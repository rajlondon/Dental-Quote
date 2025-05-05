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
  console.log(`[DEBUG] PUBLIC GET /api/public/packages request received`);
  console.log(`[DEBUG] Request headers:`, JSON.stringify(req.headers, null, 2));
  
  try {
    const packagesList = await db.select().from(packages).where(eq(packages.isActive, true));
    
    console.log(`[DEBUG] Found ${packagesList.length} active packages`);
    
    if (packagesList.length === 0) {
      console.log('[WARNING] No active packages found in the database');
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Log the structure of the first package for debugging
    const samplePackage = packagesList[0];
    console.log(`[DEBUG] First package structure:`, JSON.stringify({
      id: samplePackage.id,
      name: samplePackage.name,
      totalFields: Object.keys(samplePackage).length
    }, null, 2));
    
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
      
      // Try to identify the problematic fields
      packagesList.forEach((pkg, index) => {
        try {
          JSON.stringify(pkg);
        } catch (e) {
          console.error(`[ERROR] Package at index ${index} failed to serialize:`, e);
          // Try to identify which field is causing the issue
          for (const [key, value] of Object.entries(pkg)) {
            try {
              JSON.stringify({ [key]: value });
            } catch (fieldError) {
              console.error(`[ERROR] Field '${key}' in package ${index} causes serialization error:`, fieldError);
            }
          }
        }
      });
      
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
  
  console.log(`[DEBUG] PUBLIC GET /api/public/packages/${packageId} request received`);
  console.log(`[DEBUG] Request headers:`, JSON.stringify(req.headers, null, 2));
  
  try {
    // Map URL slugs to package IDs if needed
    const slugToIdMap: Record<string, string> = {
      'hollywood-smile-vacation': 'e53cc92a-596d-4edc-a3f4-b1f31856415e',
      // Add more mappings as needed
    };
    
    // Get the actual ID to use for the database query
    const dbPackageId = slugToIdMap[packageId] || packageId;
    
    console.log(`[DEBUG] Looking up package - URL param: ${packageId}, Database ID: ${dbPackageId}`);
    
    // Try a simpler query first to see if we can get the package
    try {
      const simplePackage = await db.select().from(packages).where(eq(packages.id, dbPackageId));
      console.log(`[DEBUG] Simple query found ${simplePackage.length} packages`);
      
      if (simplePackage.length > 0) {
        console.log(`[DEBUG] Simple package structure:`, JSON.stringify({
          id: simplePackage[0].id,
          name: simplePackage[0].name,
          totalFields: Object.keys(simplePackage[0]).length
        }, null, 2));
      }
    } catch (e) {
      console.error('[ERROR] Simple package query failed:', e);
    }
    
    // Now try the full query with relations
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
    console.log(`[DEBUG] Package structure:`, JSON.stringify({
      id: packageData.id,
      name: packageData.name,
      totalFields: Object.keys(packageData).length,
      hasHotelDetails: !!packageData.hotelDetails,
      hasFlightDetails: !!packageData.flightDetails,
      hotelDetailsType: packageData.hotelDetails ? typeof packageData.hotelDetails : 'none',
      flightDetailsType: packageData.flightDetails ? typeof packageData.flightDetails : 'none'
    }, null, 2));
    
    // Process JSON fields to ensure proper serialization (safely handling nulls)
    const processedPackage = {
      ...packageData,
      // Safely handle potential JSON string fields with null checks
      hotelDetails: packageData.hotelDetails ? (
        typeof packageData.hotelDetails === 'string' 
          ? JSON.parse(packageData.hotelDetails) 
          : packageData.hotelDetails
      ) : null,
      flightDetails: packageData.flightDetails ? (
        typeof packageData.flightDetails === 'string' 
          ? JSON.parse(packageData.flightDetails) 
          : packageData.flightDetails
      ) : null
    };
    
    // Additional safe processing for circular structures (clinic relations)
    const safeProcessedPackage = {
      ...processedPackage,
      // If clinic has circular references, flatten it to avoid serialization issues
      clinic: processedPackage.clinic ? {
        id: processedPackage.clinic.id,
        name: processedPackage.clinic.name,
        email: processedPackage.clinic.email,
        city: processedPackage.clinic.city,
        country: processedPackage.clinic.country,
        specialties: processedPackage.clinic.specialties || [],
        rating: processedPackage.clinic.rating || 0,
        reviewCount: processedPackage.clinic.reviewCount || 0
      } : null
    };
    
    // Let's make sure we're returning valid JSON
    const responseData = {
      success: true,
      data: safeProcessedPackage
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
      for (const [key, value] of Object.entries(safeProcessedPackage)) {
        try {
          JSON.stringify({ [key]: value });
          console.log(`[DEBUG] Field '${key}' serializes correctly`);
        } catch (fieldError) {
          console.error(`[ERROR] Field '${key}' causes serialization error:`, fieldError);
          // If we find a problematic field, create a stripped-down version of the package
          delete safeProcessedPackage[key as keyof typeof safeProcessedPackage];
          console.log(`[DEBUG] Removed problematic field '${key}'`);
        }
      }
      
      // Try sending a cleaned version of the data without the problematic fields
      try {
        console.log('[DEBUG] Attempting to send cleaned package data without problematic fields');
        const cleanedData = {
          success: true,
          data: safeProcessedPackage,
          warning: "Some fields were removed due to serialization issues"
        };
        
        return res.status(200).json(cleanedData);
      } catch (finalError) {
        console.error('[ERROR] Even cleaned package data failed to serialize:', finalError);
        return res.status(500).json({
          success: false,
          message: "Failed to serialize package data, even after cleaning"
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching package ${packageId}:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch package details: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

export default router;