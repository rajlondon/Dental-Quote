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
    
    // Enhance the custom prompt with specific photography directives
    const enhancedPrompt = `${customPrompt}

IMPORTANT TECHNICAL GUIDELINES:
- Create the image using professional photography techniques with natural lighting, shadows, and reflections
- Include subtle imperfections that real photographs have (slight asymmetry, natural vignetting, realistic depth of field)
- Use the color science of professional cameras with accurate white balance and natural color rendering
- Avoid perfect symmetry, unnaturally even lighting, or computer-generated perfection
- The image should be indistinguishable from a professional photograph taken with high-end equipment

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
  
  // Always use the more photorealistic, natural style
  basePrompt = `Create a completely realistic photograph for a dental tourism marketing campaign featuring an offer called "${offerTitle}". 

The image should be created using professional photography techniques with the following characteristics:
- Natural lighting with proper shadows and realistic reflections
- Authentic perspective and depth that follows the physics of real camera lenses
- Subtle imperfections and asymmetry found in real-world photography
- Professional white balance and color grading typical of high-end commercial photography
- The scene should have the visual qualities of an image shot with a professional DSLR or mirrorless camera

This image must be indistinguishable from a professional photograph and avoid any characteristics that would make it look AI-generated.`;
  
  
  // Additional unique identifier to force the model to generate a different image each time
  let uniqueModifier = `(Unique generation ID: ${timestamp}-${uniqueId})`;
  
  let specificDetails = "";
  
  if (offerType.toLowerCase().includes("hotel") || offerTitle.toLowerCase().includes("hotel")) {
    specificDetails = `
Create a photograph of a luxury hotel room that resembles professional hotel marketing photography.

SETTING:
- A luxury hotel room in Istanbul with a king-size bed with neutral/gray bedding and subtle textural elements
- Large floor-to-ceiling windows showing a nighttime city skyline with visible lights and landmarks
- Warm, ambient lighting from bedside lamps creating a cozy atmosphere with natural shadows
- Include a corner seating area with a small side table and some lived-in details
- The room should have warm wood tones and earthy colors that give it a high-end but natural appearance

TECHNICAL ASPECTS:
- Use a wide angle lens perspective (24mm equivalent) with subtle lens distortion at the edges
- Employ real-world architectural photography lighting techniques with proper shadows under furniture
- Include realistic reflections on surfaces like wood and glass that follow proper physics
- Add subtle imperfections that real rooms have - slight wrinkles in fabrics, minor asymmetry
- Use the natural color science of Sony or Canon cameras with accurate white balance
- The image should have slight vignetting and depth of field characteristics of real photography

COMPOSITION:
- Frame from a lower corner of the room to show depth and create a welcoming composition
- Natural perspective with proper vanishing points for the windows and furniture
- Allow some areas to fall into natural shadow rather than being perfectly evenly lit
- Create realistic window exposure that shows both the room interior and night cityscape
- Leave room for organic negative space rather than perfectly balanced composition

IMPORTANT: Study the aesthetics of Ritz-Carlton and Four Seasons hotel photography for reference. The final image should be indistinguishable from a professional photograph taken with high-end equipment by a hotel photographer.`;
  } 
  else if (offerType.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("transfer") || offerTitle.toLowerCase().includes("airport")) {
    specificDetails = `
Create a photograph of luxury airport transfer service that resembles professional automotive and travel photography.

SUBJECT:
- A black Mercedes S-Class sedan (or equivalent luxury car) with a chauffeur in a suit by the open rear door
- Position in front of an airport terminal entrance with some architecture visible but not dominating
- Car should have proper reflections, realistic chrome/metal surfaces, and accurate proportions
- The chauffeur should look natural (not AI-generated) with realistic facial features and stance

TECHNICAL ASPECTS:
- Use golden hour/dusk lighting with the sky transitioning to evening blue
- Include practical lighting from airport entrance illuminating the scene naturally
- Employ automotive photography techniques with a 35mm lens perspective
- Create realistic highlights on the car's paint with proper reflections (not perfect mirror reflections)
- Include subtle lens flare or bokeh from lights in the background
- Use slight vignetting and proper depth of field for a high-end camera look
- Capture realistic shadows underneath the vehicle that match the lighting conditions

COMPOSITION:
- Frame from a slightly lower angle (about waist height) and from the front quarter to show the car's profile
- Allow some environmental elements (other travelers with luggage in background, airport signage)
- Create a natural sense of depth with foreground, midground, and background elements
- Include small imperfections that real photography would have - very slight motion blur of background people, minor lens distortion

