import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Get all treatment options
router.get('/treatments', async (req, res) => {
  try {
    const treatments = await db.execute(sql`
      SELECT id, name, description, base_price, clinic_id
      FROM treatments
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);
    
    res.json(treatments.rows);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ success: false, message: 'Error retrieving treatments' });
  }
});

// Get all treatment packages
router.get('/treatment-packages', async (req, res) => {
  try {
    const packages = await db.execute(sql`
      SELECT id, name, description, price, image_url, city_code
      FROM treatment_packages
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);
    
    res.json(packages.rows);
  } catch (error) {
    console.error('Error fetching treatment packages:', error);
    res.status(500).json({ success: false, message: 'Error retrieving packages' });
  }
});

// Save a quote to the database
router.post('/quotes-api/save', async (req, res) => {
  try {
    const { 
      patientName, 
      patientEmail, 
      items,
      subtotal,
      discount,
      total,
      promoCode
    } = req.body;
    
    if (!patientName || !items || !items.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: patient name and at least one quote item' 
      });
    }
    
    // Create a quote record
    const quoteResult = await db.execute(sql`
      INSERT INTO quotes (
        patient_name, 
        patient_email, 
        subtotal, 
        discount_amount,
        total_amount,
        promo_code,
        status,
        created_at
      )
      VALUES (
        ${patientName},
        ${patientEmail || null},
        ${subtotal},
        ${discount || 0},
        ${total},
        ${promoCode || null},
        'draft',
        NOW()
      )
      RETURNING id
    `);
    
    const quoteId = quoteResult.rows[0].id;
    
    // Insert quote items
    for (const item of items) {
      await db.execute(sql`
        INSERT INTO quote_items (
          quote_id,
          treatment_name,
          clinic_name,
          quantity,
          unit_price,
          total_price,
          is_package
        )
        VALUES (
          ${quoteId},
          ${item.treatmentName},
          ${item.clinicName},
          ${item.quantity},
          ${item.unitPrice},
          ${item.totalPrice},
          ${item.isPackage || false}
        )
      `);
    }
    
    res.json({ 
      success: true, 
      message: 'Quote saved successfully', 
      quoteId,
      quoteNumber: `Q-${quoteId}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  } catch (error) {
    console.error('Error saving quote:', error);
    res.status(500).json({ success: false, message: 'Error saving quote' });
  }
});

// Generate a PDF quote
router.post('/quotes-api/generate-pdf', async (req, res) => {
  try {
    // In a real implementation, this would generate a PDF
    // For the test page, we'll just return a success message
    
    setTimeout(() => {
      res.json({ 
        success: true, 
        message: 'PDF generated successfully',
        pdfUrl: '/sample-quote.pdf' // This would be a real URL in production
      });
    }, 1500); // Simulate PDF generation time
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  }
});

// Send an email with the quote
router.post('/quotes-api/email', async (req, res) => {
  try {
    const { email, quoteId } = req.body;
    
    if (!email || !quoteId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email and quoteId' 
      });
    }
    
    // In a real implementation, this would send an email
    // For the test page, we'll just return a success message
    
    setTimeout(() => {
      res.json({ 
        success: true, 
        message: `Quote sent successfully to ${email}`
      });
    }, 2000); // Simulate email sending time
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

export default router;