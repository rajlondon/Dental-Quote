import { generateOptimalCSS } from '../services/css-generator';

/**
 * Apply the AI-generated CSS solution to the document
 */
export async function applyAIGeneratedStyles(): Promise<void> {
  try {
    // Generate the optimized CSS
    const optimizedCSS = await generateOptimalCSS();
    
    if (!optimizedCSS) {
      console.error('Failed to generate optimized CSS');
      return;
    }
    
    // Create or update a style element with the AI-generated CSS
    let styleElement = document.getElementById('ai-generated-styles') as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'ai-generated-styles';
      document.head.appendChild(styleElement);
    }
    
    // Apply the new styles
    styleElement.textContent = optimizedCSS;
    
    console.log('AI-generated styles have been applied successfully');
  } catch (error) {
    console.error('Error applying AI-generated styles:', error);
  }
}