IMPORTANT: Study the aesthetics of luxury car service marketing photos. The final image should be indistinguishable from a professional photograph taken by an automotive/travel photographer at dusk using professional equipment.`;
  }
  else if (offerType.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consultation") || offerTitle.toLowerCase().includes("consult")) {
    specificDetails = `
Create a photograph that could be featured in a dental practice brochure or medical journal. The photo should be:

SUBJECT:
- A real dentist in a professional white coat consulting with a patient in an office setting (NOT in a dental treatment room)
- Shot from an angle that captures their genuine interaction without feeling posed or artificial
- The dentist showing a tablet or simple dental model to the patient (no equipment in use)
- Both individuals should have realistic facial features, skin textures, and expressions
- Focus on the consultation aspect - a conversation happening, not a procedure

SETTING:
- A dentist's office with typical details - desk, bookshelf, perhaps window with natural light
- Shot with diffused lighting that creates gentle shadows and depth
- Avoid any unrealistic or perfect geometric lighting fixtures
- Include natural office elements like a cup of coffee, papers, or other realistic details
- The setting should have subtle depth of field - focus on the people, background slightly blurred

TECHNICAL ASPECTS:
- Use a photography style similar to actual medical documentation or healthcare marketing
- Lighting should mimic professional documentary-style photography with natural shadows
- Capture the imperfections real photography has - slight grain, natural shadows, realistic depth
- Use a color palette that matches real medical office photography - slightly desaturated, professional
- The composition should feel like it was shot with a 50mm or 85mm lens at f/4.0

IMPORTANT: The image must look like an actual photograph taken in a real dental clinic with real people, not an AI interpretation of one.`;
  }
  else if (offerType.toLowerCase().includes("implant") || offerTitle.toLowerCase().includes("implant")) {
    specificDetails = `
Create a photograph suitable for a dental clinic's website showing implant treatment results:

SUBJECT:
- A portrait showing a natural smile of a real person (not an AI-generated face)
- The person should have realistic skin texture with natural imperfections (small wrinkles, pores visible)
- The expression should be genuinely happy but not exaggerated - like a patient satisfied with their treatment
- Focus on a natural smile that shows healthy, well-proportioned teeth (not unnaturally white or perfect)
- The person should be in casual professional attire, not a dental setting

TECHNICAL ASPECTS:
- Shoot with portrait photography techniques - 85mm lens equivalent, f/2.8-4.0 aperture
- Use soft, natural lighting with visible catch lights in the eyes 
- The background should be slightly out of focus (bokeh effect) like real portrait photography
- Use natural light techniques - slight shadow under the chin, natural skin tones
- Include some asymmetry and natural variations in both the face and framing
- Apply minimal retouching to maintain authentic skin texture and realistic teeth coloration

COMPOSITION:
- Frame as a casual portrait where the smile is prominent but not the only focus
- The image should have the slight imperfections of real photography (small shadows, natural contrast)
- Avoid dental office elements or clinical equipment - this is about results, not procedures

IMPORTANT: The image must look like a real photograph taken by a professional portrait photographer showing a genuine person, not an idealized or artificial representation.`;
  }
  else {
    // Generic special offer prompt with specific professional photography directions
    const professionalScenes = [
      {
        scene: "dental clinic reception",
        details: `Create a photograph of a luxury dental clinic reception area that resembles professional architectural photography.

SETTING:
- A modern reception area with marble reception desk and neutral-toned waiting area
- Subtle Turkish design elements like a geometric pattern rug or tasteful artwork
- Natural light coming through windows, complemented by warm interior lighting
- Elements of a high-end medical facility with premium finishes and materials
- A glimpse of Istanbul skyline or Bosphorus visible through windows

TECHNICAL ASPECTS:
- Use a wide angle lens perspective (16-24mm equivalent) with natural perspective correction
- Create architectural photography lighting with balanced exposure between interior and exterior
- Include realistic reflections on surfaces like marble, glass, and polished floors
- Show natural shadows under furniture and at wall junctions
- Add subtle imperfections - slight asymmetry in furniture placement, natural wear patterns
- Use professional architectural photography white balance and color grading

COMPOSITION:
- Frame from a slightly elevated position (chest height) to show the space's flow
- Allow some areas to fall into natural shadow rather than being perfectly evenly lit
- Capture depth through multiple layers - foreground, midground, and background
- Include typical reception area items like magazines, a water dispenser, or plants
- Create a natural sense of scale with proper spatial relationships

IMPORTANT: Study high-end hospitality and medical facility photography. The final image should be indistinguishable from a photograph taken by a professional architectural photographer using professional lighting equipment.`
      },
      {
        scene: "dental treatment result",
        details: `Create a photograph of dental treatment results that resembles professional dental photography.

