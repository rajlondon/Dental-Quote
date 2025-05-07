import express from 'express';
import { z } from 'zod';
import { SpecialOffer } from '@shared/specialOffers';
import { specialOffers } from '../routes/special-offers-routes-fixed';

const router = express.Router();

// Helper function to safely check if a date is expired
const isDateExpired = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false; // No expiration date = not expired
  
  const now = new Date().getTime();
  const expiryDate = new Date(dateStr).getTime();
  
  return expiryDate < now;
};

/**
 * Get special offers for a specific clinic
 * GET /api/special-offers/clinic/:clinicId
 */
router.get('/clinic/:clinicId', async (req, res) => {
  try {
    const { clinicId } = req.params;
    
    // Get offers from the in-memory storage
    const clinicOffers = specialOffers.get(clinicId) || [];
    
    // Filter for active and non-expired offers
    const activeOffers = clinicOffers.filter(
      offer => offer.is_active && 
               offer.admin_approved && 
               !isDateExpired(offer.end_date)
    );
    
    return res.json(activeOffers);
  } catch (error) {
    console.error('Error fetching clinic offers:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Match treatments to special offers
 * POST /api/special-offers/match-treatments
 * Body: { clinicId: number, treatments: Array<{ name: string, category: string, quantity: number }> }
 */
const matchTreatmentsSchema = z.object({
  clinicId: z.number().int().positive().or(z.string()),
  treatments: z.array(
    z.object({
      name: z.string(),
      category: z.string().optional(),
      quantity: z.number().int().positive().optional(),
      id: z.string().optional()
    })
  )
});

router.post('/match-treatments', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = matchTreatmentsSchema.parse(req.body);
    const { clinicId, treatments } = validatedData;
    
    // Convert clinicId to string if it's a number
    const clinicIdStr = typeof clinicId === 'number' ? clinicId.toString() : clinicId;
    
    // Get offers from the in-memory storage
    const clinicOffers = specialOffers.get(clinicIdStr) || [];
    
    // Filter for active and non-expired offers
    const validOffers = clinicOffers.filter(
      offer => offer.is_active && 
               offer.admin_approved && 
               !isDateExpired(offer.end_date)
    );
    
    // If no offers found, return an empty array
    if (validOffers.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          matchedOffers: [],
          clinic: { id: clinicIdStr, name: `Clinic ${clinicIdStr}` },
          message: 'No special offers available for this clinic at this time.'
        }
      });
    }
    
    // Match offers with treatments
    // This is a simplified implementation - in production you might need more sophisticated matching
    const treatmentNames = treatments.map(t => t.name.toLowerCase());
    const treatmentCategories = treatments
      .filter(t => t.category)
      .map(t => t.category!.toLowerCase());
    
    // Check each offer to see if it's applicable to the patient's treatments
    const matchedOffers = validOffers.map(offer => {
      // More robust matching logic
      // Check if any of the applicable treatments in the offer match the treatment names
      let isMatch = false;
      
      // First check if the treatment names match any of the applicable treatments in the offer
      if (offer.applicable_treatments && offer.applicable_treatments.length > 0) {
        console.log(`Checking offer "${offer.title}" with applicable treatments:`, offer.applicable_treatments);
        console.log(`Against treatment names:`, treatmentNames);
        
        isMatch = offer.applicable_treatments.some(applicableTreatment => {
          // Normalize the applicable treatment by replacing underscores with spaces
          const normalizedAppTreatment = applicableTreatment.toLowerCase().replace(/_/g, ' ');
          
          return treatmentNames.some(name => {
            // Normalize the treatment name
            const normalizedName = name.toLowerCase().replace(/_/g, ' ');
            
            // Remove periods from abbreviations
            const cleanName = normalizedName.replace(/\./g, '');
            const cleanAppTreatment = normalizedAppTreatment.replace(/\./g, '');
            
            // Check for exact match
            if (cleanName === cleanAppTreatment) {
              console.log(`Exact match between "${cleanName}" and "${cleanAppTreatment}"`);
              return true;
            }
            
            // Check if either contains the other
            const nameMatch = cleanName.includes(cleanAppTreatment);
            const appMatch = cleanAppTreatment.includes(cleanName);
            
            // Check for word match (handling abbreviations)
            let wordMatch = false;
            const nameWords = cleanName.split(' ');
            const appWords = cleanAppTreatment.split(' ');
            
            // If normalized name starts with the same words as the applicable treatment,
            // and has at least half the number of words, consider it a match
            if (nameWords.length >= 2 && appWords.length >= 2) {
              const minWordCount = Math.min(nameWords.length, appWords.length);
              let matchingWords = 0;
              
              for (let i = 0; i < minWordCount; i++) {
                // Check if words match or if it's an abbreviated version
                if (nameWords[i] === appWords[i] || 
                    (nameWords[i].length > 2 && appWords[i].startsWith(nameWords[i].substring(0, 3))) ||
                    (appWords[i].length > 2 && nameWords[i].startsWith(appWords[i].substring(0, 3)))) {
                  matchingWords++;
                }
              }
              
              wordMatch = matchingWords >= Math.floor(minWordCount / 2) + 1;
            }
            
            console.log(`Comparing "${cleanName}" with "${cleanAppTreatment}": nameMatch=${nameMatch}, appMatch=${appMatch}, wordMatch=${wordMatch}`);
            
            return nameMatch || appMatch || wordMatch;
          });
        });
        
        console.log(`Match result for "${offer.title}": ${isMatch}`);
      }
      
      // If no match found, try matching with keywords from the offer title
      if (!isMatch) {
        const offerKeywords = offer.title.toLowerCase().split(' ');
        
        isMatch = offerKeywords.some((keyword: string) => 
          treatmentNames.some(name => {
            // Normalize the treatment name by replacing underscores with spaces
            const normalizedName = name.toLowerCase().replace(/_/g, ' ');
            return normalizedName.includes(keyword);
          }) || 
          treatmentCategories.some(category => {
            if (!category) return false;
            // Normalize the category by replacing underscores with spaces
            const normalizedCategory = category.toLowerCase().replace(/_/g, ' ');
            return normalizedCategory.includes(keyword);
          })
        );
      }
      
      return {
        ...offer,
        isMatched: isMatch,
        displayText: isMatch ? 
          `Eligible for ${offer.title} (${offer.discount_type === 'percentage' ? offer.discount_value + '%' : '£' + offer.discount_value} off)` : 
          `Add ${offer.title} to your plan to qualify`
      };
    });
    
    return res.json({ 
      success: true, 
      data: { 
        matchedOffers,
        clinic: { id: clinicIdStr, name: `Clinic ${clinicIdStr}` },
        message: matchedOffers.some(o => o.isMatched) ? 
          'You qualify for special offers! Apply them to save on your treatment.' : 
          'Add more treatments to qualify for special offers.'
      }
    });
  } catch (error) {
    console.error('Error matching treatments to offers:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Apply a special offer to a treatment plan
 * POST /api/special-offers/apply
 */
const applyOfferSchema = z.object({
  specialOfferId: z.string().uuid(),
  treatmentPlanId: z.string().uuid().optional(),
  treatments: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      quantity: z.number().int().positive().optional(),
      priceGBP: z.number().positive()
    })
  ),
  patientId: z.number().int().positive().optional()
});

