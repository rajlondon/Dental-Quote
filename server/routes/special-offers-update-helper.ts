/**
 * Special Offers Image Update Helper Routes
 * 
 * This file contains special routes to help with refreshing special offer images
 * using the OpenAI DALL-E API. These routes are designed to work with the refresh-offer-images.js
 * script for easy updating of special offer images.
 */

import express from "express";
import { specialOffers } from "./special-offers-routes-fixed";
import { generateSpecialOfferImage } from "../services/openai-service";
import { WebSocketService } from "../services/websocketService";


// Create router
const router = express.Router();

// Test the offer data retrieval (GET)
router.get("/api/special-offers/test-refresh/:offerId", async (req, res) => {
  const { offerId } = req.params;
  
  if (!offerId) {
    return res.status(400).json({
      success: false,
      message: "Offer ID is required"
    });
  }
  
  try {
    // Search for the offer in all clinic offer lists
    let foundOffer = null;
    
    specialOffers.forEach(clinicOffers => {
      const offer = clinicOffers.find(o => o.id === offerId);
      if (offer) {
        foundOffer = offer;
      }
    });
    
    if (!foundOffer) {
      return res.status(404).json({
        success: false,
        message: `Offer with ID ${offerId} not found`
      });
    }
    
    // Return the offer data with current image URL
    return res.status(200).json({
      success: true,
      offer: {
        id: foundOffer.id,
        title: foundOffer.title,
        description: foundOffer.description,
        clinic_id: foundOffer.clinic_id
      },
      currentImageUrl: foundOffer.banner_image
    });
  } catch (error) {
    console.error("Error testing offer refresh:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving offer data",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Refresh the image for a specific offer (POST)
router.post("/api/special-offers/refresh-image/:offerId", async (req, res) => {
  const { offerId } = req.params;
  const { naturalStyle = true, customPrompt = "" } = req.body;
  
  if (!offerId) {
    return res.status(400).json({
      success: false,
      message: "Offer ID is required"
    });
  }
  
  try {
    // Search for the offer in all clinic offer lists
    let foundOffer = null;
    let foundClinicId = null;
    let offerIndex = -1;
    
    specialOffers.forEach((clinicOffers, clinicId) => {
      const index = clinicOffers.findIndex(o => o.id === offerId);
      if (index !== -1) {
        foundOffer = clinicOffers[index];
        foundClinicId = clinicId;
        offerIndex = index;
      }
    });
    
    if (!foundOffer || foundClinicId === null || offerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Offer with ID ${offerId} not found`
      });
    }
    
    // Generate a new image for the offer
    const imageResult = await generateSpecialOfferImage(
      foundOffer.title,
      foundOffer.discount_type,
      customPrompt || undefined,
      naturalStyle
    );
    
    if (!imageResult || !imageResult.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate new image"
      });
    }
    
    // Get cleaned URL without query parameters
    const imageUrl = imageResult.url.split('?')[0];
    
    // Update the offer with the new image URL
    const clinicOffers = specialOffers.get(foundClinicId)!;
    clinicOffers[offerIndex] = {
      ...foundOffer,
      banner_image: imageUrl,
      updated_at: new Date().toISOString()
    };
    specialOffers.set(foundClinicId, clinicOffers);
    
    // Send WebSocket notifications to all connected clients to refresh their offers
    // Using a staggered approach to ensure images are properly loaded
    // First notification - immediate
    WebSocketService.broadcastToAll({
      type: 'SPECIAL_OFFER_UPDATED',
      data: { offerId, imageUrl }
    });
    
    // Second notification - after 1 second
    setTimeout(() => {
      WebSocketService.broadcastToAll({
        type: 'SPECIAL_OFFER_IMAGE_REFRESH',
        data: { offerId, timestamp: Date.now() }
      });
    }, 1000);
    
    // Third notification - after 2 seconds
    setTimeout(() => {
      WebSocketService.broadcastToAll({
        type: 'CACHE_INVALIDATION',
        data: { 
          type: 'special_offers',
          timestamp: Date.now()
        }
      });
    }, 2000);
    
    // Return success with the new image URL
    return res.status(200).json({
      success: true,
      message: "Offer image refreshed successfully",
      offerId,
      imageUrl,
      offer: foundOffer.title
    });
  } catch (error) {
    console.error("Error refreshing offer image:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while refreshing offer image",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;