
interface QuoteRequest {
  id: string;
  treatments: string[];
  patientPreferences?: {
    budget: 'low' | 'medium' | 'high';
    priority: 'cost' | 'quality' | 'location';
    holidayInterest: boolean;
  };
  location?: string;
  timeline?: string;
}

interface EnhancedClinic {
  id: string;
  name: string;
  location: string;
  rating: number;
  tier: 'affordable' | 'mid' | 'premium';
  specialties: string[];
  features: string[];
  priceGBP: number;
  distanceFromBeach?: number; // km
  touristArea: boolean;
  packages: {
    budget: boolean;
    premium: boolean;
    holiday: boolean;
  };
}

// Smart Quote Assignment Algorithm
export class QuoteEngine {
  
  /**
   * Main function to assign best-matching clinics to a quote
   * Uses existing clinic data with minimal enhancements
   */
  static assignBestClinics(
    quoteRequest: QuoteRequest, 
    availableClinics: EnhancedClinic[]
  ): EnhancedClinic[] {
    
    // 1. Filter clinics that can handle the treatments
    const capableClinics = availableClinics.filter(clinic => 
      this.canHandleTreatments(clinic, quoteRequest.treatments)
    );

    // 2. Score each clinic based on patient preferences
    const scoredClinics = capableClinics.map(clinic => ({
      clinic,
      score: this.calculateClinicScore(clinic, quoteRequest)
    }));

    // 3. Sort by score and return top 3-5 options
    return scoredClinics
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.clinic);
  }

  /**
   * Check if clinic can handle the requested treatments
   */
  private static canHandleTreatments(clinic: EnhancedClinic, treatments: string[]): boolean {
    // Basic specialty matching
    const implantTreatments = ['Dental Implant', 'All-on-4', 'All-on-6', 'implants'];
    const cosmeticTreatments = ['Veneers', 'Crowns', 'Teeth Whitening', 'veneers', 'crowns', 'whitening'];
    const orthodonticTreatments = ['Invisalign', 'Braces', 'orthodontics'];

    for (const treatment of treatments) {
      if (implantTreatments.some(t => treatment.toLowerCase().includes(t.toLowerCase()))) {
        if (!clinic.specialties.some(s => s.toLowerCase().includes('implant'))) return false;
      }
      if (cosmeticTreatments.some(t => treatment.toLowerCase().includes(t.toLowerCase()))) {
        if (!clinic.specialties.some(s => s.toLowerCase().includes('cosmetic') || s.toLowerCase().includes('veneer') || s.toLowerCase().includes('crown'))) return false;
      }
      if (orthodonticTreatments.some(t => treatment.toLowerCase().includes(t.toLowerCase()))) {
        if (!clinic.specialties.some(s => s.toLowerCase().includes('orthodontic'))) return false;
      }
    }
    return true;
  }

  /**
   * Calculate compatibility score between clinic and patient preferences
   */
  private static calculateClinicScore(clinic: EnhancedClinic, request: QuoteRequest): number {
    let score = 0;
    const preferences = request.patientPreferences;

    if (!preferences) return clinic.rating * 20; // Default scoring

    // Base rating score (0-100)
    score += clinic.rating * 20;

    // Budget alignment
    switch (preferences.budget) {
      case 'low':
        score += clinic.tier === 'affordable' ? 30 : 
                 clinic.tier === 'mid' ? 10 : -10;
        break;
      case 'medium':
        score += clinic.tier === 'mid' ? 30 : 15;
        break;
      case 'high':
        score += clinic.tier === 'premium' ? 30 : 
                 clinic.tier === 'mid' ? 15 : 5;
        break;
    }

    // Priority-based scoring
    switch (preferences.priority) {
      case 'cost':
        score += clinic.tier === 'affordable' ? 25 : 
                 clinic.tier === 'mid' ? 5 : -15;
        break;
      case 'quality':
        score += clinic.rating >= 4.5 ? 25 : 
                 clinic.rating >= 4.0 ? 15 : 0;
        score += clinic.tier === 'premium' ? 15 : 0;
        break;
      case 'location':
        if (preferences.holidayInterest) {
          score += clinic.touristArea ? 25 : 0;
          score += (clinic.distanceFromBeach || 50) < 5 ? 20 : 0;
        }
        break;
    }

    // Holiday interest bonus
    if (preferences.holidayInterest) {
      score += clinic.packages.holiday ? 15 : 0;
      score += clinic.touristArea ? 10 : 0;
    }

    return Math.max(0, score);
  }

  /**
   * Generate filtering options for frontend
   */
  static getFilterOptions() {
    return {
      'money-saver': {
        title: '💰 Best Value',
        description: 'Maximum savings with quality care',
        filter: (clinics: EnhancedClinic[]) => 
          clinics.filter(c => c.tier === 'affordable' && c.rating >= 4.0)
                 .sort((a, b) => a.priceGBP - b.priceGBP)
      },
      
      'quality-first': {
        title: '🏆 Premium Quality',
        description: 'Top-rated clinics with latest technology',
        filter: (clinics: EnhancedClinic[]) => 
          clinics.filter(c => c.rating >= 4.5)
                 .sort((a, b) => b.rating - a.rating)
      },
      
      'holiday-combo': {
        title: '🏖️ Beach & Treatment',
        description: 'Combine treatment with Turkish coastal holiday',
        filter: (clinics: EnhancedClinic[]) => 
          clinics.filter(c => c.touristArea && (c.distanceFromBeach || 50) < 10)
                 .sort((a, b) => (a.distanceFromBeach || 50) - (b.distanceFromBeach || 50))
      },
      
      'quickest': {
        title: '⚡ Fastest Treatment',
        description: 'Shortest wait times and express packages',
        filter: (clinics: EnhancedClinic[]) => 
          clinics.filter(c => c.features.includes('Express Treatment'))
                 .sort((a, b) => b.rating - a.rating)
      }
    };
  }
}

