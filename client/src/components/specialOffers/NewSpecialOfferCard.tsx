import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

console.log('COMPONENT_ID: NewSpecialOfferCard LOADED - ' + new Date().toISOString());

export interface NewSpecialOfferCardProps {
  offer: {
    id: string;
    title?: string;
    name?: string; // Some offers might use name instead of title
    description: string;
    discountType?: string;
    discountValue?: number;
    applicableTreatments?: string[];
    startDate?: string;
    endDate?: string;
    promoCode?: string;
    termsAndConditions?: string;
    imageUrl?: string;
    treatmentPriceGBP?: number;
    badgeText?: string;
    type?: 'offer' | 'package';
  };
  onClick?: (promoCode: string) => void;
}

const NewSpecialOfferCard: React.FC<NewSpecialOfferCardProps> = ({ offer, onClick }) => {
  // Debug logging
  useEffect(() => {
    console.log('⭐⭐⭐ NEW SPECIAL OFFER CARD MOUNTED ⭐⭐⭐', offer);
    
    // Log DOM elements after render
    const timer = setTimeout(() => {
      console.log('DOM after render of NewSpecialOfferCard:', 
        document.querySelectorAll('.new-special-offer-card').length, 
        'instances found');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [offer]);
  
  // Use the title or name property (whichever is available)
  const title = offer.title || offer.name || 'Unnamed Offer';
  
  // Handle click
  const handleUseOffer = () => {
    console.log('NewSpecialOfferCard button clicked for offer:', title);
    if (onClick && offer.promoCode) {
      onClick(offer.promoCode);
    }
  };
  
  // Use very distinctive styling to make changes obvious
  return (
    <div className="new-special-offer-card" style={{
      border: '4px solid red',
      padding: '20px',
      margin: '10px',
      backgroundColor: '#ffe0e0',
      borderRadius: '10px',
      maxWidth: '400px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Very obvious marker to show this is the new component */}
      <div style={{
        position: 'absolute', 
        top: '-10px', 
        right: '-10px',
        backgroundColor: '#ff0000',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: '24px'
      }}>
        !
      </div>
      
      <h2 style={{ color: 'blue', marginBottom: '10px' }}>
        NEW CARD: {title}
      </h2>
      
      {/* Display type */}
      <div style={{
        display: 'inline-block',
        backgroundColor: offer.type === 'package' ? '#e0f7ff' : '#fff4e0',
        color: offer.type === 'package' ? '#0077b6' : '#ff8c00',
        padding: '4px 8px',
        borderRadius: '4px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        {offer.type === 'package' ? '📦 Package' : '🏷️ Offer'}
      </div>
      
      {/* Description */}
      <p style={{
        margin: '10px 0',
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '4px'
      }}>
        {offer.description}
      </p>
      
      {/* Button with distinctive styling */}
      <Button 
        onClick={handleUseOffer}
        style={{ 
          backgroundColor: 'green', 
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '10px'
        }}
      >
        APPLY TO QUOTE (NEW)
      </Button>
      
      {/* Timestamp to show when rendered */}
      <div style={{
        fontSize: '10px',
        marginTop: '10px',
        color: '#666',
        textAlign: 'right'
      }}>
        Rendered: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default NewSpecialOfferCard;