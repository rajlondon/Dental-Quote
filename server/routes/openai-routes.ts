import { Router } from "express";
import { generateImage, generateSpecialOfferImage, generateDentalTreatmentImage } from "../services/openai-service";
import { storage } from "../storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const router = Router();

/**
 * Generate an image using DALL-E
 * POST /api/openai/generate-image
 */
router.post("/generate-image", async (req, res) => {
  try {
    const { prompt, size } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const result = await generateImage(
      prompt, 
      size as "1024x1024" | "1792x1024" | "1024x1792"
    );

    return res.json({
      success: true,
      imageUrl: result.url,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Generate a special offer image and save it to S3
 * POST /api/openai/special-offer-image
 */
router.post("/special-offer-image", async (req, res) => {
  try {
    const { title, type, offerId } = req.body;

    if (!title || !type || !offerId) {
      return res.status(400).json({
        success: false,
        message: "Title, type, and offerId are required",
      });
    }

    // Check if user is authorized (clinic staff or admin)
    if (
      !req.isAuthenticated() ||
      (req.user.role !== "admin" && req.user.role !== "clinic_staff")
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only clinic staff and admins can generate special offer images.",
      });
    }

    // Generate the image using DALL-E
    const result = await generateSpecialOfferImage(title, type);
    
    if (!result.url) {
      throw new Error("Failed to generate image URL");
    }

    // Download the image
    const imageResponse = await axios.get(result.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data, 'binary');
    
    // Generate a unique filename
    const filename = `special-offer-${offerId}.png`;
    
    // Save image temporarily
    const tempPath = path.join(__dirname, '../../uploads', filename);
    fs.writeFileSync(tempPath, buffer);

    // Upload to S3
    const s3Result = await storage.uploadFile({
      fieldname: 'specialOfferImage',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: buffer,
      destination: 'uploads/',
      filename: filename,
      path: tempPath,
      size: buffer.length
    });

    // Delete temporary file
    fs.unlinkSync(tempPath);

    // Update the special offer with the new image URL
    await storage.updateSpecialOfferImage(offerId, s3Result.url);

    return res.json({
      success: true,
      imageUrl: s3Result.url,
      message: "Special offer image generated and saved successfully",
    });
  } catch (error) {
    console.error("Error generating special offer image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate special offer image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Generate images for dental treatments
 * POST /api/openai/treatment-image
 */
router.post("/treatment-image", async (req, res) => {
  try {
    const { treatmentType } = req.body;

    if (!treatmentType) {
      return res.status(400).json({
        success: false,
        message: "Treatment type is required",
      });
    }

    // Check if user is authorized (admin only)
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only admins can generate treatment images.",
      });
    }

    const result = await generateDentalTreatmentImage(treatmentType);

    return res.json({
      success: true,
      imageUrl: result.url,
    });
  } catch (error) {
    console.error("Error generating treatment image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate treatment image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;