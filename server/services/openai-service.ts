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

/**
 * Check if a URL is from OpenAI/DALL-E
 * This helps identify URLs that need special handling because they expire quickly
 * @param url The URL to check
 * @returns Boolean indicating if the URL is from OpenAI
 */
export function isOpenAIGeneratedImageUrl(url: string): boolean {
  if (!url || !url.startsWith('https://')) {
    return false;
  }
  
  // Check for known OpenAI URL patterns
  return (
    url.includes('openai') || 
    url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
    url.includes('dall-e') ||
    url.includes('dalleapi')
  );
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
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(2, 10);
  
  const basePrompt = `Create a photograph for a dental clinic website showcasing ${treatmentType} treatment results.

SUBJECT:
- Show a natural result of the treatment - a person with a genuine, non-exaggerated smile
- The person should have realistic skin texture with natural imperfections and asymmetry
- Focus on a realistic smile that shows healthy, well-proportioned teeth (not unnaturally white)
- The person should be in casual professional attire, against a neutral background
- No dental office equipment or clinical setting should be visible

TECHNICAL ASPECTS:
- Use portrait photography techniques with 85mm lens equivalent, f/2.8-4.0 aperture simulation
- Create natural, soft lighting with proper facial highlights and shadows
- Apply subtle depth of field with background slightly out of focus
- Include realistic catch lights in the eyes and natural skin tones
- Ensure the composition follows professional portrait photography guidelines
- Add minor natural photography imperfections - slight grain in shadows, natural vignetting

IMPORTANT: Study real dental result photography from top dental clinics. The image must be indistinguishable from a photograph taken by a professional dental photographer using high-end equipment.
(Unique generation ID: ${timestamp}-${uniqueId})`;

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
  naturalStyle: boolean = true // Set default to true for all special offer images
): Promise<{ url: string }> {
  // Generate a unique timestamp and randomizer to ensure we get different images each time
  const timestamp = new Date().toISOString();
  const uniqueId = Math.random().toString(36).substring(2, 10);
  
  // If a custom prompt is provided, use it directly
  if (customPrompt) {
    console.log(`Using custom prompt for "${offerTitle}"`);
    // Still add the unique modifier to ensure different images
    const uniqueModifier = `(Unique generation ID: ${timestamp}-${uniqueId})`;
    
    // Enhance the custom prompt with concise stock photography directives
    const enhancedPrompt = `${customPrompt}

PROFESSIONAL PHOTOGRAPHY DIRECTIVES:
- Match Shutterstock premium photography quality and style
- Use natural lighting with accurate shadows and reflections
- Include authentic lens characteristics (mild vignetting, bokeh at f/2.8-4.0)
- Apply Canon 5D Mark IV professional color science
- Incorporate subtle photographic imperfections and asymmetries
- Use rule of thirds with proper foreground/midground/background layering

This MUST be indistinguishable from a professional Shutterstock photograph.

${uniqueModifier}`;
    
    console.log(`Generating special offer image with enhanced custom prompt (ID: ${uniqueId})`);
    
    // Generate the image with wider format for banner images
    const result = await generateImage(enhancedPrompt, "1792x1024");
    
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
  
  // Use photorealistic Shutterstock style with optimized length
  basePrompt = `Create a high-end Shutterstock-quality photograph for a dental tourism campaign featuring "${offerTitle}".

PROFESSIONAL STOCK PHOTO STYLE:
- Match premium Shutterstock medical/tourism photography aesthetic
- Natural lighting with proper shadows and realistic reflections
- Subtle lens effects (mild vignetting, natural bokeh at f/2.8)
- Professional color grading with natural vibrance
- Include realistic imperfections that stock photos have

TECHNICAL DETAILS:
- Canon 5D Mark IV color science with 24-70mm lens perspective
- Rule of thirds composition with proper depth layers
- Authentic textures and material rendering
- Natural asymmetries and photographic imperfections

The final image must be indistinguishable from a professionally shot photograph in a premium stock collection.`;
  
  
  // Additional unique identifier to force the model to generate a different image each time
  let uniqueModifier = `(Unique generation ID: ${timestamp}-${uniqueId})`;
  
  let specificDetails = "";
  
  if (offerType.toLowerCase().includes("hotel") || offerTitle.toLowerCase().includes("hotel")) {
    specificDetails = `
Create a photograph of a luxury hotel room in Istanbul that looks like professional hotel marketing photography.

SETTING:
- Elegant king-size bed with neutral/gray bedding and luxurious textures
- Floor-to-ceiling windows showing Istanbul's nighttime skyline with city lights
- Warm ambient lighting from bedside lamps with natural shadows
- Corner seating area with tasteful furniture and lived-in details
- Warm wood tones and earthy colors with high-end finishes

TECHNICAL:
- Wide angle (24mm) perspective with natural distortion at edges
- Balanced exposure showing both room interior and night view
- Realistic reflections on surfaces with proper shadows
- Natural imperfections (slight fabric wrinkles, minimal asymmetry)
- Professional hotel photography style with atmospheric depth

Capture the luxury feel of high-end Istanbul accommodations with photorealistic quality like Ritz-Carlton marketing materials.`;
  } 
  else if (offerType.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("airport")) {
    specificDetails = `
Create a photograph of luxury airport transfer service that mimics professional automotive marketing photography.

SUBJECT:
- Black Mercedes S-Class sedan with chauffeur in suit by open rear door
- Positioned at airport terminal entrance with visible architecture
- Realistic car details with proper reflections on paint and chrome surfaces
- Natural-looking chauffeur with authentic facial features and stance

LIGHTING & STYLE:
- Golden hour/dusk lighting with blue-gradient evening sky
- Practical lighting from airport entrance illuminating the scene
- 35mm lens perspective with automotive photography techniques
- Subtle lens flare and bokeh effects from background lights
- Natural vignetting and professional depth of field

COMPOSITION:
- Lower angle view (waist height) showing car's front quarter profile
- Environmental context (travelers with luggage, airport signage)
- Professional automotive photography with realistic imperfections

Create an image that looks exactly like luxury car service marketing material photographed at dusk by a professional automotive photographer.`;
  }
  else if (offerType.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consult")) {
    specificDetails = `
Create a professional dental consultation photograph for a medical brochure or website.

SCENE:
- Dentist in white coat consulting with patient in office setting (not treatment room)
- Natural interaction showing dentist explaining with tablet or dental model
- Both individuals with realistic features, textures and expressions
- Authentic office environment with desk, bookshelf and natural light
- Professional but warm atmosphere with natural office details

PHOTOGRAPHY STYLE:
- Medical documentary style with diffused lighting and natural shadows
- 50mm lens perspective at f/4.0 with shallow depth of field
- Professional healthcare marketing color palette (slightly desaturated)
- Natural photographic imperfections and realistic textures
- Composition focusing on human interaction rather than clinical elements

Create an image indistinguishable from actual professional medical photography taken in a real dental office.`;
  }
  else if (offerType.toLowerCase().includes("implant") || offerTitle.toLowerCase().includes("implant")) {
    specificDetails = `
Create a portrait photograph showing dental implant treatment results for a clinic website.

SUBJECT:
- Natural-looking person with authentic smile showing healthy, well-proportioned teeth
- Realistic skin texture with natural imperfections (subtle wrinkles, visible pores)
- Genuine happy expression of a satisfied patient
- Person in casual professional attire, not in clinical setting
- Focus on natural-looking dental work (not unnaturally white or perfect)

PHOTOGRAPHY STYLE:
- Portrait photography with 85mm lens at f/2.8-4.0 aperture
- Soft natural lighting with subtle catch lights in eyes
- Background slightly out of focus with professional bokeh effect
- Natural skin tones with minimal retouching
- Professional portrait composition with smile as focal point
- Authentic photographic imperfections (natural shadows, realistic contrast)

Create an image that looks exactly like a professional portrait photograph taken by an experienced photographer for a dental clinic's marketing materials.`;
  }
  else {
    // Generic special offer prompt with specific professional photography directions
    const professionalScenes = [
      {
        scene: "dental clinic reception",
        details: `Create a photograph of a luxury dental clinic reception area using professional architectural photography techniques.

SETTING:
- Modern reception with marble desk and Turkish design elements
- Natural light through windows showing glimpse of Istanbul skyline
- Premium healthcare facility materials and high-end finishes
- Warm interior lighting complementing daylight

STYLE:
- Wide angle (16-24mm) perspective with architectural photography techniques
- Balanced exposure between interior and exterior elements
- Professional reflections on marble, glass and polished surfaces
- Natural shadows and subtle design imperfections
- Professional interior photography color grading

Frame from elevated position showing natural flow and depth with typical reception elements. Create an image indistinguishable from professional architectural photography of a luxury medical facility.`
      },
      {
        scene: "dental treatment result",
        details: `Create a dental treatment result photograph using professional dental photography techniques.

SUBJECT:
- Close-up view of natural smile showing healthy, well-aligned teeth
- Frame only mouth area (chin to upper lip), not full face
- Natural lip color and skin texture with subtle pores and imperfections
- Realistic ceramic dental work appearance (not artificially perfect)
- No dental tools or clinical setting visible

TECHNICAL:
- Professional dental photography with ring flash lighting
- Natural reflections on tooth surfaces following proper light physics
- Subtle imperfections in tooth color/shape like real dental photos
- Macro lens (85-105mm) effect with f/5.6-8 depth of field
- Neutral white balance with clinical photography color rendering

Create an image exactly matching professional dental before/after photography used by leading cosmetic dentists, with natural dental arch curvature and realistic teeth surface highlights.`
      },
      {
        scene: "istanbul skyline with clinic",
        details: `Create a photograph of a high-end dental clinic with Istanbul skyline views using professional architectural photography techniques.

SETTING:
- Modern treatment room with floor-to-ceiling windows
- Istanbul skyline with Blue Mosque or Hagia Sophia visible in distance
- Minimalist interior with premium materials (marble, wood accents)
- Advanced dental technology with clean, uncluttered design
- Golden hour lighting illuminating both interior and exterior

PHOTOGRAPHY STYLE:
- Architectural interior photography with balanced exposure
- Natural golden hour light with professional interior lighting
- Realistic reflections on glass, chrome and polished surfaces
- Professional depth of field keeping both clinic and view in focus
- Subtle lens effects (minimal flare, natural vignetting)

Frame with pleasing perspective lines leading to the view with rule-of-thirds composition. Image should match high-end architectural photography of premium medical facilities with iconic skyline views.`
      },
      {
        scene: "dental vacation concept",
        details: `Create a photograph combining dental tourism in Istanbul using luxury travel and healthcare photography techniques.

SETTING:
- Modern dental clinic lounge area with large windows/doors to terrace
- Istanbul landmarks (Hagia Sophia/Blue Mosque/Bosphorus) visible through windows
- Premium healthcare interior with marble surfaces and high-end furniture
- Golden hour lighting on cityscape with clean interior lighting
- Transitional space connecting medical care with Istanbul travel experience

TECHNICAL:
- Luxury travel and hospitality photography style
- Balanced lighting between bright interior and warm golden hour exterior
- Professional reflections on glass with accurate transparency physics
- Subtle natural lens characteristics (mild vignetting, minimal distortion)
- Travel magazine color grading with slightly warmer exterior tones

Create an image with natural flow from healthcare space to tourism view using leading lines. The final image should exactly match high-end travel magazine photography featuring medical tourism destinations.`
      }
    ];
    
    // Select a random professional scene to ensure variation
    const selectedScene = professionalScenes[Math.floor(Math.random() * professionalScenes.length)];
    
    specificDetails = selectedScene.details;
  }
  
  // Common ending for all prompts - optimized for length
  let commonEnding = `
No text or captions in the image. Create sophisticated and aspirational high-end advertisement style.
Include natural photographic imperfections - authentic lighting, realistic shadows, and slight asymmetry.
Avoid perfect symmetry or unnaturally clean aesthetics that make images look AI-generated.`;

  // Brief additives for natural style 
  if (naturalStyle) {
    commonEnding += ` Create a completely natural, photorealistic image indistinguishable from professional stock photography.`;
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