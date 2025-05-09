import { db } from "../db";
import { enhancedPromoTokens, promoClinics, promoItems, promos } from "@shared/schema";
import type { 
  Promo, 
  InsertPromo, 
  PromoItem, 
  InsertPromoItem, 
  PromoClinic, 
  InsertPromoClinic, 
  EnhancedPromoToken, 
  InsertEnhancedPromoToken
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and, gte, inArray, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Service layer for managing promos and related entities
 */
export class PromoService {
  /**
   * Create a new promotion with its items and clinic associations
   */
  async createPromo(
    promoData: InsertPromo,
    promoItems: InsertPromoItem[],
    promoClinics: InsertPromoClinic[]
  ): Promise<Promo> {
    // Generate a unique slug if not provided
    if (!promoData.slug) {
      promoData.slug = this.generateSlug(promoData.title);
    }

    // Convert string enums to proper enum types
    const promoDataWithEnums = {
      ...promoData,
      promoType: promoData.promoType as any,
      discountType: promoData.discountType as any
    };

    // Insert the promo
    const [newPromo] = await db
      .insert(promos)
      .values(promoDataWithEnums)
      .returning();

    // Insert associated items one by one to avoid array insertion issues
    if (promoItems.length > 0) {
      const promoItemsWithId = promoItems.map(item => ({
        ...item,
        promoId: newPromo.id,
        itemType: item.itemType as any
      }));
      
      // Process items individually to avoid type issues
      for (const item of promoItemsWithId) {
        await db
          .execute(sql`INSERT INTO ${promoItems} ${sql.raw(
            `(id, promo_id, item_type, item_code, qty, created_at, updated_at)`
          )} VALUES ${sql.raw(
            `(
              uuid_generate_v4(),
              ${item.promoId},
              ${item.itemType},
              ${item.itemCode},
              ${item.qty || 1},
              NOW(),
              NOW()
            )`
          )}`);
      }
    }

    // Insert associated clinics one by one to avoid array insertion issues
    if (promoClinics.length > 0) {
      const promoClinicsWithId = promoClinics.map(clinic => ({
        ...clinic,
        promoId: newPromo.id
      }));
      
      // Process clinics individually to avoid type issues
      for (const clinic of promoClinicsWithId) {
        await db
          .execute(sql`INSERT INTO ${promoClinics} ${sql.raw(
            `(id, promo_id, clinic_id, created_at, updated_at)`
          )} VALUES ${sql.raw(
            `(
              uuid_generate_v4(),
              ${clinic.promoId},
              ${clinic.clinicId},
              NOW(),
              NOW()
            )`
          )}`);
      }
    }

    return newPromo;
  }

  /**
   * Update an existing promotion
   */
  async updatePromo(
    promoId: string,
    promoData: Partial<InsertPromo>
  ): Promise<Promo | null> {
    // Prevent updating the slug to avoid breaking existing links
    if (promoData.slug) {
      delete promoData.slug;
    }

    // Convert string enums to proper enum types
    const promoDataWithEnums = {
      ...promoData,
      promoType: promoData.promoType as any,
      discountType: promoData.discountType as any,
      updatedAt: new Date()
    };

    const [updatedPromo] = await db
      .update(promos)
      .set(promoDataWithEnums)
      .where(eq(promos.id, promoId))
      .returning();

    return updatedPromo || null;
  }

  /**
   * Delete an existing promotion and all its related data
   */
  async deletePromo(promoId: string): Promise<boolean> {
    // Note: Related records will be cascade deleted due to 
    // onDelete: "cascade" references in the schema
    const result = await db
      .delete(promos)
      .where(eq(promos.id, promoId));

    return result.rowCount != null && result.rowCount > 0;
  }

  /**
   * Get a promo by ID with all related items and clinics
   */
  async getPromoById(promoId: string): Promise<Promo | null> {
    const result = await db.query.promos.findFirst({
      where: eq(promos.id, promoId),
      with: {
        items: true,
        clinics: {
          with: {
            clinic: true
          }
        }
      }
    });

    return result || null;
  }

  /**
   * Get a promo by slug with all related items and clinics
   */
  async getPromoBySlug(slug: string): Promise<Promo | null> {
    const result = await db.query.promos.findFirst({
      where: eq(promos.slug, slug),
      with: {
        items: true,
        clinics: {
          with: {
            clinic: true
          }
        }
      }
    });

    return result || null;
  }

  /**
   * Get all active promos with pagination, sorted by end date (soonest first)
   */
  async getActivePromos(page = 1, limit = 10): Promise<Promo[]> {
    const offset = (page - 1) * limit;
    const now = new Date();

    const activePromos = await db.query.promos.findMany({
      where: and(
        eq(promos.isActive, true),
        gte(promos.endDate, now)
      ),
      limit,
      offset,
      orderBy: [desc(promos.endDate)],
      with: {
        items: true,
        clinics: true
      }
    });

    return activePromos;
  }

  /**
   * Get all promos for a specific clinic
   */
  async getPromosByClinic(clinicId: string): Promise<Promo[]> {
    const clinicPromos = await db.query.promoClinics.findMany({
      where: eq(promoClinics.clinicId, clinicId),
      with: {
        promo: {
          with: {
            items: true
          }
        }
      }
    });

    return clinicPromos.map(cp => cp.promo);
  }

  /**
   * Add items to an existing promo
   */
  async addPromoItems(promoId: string, items: InsertPromoItem[]): Promise<PromoItem[]> {
    const itemsWithPromoId = items.map(item => ({
      ...item,
      promoId,
      itemType: item.itemType as any
    }));

    // Process items individually to avoid array insertion issues
    const newItems = [];
    for (const item of itemsWithPromoId) {
      const [newItem] = await db
        .insert(promoItems)
        .values(item)
        .returning();
      
      newItems.push(newItem);
    }

    return newItems;
  }

  /**
   * Remove specific items from a promo
   */
  async removePromoItems(promoId: string, itemIds: string[]): Promise<boolean> {
    const result = await db
      .delete(promoItems)
      .where(
        and(
          eq(promoItems.promoId, promoId),
          inArray(promoItems.id, itemIds)
        )
      );

    return result.rowCount != null && result.rowCount > 0;
  }

  /**
   * Add clinics to an existing promo
   */
  async addPromoClinics(promoId: string, clinicIds: string[]): Promise<PromoClinic[]> {
    const clinicsWithPromoId = clinicIds.map(clinicId => ({
      promoId,
      clinicId
    }));

    // Process clinics individually to avoid array insertion issues
    const newClinics = [];
    for (const clinic of clinicsWithPromoId) {
      const [newClinic] = await db
        .insert(promoClinics)
        .values(clinic)
        .returning();
      
      newClinics.push(newClinic);
    }

    return newClinics;
  }

  /**
   * Remove specific clinics from a promo
   */
  async removePromoClinics(promoId: string, clinicIds: string[]): Promise<boolean> {
    const result = await db
      .delete(promoClinics)
      .where(
        and(
          eq(promoClinics.promoId, promoId),
          inArray(promoClinics.clinicId, clinicIds)
        )
      );

    return result.rowCount != null && result.rowCount > 0;
  }

  /**
   * Generate a promo token for a specific promo and user/email
   */
  async generatePromoToken(
    promoId: string,
    source: string,
    tokenData: Partial<InsertEnhancedPromoToken>
  ): Promise<EnhancedPromoToken> {
    const token = this.generateUniqueToken();
    
    // Default expiration to 30 days if not specified
    const expireAt = tokenData.expireAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [newToken] = await db
      .insert(enhancedPromoTokens)
      .values({
        promoId,
        token,
        source: source as any,
        email: tokenData.email,
        userId: tokenData.userId,
        used: false,
        expireAt
      })
      .returning();

    return newToken;
  }

  /**
   * Validate and consume a promo token
   */
  async validateToken(tokenStr: string): Promise<EnhancedPromoToken | null> {
    const now = new Date();

    // Find the token
    const [token] = await db
      .select()
      .from(enhancedPromoTokens)
      .where(
        and(
          eq(enhancedPromoTokens.token, tokenStr),
          eq(enhancedPromoTokens.used, false),
          gte(enhancedPromoTokens.expireAt, now)
        )
      );

    if (!token) {
      return null;
    }

    // Load the associated promo
    const promo = await this.getPromoById(token.promoId);
    
    // Check if the promo is active and not expired
    if (!promo || !promo.isActive || promo.endDate < now) {
      return null;
    }

    return token;
  }

  /**
   * Mark a token as used
   */
  async markTokenAsUsed(tokenStr: string): Promise<boolean> {
    const result = await db
      .update(enhancedPromoTokens)
      .set({ used: true })
      .where(eq(enhancedPromoTokens.token, tokenStr));

    return result.rowCount != null && result.rowCount > 0;
  }

  // Helper methods
  private generateSlug(title: string): string {
    const slugBase = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 10000).toString();
    return `${slugBase}-${randomSuffix}`;
  }

  private generateUniqueToken(): string {
    // Generate a secure random token
    return randomBytes(16).toString('hex');
  }
  
  /**
   * Check if a clinic is eligible for a promotion
   */
  async isClinicEligibleForPromo(promoId: string, clinicId: string): Promise<boolean> {
    // Check if this clinic is specifically associated with this promo
    const [association] = await db
      .select()
      .from(promoClinics)
      .where(
        and(
          eq(promoClinics.promoId, promoId),
          eq(promoClinics.clinicId, clinicId)
        )
      )
      .limit(1);
      
    return !!association;
  }
}

// Export a singleton instance
export const promoService = new PromoService();