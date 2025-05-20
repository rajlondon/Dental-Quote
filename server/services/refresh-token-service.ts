import { db } from "../db";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a refresh token for a user
 * @param userId The ID of the user
 * @param expiresInDays Number of days until the token expires (default: 30)
 * @returns The token string
 */
export async function createRefreshToken(userId: number, expiresInDays: number = 30): Promise<string> {
  // Generate a secure random token
  const token = uuidv4();
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  // Create refresh token in database
  await db.execute(sql`
    INSERT INTO refresh_tokens (token, user_id, expires_at, created_at, is_revoked)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()}, NOW(), false)
  `);
  
  return token;
}

/**
 * Validates a refresh token and returns the associated user ID
 * @param token The refresh token string
 * @returns The user ID if valid, null otherwise
 */
export async function validateRefreshToken(token: string): Promise<number | null> {
  // Get token from database
  const result = await db.execute(sql`
    SELECT * FROM refresh_tokens 
    WHERE token = ${token} 
    AND expires_at > NOW() 
    AND is_revoked = false
  `);
  
  // Check if token exists and is valid
  if (!result.rows || result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0] as any;
  return row.user_id;
}

/**
 * Revokes a refresh token
 * @param token The refresh token string
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await db.execute(sql`
    UPDATE refresh_tokens
    SET is_revoked = true
    WHERE token = ${token}
  `);
}

/**
 * Revokes all refresh tokens for a user
 * @param userId The ID of the user
 */
export async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  await db.execute(sql`
    UPDATE refresh_tokens
    SET is_revoked = true
    WHERE user_id = ${userId}
  `);
}

/**
 * Clean up expired refresh tokens (should be called periodically)
 */
export async function cleanupExpiredRefreshTokens(): Promise<void> {
  await db.execute(sql`
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
  `);
}

/**
 * Ensures the refresh token table exists
 */
export async function ensureRefreshTokenTable(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL,
      is_revoked BOOLEAN NOT NULL DEFAULT false
    )
  `);
  
  // Create index on token for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON refresh_tokens (token)
  `);
  
  // Create index on user_id for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens (user_id)
  `);
}