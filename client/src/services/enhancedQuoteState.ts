// client/src/services/enhancedQuoteState.ts
import { QuoteData } from "@/types/quote";

interface QuoteSession {
  sessionId: string;
  quoteData: QuoteData;
  lockedPromoCodes: string[];
  createdAt: string;
  lastUpdated: string;
  version: number;
}

class QuoteStateManager {
  private session: QuoteSession | null = null;
  private readonly STORAGE_KEY = "quote_session";

  // Generate unique session ID
  private generateSessionId(): string {
    return `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize new quote session
  initializeSession(initialData?: Partial<QuoteData>): string {
    const sessionId = this.generateSessionId();

    this.session = {
      sessionId,
      quoteData: {
        treatments: [],
        subtotal: 0,
        total: 0,
        currency: "GBP",
        ...initialData,
      },
      lockedPromoCodes: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: 1,
    };

    this.persistSession();
    return sessionId;
  }

  // Get current session
  getSession(): QuoteSession | null {
    if (this.session) return this.session;

    // Try to restore from storage
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.session = JSON.parse(stored);
        return this.session;
      }
    } catch (error) {
      console.error("Failed to restore quote session:", error);
      this.clearSession();
    }

    return null;
  }

  // Update quote data with version control
  updateQuoteData(
    updates: Partial<QuoteData>,
    lockPromoCodes?: string[],
  ): void {
    const session = this.getSession();
    if (!session) {
      console.warn("No active quote session");
      return;
    }

    // Increment version for consistency checking
    session.version += 1;
    session.lastUpdated = new Date().toISOString();
    session.quoteData = { ...session.quoteData, ...updates };

    // Lock promo codes if provided
    if (lockPromoCodes) {
      session.lockedPromoCodes = [
        ...new Set([...session.lockedPromoCodes, ...lockPromoCodes]),
      ];
    }

    this.persistSession();
  }

  // Check if promo code is locked
  isPromoCodeLocked(code: string): boolean {
    const session = this.getSession();
    return session?.lockedPromoCodes.includes(code.toUpperCase()) || false;
  }

  // Get locked promo codes
  getLockedPromoCodes(): string[] {
    const session = this.getSession();
    return session?.lockedPromoCodes || [];
  }

  // Persist session to storage
  private persistSession(): void {
    if (!this.session) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.session));
      // Also backup to sessionStorage for additional security
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.session));
    } catch (error) {
      console.error("Failed to persist quote session:", error);
    }
  }

  // Clear session
  clearSession(): void {
    this.session = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear session storage:", error);
    }
  }

  // Get session ID
  getSessionId(): string | null {
    return this.session?.sessionId || null;
  }
}

// Export singleton instance
export const quoteStateManager = new QuoteStateManager();

// Backward compatibility exports
export function setQuoteData(data: QuoteData): void {
  if (!quoteStateManager.getSession()) {
    quoteStateManager.initializeSession();
  }
  quoteStateManager.updateQuoteData(data);
}

export function getQuoteData(): QuoteData | null {
  const session = quoteStateManager.getSession();
  return session?.quoteData || null;
}

export function updateQuoteData(partialData: Partial<QuoteData>): void {
  quoteStateManager.updateQuoteData(partialData);
}

export function clearQuoteData(): void {
  quoteStateManager.clearSession();
}
