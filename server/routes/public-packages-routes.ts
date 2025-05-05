import express, { Router, Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { packages } from "@shared/schema";

const router: Router = express.Router();

/**
 * Public Package Routes
 * 
 * These routes provide public access to package data without authentication
 * for displaying on public-facing pages
 */

// Get all active packages
router.get("/packages", async (req: Request, res: Response) => {
  console.log(`[DEBUG] GET /public/packages request received`);
  
  try {
    const packagesList = await db.select().from(packages).where(eq(packages.isActive, true));
    
    console.log(`[DEBUG] Found ${packagesList.length} active packages`);
    
    // Let's make sure we're returning valid JSON
    const responseData = {
      success: true,
      data: packagesList
    };
    
    // Verify the data can be serialized properly
    try {
      const serializedData = JSON.stringify(responseData);
      console.log(`[DEBUG] Successfully serialized package data: ${serializedData.substring(0, 100)}...`);
      
      return res.status(200).json(responseData);
    } catch (jsonError) {
      console.error('[ERROR] Failed to serialize package data to JSON:', jsonError);
      return res.status(500).json({
        success: false,
        message: "Failed to serialize package data"
      });
    }
  } catch (error) {
    console.error("Error fetching packages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch packages"
    });
  }
});

// Get a specific package by ID
router.get("/packages/:packageId", async (req: Request, res: Response) => {
  const { packageId } = req.params;
  
  console.log(`[DEBUG] GET /public/packages/${packageId} request received`);
  
  try {
    // Map URL slugs to package IDs if needed
    const slugToIdMap: Record<string, string> = {
      'hollywood-smile-vacation': 'e53cc92a-596d-4edc-a3f4-b1f31856415e',
      // Add more mappings as needed
    };
    
    // Get the actual ID to use for the database query
    const dbPackageId = slugToIdMap[packageId] || packageId;
    
    console.log(`[DEBUG] Looking up package - URL param: ${packageId}, Database ID: ${dbPackageId}`);
    
    const packageData = await db.query.packages.findFirst({
      where: eq(packages.id, dbPackageId as string),
      with: {
        clinic: true
      }
    });
    
    if (!packageData) {
      console.log(`[ERROR] Package not found: ${packageId} (DB ID: ${dbPackageId})`);
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }
    
    console.log(`[DEBUG] Package data found for ${packageId} (DB ID: ${dbPackageId})`);
    
    // Process JSON fields to ensure proper serialization
    const processedPackage = {
      ...packageData,
      // Safely handle potential JSON string fields
      hotelDetails: typeof packageData.hotelDetails === 'string' 
        ? JSON.parse(packageData.hotelDetails) 
        : packageData.hotelDetails,
      flightDetails: typeof packageData.flightDetails === 'string' 
        ? JSON.parse(packageData.flightDetails) 
        : packageData.flightDetails
    };
    
    // Let's make sure we're returning valid JSON
    const responseData = {
      success: true,
      data: processedPackage
    };
    
    // Verify the data can be serialized properly
    try {
      const serializedData = JSON.stringify(responseData);
      console.log(`[DEBUG] Successfully serialized package data: ${serializedData.substring(0, 100)}...`);
      
      return res.status(200).json(responseData);
    } catch (jsonError) {
      console.error('[ERROR] Failed to serialize package data to JSON:', jsonError);
      
      // Try to identify the problematic fields
      console.error('[DEBUG] Problem fields examination:');
      for (const [key, value] of Object.entries(processedPackage)) {
        try {
          JSON.stringify({ [key]: value });
          console.log(`[DEBUG] Field '${key}' serializes correctly`);
        } catch (fieldError) {
          console.error(`[ERROR] Field '${key}' causes serialization error:`, fieldError);
        }
      }
      
      return res.status(500).json({
        success: false,
        message: "Failed to serialize package data"
      });
    }
  } catch (error) {
    console.error(`Error fetching package ${packageId}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch package details"
    });
  }
});

export default router;