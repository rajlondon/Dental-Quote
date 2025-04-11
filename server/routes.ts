import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { ZodError } from "zod";
import { insertUserSchema, insertQuoteRequestSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import fs from "fs";
import htmlPdf from "html-pdf-node";
import { createHash } from "crypto";
import { spawn } from "child_process";
import axios from "axios";
import http from "http";
import Handlebars from "handlebars";
import { generateQuotePdf, generateQuotePdfV2 } from "./pdf-generator";
import { sendQuoteEmail, isMailjetConfigured } from "./mailjet-service";
import { upload, handleUploadError, type UploadedFile } from "./file-upload";
import { createPaymentIntent, createDepositPaymentIntent, isStripeConfigured, getPaymentIntent, createOrRetrieveCustomer } from "./stripe-service";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache to store generated PDFs temporarily
const pdfCache = new Map<string, { 
  buffer: Buffer, 
  filename: string, 
  createdAt: number 
}>();

// Clean up PDFs older than 15 minutes
setInterval(() => {
  const now = Date.now();
  const expiryTime = 15 * 60 * 1000; // 15 minutes
  
  // Using Array.from to convert map entries to array to avoid iterator issues
  Array.from(pdfCache.entries()).forEach(([key, data]) => {
    if (now - data.createdAt > expiryTime) {
      pdfCache.delete(key);
    }
  });
}, 5 * 60 * 1000); // Check every 5 minutes

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
    
    // Let's use the default template ID from the environment variables
    // The template_new ID might be incorrectly configured
    const customerQuoteTemplateId = process.env.EMAILJS_TEMPLATE_ID || '';
    
    // Log the template ID we're using for debugging
    console.log('Using EmailJS template ID:', customerQuoteTemplateId);
    
    res.json({
      serviceId: process.env.EMAILJS_SERVICE_ID || '',
      templateId: customerQuoteTemplateId, // Use specific customer template for client-facing emails
      publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
      // Include extra information for debugging
      isConfigured: !!(process.env.EMAILJS_SERVICE_ID && customerQuoteTemplateId && process.env.EMAILJS_PUBLIC_KEY)
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
  // Generate a PDF and store it in memory for later download
  app.post("/api/jspdf-quote-v2", async (req, res) => {
    try {
      // Import the updated PDF generator function and email service
      const { generateQuotePdfV2 } = await import('./pdf-generator?t=' + Date.now());
      const { sendQuoteEmail, isMailjetConfigured } = await import('./mailjet-service');
      
      // Get data from request body
      const quoteData = req.body;
      
      // Log flight info for debugging
      console.log('JSPDF Quote Request Travel Info:', {
        travelMonth: quoteData.travelMonth,
        departureCity: quoteData.departureCity
      });
      
      // Log the full quote data for debugging
      console.log('Quote data for PDF generation:', {
        patientName: quoteData.patientName,
        patientEmail: quoteData.patientEmail,
        travelMonth: quoteData.travelMonth,
        departureCity: quoteData.departureCity,
        selectedClinicIndex: quoteData.selectedClinicIndex,
        itemCount: quoteData.items.length,
        totalGBP: quoteData.totalGBP
      });
      
      // Validate that patient email has proper format if provided
      if (quoteData.patientEmail && !quoteData.patientEmail.includes('@')) {
        console.warn('Invalid patient email format detected:', quoteData.patientEmail);
      }
      
      // Generate the PDF using the v2 function
      const pdfBuffer = generateQuotePdfV2(quoteData);
      
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
          console.log('Initiating email send for quote with patient details:', {
            name: quoteData.patientName || 'unnamed',
            email: quoteData.patientEmail || 'no email',
            phone: quoteData.patientPhone || 'no phone'
          });
          
          // Send email asynchronously (don't wait for it to complete)
          sendQuoteEmail({
            pdfBuffer,
            quoteData,
            filename
          }).then(success => {
            if (success) {
              console.log(`Quote email sent successfully for: ${quoteData.patientName || 'unnamed patient'} to ${quoteData.patientEmail || 'no email'}`);
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
      
      // Generate a unique ID for this PDF
      const pdfId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Store the PDF in memory cache
      pdfCache.set(pdfId, {
        buffer: pdfBuffer,
        filename,
        createdAt: Date.now()
      });
      
      // Return the download URL
      return res.json({
        success: true,
        message: "PDF generated successfully",
        downloadUrl: `/api/download-quote/${pdfId}`,
        filename
      });
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
      
      // Log the selected clinic index if available
      if (quoteData.selectedClinicIndex !== undefined) {
        console.log(`Notification for quote with selected clinic index: ${quoteData.selectedClinicIndex}`);
      }
      
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

  // Add a route to download the stored PDF using the ID
  app.get("/api/download-quote/:id", (req, res) => {
    try {
      const pdfId = req.params.id;
      
      // Get the PDF from cache
      const pdfData = pdfCache.get(pdfId);
      
      if (!pdfData) {
        return res.status(404).json({
          message: "PDF not found. It may have expired or was never generated."
        });
      }
      
      // Set headers for a proper PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdfData.filename}"`);
      res.setHeader('Content-Length', pdfData.buffer.length);
      
      // Browser cache control to ensure fresh downloads
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send the PDF
      res.send(pdfData.buffer);
      
      // Optional: Delete after retrieval
      // pdfCache.delete(pdfId);
    } catch (error) {
      console.error("Error delivering cached PDF:", error);
      res.status(500).json({
        message: "Failed to deliver PDF",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // New direct download endpoint using form post - simplified to avoid crypto issues
  app.post("/api/direct-download-pdf", (req, res) => {
    try {
      // Get data from request body
      const { quoteData: quoteDataStr, filename } = req.body;
      
      if (!quoteDataStr) {
        return res.status(400).send("Missing quote data");
      }
      
      // Parse the JSON string
      const quoteData = JSON.parse(quoteDataStr);
      
      // Log the request
      console.log('Direct PDF download request:', {
        patientName: quoteData.patientName,
        itemCount: quoteData.items?.length || 0,
        hasEmail: !!quoteData.patientEmail
      });
      
      // Generate the PDF 
      const pdfBuffer = generateQuotePdfV2(quoteData);
      
      // Set a default filename with timestamp for uniqueness
      const timestamp = Date.now();
      const finalFilename = filename || `IstanbulDentalSmile_Quote_${timestamp}.pdf`;
      
      // Send email if configured and email is provided - in the background
      if (isMailjetConfigured() && quoteData.patientEmail) {
        // Create a timeout to run the email sending asynchronously
        setTimeout(() => {
          try {
            sendQuoteEmail({
              pdfBuffer,
              quoteData,
              filename: finalFilename
            }).then(success => {
              if (success) {
                console.log(`Quote email sent successfully for: ${quoteData.patientName || 'unnamed'}`);
              } else {
                console.error('Failed to send quote email');
              }
            }).catch(emailError => {
              console.error('Error sending quote email:', emailError);
            });
          } catch (emailError) {
            console.error('Error initiating quote email:', emailError);
          }
        }, 10); // Tiny timeout to ensure this runs after response
      }
      
      // Set headers to force download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send the PDF directly
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating direct download PDF:", error);
      res.status(500).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Error Generating PDF</h1>
            <p>There was an error generating your PDF. Please try again or contact support.</p>
            <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
            <p><a href="/">Return to homepage</a></p>
            <p><a href="/pdf-download-help.html" target="_blank">View alternative download options</a></p>
          </body>
        </html>
      `);
    }
  });
  
  // File upload endpoint for X-rays
  app.post('/api/upload-xrays', upload.array('xrays', 5), handleUploadError, (req: Request, res: Response) => {
    try {
      // Validate if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded.'
        });
      }
      
      // Process uploaded files
      const files = (req.files as Express.Multer.File[]).map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      // Return success response with file information
      res.status(200).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully.`,
        files
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing file upload.',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Serve uploaded files (with security checks)
  app.get('/api/xrays/:filename', (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      
      // Security check to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename.'
        });
      }
      
      const filePath = path.join(process.cwd(), 'uploads', 'xrays', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found.'
        });
      }
      
      // Determine content type
      const ext = path.extname(filePath).toLowerCase();
      const contentTypeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf'
      };
      const contentType = contentTypeMap[ext] || 'application/octet-stream';
      
      // Set headers and stream file
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving file.',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Payment endpoints for the booking system
  // Check if Stripe is configured
  app.get('/api/config/stripe', (_req, res) => {
    res.json({
      isConfigured: isStripeConfigured(),
      publicKey: process.env.STRIPE_PUBLIC_KEY || ''
    });
  });

  // Create a payment intent for the booking deposit
  // Create a general payment intent
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'gbp', quoteRequestId, clinicId, metadata = {} } = req.body;
      
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Amount is required'
        });
      }
      
      if (!isStripeConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Payment processing is not available'
        });
      }
      
      // Add additional metadata if provided
      const paymentMetadata: Record<string, string> = {
        ...metadata
      };
      
      if (quoteRequestId) {
        paymentMetadata.quoteRequestId = String(quoteRequestId);
      }
      
      if (clinicId) {
        paymentMetadata.clinicId = String(clinicId);
      }
      
      // Create the payment intent
      const paymentIntentData = await createPaymentIntent(
        amount,
        currency,
        paymentMetadata
      );
      
      res.status(200).json({
        success: true,
        clientSecret: paymentIntentData.clientSecret,
        paymentIntentId: paymentIntentData.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create a deposit payment intent (£200)
  app.post('/api/create-deposit-payment-intent', async (req, res) => {
    try {
      const { email, currency = 'gbp' } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      if (!isStripeConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Payment processing is not available'
        });
      }
      
      // Create the payment intent for the £200 deposit
      const paymentIntentData = await createDepositPaymentIntent(email, currency);
      
      if (!paymentIntentData) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment intent'
        });
      }
      
      // Return the client secret to the frontend
      res.json({
        success: true,
        clientSecret: paymentIntentData.clientSecret,
        paymentIntentId: paymentIntentData.paymentIntentId
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing the payment intent',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Handle successful payment confirmation
  app.post('/api/confirm-deposit-payment', async (req, res) => {
    try {
      const { paymentIntentId, quoteRequestId, clinicId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID is required'
        });
      }
      
      // Retrieve the payment intent from Stripe to verify the status
      const paymentIntent = await getPaymentIntent(paymentIntentId);
      
      if (!paymentIntent) {
        return res.status(404).json({
          success: false,
          message: 'Payment intent not found'
        });
      }
      
      // Verify the payment was successful
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: `Payment is not complete. Status: ${paymentIntent.status}`
        });
      }
      
      // Get the quote request
      let quoteRequest = null;
      if (quoteRequestId) {
        quoteRequest = await storage.getQuoteRequest(Number(quoteRequestId));
        if (!quoteRequest) {
          return res.status(404).json({
            success: false,
            message: 'Quote request not found'
          });
        }
      }
      
      // Find or create a user account
      const email = paymentIntent.receipt_email || '';
      let user = await storage.getUserByEmail(email);
      
      // If no user exists, create one
      if (!user && email) {
        // Generate a temporary password - in a real scenario you'd send a reset link
        const tempPassword = Math.random().toString(36).slice(2, 10);
        
        try {
          user = await storage.createUser({
            email,
            password: tempPassword, // In production you would hash this
            role: 'patient'
          });
        } catch (error) {
          console.error('Error creating user account:', error);
          // Continue with payment processing even if user creation fails
        }
      }
      
      // Create a booking record
      let booking = null;
      if (user) {
        booking = await storage.createBooking({
          userId: user.id,
          quoteRequestId: quoteRequest?.id,
          clinicId: clinicId ? Number(clinicId) : undefined,
          status: 'deposit_paid',
          depositPaid: true,
          depositAmount: 200.00
        });
      }
      
      // Record the payment
      if (user) {
        await storage.createPayment({
          userId: user.id,
          bookingId: booking?.id,
          amount: paymentIntent.amount / 100, // Convert from cents to pounds
          currency: paymentIntent.currency.toUpperCase(),
          status: 'succeeded',
          paymentMethod: paymentIntent.payment_method_types[0] || 'card',
          transactionId: paymentIntent.id,
          stripePaymentIntentId: paymentIntent.id,
          paymentType: 'deposit'
        });
      }
      
      // Return success response
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        bookingId: booking?.id
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while confirming the payment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Webhook to handle Stripe events
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!isStripeConfigured()) {
      return res.status(503).json({ message: 'Stripe is not configured' });
    }
    
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // Verify the webhook signature
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret is not configured' });
    }
    
    let event;
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16' as any,
      });
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ message: 'Webhook signature verification failed' });
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        
        // Check if we already recorded this payment
        const existingPayment = await storage.getPaymentByStripeId(paymentIntent.id);
        if (!existingPayment) {
          // Find the user by email
          const email = paymentIntent.receipt_email || '';
          const user = await storage.getUserByEmail(email);
          
          if (user) {
            // Record the payment
            await storage.createPayment({
              userId: user.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: 'succeeded',
              paymentMethod: paymentIntent.payment_method_types[0] || 'card',
              transactionId: paymentIntent.id,
              stripePaymentIntentId: paymentIntent.id,
              paymentType: 'deposit'
            });
          }
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPaymentIntent.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a success response
    res.json({ received: true });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