router.post('/apply', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = applyOfferSchema.parse(req.body);
    const { specialOfferId, treatments, patientId, treatmentPlanId } = validatedData;
    
    // Find the offer in the in-memory storage
    let foundOffer: SpecialOffer | undefined;
    
    // Convert entries to array to avoid iterator issues
    const entries = Array.from(specialOffers.entries());
    for (const [clinicId, offers] of entries) {
      const offer = offers.find((o: SpecialOffer) => o.id === specialOfferId);
      if (offer) {
        foundOffer = offer;
        break;
      }
    }
    
    if (!foundOffer) {
      return res.status(404).json({ success: false, message: 'Special offer not found' });
    }
    
    const offer = foundOffer;
    
    if (!offer.is_active) {
      return res.status(400).json({ success: false, message: 'This special offer is no longer active' });
    }
    
    // Check if offer is expired
    if (isDateExpired(offer.end_date)) {
      return res.status(400).json({ success: false, message: 'This special offer has expired' });
    }
    
    // Apply the discount to the treatments, but only apply to eligible treatments
    const discountedTreatments = treatments.map(treatment => {
      // First determine if this treatment is eligible for the special offer
      const treatmentName = treatment.name.toLowerCase().replace(/_/g, ' ').replace(/\./g, '');
      const isEligible = offer.applicable_treatments.some(appTreatment => {
        const normalizedAppTreatment = appTreatment.toLowerCase().replace(/_/g, ' ').replace(/\./g, '');
        return treatmentName.includes(normalizedAppTreatment) || 
               normalizedAppTreatment.includes(treatmentName);
      });
      
      // If treatment is not eligible, return it unchanged
      if (!isEligible) {
        return treatment;
      }
      
      // Apply discount based on the offer type
      let discountedPrice = treatment.priceGBP;
      
      if (offer.discount_type === 'percentage') {
        discountedPrice = treatment.priceGBP * (1 - (Number(offer.discount_value) / 100));
      } else {
        discountedPrice = treatment.priceGBP - Number(offer.discount_value);
      }
      
      // Ensure the price doesn't go below zero
      discountedPrice = Math.max(0, discountedPrice);
      
      return {
        ...treatment,
        originalPriceGBP: treatment.priceGBP,
        priceGBP: discountedPrice,
        specialOfferApplied: true,
        specialOfferId: offer.id,
        specialOfferTitle: offer.title,
        discountAmount: treatment.priceGBP - discountedPrice
      };
    });
    
    // Calculate the total savings
    const totalSavings = discountedTreatments.reduce(
      (sum, t) => sum + (t.originalPriceGBP - t.priceGBP), 
      0
    );
    
    // If treatmentPlanId is provided, update the treatment plan in the database
    if (treatmentPlanId) {
      // This would be the code to update the treatment plan
      // For now, we'll just return the discounted treatments
      console.log(`Would update treatment plan ${treatmentPlanId} with discounted treatments`);
    }
    
    return res.json({
      success: true,
      data: {
        discountedTreatments,
        totalSavings,
        message: `${offer.title} has been applied. You saved ${offer.discount_type === 'percentage' ? 
          offer.discount_value + '%' : 
          '£' + totalSavings.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Error applying special offer:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;