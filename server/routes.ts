import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { ZodError } from "zod";
import { insertQuoteRequestSchema } from "@shared/schema";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the public directory for static files like translations
  app.use('/locales', express.static(path.join(__dirname, '../public/locales')));
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
