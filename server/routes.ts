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
      const templatePath = path.join(__dirname, "../client/src/templates/quote_template.html");
      let template = fs.readFileSync(templatePath, "utf-8");
      
      // Simple mustache-like template rendering
      // Replace {{variable}} with actual values
      Object.entries(templateData).forEach(([key, value]) => {
        // Handle arrays with #each-like syntax
        if (Array.isArray(value)) {
          // Find all sections that use this array
          const pattern = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
          
          template = template.replace(pattern, (_, sectionTemplate) => {
            return (value as any[]).map((item: any) => {
              let itemHtml = sectionTemplate;
              // Replace item properties
              Object.entries(item).forEach(([itemKey, itemValue]) => {
                itemHtml = itemHtml.replace(
                  new RegExp(`{{${itemKey}}}`, 'g'), 
                  String(itemValue)
                );
              });
              return itemHtml;
            }).join('');
          });
        } else if (key.endsWith('Icon') || key.endsWith('Url')) {
          // Use triple braces for URLs to prevent HTML escaping
          template = template.replace(
            new RegExp(`{{{${key}}}}`, 'g'), 
            String(value)
          );
        } else {
          // Replace simple variables
          template = template.replace(
            new RegExp(`{{${key}}}`, 'g'), 
            String(value)
          );
        }
      });

      // Optional sections with #extras tag
      template = template.replace(/{{#extras}}([\s\S]*?){{\/extras}}/g, (_, content) => {
        // If extras exists and is not empty, return the content
        return content;
      });
      
      // Generate PDF from the rendered HTML
      const options = { 
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
        preferCSSPageSize: true
      };
      
      const file = { content: template };
      
      htmlPdf.generatePdf(file, options).then(pdfBuffer => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=IstanbulDentalSmile_Quote.pdf');
        res.send(pdfBuffer);
      }).catch(error => {
        console.error("PDF generation error:", error);
        res.status(500).json({
          message: "Failed to generate PDF",
        });
      });
    } catch (error) {
      console.error("Error processing PDF request:", error);
      res.status(500).json({
        message: "An error occurred while generating the PDF",
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
