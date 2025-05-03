import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  ArrowLeft, 
  Tag as TagIcon, 
  BadgePercent, 
  Clock,
  Star,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, isAfter, parseISO, differenceInDays } from "date-fns";
import { SpecialOffer } from "@shared/specialOffers";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

interface EnhancedOffersCarouselProps {
  className?: string;
}

// Sample offers data for demonstration
const sampleOffers: SpecialOffer[] = [
  {
    id: "free-consultation",
    clinic_id: "1",
    title: "Free Consultation Package",
    description: "Experience personalized dental care with our complimentary consultation package, featuring comprehensive evaluations by internationally-trained specialists in our state-of-the-art facility.",
    discount_type: "percentage",
    discount_value: 100,
    applicable_treatments: ["Dental Implants", "Veneers", "Full Mouth Reconstruction"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
    promo_code: "FREE-CONSULTATION100",
    terms_conditions: "Terms and conditions apply. Please contact our team for details.",
    banner_image: "/images/offers/free-consultation.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 20,
    promotion_level: "premium",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "dental-implant-crown-bundle",
    clinic_id: "2",
    title: "Dental Implant + Crown Bundle",
    description: "Transform your smile with our exclusive dental implant and crown bundle, designed specifically for international patients seeking top-tier dental restoration.",
    discount_type: "fixed_amount",
    discount_value: 40,
    applicable_treatments: ["All Treatments"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "DENTAL-IMPLANT-CROWN-BUNDLE101",
    terms_conditions: "Terms and conditions apply. Please contact our team for details.",
    banner_image: "/images/offers/dental-implant-crown-bundle.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 18,
    promotion_level: "featured",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "luxury-airport-transfer",
    clinic_id: "3",
    title: "Luxury Airport Transfer",
    description: "Begin your dental tourism experience with our complimentary luxury airport transfer service, designed for the ultimate comfort and convenience.",
    discount_type: "fixed_amount",
    discount_value: 60,
    applicable_treatments: ["All Treatments"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
    promo_code: "LUXURY-AIRPORT-TRANSFER102",
    terms_conditions: "Terms and conditions apply. Please contact our team for details.",
    banner_image: "/images/offers/luxury-airport-transfer.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 16,
    promotion_level: "standard",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  },
  {
    id: "premium-hotel-deal",
    clinic_id: "4",
    title: "Premium Hotel Deal",
    description: "Enjoy luxury accommodation with our premium hotel package when booking selected dental treatments.",
    discount_type: "percentage",
    discount_value: 25,
    applicable_treatments: ["All Treatments"],
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    promo_code: "PREMIUM-HOTEL-25",
    terms_conditions: "Terms and conditions apply. Please contact our team for details.",
    banner_image: "/images/offers/premium-hotel-deal.jpg",
    is_active: true,
    admin_approved: true,
    commission_percentage: 22,
    promotion_level: "premium",
    homepage_display: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    admin_reviewed_at: new Date().toISOString()
  }
];

const EnhancedOffersCarousel: React.FC<EnhancedOffersCarouselProps> = ({ className }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now()); // Add timestamp for forced refresh

  // Fetch special offers data
  const { data: apiOffers = [], isLoading } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/special-offers/homepage"],
  });
  
  // Use sample offers for demonstration if the API returns empty
  const offers = apiOffers.length > 0 ? apiOffers : sampleOffers;

  // Force re-render every 30 seconds to refresh images
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || offers.length === 0 || isHovering) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [offers.length, isAutoPlaying, isHovering]);

  // Handle pause on hover
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Navigation functions
  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % offers.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Get promotion level styling
  const getPromotionBadgeStyle = (level: string) => {
    switch (level) {
      case "premium":
        return "bg-gradient-to-r from-amber-500 to-yellow-400 text-black";
      case "featured":
        return "bg-gradient-to-r from-blue-500 to-cyan-400 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Format discount text based on type and value
  const formatDiscount = (type: string, value: number) => {
    return type === "percentage" ? `${value}% off` : `$${value} off`;
  };

  // Calculate days left until offer expires
  const getDaysRemaining = (endDate: string) => {
    const end = parseISO(endDate);
    return differenceInDays(end, new Date());
  };

  // Generate image URL with timestamp to force refresh
  const getImageUrl = (offer: SpecialOffer) => {
    const baseUrl = offer.banner_image || `/images/offers/${offer.id.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    return `${baseUrl}?v=${timestamp}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto mt-8 p-4">
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg animate-pulse">
          <div className="text-gray-400">Loading special offers...</div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null; // Hide section if no offers available
  }

  return (
    <div className={cn("w-full py-10 overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-sky-50 shadow-inner", className)}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 px-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 text-transparent bg-clip-text">Special Offers</h2>
            <p className="text-gray-600">Exclusive deals from our partner clinics</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/50 hover:bg-white shadow-sm transition-colors"
              aria-label="Previous offer"
            >
              <ChevronLeft size={22} className="text-blue-600" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/50 hover:bg-white shadow-sm transition-colors"
              aria-label="Next offer"
            >
              <ChevronRight size={22} className="text-blue-600" />
            </button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 mx-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {offers.map((offer) => (
              <div key={offer.id + "-" + timestamp} className="w-full flex-shrink-0">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image Section */}
                  <div className="md:w-1/2 h-40 md:h-auto relative">
                    <img
                      src={getImageUrl(offer)}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        // Fallback to original image path without timestamp if error
                        const target = e.target as HTMLImageElement;
                        target.src = `/images/offers/${offer.id.toLowerCase().replace(/\s+/g, '-')}.jpg`;
                      }}
                    />
                    
                    {/* Promotion Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center ${getPromotionBadgeStyle(offer.promotion_level)}`}>
                      <Star size={14} className="mr-1" />
                      {offer.promotion_level.charAt(0).toUpperCase() + offer.promotion_level.slice(1)}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="md:w-1/2 p-4 md:p-6 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xl md:text-2xl text-gray-800 mb-2">{offer.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 md:line-clamp-5">{offer.description}</p>
                      
                      {/* Offer Details */}
                      <div className="space-y-2">
                        {offer.discount_type && (
                          <div className="flex items-center text-sm">
                            <BadgePercent size={16} className="mr-2 text-green-600" />
                            <span className="font-medium text-green-600">
                              {formatDiscount(offer.discount_type, offer.discount_value)}
                            </span>
                          </div>
                        )}
                        
                        {offer.applicable_treatments && offer.applicable_treatments.length > 0 && (
                          <div className="flex items-center text-sm">
                            <TagIcon size={16} className="mr-2 text-gray-500" />
                            <span>
                              {offer.applicable_treatments.length === 1 && offer.applicable_treatments[0] === "All Treatments"
                                ? "All treatments"
                                : offer.applicable_treatments.join(", ")}
                            </span>
                          </div>
                        )}
                        
                        {offer.end_date && (
                          <div className="flex items-center text-sm">
                            <Clock size={16} className="mr-2 text-gray-500" />
                            <span>
                              {getDaysRemaining(offer.end_date) > 0
                                ? `${getDaysRemaining(offer.end_date)} days left`
                                : "Expires today"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-4">
                      <a
                        href={`/offers/${offer.id}`}
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        View details
                        <ArrowUpRight size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="flex space-x-2 bg-black/20 px-3 py-1.5 rounded-full">
              {offers.map((_, index) => (
                <button
                  key={index + "-" + timestamp}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "bg-primary shadow-sm w-5"
                      : "bg-white/70 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOffersCarousel;