import OpenAI from "openai";
import { getLogoAsBase64 } from "../utils/logo-utils";
import { isProduction } from "../utils/environment";
import { logError, ErrorSeverity } from "./error-logger";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";

// Track API usage to handle rate limits
let lastImageGenerationTime = 0;
let imageGenerationCount = 0;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window 
const MAX_IMAGES_PER_WINDOW = 15; // Standard tier is 50/minute, using a conservative value

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verify that the OpenAI API key is properly configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Check if we might be approaching rate limits
function checkRateLimits(): boolean {
  const now = Date.now();
  
  // Reset counter if we're in a new window
  if (now - lastImageGenerationTime > RATE_LIMIT_WINDOW) {
    imageGenerationCount = 0;
    lastImageGenerationTime = now;
    return true; // OK to proceed
  }
  
  // Check if we're over the limit
  if (imageGenerationCount >= MAX_IMAGES_PER_WINDOW) {
    console.warn(`OpenAI rate limit reached: Generated ${imageGenerationCount} images in the current window (limit: ${MAX_IMAGES_PER_WINDOW} per ${RATE_LIMIT_WINDOW/1000}s). Using fallback images.`);
    return false; // Not OK to proceed
  }
  
  return true; // OK to proceed
}

/**
 * Generate an image using OpenAI's DALL-E model
 * @param prompt The text prompt to generate an image from
 * @param size The size of the image to generate (default: 1024x1024)
 * @returns Object containing the URL of the generated image
 */
