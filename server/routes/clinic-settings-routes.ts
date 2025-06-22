
import express from 'express';
import { db } from '../db';
import { clinics } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Update clinic profile
router.put('/profile', async (req, res) => {
  try {
    const { name, description, tier, address, phoneNumber, email, website, yearEstablished, photos, videos } = req.body;
    
    // Get clinic ID from session/auth (assuming it's available)
    const clinicId = req.user?.clinicId || 1; // Fallback for development
    
    const updatedClinic = await db.update(clinics)
      .set({
        name,
        description,
        address,
        phoneNumber,
        email,
        website,
        yearEstablished,
        updatedAt: new Date()
      })
      .where(eq(clinics.id, clinicId))
      .returning();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      clinic: updatedClinic[0]
    });
  } catch (error) {
    console.error('Error updating clinic profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Add treatment
router.post('/treatments', async (req, res) => {
  try {
    const { name, category, priceGBP, priceUSD, priceEUR, guarantee } = req.body;
    
    // For now, we'll store treatments in a simple format
    // In a full implementation, you'd have a treatments table
    const treatment = {
      id: Date.now(),
      name,
      category,
      priceGBP,
      priceUSD,
      priceEUR,
      guarantee,
      createdAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Treatment added successfully',
      ...treatment
    });
  } catch (error) {
    console.error('Error adding treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add treatment',
      error: error.message
    });
  }
});

// Get clinic treatments
router.get('/treatments', async (req, res) => {
  try {
    // For now, return mock data
    // In a full implementation, you'd query the treatments table
    const treatments = [
      { id: 1, name: "Dental Implant", category: "Implants", priceGBP: 750, priceUSD: 975, priceEUR: 862, guarantee: "Lifetime" },
      { id: 2, name: "Porcelain Crown", category: "Crowns", priceGBP: 200, priceUSD: 260, priceEUR: 230, guarantee: "5 Years" },
      { id: 3, name: "Teeth Whitening", category: "Cosmetic", priceGBP: 180, priceUSD: 234, priceEUR: 207, guarantee: "1 Year" }
    ];
    
    res.json({
      success: true,
      treatments
    });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatments',
      error: error.message
    });
  }
});

export default router;
