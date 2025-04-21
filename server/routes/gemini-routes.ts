import { Router } from "express";
import { generateText, generateChatResponse } from "../services/gemini-service";

const router = Router();

/**
 * Generate dental treatment advice using Gemini AI
 * POST /api/gemini/treatment-advice
 */
router.post("/treatment-advice", async (req, res) => {
  try {
    const { treatmentType, patientConcerns, budget } = req.body;

    if (!treatmentType) {
      return res.status(400).json({ 
        success: false, 
        message: "Treatment type is required" 
      });
    }

    // Construct a prompt for Gemini
    const prompt = `
      Please provide professional advice about dental treatment: ${treatmentType}.
      ${patientConcerns ? `The patient has these concerns: ${patientConcerns}.` : ''}
      ${budget ? `The patient's budget is approximately: ${budget}.` : ''}
      
      Please format your response with these sections:
      1. Brief overview of the treatment
      2. What to expect during the procedure
      3. Recovery and aftercare
      4. Alternatives to consider
      5. General advice
      
      Please keep your response informative, reassuring, and medically accurate.
    `;

    // Generate text using Gemini
    const advice = await generateText(prompt);

    return res.json({
      success: true,
      advice
    });
  } catch (error) {
    console.error("Error generating treatment advice:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate treatment advice",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Generate responses for patient questions using Gemini AI chat
 * POST /api/gemini/chat
 */
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid conversation history is required"
      });
    }

    // Generate chat response using Gemini
    const response = await generateChatResponse(messages);

    return res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error("Error generating chat response:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate chat response",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;