import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client with API key
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Use Gemini Pro model
// Documentation: https://ai.google.dev/tutorials/node_quickstart
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Log some information about the configuration
console.log("Gemini API initialized with API key:", API_KEY ? "Key is set" : "No key found");
console.log("Using model: gemini-pro");

/**
 * Generate text using Google's Gemini AI model
 * @param prompt Text prompt for the model
 * @returns Generated response text
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw error;
  }
}

/**
 * Generate chat response using Google's Gemini AI model
 * @param history Array of chat message objects with role and content
 * @returns Generated response text
 */
export async function generateChatResponse(
  history: Array<{ role: "user" | "model"; content: string }>
): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Get the chat model
    const chatModel = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    // Get the last user message
    const lastUserMessage = history
      .filter(msg => msg.role === "user")
      .pop()?.content || "";

    // Generate chat response
    const result = await chatModel.sendMessage(lastUserMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating chat response with Gemini:", error);
    throw error;
  }
}