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
    console.log("Image generated successfully");
    
    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error("OpenAI returned empty response");
    }
    
    return { url: response.data[0].url ?? "" };
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
 * @returns Object containing the URL of the generated image
 */
export async function generateSpecialOfferImage(
  offerTitle: string,
  offerType: string = "premium"
): Promise<{ url: string }> {
  let prompt = "";
  
  if (offerType.toLowerCase().includes("hotel") || offerTitle.toLowerCase().includes("hotel")) {
    prompt = `Create a realistic, professional marketing image for a dental tourism special offer titled "${offerTitle}".
The image should showcase a luxury hotel experience with a view of Istanbul. Include elements that suggest comfort, relaxation, and premium accommodation.
Use soft lighting and warm, inviting colors. The image should convey exclusivity and premium service - key values for dental tourists.
Do not include any text or captions within the image.
Make it sophisticated and aspirational, like a high-end travel magazine photograph.`;
  } 
  else if (offerType.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("airport")) {
    prompt = `Create a realistic, professional marketing image for a dental tourism special offer titled "${offerTitle}".
The image should showcase a luxury vehicle transfer service in Istanbul. Include elements that suggest comfort, convenience, and VIP treatment.
Use clean, professional lighting and colors that convey reliability and premium service.
The image should feature a premium black car (like a Mercedes) with a professional driver, suggesting airport pickup service.
Do not include any text or captions within the image.
Make it sophisticated and aspirational, like a high-end travel service photograph.`;
  }
  else if (offerType.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consult")) {
    prompt = `Create a realistic, professional marketing image for a dental tourism special offer titled "${offerTitle}".
The image should showcase a dental consultation with a professional dentist and patient in a modern dental clinic.
Use clean, medical lighting with a professional atmosphere. Include dental technology elements in the background.
The dentist should be wearing professional attire and appear knowledgeable and trustworthy.
Do not include any text or captions within the image.
Make it professional and reassuring, conveying dental expertise and patient care.`;
  }
  else if (offerType.toLowerCase().includes("implant") || offerTitle.toLowerCase().includes("implant")) {
    prompt = `Create a realistic, professional marketing image for a dental tourism special offer titled "${offerTitle}".
The image should showcase dental implant treatment results with a beautiful smile transformation.
Use clean, bright lighting that highlights the perfect teeth. Include subtle elements suggesting advanced dental technology.
The image should convey quality, precision, and long-lasting results - key benefits of dental implants.
Do not include any text or captions within the image.
Make it aspirational and impressive, like a premium dental clinic advertisement.`;
  }
  else {
    // Generic special offer prompt
    prompt = `Create a realistic, professional marketing image for a dental tourism special offer titled "${offerTitle}".
The image should have a luxurious, premium aesthetic with subtle elements suggesting dental care combined with travel experience.
Use a scene that combines a glimpse of Istanbul's iconic skyline with sophisticated dental imagery.
Use clean, bright, professional lighting and a color palette that feels premium and trustworthy.
The image should convey quality, exclusivity, and premium service - key values in dental tourism.
Do not include any text or captions within the image.
Make it sophisticated and aspirational, like a high-end travel or medical service advertisement.`;
  }

  return generateImage(prompt, "1792x1024"); // Wider format for banner images
}