SUBJECT:
- A close-up view of a natural smile showing healthy, well-aligned teeth (not unnaturally white)
- Frame just the mouth area through the chin and upper lip, not the full face
- Natural lip color and skin texture with realistic pores and subtle imperfections
- Focus on showing teeth that look like real ceramic dental work, not digitally perfect teeth
- No visible dental tools, equipment, or clinic setting - just the smile result

TECHNICAL ASPECTS:
- Use professional dental photography techniques with proper ring flash lighting simulation
- Create natural reflections on teeth surfaces that follow proper light physics
- Include subtle imperfections that real dental photos have - slight variations in tooth color/shape
- Apply proper color rendering with neutral white balance typical of clinical photography
- Use macro lens (85-105mm equivalent) with shallow depth of field (f/5.6-f/8)
- Maintain high detail in focal area with natural falloff at edges

COMPOSITION:
- Center the smile with professional dental photography framing
- Ensure natural curvature of the dental arch with proper perspective
- Show symmetry but avoid perfect mathematical symmetry
- Create proper exposure with detail in both highlight and shadow areas
- Capture realistic specular highlights on moist teeth surfaces

IMPORTANT: Study real dental before/after photography from leading cosmetic dentists. The final image should be indistinguishable from a photograph taken by a professional dental photographer using specialized dental photography equipment.`
      },
      {
        scene: "istanbul skyline with clinic",
        details: `Create a photograph of a modern dental clinic with Istanbul views that resembles professional architectural photography.

SETTING:
- A high-end dental clinic treatment room with floor-to-ceiling glass walls or windows
- The iconic Istanbul skyline with Blue Mosque or Hagia Sophia visible in the distance
- Modern dental chair and minimal equipment suggesting advanced technology
- Clean, bright interior with a mix of natural light and professional medical lighting
- Elegant, minimalist interior design with premium materials (marble, wood accents)

TECHNICAL ASPECTS:
- Use architectural/interior photography techniques with a balanced exposure
- Create natural lighting with golden hour warm tones through the windows
- Balance interior lighting with exterior light using HDR-like technique
- Include realistic reflections on glass, chrome and polished surfaces
- Apply proper white balance calibration across indoor/outdoor elements
- Create proper depth of field that keeps both interior and view in reasonable focus
- Include realistic light falloff and natural shadows in interior corners

COMPOSITION:
- Frame from a position that creates pleasing perspective lines toward the view
- Balance the interior dental elements with the exterior skyline (rule of thirds)
- Create a sense of depth with foreground, midground (clinic) and background (skyline)
- Allow some subtle lens flare or highlight bloom from window light
- Include subtle real-world imperfections in the interior like slight asymmetry

IMPORTANT: Study high-end medical facility photography combined with architectural photography. The final image should be indistinguishable from a photograph taken by a professional architectural photographer during golden hour using professional equipment and lighting.`
      },
      {
        scene: "dental vacation concept",
        details: `Create a photograph that combines dental care and tourism in Istanbul using professional travel and healthcare photography techniques.

SETTING:
- Create a transitional scene that connects a modern dental clinic with a view of Istanbul landmarks
- Show a dental clinic waiting or relaxation area with large windows or glass doors opening to a terrace/balcony
- Visible Istanbul landmarks (Hagia Sophia, Blue Mosque or Bosphorus) through the windows/doors
- The interior should have modern furniture, marble surfaces, and premium healthcare design elements
- The exterior/view should show the city in attractive golden hour lighting

TECHNICAL ASPECTS:
- Use techniques from luxury travel and hospitality photography
- Balance interior lighting (bright, clean) with exterior golden hour warmth
- Create realistic light transition from interior to exterior with proper exposure gradient
- Include realistic reflections on glass surfaces with accurate transparency physics
- Apply natural shadow transitions between areas rather than perfect even lighting
- Use professional travel photography white balance adjustments (slightly warmer for exterior)
- Include natural lens characteristics (subtle vignetting, slight lens distortion at edges)

COMPOSITION:
- Create a natural transitional flow from healthcare space to tourism vista
- Use leading lines that draw the eye from foreground (clinic) to background (cityscape)
- Frame with subtle rule-of-thirds placement of key elements
- Include meaningful details that tell the story of medical tourism
- Allow natural asymmetry and imperfections that real-world spaces contain

IMPORTANT: Study high-end travel magazine photography and medical facility marketing. The final image should be indistinguishable from a photograph taken by a professional travel/hospitality photographer using high-end equipment and balanced lighting techniques.`
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
The image must be completely different from previous generations, with unique composition and elements.
IMPORTANT: Create the image with natural imperfections that real photographs have - authentic lighting, realistic shadows, and proper human proportions. Avoid the perfectly symmetrical, overly clean aesthetic that makes images look AI-generated.`;

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