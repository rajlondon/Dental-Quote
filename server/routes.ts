import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { ZodError } from "zod";
import { insertQuoteRequestSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import fs from "fs";
import htmlPdf from "html-pdf-node";
import { spawn } from "child_process";
import axios from "axios";
import http from "http";
import Handlebars from "handlebars";
import { generateQuotePdf } from "./pdf-generator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the public directory for static files like translations and images
  app.use('/locales', express.static(path.join(__dirname, '../public/locales')));
  app.use('/images', express.static(path.join(__dirname, '../public/images')));
  app.use('/favicon.ico', express.static(path.join(__dirname, '../public/favicon.ico')));
  // API route for quote requests
  app.post("/api/quote-requests", async (req, res) => {
    try {
      // Validate the request body against the schema
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      
      // Remove the consent field as it's not stored in the database
      const { consent, ...quoteRequestData } = validatedData;
      
      // Store the quote request
      const quoteRequest = await storage.createQuoteRequest(quoteRequestData);
      
      // Send email notification
      try {
        // Create a test account at ethereal.email
        const testAccount = await nodemailer.createTestAccount();
        
        // Create a transporter with Ethereal email for testing
        // In production, you would use a real email service
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        // Prepare email content
        const emailContent = {
          from: '"HealthMatch Istanbul" <info@healthmatchistanbul.com>',
          to: "admin@healthmatchistanbul.com", // In production, this would be your admin email
          subject: "New Quote Request from HealthMatch Istanbul",
          html: `
            <h2>New Quote Request</h2>
            <p><strong>Name:</strong> ${quoteRequestData.name}</p>
            <p><strong>Email:</strong> ${quoteRequestData.email}</p>
            <p><strong>Treatment:</strong> ${quoteRequestData.treatment === 'other' ? quoteRequestData.otherTreatment : quoteRequestData.treatment}</p>
            <p><strong>Budget:</strong> ${quoteRequestData.budget || 'Not specified'}</p>
            <p><strong>Preferred Dates:</strong> ${quoteRequestData.dates || 'Not specified'}</p>
            <p><strong>Additional Notes:</strong> ${quoteRequestData.notes || 'None'}</p>
          `,
        };
        
        // Send email
        const info = await transporter.sendMail(emailContent);
        
        console.log("Email sent:", info.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        
      } catch (error) {
        console.error("Error sending email notification:", error);
        // Continue execution even if email fails
      }
      
      // Return success response
      res.status(201).json({
        message: "Quote request submitted successfully",
        id: quoteRequest.id,
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      } else {
        // Handle other errors
        console.error("Error processing quote request:", error);
        res.status(500).json({
          message: "An error occurred while processing your request",
        });
      }
    }
  });
  
  // Endpoint to securely provide EmailJS config to the frontend
  app.get("/api/config/emailjs", (_req, res) => {
    // Log the values being extracted from environment variables (without revealing the actual values)
    console.log('EmailJS Config from env:', {
      serviceIdExists: !!process.env.EMAILJS_SERVICE_ID,
      templateIdExists: !!process.env.EMAILJS_TEMPLATE_ID,
      publicKeyExists: !!process.env.EMAILJS_PUBLIC_KEY
    });
    
    res.json({
      serviceId: process.env.EMAILJS_SERVICE_ID || '',
      templateId: process.env.EMAILJS_TEMPLATE_ID || '',
      publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
    });
  });

  // Serve the quote template
  app.get("/api/quote-template", (_req, res) => {
    try {
      const templatePath = path.join(__dirname, "../client/src/templates/quote_template.html");
      const template = fs.readFileSync(templatePath, "utf-8");
      res.send(template);
    } catch (error) {
      console.error("Error serving template:", error);
      res.status(500).json({
        message: "Failed to retrieve template",
      });
    }
  });

  // Serve static assets for the PDF generator
  app.get("/api/asset", (req, res) => {
    try {
      const assetPath = req.query.path as string;
      if (!assetPath) {
        return res.status(400).json({ message: "Asset path is required" });
      }

      // Make sure we're not allowing directory traversal
      const normalizedPath = path.normalize(assetPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const filePath = path.join(__dirname, "..", normalizedPath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Get the file extension
      const ext = path.extname(filePath).toLowerCase();
      
      // Set appropriate content type
      const contentTypeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      
      const contentType = contentTypeMap[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving asset:", error);
      res.status(500).json({
        message: "Failed to retrieve asset",
      });
    }
  });

  // Generate PDF from template
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { templateData } = req.body;
      if (!templateData) {
        return res.status(400).json({ message: "Template data is required" });
      }

      // Get the template
      const templatePath = path.join(__dirname, "templates/quote_template.html");
      let templateSource = fs.readFileSync(templatePath, "utf-8");
      
      // Read logo file and convert to base64
      const logoPath = path.join(__dirname, "../attached_assets/logo.png");
      let logoBase64 = '';
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = logoData.toString('base64');
      } else {
        // Fallback to logo.jpeg if logo.png doesn't exist
        const jpegLogoPath = path.join(__dirname, "../attached_assets/logo.jpeg");
        if (fs.existsSync(jpegLogoPath)) {
          const logoData = fs.readFileSync(jpegLogoPath);
          logoBase64 = logoData.toString('base64');
        }
      }
      
      // Generate a quote number
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const quoteId = `IDS-${datePart}-${randomPart}`;
      
      // Format the date
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      
      // Create a treatment summary from the items
      let treatment = "";
      if (templateData.items && templateData.items.length > 0) {
        const mainTreatments = templateData.items.map((item: any) => 
          `${item.treatment} (${item.quantity})`).join(' + ');
        treatment = mainTreatments;
      } else {
        treatment = "Dental Treatment Package";
      }
      
      // Generate UK vs Istanbul price comparison
      const savings = templateData.items ? 
        templateData.items.map((item: any) => {
          // UK price is typically 2-3x higher
          // Ensure we're working with numbers
          const priceGBP = typeof item.priceGBP === 'number' ? item.priceGBP : parseFloat(item.priceGBP || '0');
          const ukPrice = priceGBP * 2.5;
          const istanbulPrice = priceGBP;
          return {
            name: item.treatment,
            uk: `£${ukPrice.toFixed(2)}`,
            istanbul: `£${istanbulPrice.toFixed(2)}`,
            savings: `£${(ukPrice - istanbulPrice).toFixed(2)}`
          };
        }) : [];
      
      // Sample reviews
      const reviews = [
        { text: "The best dental experience I've had – professional, smooth and transparent.", author: "Sarah W." },
        { text: "Incredible results and I got to explore Istanbul too. 100% recommend!", author: "James T." },
        { text: "From airport to aftercare, every detail was taken care of. Thanks team!", author: "Alicia M." }
      ];
      
      // Prepare clinic data (using provided clinics or defaults if not provided)
      let clinics = templateData.clinics || [];
      if (!clinics || clinics.length === 0) {
        // Default clinics if none provided
        clinics = [
          {
            name: "DentGroup Istanbul", 
            priceGBP: `£${(templateData.totalGBP * 0.95).toFixed(2)}`,
            priceUSD: `$${(templateData.totalGBP * 0.95 * 1.25).toFixed(2)}`,
            location: "Nişantaşı", 
            guarantee: "5 Years", 
            turnaround: "3 Days", 
            rating: "⭐⭐⭐⭐⭐"
          },
          {
            name: "Vera Smile", 
            priceGBP: `£${(templateData.totalGBP * 0.92).toFixed(2)}`,
            priceUSD: `$${(templateData.totalGBP * 0.92 * 1.25).toFixed(2)}`,
            location: "Şişli", 
            guarantee: "5 Years", 
            turnaround: "4 Days", 
            rating: "⭐⭐⭐⭐½"
          },
          {
            name: "LuxClinic Turkey", 
            priceGBP: `£${(templateData.totalGBP).toFixed(2)}`,
            priceUSD: `$${(templateData.totalGBP * 1.25).toFixed(2)}`,
            location: "Levent", 
            guarantee: "10 Years", 
            turnaround: "3 Days", 
            rating: "⭐⭐⭐⭐⭐"
          }
        ];
      }
      
      // Combine all the data for the template
      const data = {
        logoBase64,
        quoteId,
        date: formattedDate,
        name: templateData.patientName || 'Valued Customer',
        treatment,
        clinics,
        duration: "3-5 Days",
        materials: "Premium dental materials with long-term guarantee",
        hotel: "4-star luxury stay with breakfast, walking distance to clinic – £240 (3 nights)",
        transport: "VIP airport pickup + all clinic transfers – £75",
        flights: `London-Istanbul return – £150–£300 (${templateData.travelMonth || 'flexible'})`,
        bonuses: "Free Turkish Hamam experience & English-speaking coordinator",
        savings,
        reviews,
        consultationLink: "https://calendly.com/istanbuldentalsmile/consultation",
        depositLink: "https://payment.istanbuldentalsmile.com/deposit",
        email: "info@istanbuldentalsmile.com",
        website: "www.istanbuldentalsmile.com"
      };
      
      // Compile the template and render with Handlebars
      const template = Handlebars.compile(templateSource);
      const htmlContent = template(data);
      
      // Generate PDF from the rendered HTML
      const options = { 
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
        preferCSSPageSize: true
      };
      
      const file = { content: htmlContent };
      
      htmlPdf.generatePdf(file, options).then(pdfBuffer => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=IstanbulDentalSmile_Quote_${quoteId}.pdf`);
        res.send(pdfBuffer);
      }).catch(error => {
        console.error("PDF generation error:", error);
        res.status(500).json({
          message: "Failed to generate PDF",
          error: error.toString()
        });
      });
    } catch (error) {
      console.error("Error processing PDF request:", error);
      res.status(500).json({
        message: "An error occurred while generating the PDF",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generate PDF using Python code directly integrated within Node.js
  app.post(["/api/generate-python-pdf", "/api/python/generate-quote"], async (req, res) => {
    try {
      const data = req.body;
      
      // Generate quote ID similar to the Python implementation
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const quoteId = `IDS-${dateStr}-${randNum}`;
      
      // Format the date for display
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      
      // Prepare clinic data (using provided clinics or defaults if not provided)
      let clinics = data.clinics || [];
      if (!clinics || clinics.length === 0) {
        // Default clinics if none provided
        clinics = [
          {
            name: "DentGroup Istanbul", 
            priceGBP: data.totalGBP * 0.95, 
            location: "Nişantaşı", 
            guarantee: "5 Years", 
            turnaround: "3 Days", 
            rating: "⭐⭐⭐⭐⭐"
          },
          {
            name: "Vera Smile", 
            priceGBP: data.totalGBP * 0.92, 
            location: "Şişli", 
            guarantee: "5 Years", 
            turnaround: "4 Days", 
            rating: "⭐⭐⭐⭐½"
          },
          {
            name: "LuxClinic Turkey", 
            priceGBP: data.totalGBP, 
            location: "Levent", 
            guarantee: "10 Years", 
            turnaround: "3 Days", 
            rating: "⭐⭐⭐⭐⭐"
          }
        ];
      }
      
      // Format the clinics data for template
      const formattedClinics = clinics.map((clinic: any) => ({
        name: clinic.name || '',
        price_gbp: `£${parseFloat(String(clinic.priceGBP || 0)).toFixed(2)}`,
        price_usd: `$${parseFloat(String(clinic.priceGBP * 1.25 || 0)).toFixed(2)}`,
        location: clinic.location || 'Istanbul',
        guarantee: clinic.guarantee || '5 Years',
        turnaround: clinic.turnaround || '3-5 Days',
        rating: clinic.rating || '⭐⭐⭐⭐⭐'
      }));
      
      // Calculate treatment summary
      const treatments = data.items ? 
        data.items.map((item: any) => `${item.quantity}x ${item.treatment}`) : [];
      const treatmentSummary = treatments.length ? treatments.join(" + ") : "Dental Treatment Package";
      
      // Generate UK vs Istanbul price comparison
      const savings = data.items ? 
        data.items.map((item: any) => {
          // UK price is typically 2-3x higher
          // Ensure we're working with numbers
          const priceGBP = typeof item.priceGBP === 'number' ? item.priceGBP : parseFloat(item.priceGBP || '0');
          const ukPrice = priceGBP * 2.5;
          const istanbulPrice = priceGBP;
          return {
            name: item.treatment,
            uk: `£${ukPrice.toFixed(2)}`,
            istanbul: `£${istanbulPrice.toFixed(2)}`,
            savings: `£${(ukPrice - istanbulPrice).toFixed(2)}`
          };
        }) : [];
      
      // Sample reviews
      const reviews = [
        { text: "The best dental experience I've had – professional, smooth and transparent.", author: "Sarah W." },
        { text: "Incredible results and I got to explore Istanbul too. 100% recommend!", author: "James T." },
        { text: "From airport to aftercare, every detail was taken care of. Thanks team!", author: "Alicia M." }
      ];
      
      // Get the HTML template
      const templatePath = path.join(process.cwd(), "python_pdf/templates/quote_pdf.html");
      let template = fs.readFileSync(templatePath, "utf-8");
      
      // Read logo file and convert to base64
      const logoPath = path.join(process.cwd(), "python_pdf/static/logo.png");
      let logoBase64 = '';
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
        // Replace logo image with base64 data URL in the template
        template = template.replace(
          /src="{{ url_for\('static', filename='logo.png'\) }}"/g, 
          `src="${logoBase64}"`
        );
      }
      
      // Prepare additional data for the template
      const quoteData = {
        quote_id: quoteId,
        name: data.patientName || 'Valued Customer',
        date: formattedDate,
        treatment: treatmentSummary,
        clinics: formattedClinics,
        duration: "3-5 Days",
        materials: "Premium dental materials with long-term guarantee",
        hotel: "4-star luxury stay with breakfast, walking distance to clinic – £240 (3 nights)",
        transport: "VIP airport pickup + all clinic transfers – £75",
        flights: `London-Istanbul return – £150–£300 (${data.travelMonth || 'flexible'})`,
        bonuses: "Free Turkish Hamam experience & English-speaking coordinator",
        savings: savings,
        reviews: reviews,
        consultation_link: "https://calendly.com/istanbuldentalsmile/consultation",
        deposit_link: "https://payment.istanbuldentalsmile.com/deposit",
        email: "info@istanbuldentalsmile.com",
        website: "www.istanbuldentalsmile.com"
      };
      
      // Simple template rendering - replace variables
      let html = template;
      
      // Handle simple variable replacement
      Object.entries(quoteData).forEach(([key, value]) => {
        if (!Array.isArray(value)) {
          const regex = new RegExp(`{{ ${key} }}`, 'g');
          html = html.replace(regex, String(value || ''));
        }
      });
      
      // Handle clinic table
      let clinicRows = '';
      quoteData.clinics.forEach((clinic: any) => {
        clinicRows += `<tr><td>${clinic.name}</td><td>${clinic.price_gbp}</td><td>${clinic.price_usd}</td></tr>`;
      });
      html = html.replace(/{% for clinic in clinics %}[\s\S]*?{% endfor %}/g, clinicRows);
      
      // Handle clinic comparison table
      let clinicComparisonRows = '';
      quoteData.clinics.forEach((clinic: any) => {
        clinicComparisonRows += `<tr><td>${clinic.name}</td><td>${clinic.location}</td><td>${clinic.guarantee}</td><td>${clinic.turnaround}</td><td>${clinic.rating}</td></tr>`;
      });
      const clinicComparisonPattern = /{% for clinic in clinics %}[\s\S]*?{% endfor %}/g;
      const matches = html.match(clinicComparisonPattern);
      if (matches && matches.length > 1) {
        // Replace the second occurrence (the one in the comparison table)
        html = html.replace(clinicComparisonPattern, (match, offset) => {
          if (html.indexOf(match) === offset) {
            return match; // Skip the first occurrence
          }
          return clinicComparisonRows;
        });
      }
      
      // Handle savings table
      let savingsRows = '';
      quoteData.savings.forEach((item: any) => {
        savingsRows += `<tr><td>${item.name}</td><td>${item.uk}</td><td>${item.istanbul}</td><td>${item.savings}</td></tr>`;
      });
      html = html.replace(/{% for item in savings %}[\s\S]*?{% endfor %}/g, savingsRows);
      
      // Handle reviews
      let reviewsHtml = '';
      quoteData.reviews.forEach((review: any) => {
        reviewsHtml += `<div class="testimonial">"${review.text}"<br>– ${review.author}</div>`;
      });
      html = html.replace(/{% for review in reviews %}[\s\S]*?{% endfor %}/g, reviewsHtml);
      
      // Generate PDF from the rendered HTML
      const options = { 
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
        preferCSSPageSize: true
      };
      
      const file = { content: html };
      
      htmlPdf.generatePdf(file, options).then(pdfBuffer => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=IstanbulDentalSmile_Quote_${quoteId}.pdf`);
        res.send(pdfBuffer);
      }).catch(error => {
        console.error("PDF generation error:", error);
        res.status(500).json({
          message: "Failed to generate PDF",
          error: error.toString()
        });
      });
    } catch (error) {
      console.error("Error in Python-style PDF generation:", error);
      res.status(500).json({
        message: "An error occurred while generating the PDF with Python-style template",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Simple PDF generation using jspdf (HTML view)
  app.post("/api/simple-pdf", async (req, res) => {
    try {
      const { items, totalGBP, totalUSD, patientName, clinics } = req.body;
      
      // Generate PDF on the server-side
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const quoteId = `IDS-${datePart}-${randomPart}`;
      
      // Prepare the HTML for the PDF
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dental Quote - ${quoteId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { color: #007ba7; text-align: center; }
          h2 { color: #007ba7; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #007ba7; color: white; }
          .header { background-color: #007ba7; color: white; padding: 10px; text-align: center; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Istanbul Dental Smile</h1>
          <p>Quote ID: ${quoteId} | Date: ${now.toLocaleDateString('en-GB')}</p>
        </div>
        
        <h2>Hello ${patientName || 'Valued Customer'},</h2>
        <p>Here is your personalized quote for dental treatment in Istanbul.</p>
        
        <h2>Treatment Details</h2>
        <table>
          <tr>
            <th>Treatment</th>
            <th>Quantity</th>
            <th>Price (GBP)</th>
            <th>Price (USD)</th>
          </tr>
          ${items ? items.map((item: { treatment: string; quantity: number; priceGBP: number; priceUSD: number }) => `
          <tr>
            <td>${item.treatment}</td>
            <td>${item.quantity}</td>
            <td>£${item.priceGBP.toFixed(2)}</td>
            <td>$${item.priceUSD.toFixed(2)}</td>
          </tr>
          `).join('') : ''}
          <tr>
            <td colspan="2"><strong>Total</strong></td>
            <td><strong>£${totalGBP.toFixed(2)}</strong></td>
            <td><strong>$${totalUSD.toFixed(2)}</strong></td>
          </tr>
        </table>
        
        <h2>Clinic Options</h2>
        <table>
          <tr>
            <th>Clinic</th>
            <th>Price</th>
            <th>Features</th>
          </tr>
          ${clinics ? clinics.map((clinic: { name: string; priceGBP: number | string; extras?: string }) => {
            const price = typeof clinic.priceGBP === 'number' ? clinic.priceGBP : parseFloat(String(clinic.priceGBP || '0'));
            return `
          <tr>
            <td>${clinic.name}</td>
            <td>£${price.toFixed(2)}</td>
            <td>${clinic.extras || ''}</td>
          </tr>
          `;
          }).join('') : ''}
        </table>
        
        <div class="footer">
          <p>For more information, please contact us at info@istanbuldentalsmile.com</p>
          <p>www.istanbuldentalsmile.com</p>
        </div>
      </body>
      </html>
      `;
      
      // Send the HTML content directly as the response
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
      
    } catch (error) {
      console.error("Error generating simple PDF:", error);
      res.status(500).json({
        message: "Failed to generate simple PDF",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Pure PDF generation using jsPDF with Mailjet email notification
  app.post("/api/jspdf-quote", async (req, res) => {
    try {
      // Import the PDF generator function and email service
      const { generateQuotePdf } = await import('./pdf-generator');
      const { sendQuoteEmail, isMailjetConfigured } = await import('./mailjet-service');
      
      // Get data from request body
      const quoteData = req.body;
      
      // Log flight info for debugging
      console.log('JSPDF Quote Request Travel Info:', {
        travelMonth: quoteData.travelMonth,
        departureCity: quoteData.departureCity
      });
      
      // Generate the PDF
      const pdfBuffer = generateQuotePdf(quoteData);
      
      // Generate filename with date and patient name
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, '');
      const sanitizedName = (quoteData.patientName || 'Unnamed')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20);
      const filename = `IstanbulDentalSmile_Quote_${formattedDate}_${sanitizedName}.pdf`;
      
      // Send email with quote PDF if Mailjet is configured
      if (isMailjetConfigured()) {
        try {
          // Send email asynchronously (don't wait for it to complete)
          sendQuoteEmail({
            pdfBuffer,
            quoteData,
            filename
          }).then(success => {
            if (success) {
              console.log(`Quote email sent successfully for: ${quoteData.patientName || 'unnamed patient'}`);
            } else {
              console.error('Failed to send quote email via Mailjet');
            }
          }).catch(emailError => {
            console.error('Error sending quote email:', emailError);
          });
          
          console.log('Sending quote email in background...');
        } catch (emailError) {
          console.error('Error initiating quote email sending:', emailError);
          // Continue execution even if email fails - we still want to deliver the PDF to the user
        }
      } else {
        console.log('Mailjet not configured, skipping email notification');
      }
      
      // Set the response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send the PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF with jsPDF:", error);
      res.status(500).json({
        message: "Failed to generate PDF with jsPDF",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // New endpoint for quote calculation notification
  app.post("/api/notify-quote-calculation", async (req, res) => {
    try {
      // Import the mailjet service
      const { sendEmailNotification, isMailjetConfigured } = await import('./mailjet-service');
      
      // Get data from request body
      const quoteData = req.body;
      
      // If Mailjet is not configured, return success anyway but log the issue
      if (!isMailjetConfigured()) {
        console.log('Mailjet not configured, skipping email notification for quote calculation');
        return res.status(200).json({
          message: "Quote calculation recorded successfully (email notification skipped)",
          emailSent: false
        });
      }
      
      // Send the notification email
      const emailResult = await sendEmailNotification({
        quoteData,
        isCalculationOnly: true
      });
      
      // Return success response
      return res.status(200).json({
        message: "Quote calculation notification sent successfully",
        emailSent: emailResult
      });
    } catch (error) {
      console.error("Error sending quote calculation notification:", error);
      // Return success anyway to not block the user experience
      return res.status(200).json({
        message: "Quote calculation recorded successfully (notification failed)",
        emailSent: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
