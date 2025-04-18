# MyDentalFly

A comprehensive dental tourism platform connecting UK and EU patients with top-rated dental clinics in Turkey through an advanced, user-centric patient portal.

## Domain Configuration

If you're having trouble with domain configuration, here are some important notes:

### For .com domains:
- Add an **A record** for "www" pointing to `34.111.179.208`
- Add a **TXT record** for "www" with the verification code provided by Replit

### For .co.uk domains:
- Add an **A record** for "www.mydentalfly" pointing to `34.111.179.208`
- Add a **TXT record** for "www.mydentalfly" with the verification code provided by Replit

## Deployment Process

1. First, verify your domain in the Replit interface
2. Click the "Deploy" button to deploy the application
3. Wait for the deployment process to complete
4. Your site should be accessible at your domain

## Troubleshooting

If you're seeing a 502 error or "This site can't be reached":

1. Make sure your domain's DNS records are configured correctly
2. Check that the deployment process completed successfully
3. Try accessing the domain verification page at your-domain.com/domaintest.html
4. If problems persist, check the deployment logs in the Replit interface

## Server Information

The production server provides several endpoints for diagnostics:

- `/`: Main application or domain verification page
- `/api/health`: Server health check endpoint
- `/api/domain-info`: Detailed information about the domain configuration
- `/simple`: A simplified fallback page for testing

## Environment Variables

The following environment variables are required:

- `STRIPE_SECRET_KEY`: Stripe payment processing
- `EMAILJS_SERVICE_ID`: EmailJS service
- `EMAILJS_TEMPLATE_ID`: EmailJS template
- `EMAILJS_PUBLIC_KEY`: EmailJS public key