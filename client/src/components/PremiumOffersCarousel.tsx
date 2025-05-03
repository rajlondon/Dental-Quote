import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  ArrowLeft, 
  Tag as TagIcon, 
  BadgePercent, 
  Clock,
  Star,
  ArrowUpRight
} from "lucide-react";
import { format, isAfter, parseISO, differenceInDays } from "date-fns";
import { SpecialOffer } from "@shared/specialOffers";

interface PremiumOffersCarouselProps {
  className?: string;
}

const PremiumOffersCarousel: React.FC<PremiumOffersCarouselProps> = ({ className }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch special offers data
  const { data: offers = [], isLoading } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/special-offers/homepage"],
    // Default queryFn is already set up in the app to use the backend
  });

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
  const handlePrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleNext = () => {
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
    <div className={`max-w-5xl mx-auto mt-8 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Special Offers</h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevious}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous offer"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next offer"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-lg shadow-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Carousel Track */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {offers.map((offer, index) => (
            <div key={offer.id} className="w-full flex-shrink-0">
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="md:w-1/2 h-40 md:h-auto relative">
                  <img
                    src={offer.banner_image || "/images/placeholder-offer.jpg"}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Promotion Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center ${getPromotionBadgeStyle(offer.promotion_level)}`}>
                    <Star size={14} className="mr-1" />
                    {offer.promotion_level.charAt(0).toUpperCase() + offer.promotion_level.slice(1)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:w-1/2 p-4 md:p-6 bg-white flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
                    
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
                      className="inline-flex items-center text-[#0071c2] font-medium hover:underline"
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
          <div className="flex space-x-1">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumOffersCarousel;