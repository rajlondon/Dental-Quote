// Simple test script for OpenAI API access
import OpenAI from "openai";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "What's a good way to debug a React application?"
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log("✅ OpenAI API working correctly!");
    console.log("\nResponse:");
    console.log(completion.choices[0].message.content);
    
  } catch (error) {
    console.error("❌ Error with OpenAI API:", error);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
    console.error("\nError stack:", error.stack);
  }
}

// Run the test
testOpenAI();