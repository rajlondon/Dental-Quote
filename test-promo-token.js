/**
 * Test script to create a promo token for testing the special offer promo API
 */
const { db } = require('./server/db');
const { promoTokens } = require('./shared/schema');

async function createTestPromoToken() {
  try {
    console.log("Creating test promo token...");
    
    // Check if the token already exists
    const [existingToken] = await db
      .select()
      .from(promoTokens)
      .where(token => token.token.equals("TEST123"));
    
    if (existingToken) {
      console.log("Test token 'TEST123' already exists:", existingToken);
      console.log("Updating token...");
      
      // If it exists, ensure it's active
      await db
        .update(promoTokens)
        .set({
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          updatedAt: new Date()
        })
        .where(token => token.token.equals("TEST123"));
      
      console.log("Token updated successfully!");
      return;
    }
    
    // Insert a new test token
    const [newToken] = await db.insert(promoTokens).values({
      token: "TEST123",
      clinicId: 1, // Use clinic ID 1 for testing
      promoType: "free_consultation",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    console.log("Created test promo token:", newToken);
  } catch (error) {
    console.error("Error creating test promo token:", error);
  } finally {
    // Close the database connection
    console.log("Done");
    process.exit(0);
  }
}

createTestPromoToken();
