// Script to analyze the clinic portal refresh issue with Google's Gemini API
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current file's directory equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Path to relevant files
const relevantFiles = [
  '../client/src/pages/ClinicPortalPage.tsx',
  '../client/src/App.tsx',
  '../client/src/i18n.ts',
  '../client/src/hooks/use-auth.tsx',
  '../client/src/components/ReloadTranslations.tsx',
  '../client/src/utils/prevent-reloads.ts',
  '../client/src/lib/protected-route.tsx'
];

// Prepare the file contents
async function readFiles() {
  const fileContents = {};
  
  for (const filePath of relevantFiles) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.promises.readFile(fullPath, 'utf8');
      fileContents[filePath] = content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      fileContents[filePath] = `Error reading file: ${error.message}`;
    }
  }
  
  return fileContents;
}

// Issue description
const issueDescription = `
The clinic portal in our dental tourism application has a persistent refresh issue:
- Approximately 5 seconds after login, the page automatically refreshes
- 1 second after that first refresh, it refreshes again
- This exact 5-second pause, refresh, 1-second pause, refresh pattern happens consistently
- Only happens in the clinic portal, not in the patient or admin portals
- We've tried multiple approaches to prevent these refreshes:
  1. Overriding window.location.reload
  2. Using beforeunload event handlers
  3. Disabling i18n's ReloadTranslations component for the clinic portal path
  4. Creating a simplified ClinicPortal component that doesn't have any complex initialization
  5. Using page-specific reload prevention
  
None of these approaches have stopped the automatic refresh cycle. We need to identify what's
causing this specific pattern of refreshes and how to fix it without building a completely new
portal from scratch.

The auto-refresh pattern is like:
1. User logs in
2. Portal loads successfully
3. After exactly 5 seconds: first automatic refresh
4. After exactly 1 more second: second automatic refresh
5. Portal works normally after that, until user navigates away and comes back

This suggests some kind of initialization or state management issue triggering the refreshes.
`;

// Get an analysis from Gemini
async function analyzeIssue() {
  try {
    const files = await readFiles();
    
    // Prepare file content for the prompt
    let fileContentText = '';
    for (const [filePath, content] of Object.entries(files)) {
      fileContentText += `\n\nFILE: ${filePath}\n\`\`\`typescript\n${content}\n\`\`\``;
    }
    
    // Create prompt for Gemini
    const prompt = `
I need help debugging a React web application issue. Here's the problem:

${issueDescription}

I'll provide the relevant code files below. Please analyze them to:
1. Identify what's causing the specific pattern of two automatic refreshes (5 seconds, then 1 second)
2. Explain why this only happens in the clinic portal
3. Provide a specific solution to prevent these automatic refreshes without breaking functionality

${fileContentText}

Please focus specifically on finding what's triggering the automatic page refreshes on a timer and how to prevent them while maintaining the application's functionality. The solution needs to be specific and targeted directly at the cause of the refreshes.
`;

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Write the analysis to a file
    const analysisFilePath = path.join(__dirname, 'clinic-portal-refresh-analysis.md');
    await fs.promises.writeFile(analysisFilePath, text, 'utf8');
    
    console.log(`Analysis complete! See ${analysisFilePath} for results.`);
    console.log("\nHighlights of the analysis:");
    
    // Extract and print some key snippets
    const highlights = text.split('\n\n').slice(0, 3).join('\n\n');
    console.log(highlights + "\n...");
    
  } catch (error) {
    console.error("Error during analysis:", error);
    if (error.response) {
      console.error("Gemini API error:", error.response.data);
    }
  }
}

// Run the analysis
analyzeIssue();