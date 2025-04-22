import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { db } from '../db';
import { verificationTokens, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// EmailJS config
interface EmailJSConfig {
  serviceId: string;
  publicKey: string;
}

/**
 * Generates a secure token for verification or password reset
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Creates a verification token in the database
 */
export async function createVerificationToken(userId: number, type: 'email_verification' | 'password_reset'): Promise<string> {
  const token = generateSecureToken();
  const expiresAt = addHours(new Date(), 24); // Token expires in 24 hours
  
  await db.insert(verificationTokens).values({
    userId,
    token,
    type,
    expiresAt,
    used: false
  });
  
  return token;
}

/**
 * Verifies if a token is valid and not expired
 */
export async function verifyToken(token: string, type: 'email_verification' | 'password_reset'): Promise<{ valid: boolean, userId?: number }> {
  try {
    const [foundToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        eq(verificationTokens.token, token)
      );
    
    if (!foundToken) {
      return { valid: false };
    }
    
    // Check if token is of the correct type
    if (foundToken.type !== type) {
      return { valid: false };
    }
    
    // Check if token has been used
    if (foundToken.used) {
      return { valid: false };
    }
    
    // Check if token is expired
    if (new Date(foundToken.expiresAt) < new Date()) {
      return { valid: false };
    }
    
    return { valid: true, userId: foundToken.userId };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false };
  }
}

/**
 * Marks a token as used
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    await db
      .update(verificationTokens)
      .set({ used: true })
      .where(eq(verificationTokens.token, token));
    
    return true;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
}

/**
 * Formats verification email data for EmailJS
 */
export function formatVerificationEmail(userEmail: string, userName: string, verificationLink: string) {
  return {
    to_email: userEmail,
    to_name: userName,
    subject: 'Verify Your MyDentalFly Account',
    message: `Please verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.`,
    verification_link: verificationLink
  };
}

/**
 * Formats password reset email data for EmailJS
 */
export function formatPasswordResetEmail(userEmail: string, userName: string, resetLink: string) {
  return {
    to_email: userEmail,
    to_name: userName,
    subject: 'Reset Your MyDentalFly Password',
    message: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 24 hours.`,
    reset_link: resetLink
  };
}

/**
 * Gets current EmailJS configuration
 */
export function getEmailJSConfig(): EmailJSConfig {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
  };
}

/**
 * Gets user data by email
 */
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  return user;
}

/**
 * Updates a user's email verification status
 */
export async function markEmailAsVerified(userId: number): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error('Error marking email as verified:', error);
    return false;
  }
}