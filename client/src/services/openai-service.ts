import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow client-side usage
});

/**
 * Generate CSS fixes using OpenAI
 * @param description Description of the styling problem
 * @param currentCSS Current CSS that needs to be fixed
 * @param elementStructure HTML structure of the elements we're trying to style
 * @returns Optimized CSS solution
 */
export async function generateCSSFix(
  description: string,
  currentCSS: string,
  elementStructure: string
): Promise<string> {
  try {
    const prompt = `
You are an expert CSS developer specializing in React and Tailwind CSS applications.

THE PROBLEM:
${description}

CURRENT CSS:
\`\`\`css
${currentCSS}
\`\`\`

ELEMENT STRUCTURE:
\`\`\`jsx
${elementStructure}
\`\`\`

Please generate a highly optimized CSS solution that:
1. Forces all elements to have exactly the same height (42px)
2. Ensures all elements are perfectly aligned in a straight line
3. Centers text inside buttons perfectly (vertically and horizontally)
4. Uses extremely high specificity and !important flags to override any existing styles
5. Applies fixes directly to the core element types (not just classes)
6. Provides a complete replacement for the CSS section above

Respond ONLY with the CSS code, no explanations or markdown formatting.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Low temperature for more precise output
      max_tokens: 2000
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error: any) {
    console.error("Error generating CSS fix:", error);
    throw new Error(`Failed to generate CSS fix: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Analyze form structure using OpenAI
 * @param formHTML HTML structure of the form
 * @returns Analysis result and suggested fixes 
 */
export async function analyzeFormStructure(formHTML: string): Promise<{
  analysis: string;
  suggestedFixes: string;
}> {
  try {
    const prompt = `
You are an expert React developer specializing in form design and accessibility.

Analyze this form structure and identify issues with:
1. Element alignment
2. Height consistency
3. Text centering in buttons
4. Any other layout or styling issues

FORM HTML:
\`\`\`jsx
${formHTML}
\`\`\`

Provide a JSON response with:
1. analysis: A brief analysis of the issues found
2. suggestedFixes: Specific code changes to fix the issues

Make your suggestions extremely specific and detailed, ready to implement.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content || '{"analysis":"","suggestedFixes":""}');
  } catch (error: any) {
    console.error("Error analyzing form structure:", error);
    return {
      analysis: `Error analyzing form structure: ${error?.message || 'Unknown error'}`,
      suggestedFixes: ""
    };
  }
}