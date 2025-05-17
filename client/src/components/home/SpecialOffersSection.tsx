import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Tag, Clock } from 'lucide-react';

// Special offer package data
const specialOffers = [
  {
    id: 'premium-implant',
    title: 'Premium Implant Package',
    description: 'Complete dental implant treatment including consultation, surgery, crown, and aftercare.',
    price: '€750',
    oldPrice: '€1500',
    discount: '50% Off',
    image: '/images/dental-implant.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    promoCode: 'IMPLANTCROWN30',
    limited: true,
    items: ['Premium implant + crown', 'Pre-op consultation', 'Aftercare', '5-year warranty']
  },
  {
    id: 'smile-makeover',
    title: 'Luxury Smile Makeover',
    description: 'Complete smile transformation with premium zirconia crowns, plus 5-star hotel accommodation.',
    price: '€2999',
    oldPrice: '€5999',
    discount: 'Save €3000',
    image: '/images/smile-makeover.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    promoCode: 'LUXHOTEL20',
    limited: true,
    items: ['8 zirconia crowns', 'Luxury hotel (5 nights)', 'VIP airport transfers', 'Personal coordinator']
  },
  {
    id: 'travel-bundle',
    title: 'Travel & Treatment Bundle',
    description: 'All-inclusive package with flights, hotel, and comprehensive dental treatment.',
    price: '€1999',
    oldPrice: '€3499',
    discount: '40% Off',
    image: '/images/travel-bundle.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1528053328864-2edbd49ed66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    promoCode: 'LUXTRAVEL',
    limited: false,
    items: ['Full dental assessment', 'Two-way flight tickets', 'Hotel accommodation', 'Professional whitening']
  }
];

const SpecialOffersSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Special Offers & Packages</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Take advantage of our limited-time deals on premium dental treatments in Turkey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specialOffers.map((offer) => (
            <Card key={offer.id} className="border shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={offer.image} 
                  alt={offer.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = offer.fallbackImage;
                  }}
                />
                {offer.limited && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-md flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Limited Time Offer
                  </div>
                )}
                <Badge className="absolute top-3 left-3 text-sm font-medium" variant="destructive">
                  {offer.discount}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{offer.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-primary">{offer.price}</span>
                  <span className="text-gray-500 text-sm line-through ml-2">{offer.oldPrice}</span>
                </div>
                <ul className="space-y-2">
                  {offer.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Tag className="h-4 w-4 text-primary mr-2 mt-1 shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/quote-builder?promo=${offer.promoCode}`}>
                    Book This Offer <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;