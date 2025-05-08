import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from 'lucide-react';

interface SingleClinicCardProps {
  clinic: any;
  badge: string;
  onSelect?: () => void;
  totalPrice?: number;
}

/**
 * Helper function to calculate clinic price based on treatment items
 */
function calculateClinicPrice(clinic: any): number {
  try {
    // Try to get treatment items from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const treatmentItemsParam = urlParams.get('treatmentItems');
    
    if (treatmentItemsParam) {
      // Parse the treatment items from URL
      const treatmentItems = JSON.parse(decodeURIComponent(treatmentItemsParam));
      if (Array.isArray(treatmentItems) && treatmentItems.length > 0) {
        // Apply clinic's price factor to each treatment
        const priceFactor = clinic.priceFactor || 0.4; // Default to 0.4 (40%) if not specified
        const totalPrice = treatmentItems.reduce((total, item) => {
          return total + (item.subtotalGBP * priceFactor);
        }, 0);
        
        // Apply any special offer discounts
        if (clinic.specialOffer && clinic.specialOffer.discountType) {
          if (clinic.specialOffer.discountType === 'percentage') {
            return totalPrice * (1 - (clinic.specialOffer.discountValue / 100));
          } else if (clinic.specialOffer.discountType === 'fixed_amount') {
            return Math.max(0, totalPrice - clinic.specialOffer.discountValue);
          }
        }
        
        return totalPrice;
      }
    }
    
    // Fallback: return a default price or access clinic.totalPrice
    return clinic.totalPrice || 5150;
  } catch (error) {
    console.error('Error calculating clinic price:', error);
    return 0;
  }
}

/**
 * A component that displays a single clinic card with a promotional badge
 * Used specifically for promotional flows where only one clinic should be shown
 */
export default function SingleClinicCard({ clinic, badge, onSelect, totalPrice }: SingleClinicCardProps) {
  return (
    <div className="mb-8">
      <Card className="overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-colors shadow-md">
        <div className="border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Clinic Info */}
            <div className="md:col-span-1">
              <div className="aspect-video rounded-lg overflow-hidden mb-4 relative shadow-md border-2 border-gray-100">
                {/* Clinic image */}
                <img 
                  src={`/images/clinics/${clinic.id}/exterior.jpg`} 
                  alt={`${clinic.name} Exterior`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.currentTarget.src = clinic.tier === 'premium' 
                      ? 'https://placehold.co/600x400/fef3c7/92400e?text=Premium+Clinic'
                      : clinic.tier === 'standard'
                        ? 'https://placehold.co/600x400/e0f2fe/1e40af?text=Standard+Clinic'
                        : 'https://placehold.co/600x400/f0fdf4/166534?text=Affordable+Clinic';
                  }}
                />
                
                {/* Small badge in the corner to indicate tier */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={`
                      ${clinic.tier === 'premium' 
                        ? 'bg-amber-500/90 text-white border-amber-400' 
                        : clinic.tier === 'standard' 
                          ? 'bg-blue-500/90 text-white border-blue-400' 
                          : 'bg-green-500/90 text-white border-green-400'
                      }
                    `}
                  >
                    {clinic.tier === 'premium' ? 'Premium' : clinic.tier === 'standard' ? 'Standard' : 'Affordable'}
                  </Badge>
                </div>
              </div>
              
              <h2 className="text-xl font-bold mb-1">{clinic.name}</h2>
              
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{clinic.location?.area}, {clinic.location?.city}</span>
              </div>
              
              {clinic.ratings && (
                <div className="flex items-center gap-1 mb-4">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">{clinic.ratings.overall}</span>
                  <span className="text-xs text-gray-500">({clinic.ratings.reviews} reviews)</span>
                </div>
              )}
            </div>
            
            {/* Clinic Features */}
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">CLINIC HIGHLIGHTS</h3>
              <ul className="space-y-2">
                {clinic.features?.slice(0, 5).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="rounded-full bg-green-100 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Price and Action */}
            <div className="md:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">YOUR PACKAGE PRICE</h3>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-blue-700">
                    £{totalPrice ? totalPrice.toFixed(2) : calculateClinicPrice(clinic).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Includes all selected treatments</p>
                </div>
                
                {/* Guarantees Quick View */}
                {clinic.guarantees && (
                  <div className="mb-4">
                    <p className="text-sm"><span className="font-medium">Guarantees:</span> Implants {clinic.guarantees.implants}, Crowns {clinic.guarantees.crowns}</p>
                  </div>
                )}
              </div>
              
              {/* Action Button */}
              <div className="space-y-2">
                {onSelect && (
                  <button 
                    onClick={onSelect}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
                  >
                    Select This Clinic
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <span className="inline-block mt-2 rounded bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-700">
        {badge}
      </span>
    </div>
  );
}