export async function generateImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<{ url: string }> {
  try {
    if (!isOpenAIConfigured()) {
      throw new Error("OpenAI API key not configured");
    }
    
    // Check rate limits
    if (!checkRateLimits()) {
      throw new Error("OpenAI API quota limit reached (15 images per minute). Using fallback images instead.");
    }

    console.log(`Generating image for prompt: ${prompt.substring(0, 100)}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "standard",
    });

    // Update rate limit tracking
    imageGenerationCount++;
    lastImageGenerationTime = Date.now();
    
    // Log success
    console.log("Image generated successfully via DALL-E API");
    
    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error("OpenAI returned empty response");
    }
    
    const imageUrl = response.data[0].url ?? "";
    console.log(`Raw OpenAI response URL: ${imageUrl}`);
    
    // Verify the URL format for debugging
    const isValidUrl = imageUrl.startsWith('https://');
    const isAzureBlobUrl = imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net');
    
    console.log(`URL validation checks: 
    - Is valid HTTPS URL: ${isValidUrl}
    - Is Azure Blob Storage URL: ${isAzureBlobUrl}
    - Full URL for reference: ${imageUrl}`);
    
    return { url: imageUrl };
  } catch (error) {
    console.error("OpenAI image generation error:", error);
    
    // Log detailed error for debugging
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }
    
    logError(error instanceof Error ? error : new Error(errorMessage), {
      component: "OpenAI",
      operation: "generateImage",
      prompt: prompt.substring(0, 100) + "..."
    }, ErrorSeverity.ERROR);
    
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
}

/**
 * Generate a high-quality dental treatment image
 * @param treatmentType The type of dental treatment to generate an image for
 * @returns Object containing the URL of the generated image
 */
export async function generateDentalTreatmentImage(
  treatmentType: string
): Promise<{ url: string }> {
  const basePrompt = `Create a high-quality, professional dental marketing image for ${treatmentType}. 
The image should look realistic and medical, suitable for a premium dental clinic website.
It should showcase the treatment result with clean, bright teeth and a natural-looking smile.
Use soft lighting and a clean, sterile aesthetic with a subtle blue dental theme.
The image should convey professionalism, expertise, and trust - key values in dental tourism.
Do not include any text in the image.`;

  return generateImage(basePrompt, "1024x1024");
}

/**
 * Generate a special offer image for dental tourism
 * @param offerTitle The title of the special offer
 * @param offerType The type of special offer (e.g., discount, package, etc.)
 * @param customPrompt Optional custom prompt to generate a more specific image
 * @param naturalStyle Set to true to generate more natural-looking images
 * @returns Object containing the URL of the generated image
 */
export async function generateSpecialOfferImage(
  offerTitle: string,
  offerType: string = "premium",
  customPrompt?: string,
  naturalStyle: boolean = false
): Promise<{ url: string }> {
  // Generate a unique timestamp and randomizer to ensure we get different images each time
  const timestamp = new Date().toISOString();
  const uniqueId = Math.random().toString(36).substring(2, 10);
  
  // If a custom prompt is provided, use it directly
  if (customPrompt) {
    console.log(`Using custom prompt for "${offerTitle}"`);
    // Still add the unique modifier to ensure different images
    const uniqueModifier = `(Unique generation ID: ${timestamp}-${uniqueId})`;
    
    // Use the custom prompt as is, just append the unique ID
    const prompt = `${customPrompt} ${uniqueModifier}`;
    
    console.log(`Generating special offer image with custom prompt (ID: ${uniqueId})`);
    
    // Generate the image with wider format for banner images
    const result = await generateImage(prompt, "1792x1024");
    
    // If successful, ensure the URL has a cache-busting parameter
    if (result && result.url) {
      const url = result.url;
      // Only add query parameter if it doesn't already have one
      if (!url.includes('?')) {
        result.url = `${url}?t=${Date.now()}&u=${uniqueId}`;
        console.log(`Added cache busting parameters to URL: ${result.url}`);
      } else {
        console.log(`URL already contains query parameters: ${url}`);
      }
    }
    
    return result;
  }
  
  // If no custom prompt, proceed with the standard prompt generation approach
  // Base prompt structure with built-in uniqueness
  let basePrompt = "";
  
  if (naturalStyle) {
    // More photorealistic, less AI-looking prompt style
    basePrompt = `Create a professional, photorealistic marketing image for a dental tourism special offer titled "${offerTitle}". Make it look like a high-quality stock photograph, not AI-generated.`;
  } else {
    // Standard prompt style
    basePrompt = `Create a completely unique and original marketing image for a dental tourism special offer titled "${offerTitle}".`;
  }
  
  // Additional unique identifier to force the model to generate a different image each time
  let uniqueModifier = `(Unique generation ID: ${timestamp}-${uniqueId})`;
  
  let specificDetails = "";
  
  if (offerType.toLowerCase().includes("hotel") || offerTitle.toLowerCase().includes("hotel")) {
    specificDetails = `
Create a professional photograph of a luxury hotel room in Istanbul with a stunning Bosphorus view. The room should have:
- Premium king-size bed with crisp white linens and decorative pillows
- Floor-to-ceiling windows showing Istanbul landmarks and blue water
- Elegant modern furnishings in neutral colors with subtle Turkish design elements
- Soft, golden hour lighting casting warm tones across the room
- A small seating area with comfortable armchairs
- Subtle luxury touches like fresh flowers or a welcome fruit basket
- The composition should be from a corner of the room, showing depth and spaciousness
- Use photorealistic lighting and natural colors that a professional hotel photographer would use

The image must look like it was taken by a professional hotel photographer with a high-end DSLR camera.`;
  } 
  else if (offerType.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("airport")) {
    specificDetails = `
Create a professional photograph of a luxury airport transfer service in Istanbul. The image should show:
- A black Mercedes S-Class or similar premium vehicle with polished finish parked in front of a modern terminal
- A professional chauffeur in a dark suit standing by the open rear passenger door
- Early evening lighting with the sky still blue but city lights coming on
- Airport architecture visible but softly blurred in the background
- Clean, uncluttered composition focusing on the vehicle and driver
- The angle should be slightly from the front quarter of the vehicle to show its prestigious profile
- Use photorealistic lighting and colors that a professional automotive photographer would use

The image must look like it was taken by a professional transportation service photographer with high-end equipment.`;
  }
  else if (offerType.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consult")) {
    specificDetails = `
Create a professional photograph of a dental consultation in a modern Istanbul clinic. The image should show:
- A dentist in a white coat and professional attire explaining something to a patient
- The dentist using a tablet or dental model to explain a procedure
- A modern, clean dental office with contemporary furniture and subtle Turkish design elements
- State-of-the-art dental equipment visible but not dominating the scene
- Natural, professional lighting with soft shadows typical of medical photography
- The patient looking engaged and comfortable (not showing dental work in progress)
- The composition should be at eye level, capturing genuine interaction
- Use photorealistic lighting and colors that a professional medical photographer would use

The image must look like it was taken by a professional healthcare photographer with high-end equipment.`;
  }
  else if (offerType.toLowerCase().includes("implant") || offerTitle.toLowerCase().includes("implant")) {
    specificDetails = `
Create a professional photograph showcasing the results of dental implant treatment. The image should feature:
- A natural, attractive smile of a middle-aged person showing perfect teeth (result, not procedure)
- The subject should have a genuine, confident expression (not exaggerated)
- Clean, professional studio lighting with soft catch lights in the eyes
- A simple, neutral background with subtle gradient
- The composition should be a close-up focusing on the smile but showing enough face for context
- Natural skin tones and texture without excessive retouching
- The teeth should look realistic and not artificially white
- Use photorealistic lighting and colors that a professional dental photographer would use

The image must look like it was taken by a professional dental photographer with specialized equipment for clinical photography.`;
  }
  else {
    // Generic special offer prompt with specific professional photography directions
    const professionalScenes = [
      {
        scene: "dental clinic reception",
        details: `Create a professional photograph of a luxury dental clinic reception area in Istanbul. The image should show:
- A modern, minimalist reception area with marble or quartz surfaces
- Comfortable seating area with designer furniture in neutral tones
- Subtle Turkish design elements like geometric patterns or tasteful artwork
- Soft, professional lighting highlighting the elegant space
- A clean, uncluttered environment with premium finishes
- A reception desk with a subtle dental clinic logo (not readable)
- Optional: a glimpse of Istanbul skyline through large windows
- The composition should be wide angle to show the spaciousness of the area
- Use photorealistic lighting like professional architectural photography`
      },
      {
        scene: "dental treatment result",
        details: `Create a professional photograph showcasing high-quality dental work results. The image should show:
- A natural, attractive close-up smile of a person with perfect teeth (just the smile, not full face)
- Clean, professional dental photography lighting with natural colors
- No visible dental tools or equipment - just the beautiful result
- Natural-looking, not artificially white teeth with realistic reflections
- A simple, neutral background typical of professional dental photography
- The image should have the crisp, clean aesthetic of clinical photography
- Use photorealistic lighting and colors that a professional dental photographer would use`
      },
      {
        scene: "istanbul skyline with clinic",
        details: `Create a professional photograph combining Istanbul's skyline with a modern dental facility. The image should show:
- A high-end dental clinic with glass walls offering a panoramic view of Istanbul
- The iconic skyline with the Blue Mosque or Hagia Sophia visible in the distance
- Modern dental chairs and equipment suggesting advanced technology
- Clean, bright interior with professional medical lighting
- The composition should balance the interior space and the stunning view
- Golden hour lighting creating a warm, inviting atmosphere
- Use photorealistic lighting and colors that a professional architectural photographer would use`
      },
      {
        scene: "dental vacation concept",
        details: `Create a professional photograph representing dental tourism in Istanbul. The image should show:
- A split composition: on one side, a modern dental clinic interior, on the other, a glimpse of Istanbul landmarks
- Clean, bright lighting on the dental side, warm golden light on the tourism side
- Subtle transition between the two concepts, perhaps using glass or a doorway
- Professional, uncluttered composition with premium aesthetic
- No text or obvious branding elements
- The image should convey both healthcare quality and travel experience 
- Use photorealistic lighting and colors that would appear in a travel magazine feature`
      }
    ];
    
    // Select a random professional scene to ensure variation
    const selectedScene = professionalScenes[Math.floor(Math.random() * professionalScenes.length)];
    
    specificDetails = selectedScene.details;
  }
  
  // Common ending for all prompts
  let commonEnding = `
Do not include any text or captions within the image.
Make it sophisticated and aspirational, like a high-end professional advertisement.
The image must be completely different from previous generations, with unique composition and elements.`;

  // For natural style, add additional directives
  if (naturalStyle) {
    commonEnding += `
Make the image appear completely natural and photorealistic.
Avoid any stylistic elements that make it look AI-generated.
It should be indistinguishable from a professional stock photograph.`;
  }
  
  // Add the unique modifier
  commonEnding += `\n${uniqueModifier}`;
  
  // Combine all parts
  const prompt = `${basePrompt}${specificDetails}${commonEnding}`;

  console.log(`Generating special offer image with ${naturalStyle ? 'natural' : 'standard'} prompt (ID: ${uniqueId})`);
  
  // Generate the image with wider format for banner images
  const result = await generateImage(prompt, "1792x1024");
  
  // If successful, ensure the URL has a cache-busting parameter
  if (result && result.url) {
    const url = result.url;
    // Only add query parameter if it doesn't already have one
    if (!url.includes('?')) {
      result.url = `${url}?t=${Date.now()}&u=${uniqueId}`;
      console.log(`Added cache busting parameters to URL: ${result.url}`);
    } else {
      console.log(`URL already contains query parameters: ${url}`);
    }
  }
  
  return result;
}