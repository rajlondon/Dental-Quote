
import { useLocation } from 'wouter';

const SpecialOffers = () => {
  const [, setLocation] = useLocation();

  const offers = [
    {
      title: "Summer Implant Package",
      description: "Complete dental implant with crown - Save 25%",
      originalPrice: "£2,200",
      salePrice: "£1,650", 
      promoCode: "SUMMER25",
      highlight: "implant",
      validUntil: "2025-08-31"
    },
    {
      title: "Hollywood Smile Makeover", 
      description: "16-20 veneers + teeth whitening",
      originalPrice: "£4,500",
      salePrice: "£3,200",
      promoCode: "SMILE50",
      highlight: "veneers",
      validUntil: "2025-07-31"
    },
    {
      title: "Full Mouth Reconstruction",
      description: "Complete oral rehabilitation package",
      originalPrice: "£12,000", 
      salePrice: "£8,500",
      promoCode: "FULLMOUTH",
      highlight: "reconstruction",
      validUntil: "2025-09-30"
    }
  ];

  const handleOfferClick = (offer: typeof offers[0]) => {
    // Build URL with promo code and highlighted treatment
    const params = new URLSearchParams({
      promo: offer.promoCode,
      highlight: offer.highlight,
      offer: 'true'
    });
    
    setLocation(`/pricing?${params.toString()}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Limited Time Offers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Exclusive deals from our premium partner clinics to make your dental journey more affordable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              
              {/* Promo Badge */}
              <div className="bg-red-500 text-white text-center py-2 font-semibold">
                🔥 LIMITED TIME: Use code {offer.promoCode}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                {/* Pricing */}
                <div className="mb-4">
                  <span className="text-gray-500 line-through text-lg">{offer.originalPrice}</span>
                  <span className="text-green-600 text-2xl font-bold ml-2">{offer.salePrice}</span>
                </div>

                {/* Validity */}
                <p className="text-sm text-gray-500 mb-4">
                  ⏰ Valid until {new Date(offer.validUntil).toLocaleDateString()}
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => handleOfferClick(offer)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Claim This Offer →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
