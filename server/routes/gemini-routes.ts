import { Router } from "express";
import { generateText, generateChatResponse } from "../services/gemini-service";

const router = Router();

// Fallback information for different dental treatments
const DENTAL_TREATMENT_FALLBACKS = {
  "Dental Implants": {
    overview: "Dental implants are titanium posts surgically placed into the jawbone to replace missing tooth roots. They provide a sturdy foundation for artificial teeth (crowns) that are made to match your natural teeth.",
    procedure: "The procedure is typically done in stages: implant placement surgery, healing period (osseointegration), abutment placement, and crown attachment. Local anesthesia is used during the surgical steps to minimize discomfort.",
    recovery: "Some swelling, bruising, minor bleeding, and pain may occur after surgery. Most patients can return to work within 1-2 days. Complete healing and integration with the jawbone takes 3-6 months.",
    alternatives: "Alternatives include traditional bridges, partial dentures, or in some cases, no treatment. Each option has different implications for oral health, comfort, and cost.",
    advice: "Dental implants have a high success rate (95-98%) and can last a lifetime with proper care. Regular brushing, flossing, and dental check-ups are essential for implant longevity."
  },
  "Veneers": {
    overview: "Dental veneers are thin, custom-made shells of tooth-colored materials designed to cover the front surface of teeth to improve appearance. They're commonly made from porcelain or composite resin.",
    procedure: "The process usually requires three trips to the dentist – consultation, preparation, and application. A small amount of enamel is removed from the tooth surface before the veneer is bonded.",
    recovery: "There is minimal recovery time. Some patients may experience temporary sensitivity to hot and cold due to enamel removal.",
    alternatives: "Alternatives include dental bonding, crowns, teeth whitening (for discoloration), or orthodontic treatments (for alignment issues).",
    advice: "Veneers typically last 10-15 years before needing replacement. Avoid biting hard objects like ice or using your teeth as tools to prevent damage."
  },
  "Teeth Whitening": {
    overview: "Professional teeth whitening is a cosmetic procedure that lightens teeth and removes stains and discoloration. It can be performed in a dental office or at home with dentist-provided kits.",
    procedure: "In-office whitening takes about 1-2 hours. A whitening agent is applied to the teeth, often activated by heat or light. Take-home kits involve using custom-fitted trays with whitening gel for specific periods over several days.",
    recovery: "There is no recovery time, though some patients experience temporary tooth sensitivity or gum irritation.",
    alternatives: "Alternatives include over-the-counter whitening products (less effective), veneers, or crowns for severely discolored teeth.",
    advice: "Results typically last 6 months to 2 years depending on diet, lifestyle (smoking, coffee, etc.), and oral hygiene. Maintenance treatments can extend the effects."
  }
};

// Default fallback for any treatment not in our database
const DEFAULT_TREATMENT_FALLBACK = {
  overview: "This dental procedure is designed to address specific oral health needs while considering the patient's comfort and long-term dental health.",
  procedure: "The procedure typically involves an initial consultation, preparation, the main treatment, and follow-up visits. Your dentist will use appropriate anesthesia to ensure your comfort.",
  recovery: "Recovery times vary based on the complexity of the procedure. Following your dentist's aftercare instructions is crucial for proper healing and long-term success.",
  alternatives: "There are usually several treatment alternatives available. Discuss these options with your dentist to determine which best suits your specific needs, budget, and desired outcomes.",
  advice: "Regular dental check-ups, good oral hygiene practices, and following your dentist's specific care instructions will help ensure the long-term success of your treatment."
};

/**
 * Generate dental treatment advice using Gemini AI with fallback
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

    try {
      // Try to generate text using Gemini
      const advice = await generateText(prompt);
      
      // If successful, return the AI-generated advice
      return res.json({
        success: true,
        advice,
        source: "ai"
      });
    } catch (aiError) {
      console.error("AI generation failed, using fallback:", aiError);
      
      // Get fallback content based on treatment type
      const fallback = DENTAL_TREATMENT_FALLBACKS[treatmentType] || DEFAULT_TREATMENT_FALLBACK;
      
      // Format fallback content in a readable way
      const fallbackAdvice = `
# Dental Treatment Information: ${treatmentType}

## Brief Overview
${fallback.overview}

## What to Expect During the Procedure
${fallback.procedure}
${patientConcerns ? `\nRegarding your concerns about ${patientConcerns}: It's common to have these concerns. Discuss them with your dentist who can provide specific reassurance and possibly modify the approach to address your needs.` : ''}

## Recovery and Aftercare
${fallback.recovery}

## Alternatives to Consider
${fallback.alternatives}
${budget ? `\nConsidering your budget of ${budget}: Discuss payment plans and financing options with your dental office. Some procedures may be partially covered by insurance.` : ''}

## General Advice
${fallback.advice}

*Note: This is general information. For personalized advice, please consult directly with your dental professional.*
      `;
      
      // Return the fallback advice
      return res.json({
        success: true,
        advice: fallbackAdvice,
        source: "fallback"
      });
    }
  } catch (error) {
    console.error("Error in treatment advice endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate treatment advice",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Generate responses for patient questions using Gemini AI chat with fallback
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

    try {
      // Try to generate chat response using Gemini
      const response = await generateChatResponse(messages);
      
      return res.json({
        success: true,
        response,
        source: "ai"
      });
    } catch (aiError) {
      console.error("AI chat generation failed, using fallback:", aiError);
      
      // Get the last user message
      const lastUserMessage = messages
        .filter(msg => msg.role === "user")
        .pop()?.content || "";
        
      // Provide a generic helpful response
      const fallbackResponse = `Thank you for your question about "${lastUserMessage}". 
      
For personalized dental advice, we recommend consulting directly with your dental professional. They can provide specific guidance based on your unique situation and dental history.

If you have urgent concerns, please contact your dentist's office directly.`;
      
      return res.json({
        success: true,
        response: fallbackResponse,
        source: "fallback"
      });
    }
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate chat response",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;