// Helper function to enhance existing clinic data
export function enhanceClinicData(existingClinic: any): EnhancedClinic {
  return {
    ...existingClinic,
    distanceFromBeach: inferBeachDistance(existingClinic.location),
    touristArea: inferTouristArea(existingClinic.location),
    packages: {
      budget: existingClinic.tier === 'affordable',
      premium: existingClinic.tier === 'premium',
      holiday: inferHolidayPackage(existingClinic.features, existingClinic.location)
    }
  };
}

function inferBeachDistance(location: string): number {
  // Simple lookup for major Turkish cities
  const beachDistances: Record<string, number> = {
    'Antalya': 2,
    'Bodrum': 1,
    'Marmaris': 1,
    'Istanbul': 15,
    'Ankara': 250,
    'Izmir': 8,
    'Şişli': 15, // Istanbul district
    'Nişantaşı': 15, // Istanbul district
    'Maltepe': 5 // Istanbul coastal district
  };
  
  // Check if location contains any of these cities
  for (const [city, distance] of Object.entries(beachDistances)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return distance;
    }
  }
  
  return 20;
}

function inferTouristArea(location: string): boolean {
  const touristCities = ['Antalya', 'Bodrum', 'Marmaris', 'Istanbul', 'Izmir', 'Şişli', 'Nişantaşı'];
  return touristCities.some(city => location.toLowerCase().includes(city.toLowerCase()));
}

function inferHolidayPackage(features: string[], location: string): boolean {
  const holidayFeatures = ['Hotel Partnership', 'Tour Guide', 'Airport Transfer', 'VIP treatment options', 'Door-to-door service'];
  return features.some(f => holidayFeatures.some(hf => f.includes(hf))) || 
         ['Antalya', 'Bodrum', 'Marmaris'].some(city => location.toLowerCase().includes(city.toLowerCase()));
}

export type { QuoteRequest, EnhancedClinic };
