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
                
                {/* Special offer badge with animation */}
                {clinic.specialOffer && (
                  <div className="absolute top-2 left-2 animate-pulse">
                    <Badge 
                      className="bg-blue-600 text-white border-none shadow-lg px-3 py-1 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      Special Offer
                    </Badge>
                  </div>
                )}
                
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
                <h3 className="text-sm font-semibold text-gray-500 mb-2">YOUR PRICE AT THIS CLINIC</h3>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-blue-700">
                    £{totalPrice ? totalPrice.toFixed(2) : calculateClinicPrice(clinic).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">Save up to 70% vs UK prices</p>
                </div>
                
                {/* Special Offer Details */}
                {clinic.specialOffer && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-percent"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m15 9-6 6"/><path d="M9 9h.01"/><path d="M15 15h.01"/></svg>
                      <span>{clinic.specialOffer.title}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">{clinic.specialOffer.description}</p>
                    <div className="mt-2 flex items-center text-xs text-blue-800 gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                      {clinic.specialOffer.discountType === 'percentage' 
                        ? `${clinic.specialOffer.discountValue}% discount on selected treatments` 
                        : `£${clinic.specialOffer.discountValue} off your total`}
                    </div>
                  </div>
                )}
                
                {/* Tracking data - treatment details */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm flex items-center justify-between">
                    <span className="text-gray-600">Your treatments:</span>
                    <span className="font-medium">1 items</span>
                  </div>
                  <div className="text-sm flex items-center justify-between">
                    <span className="text-gray-600">Treatment duration:</span>
                    <span className="font-medium">3-5 days</span>
                  </div>
                  <div className="text-sm flex items-center justify-between">
                    <span className="text-gray-600">Accommodation:</span>
                    <span className="font-medium">{clinic.tier === 'premium' ? 'Included' : clinic.tier === 'standard' ? 'Discounted' : 'Available'}</span>
                  </div>
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