import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Car, Check, Crown, Hotel, MapPin, Plane, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TrendingPackage } from "@/data/packages";

// Package icon component
const PackageIcon: React.FC<{ 
  type: 'hotel' | 'transfers' | 'consultation' | 'cityTour' | 'excursions', 
  included: boolean 
}> = ({ type, included }) => {
  const icons = {
    hotel: <Hotel className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    transfers: <Car className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    consultation: <Shield className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    cityTour: <Plane className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />,
    excursions: <MapPin className={`h-5 w-5 ${included ? 'text-green-600' : 'text-gray-300'}`} />
  };

  const labels = {
    hotel: 'Hotel',
    transfers: 'Transfers',
    consultation: 'Consultation',
    cityTour: 'City Tour',
    excursions: 'Excursions'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {icons[type]}
      <span className={`text-xs ${included ? 'text-gray-700' : 'text-gray-400'}`}>{labels[type]}</span>
    </div>
  );
};

// Package tier badge component
const TierBadge: React.FC<{ tier: 'bronze' | 'silver' | 'gold' }> = ({ tier }) => {
  const styles = {
    bronze: "bg-amber-100 text-amber-800 border-amber-200",
    silver: "bg-slate-100 text-slate-800 border-slate-200",
    gold: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };
  
  const labels = {
    bronze: "Bronze Package",
    silver: "Silver Package",
    gold: "Gold Package"
  };

  return (
    <Badge className={`${styles[tier]} flex items-center gap-1`}>
      <Crown className="h-3 w-3" />
      {labels[tier]}
    </Badge>
  );
};

interface TrendingPackageCardProps {
  package: TrendingPackage;
}

const TrendingPackageCard: React.FC<TrendingPackageCardProps> = ({ package: pkg }) => {
  const { includedServices, tier } = pkg;
  
  // Calculate free excursions count
  const freeExcursionsCount = pkg.excursions.filter(exc => exc.included).length;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-white">
      <div className="relative">
        {/* Package image with overlay */}
        <div className="w-full h-60 overflow-hidden relative">
          <img 
            src={`/images/packages/${pkg.id}.png`}
            alt={`${pkg.title} package`} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
            <div className="flex justify-between items-center">
              <TierBadge tier={tier} />
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 shadow-sm">
                {pkg.duration}
              </Badge>
            </div>
            <h3 className="text-white font-bold text-lg mt-2 drop-shadow-md">{pkg.title}</h3>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {pkg.description}
        </p>
        
        {/* Package details */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">{pkg.clinic.name}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{pkg.clinic.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Hotel className="h-4 w-4 text-gray-500" />
            <span>{pkg.hotel.name}</span>
            <span className="flex">
              {[...Array(pkg.hotel.stars)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              ))}
            </span>
          </div>
        </div>
        
        {/* Treatments included */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Treatments Included:</h4>
          <ul className="space-y-1">
            {pkg.treatments.map((treatment, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <Check className="h-3.5 w-3.5 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                <span>{treatment.count}x {treatment.name}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Included services */}
        <div className="flex justify-between mb-4 mt-6">
          <PackageIcon type="hotel" included={includedServices.hotel} />
          <PackageIcon type="transfers" included={includedServices.transfers} />
          <PackageIcon type="consultation" included={includedServices.consultation} />
          <PackageIcon type="cityTour" included={includedServices.cityTour} />
          <PackageIcon type="excursions" included={includedServices.excursions} />
        </div>
        
        {/* Price and call to action */}
        <div className="flex flex-col gap-3">
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <div className="text-sm text-gray-600 mb-1">Complete Package</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-primary">£{pkg.totalPrice}</span>
              <span className="text-sm text-green-600 font-medium">Save £{pkg.savings}</span>
            </div>
            {freeExcursionsCount > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                Includes {freeExcursionsCount} complimentary excursion{freeExcursionsCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <Link href={`/package/${pkg.id}`}>
            <Button className="w-full">View Package Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingPackageCard;