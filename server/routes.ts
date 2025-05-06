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
import { isAuthenticated, ensureRole } from "./middleware/auth";
// Import authentication and portal routes
import { setupAuth } from "./auth";
import portalRoutes from "./routes/portal-routes";
import fileRoutes from "./routes/fileRoutes";
import authRoutesRouter from "./routes/auth-routes";
import treatmentPlanRoutes from "./routes/treatmentPlanRoutes";
import treatmentPlansModuleRoutes from "./routes/treatment-plans-routes";
import treatmentOfferIntegration from "./routes/treatment-offer-integration"; // New integration between offers and treatment plans
import publicPackagesRoutes from "./routes/public-packages-routes";
import treatmentRoutes from "./routes/treatment-routes";
import treatmentCategoriesRoutes from "./routes/treatment-categories-routes";
import geminiRoutes from "./routes/gemini-routes";
import paymentRoutes from "./routes/paymentRoutes";
import testRoutes from "./routes/test-routes";
import messagingRoutes from "./routes/messaging-routes";
import bookingRoutes from "./routes/booking-routes";
import appointmentRoutes from "./routes/appointment-routes";
import { createNotificationRoutes } from "./routes/notification-routes";
import specialOffersRoutes from "./routes/special-offers-routes-fixed";
import specialOffersUpdateHelper from "./routes/special-offers-update-helper";
import offersRoutes from "./routes/offers-routes"; // Add our new offers routes
import offerStartRoutes from "./routes/offer-start-routes"; // Add the offer start API routes
import trendingPackagesRoutes from "./routes/trending-packages-routes-fixed";
import quoteRoutes from "./routes/quote-routes";
import clinicMediaRoutes from "./routes/clinic-media-routes";
import openaiRoutes from "./routes/openai-routes";
import imageCacheRoutes from "./routes/image-cache-routes";
import { initializeSpecialOfferImageCache } from "./utils/special-offers-cache-init";
import { setupTreatmentMapperApi } from "./treatment-mapper-api";
import { registerClinicRoutes } from "./clinic-api";
// Import error handling routes (only for development)
import errorTestRoutes from "./routes/error-test-routes";
import { AppError, catchAsync } from "./middleware/error-handler";
// Import the canonical v1 API routes
import treatmentLinesRouter from "./routes/v1/treatment-lines";
import { treatmentPlansRoutes } from "./routes/v1";
// Import security middleware
import { 
  csrfProtection, 
  handleCsrfError, 
  csrfTokenHandler, 
  apiRateLimit, 
  authRateLimit, 
  uploadRateLimit 
} from "./middleware/security";
import { setupWebSocketService } from "./services/websocketService";
import { createNotificationService } from "./services/notificationService";
import { createEmailNotificationService } from "./services/emailNotificationService";

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
  
  // Serve cached images for OpenAI DALL-E image caching system
  app.use('/cached-images', express.static(path.join(__dirname, '../public/cached-images')));
  
  // Special test page for domain diagnosis
  app.get('/domaintest.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/domaintest.html'));
  });
  
  // All /blog routes are now handled by React components in the frontend
  // Blog static HTML file can still be accessed at /blog-static
  app.get('/blog-static', (req, res) => {
    // Set strong cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Add random query parameter to URL to force reloading from server
    res.setHeader('Content-Type', 'text/html');
    // Serve the new file with the updated design
    res.sendFile(path.join(__dirname, '../public/blog-new.html'));
  });
  
  // Legacy blog routes are moved to blog-v2 and blog-static
  app.get('/blog-v2', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '../public/blog-v2.html'));
  });
  
  // This handler redirects old blog.html links to the new React blog page
  app.get('/blog.html', (req, res) => {
    res.redirect('/blog');
  });
  
  // Add explicit route for new blog design
  app.get('/blog-new', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '../public/blog-new.html'));
  });
  
  // Add route for dental implants page
  app.get('/dental-implants', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '../public/dental-implants.html'));
  });
  
  // Add route for NEW dental implants page
  app.get('/dental-implants-new', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '../public/dental-implants-new.html'));
  });
  
  // Add routes for other treatment pages (these will be created later)
  app.get('/veneers', (req, res) => {
    // For now, redirect to dental implants page as it's the only one complete
    res.redirect('/dental-implants');
  });
  
  app.get('/hollywood-smile', (req, res) => {
    // For now, redirect to dental implants page as it's the only one complete
    res.redirect('/dental-implants');
  });
  
  app.get('/full-mouth', (req, res) => {
    // For now, redirect to dental implants page as it's the only one complete
    res.redirect('/dental-implants');
  });
  
  // Setup authentication
  setupAuth(app);
  
  // Apply global rate limiting to all API routes
  app.use('/api', apiRateLimit);
  
  // Add CSRF error handler (must be before CSRF middleware)
  app.use(handleCsrfError);
  
  // Direct server-side blocking of portal routes for security
  // This prevents direct access to portal routes without authentication
  app.get(["/admin-portal*", "/clinic-portal*", "/client-portal*"], (req, res) => {
    // If they're trying to access directly, redirect to login
    return res.redirect("/portal-login");
  });
  
  // Register public package routes that don't require authentication
  app.use('/api/public', publicPackagesRoutes);
  
  // IMPORTANT: Register routes in this order to avoid conflicts:
  // 1. Global auth middleware
  // 2. Role-specific middleware
  // 3. Portal routes
  
  // Apply global authentication for all portal routes
  app.use("/api/portal", isAuthenticated);
  
  // Protect admin-specific routes
  app.use("/api/portal/admin", ensureRole("admin"));
  
  // Protect clinic-specific routes
  app.use("/api/portal/clinic", ensureRole("clinic_staff"));
  
  // Register main portal routes AFTER role middleware
  app.use(portalRoutes);
  
  // Register file upload/management routes with upload rate limiting
  app.use('/api/files', uploadRateLimit, fileRoutes);
  
  // Register the canonical v1 APIs (these are the single source of truth)
  console.log('[DEBUG] Mounting CANONICAL treatmentLinesRouter at /api/v1/treatment-lines');
  app.use('/api/v1/treatment-lines', treatmentLinesRouter);
  
  console.log('[DEBUG] Mounting CANONICAL treatmentPlansRoutes at /api/v1/treatment-plans');
  app.use('/api/v1/treatment-plans', treatmentPlansRoutes);
  
  // Legacy routes - These are kept for backward compatibility during transition
  // Eventually these should be removed or redirected to the canonical endpoint
  console.log('[DEBUG] Mounting LEGACY treatmentPlanRoutes at /api/treatment-plans');
  app.use('/api/treatment-plans', treatmentPlanRoutes);
  
  console.log('[DEBUG] Mounting LEGACY treatmentPlansModuleRoutes at /api/treatment-module');
  app.use('/api/treatment-module', treatmentPlansModuleRoutes);
  
  // Register new treatment management routes for clinics
  app.use(treatmentRoutes);
  
  // Register treatment categories routes for patient quote editing
  app.use(treatmentCategoriesRoutes);
  
  // Register clinic API routes for quote generation and consultation booking
  // IMPORTANT: This is put before quote routes to avoid conflicts
  registerClinicRoutes(app);
  
  // Setup treatment mapper API routes
  setupTreatmentMapperApi(app);
  
  // Register our new treatment plan/offer integration routes
  console.log('[DEBUG] Mounting treatment-offer-integration at /api/treatment-plans');
  app.use('/api/treatment-plans', treatmentOfferIntegration);

  // Register direct route for /api/quotes/clinic to avoid conflicts
  app.get('/api/quotes/clinic', isAuthenticated, ensureRole("clinic_staff"), async (req, res, next) => {
    try {
      const user = req.user!;
      
      console.log(`[DEBUG] Clinic portal quote request: User ID=${user.id}, Role=${user.role}`);
      
      if (!user.clinicId) {
        console.log(`[ERROR] User ${user.id} is not associated with a clinic`);
        return res.status(400).json({
          success: false,
          message: "User is not associated with a clinic"
        });
      }
      
      console.log(`[DEBUG] Clinic portal user ${user.id} is associated with clinic ID=${user.clinicId}`);
      
      const quotes = await storage.getQuoteRequestsByClinicId(user.clinicId);
      
      console.log(`[DEBUG] Returning ${quotes.length} quotes to the clinic portal`);
      
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('[ERROR] Error in /api/quotes/clinic endpoint:', error);
      next(error);
    }
  });
  
  // Register the rest of the quote routes 
  app.use('/api/quotes', quoteRoutes);
  
  // Register Gemini AI routes for dental advice
  app.use('/api/gemini', geminiRoutes);
  
  // Register routes for email verification, password reset, and user registration
  app.use('/api/auth', authRoutesRouter);
  
  // Redirect the frontend /verify-email route to the backend API route
  app.get('/verify-email', (req, res) => {
    const token = req.query.token;
    res.redirect(`/api/auth/verify-email?token=${token}`);
  });
  
  // Register payment routes
  app.use('/api/payments', paymentRoutes);
  
  // Register messaging routes for cross-portal communication
  app.use('/api/messages', messagingRoutes);
  
  // We'll register notification routes later after we create the HTTP server
  
  // Register special offers routes with commission-based promotion system
  app.use(specialOffersRoutes);
  
  // Register special offers update helper routes for image generation
  app.use(specialOffersUpdateHelper);
  
  // Register new unified treatment plan/offers integration routes
  app.use('/api', offersRoutes);
  
  // Register the new offer start routes for special offers and packages
  app.use('/api/v1', offerStartRoutes);
  
  // Also register the LEGACY offer endpoint at the root for backward compatibility
  app.use('/api', treatmentOfferIntegration);
  
  // Register trending packages routes with commission-based promotion system
  app.use(trendingPackagesRoutes);
  
  // Register clinic media routes for before/after images and videos
  app.use('/api/clinic-media', clinicMediaRoutes);
  
  // Register OpenAI routes for image generation
  app.use('/api/openai', openaiRoutes);
  
  // Register image caching routes for handling Azure Blob Storage DALL-E images
  app.use(imageCacheRoutes);
  
  // Create image-cache directory for storing cached images
  const imageCacheDir = path.join(process.cwd(), 'public', 'image-cache');
  if (!fs.existsSync(imageCacheDir)) {
    fs.mkdirSync(imageCacheDir, { recursive: true });
    console.log(`Created image cache directory at ${imageCacheDir}`);
  }
  
  // Serve cached images statically
  app.use('/image-cache', express.static(imageCacheDir));
  
  // Register booking and appointment routes
  app.use('/api/bookings', bookingRoutes);
  app.use('/api', appointmentRoutes);
  
  // Register test routes (only available in development mode)
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api/test', testRoutes);
    
    // Register error testing routes for development only
    app.use('/api/error-test', errorTestRoutes);
    
    // Serve test notification analytics tool
    app.get('/test-notifications', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/test-notifications.html'));
    });
    
    console.log('✅ Test routes registered (only available in development mode)');
  }
  
  // Create the uploads directory for files if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve uploaded files statically with proper authentication checks
  app.use('/uploads', express.static(uploadsDir));
  
  // CSRF Token endpoint for frontend usage
  app.get('/api/csrf-token', csrfProtection, csrfTokenHandler);
  
  // API endpoint to get all clinics
  app.get('/api/clinics', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
    try {
      // Get clinic data from storage
      const clinics = await storage.getAllClinics();
      
      // Return clinic data
      res.json({
        success: true,
        data: clinics.map(clinic => ({
          id: clinic.id,
          name: clinic.name,
          email: clinic.email,
          city: clinic.city,
          country: clinic.country,
          specialties: clinic.specialties || [],
          rating: clinic.rating,
          reviewCount: clinic.reviewCount || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching clinics:', error);
      throw new AppError('Failed to fetch clinics', 500);
    }
  }));
  
  // WebSocket connection status endpoint with domain info
  app.get('/api/ws-status', (req, res) => {
    res.json({
      enabled: true,
      endpoint: '/ws',
      supportedEvents: [
        'register', 
        'sync_appointment', 
        'treatment_update', 
        'message'
      ],
      host: req.get('host'),
      protocol: req.protocol,
      domain_test: true,
      time: new Date().toISOString()
    });
  });
  
  // EmailJS Config endpoint
  app.get("/api/config/emailjs", (_req, res) => {
    // Log the values being extracted from environment variables (without revealing the actual values)
    console.log('EmailJS Config from env:', {
      serviceIdExists: !!process.env.EMAILJS_SERVICE_ID,
      templateIdExists: !!process.env.EMAILJS_TEMPLATE_ID,
      publicKeyExists: !!process.env.EMAILJS_PUBLIC_KEY
    });
    
    // Let's use the default template ID from the environment variables
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
  
  // Email quote endpoint
  app.post("/api/email-quote", csrfProtection, async (req, res) => {
    try {
      // Generate the PDF from the quote data
      const quoteData = req.body;
      
      if (!quoteData || !quoteData.patientEmail) {
        return res.status(400).json({
          success: false,
          message: "Missing required data: patient email is required",
        });
      }
      
      // Generate the PDF
      const { generateQuotePdfV2 } = await import('./pdf-generator');
      let pdfBuffer: Buffer;
      
      try {
        pdfBuffer = generateQuotePdfV2(quoteData);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate PDF for email",
        });
      }
      
      // Try to send the email
      try {
        // Use nodemailer as a fallback if Mailjet is not configured
        const nodemailer = await import('nodemailer');
        
        // Create a test transporter with Ethereal email for testing
        const testAccount = await nodemailer.createTestAccount();
        
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        // Format current date for the filename
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `IstanbulDentalSmile_Quote_${formattedDate}.pdf`;
        
        // Send email with the PDF attachment
        const info = await transporter.sendMail({
          from: '"Istanbul Dental Smile" <info@istanbuldentalsmile.co.uk>',
          to: quoteData.patientEmail,
          subject: "Your Dental Treatment Quote",
          text: `Dear ${quoteData.patientName || 'Patient'},\n\nThank you for your interest in Istanbul Dental Smile. Attached is your personalized dental treatment quote.\n\nIf you have any questions or would like to proceed with booking, please don't hesitate to contact us.\n\nBest regards,\nThe Istanbul Dental Smile Team`,
          html: `<p>Dear ${quoteData.patientName || 'Patient'},</p><p>Thank you for your interest in Istanbul Dental Smile. Attached is your personalized dental treatment quote.</p><p>If you have any questions or would like to proceed with booking, please don't hesitate to contact us.</p><p>Best regards,<br>The Istanbul Dental Smile Team</p>`,
          attachments: [
            {
              filename,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });
        
        console.log("Email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        return res.json({
          success: true,
          message: "Quote email sent successfully",
          previewUrl: nodemailer.getTestMessageUrl(info),
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: String(emailError),
        });
      }
    } catch (error) {
      console.error('Error in email-quote route:', error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        error: String(error),
      });
    }
  });

  // Direct PDF download endpoint
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
          </body>
        </html>
      `);
    }
  });
  
  // Payment endpoints for the booking system
  // Check if Stripe is configured
  app.get('/api/config/stripe', (_req, res) => {
    res.json({
      isConfigured: isStripeConfigured(),
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || ''
    });
  });

  // Create a deposit payment intent (£200)
  app.post('/api/create-deposit-payment-intent', csrfProtection, async (req, res) => {
    try {
      const { email, currency = 'gbp', metadata = {} } = req.body;
      
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
      
      console.log('Creating deposit payment intent with email:', email);
      console.log('Metadata received:', metadata);
      
      // Create the payment intent for the £200 deposit
      const paymentIntentData = await createDepositPaymentIntent(email, currency, metadata);
      
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
        paymentIntentId: paymentIntentData.id
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
  
  // Stripe webhook handler for processing payment events
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    console.log('Received webhook event from Stripe');
    
    if (!isStripeConfigured()) {
      console.error('Stripe not configured for webhook');
      return res.status(503).end();
    }
    
    const stripeSignature = req.headers['stripe-signature'];
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeSignature) {
      console.error('Missing Stripe signature');
      return res.status(400).send('Missing Stripe signature');
    }
    
    let event;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });
    
    try {
      if (stripeWebhookSecret) {
        // If webhook secret is set, verify the signature
        event = stripe.webhooks.constructEvent(
          req.body,
          stripeSignature,
          stripeWebhookSecret
        );
      } else {
        // For development, just parse the event
        event = JSON.parse(req.body.toString());
        console.warn('Webhook signature verification skipped - webhook secret not configured');
      }
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
          
          // Extract customer email from payment intent metadata
          const customerEmail = paymentIntent.metadata?.customerEmail || '';
          const paymentType = paymentIntent.metadata?.type || 'payment';
          const bookingId = paymentIntent.metadata?.bookingId;
          const quoteId = paymentIntent.metadata?.quoteId;
          const clinicId = paymentIntent.metadata?.clinicId;
          
          try {
            // Find the user by email
            const user = await storage.getUserByEmail(customerEmail);
            
            if (user) {
              // Record the payment in our database
              const paymentMetadata = paymentIntent.metadata ? 
                JSON.stringify(paymentIntent.metadata) : null;
                
              await storage.createPayment({
                userId: user.id,
                amount: String(paymentIntent.amount / 100), // Convert from cents to pounds
                currency: paymentIntent.currency,
                status: 'completed',
                paymentMethod: 'card',
                paymentType: paymentType,
                transactionId: paymentIntent.id,
                stripePaymentIntentId: paymentIntent.id,
                bookingId: bookingId ? parseInt(bookingId) : undefined,
                // Store metadata as notes instead
                notes: paymentMetadata
              });
              
              if (paymentType === 'deposit' && clinicId) {
                // If this is a deposit payment, create or update the booking
                const booking = await storage.createOrUpdateBooking({
                  userId: user.id,
                  clinicId: parseInt(clinicId),
                  quoteRequestId: quoteId ? parseInt(quoteId) : undefined,
                  depositPaid: true,
                  depositAmount: "200.00", // £200 fixed deposit
                  status: 'confirmed',
                  stage: 'pre_travel'
                  // Removed createdAt and updatedAt as they should be handled by the database
                });
                
                console.log(`Created/updated booking: ${booking.id}`);
              }
            } else {
              console.error(`User not found for email: ${customerEmail}`);
            }
          } catch (dbError) {
            console.error('Error recording payment in database:', dbError);
          }
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log(`❌ Payment failed: ${failedPayment.id}`);
          console.log(`Failure reason: ${failedPayment.last_payment_error?.message || 'Unknown'}`);
          break;
          
        case 'charge.succeeded':
          const charge = event.data.object;
          console.log(`Charge succeeded: ${charge.id}`);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      // Return a 200 response to acknowledge receipt of the event
      res.status(200).json({received: true});
    } catch (err) {
      console.error('Error processing webhook:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });

  // Add simplified test PDF endpoint
  app.post('/api/jspdf-quote-v2', (req, res) => {
    try {
      // Log data for debugging
      console.log('Received quote data in simplified endpoint');
      
      // Use the html-pdf-node library to generate a simple PDF
      const pdf = require('html-pdf-node');
      
      // Create a simple HTML page for testing
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>MyDentalFly Quote</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              h1 { color: #2563eb; text-align: center; }
              p { margin-bottom: 10px; }
              .container { max-width: 800px; margin: 0 auto; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>MyDentalFly Quote</h1>
              <p>Thank you for requesting a quote from MyDentalFly.</p>
              <p>This is a test PDF file to verify the download functionality is working.</p>
              <p>In the actual implementation, this will be replaced with a detailed quote.</p>
              <div class="footer">
                <p>MyDentalFly.com - Compare Dental Clinics. Book With Confidence. Fly With a Smile.</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Generate the PDF
      const options = { format: 'A4' };
      const file = { content: html };
      
      pdf.generatePdf(file, options).then((pdfBuffer: Buffer) => {
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=MyDentalFly_Quote.pdf');
        
        // Send the PDF buffer directly
        res.send(pdfBuffer);
      });
      
    } catch (error) {
      console.error('Error generating PDF with test endpoint:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  // Dental chart storage and retrieval
  // Simple in-memory storage for dental chart data (replace with database in production)
  const dentalChartStorage = new Map<string, any>();
  
  // Save dental chart data
  app.post('/api/save-dental-chart', csrfProtection, async (req: Request, res: Response) => {
    try {
      const { patientEmail, patientName, dentalChartData, quoteId } = req.body;
      
      if (!patientEmail || !dentalChartData) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required data (patientEmail or dentalChartData)' 
        });
      }
      
      // Create a unique key for this dental chart
      // In a real implementation, this would be associated with a user account or quote ID
      const key = `${patientEmail.toLowerCase()}_${quoteId || Date.now()}`;
      
      // Store the dental chart data
      dentalChartStorage.set(key, {
        patientEmail,
        patientName, 
        dentalChartData,
        createdAt: new Date().toISOString(),
        quoteId
      });
      
      console.log(`Dental chart data saved for ${patientName} (${patientEmail})`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Dental chart data saved successfully',
        chartId: key
      });
    } catch (error) {
      console.error('Error saving dental chart data:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save dental chart data' 
      });
    }
  });
  
  // Retrieve dental chart data
  app.get('/api/get-dental-chart', async (req: Request, res: Response) => {
    try {
      const { patientEmail, chartId } = req.query;
      
      // If chartId is provided, retrieve by chartId
      if (chartId && typeof chartId === 'string') {
        const chartData = dentalChartStorage.get(chartId);
        
        if (!chartData) {
          return res.status(404).json({ 
            success: false, 
            error: 'Dental chart not found' 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          chartData 
        });
      }
      
      // If email is provided, retrieve all charts for this email
      if (patientEmail && typeof patientEmail === 'string') {
        const email = patientEmail.toLowerCase();
        const charts = Array.from(dentalChartStorage.entries())
          .filter(([key, data]) => data.patientEmail.toLowerCase() === email)
          .map(([key, data]) => ({ chartId: key, ...data }));
        
        if (charts.length === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'No dental charts found for this patient' 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          charts 
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required query parameter (patientEmail or chartId)' 
      });
    } catch (error) {
      console.error('Error retrieving dental chart data:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve dental chart data' 
      });
    }
  });
  
  // Get list of all patient dental charts (for clinic access)
  // In a real implementation, this would be protected by authentication
  app.get('/api/all-dental-charts', async (req: Request, res: Response) => {
    try {
      // For demonstration purposes, this endpoint is not secured
      // In a production environment, this would require clinic authentication
      
      // Convert the Map to an array of objects
      const allCharts = Array.from(dentalChartStorage.entries())
        .map(([key, data]) => ({
          chartId: key,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          createdAt: data.createdAt,
          quoteId: data.quoteId
        }));
      
      return res.status(200).json({ 
        success: true, 
        charts: allCharts 
      });
    } catch (error) {
      console.error('Error retrieving all dental charts:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve dental chart list' 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize WebSocket Service for real-time data synchronization
  const wsService = setupWebSocketService(httpServer);
  
  // Create email notification service
  const emailService = createEmailNotificationService();
  
  // Create notification service with WebSocket service and email service
  const notificationService = createNotificationService(wsService, emailService);
  
  // Register notification routes
  app.use(createNotificationRoutes(notificationService));
  
  // Store services in app.locals for access in other routes if needed
  app.locals.wsService = wsService;
  app.locals.notificationService = notificationService;
  app.locals.emailService = emailService;
  
  console.log('WebSocket and notification services initialized for cross-portal data synchronization');
  
  // Initialize special offers image cache
  initializeSpecialOfferImageCache()
    .then(() => console.log('Special offer image cache initialized successfully'))
    .catch(err => console.error('Error initializing special offer image cache:', err));
  
  return httpServer;
}