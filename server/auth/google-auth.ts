import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export function setupGoogleAuth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Google OAuth credentials not found, skipping Google auth setup');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.googleId, profile.id));

      if (existingUser) {
        return done(null, existingUser);
      }

      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        const [emailUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (emailUser) {
          // Link Google account to existing user
          await db
            .update(users)
            .set({ 
              googleId: profile.id,
              emailVerified: true,
              status: 'active'
            })
            .where(eq(users.id, emailUser.id));

          const [updatedUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, emailUser.id));

          return done(null, updatedUser);
        }
      }

      // Create new user
      const newUserData = {
        email: email || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        googleId: profile.id,
        emailVerified: true,
        status: 'active' as const,
        role: 'patient' as const,
        password: 'google_oauth_user' // Placeholder for Google users
      };

      const [newUser] = await db
        .insert(users)
        .values(newUserData)
        .returning();

      return done(null, newUser);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}