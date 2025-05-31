const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Email verification redirect
app.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).send(`
      <html>
        <head><title>MyDentalFly - Verification Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Verification Error</h2>
          <p>Invalid verification link.</p>
          <a href="https://mydentalfly.co.uk" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to MyDentalFly</a>
        </body>
      </html>
    `);
  }

  try {
    // Check token and verify
    const result = await db.query(
      'SELECT id, email, first_name FROM users WHERE email_verification_token = $1 AND email_verified = false',
      [token]
    );

    if (result.rows.length === 0) {
      return res.send(`
        <html>
          <head><title>MyDentalFly - Verification Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h2 style="color: #dc2626;">Verification Error</h2>
            <p>Invalid or expired verification token. Your email may already be verified.</p>
            <a href="https://mydentalfly.co.uk" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to MyDentalFly</a>
          </body>
        </html>
      `);
    }

    const user = result.rows[0];

    // Verify the user
    await db.query(
      'UPDATE users SET email_verified = true, status = $1, email_verification_token = null WHERE id = $2',
      ['active', user.id]
    );

    console.log(`Email verified successfully for: ${user.email}`);

    // Success page
    res.send(`
      <html>
        <head><title>MyDentalFly - Email Verified</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #16a34a;">Email Verified Successfully!</h2>
          <p>Welcome to MyDentalFly, ${user.first_name}! Your account is now active.</p>
          <a href="https://mydentalfly.co.uk" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue to MyDentalFly</a>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send(`
      <html>
        <head><title>MyDentalFly - Verification Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Verification Error</h2>
          <p>Something went wrong. Please try again or contact support.</p>
          <a href="https://mydentalfly.co.uk" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to MyDentalFly</a>
        </body>
      </html>
    `);
  }
});

// Fallback for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MyDentalFly verification server running on port ${PORT}`);
});