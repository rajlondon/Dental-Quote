import OpenAI from "openai";

// Initialize OpenAI with API key
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

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
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    console.log(`Generating image with DALL-E for prompt: "${prompt}"`);
    
    const response = await openai.images.generate({
      model: "dall-e-3", // The newest DALL-E model
      prompt,
      n: 1, // Number of images to generate
      size,
      quality: "standard",
      style: "vivid", // More photorealistic and vibrant
    });

    console.log("Image generation successful");
    return { url: response.data[0].url };
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw error;
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
  // Create a detailed prompt that will generate high-quality, professional dental images
  const prompt = `Create a professional, high-quality image for a dental clinic featuring ${treatmentType}. 
  The image should look like a premium stock photo suitable for a dental tourism website. 
  It should be warm, inviting, and showcase modern dental facilities. 
  Include subtle elements that suggest Turkey's blend of advanced healthcare and hospitality.
  The image should be clean, bright, and inspire confidence in potential patients.
  Do not include any text, watermarks, or borders in the image.`;

  return generateImage(prompt);
}

/**
 * Generate a special offer image for dental tourism
 * @param offerTitle The title of the special offer
 * @param offerType The type of special offer (e.g., discount, package, etc.)
 * @returns Object containing the URL of the generated image
 */
export async function generateSpecialOfferImage(
  offerTitle: string,
  offerType: string
): Promise<{ url: string }> {
  // Create a detailed prompt for the special offer
  const prompt = `Create a professional marketing image for dental tourism special offer titled "${offerTitle}" of type "${offerType}".
  The image should look like a premium advertisement suitable for a high-end dental tourism website.
  It should be elegant, attractive, and visually communicate value and quality.
  Include subtle visual elements related to both dental care and travel/tourism in Turkey.
  The image should be bright, modern, and inspire trust and excitement.
  Do not include any text, watermarks, or borders in the image.`;

  // Use a landscape format for special offers to better fit in the carousel
  return generateImage(prompt, "1792x1024");
}