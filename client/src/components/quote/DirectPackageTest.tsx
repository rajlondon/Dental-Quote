import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * A simple test component to verify if package selection is working properly
 */
export default function DirectPackageTest() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  // Define test packages
  const packages = {
    'pkg-001': {
      title: 'Premium Implant Package',
      treatments: [
        { id: 'treatment-1', name: 'Dental Implant', price: 800 },
        { id: 'treatment-2', name: 'Implant Crown', price: 700 },
        { id: 'treatment-3', name: 'Panoramic X-Ray', price: 50 }
      ]
    },
    'pkg-002': {
      title: 'Luxury Smile Makeover',
      treatments: [
        { id: 'treatment-4', name: 'Dental Veneers (6 Units)', price: 2400 },
        { id: 'treatment-5', name: 'Teeth Whitening', price: 350 },
        { id: 'treatment-6', name: 'Cosmetic Consultation', price: 100 }
      ]
    },
    'pkg-003': {
      title: 'Travel & Treatment Bundle',
      treatments: [
        { id: 'treatment-7', name: 'Full Mouth Restoration', price: 3500 },
        { id: 'treatment-8', name: 'Hotel Accommodation (5 Nights)', price: 750 },
        { id: 'treatment-9', name: 'Airport Transfer', price: 100 }
      ]
    }
  };

  const applyPackage = (packageId: string) => {
    const pkg = packages[packageId as keyof typeof packages];
    if (pkg) {
      setTreatments(pkg.treatments);
      setSelectedPackage(packageId);
      console.log(`Selected package ${pkg.title} with ${pkg.treatments.length} treatments`);
    }
  };

  const totalPrice = treatments.reduce((sum, item) => sum + item.price, 0);

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <CardHeader>
        <CardTitle>Direct Package Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Button onClick={() => applyPackage('pkg-001')} className="bg-blue-600 hover:bg-blue-700">
            Premium Implant Package
          </Button>
          <Button onClick={() => applyPackage('pkg-002')} className="bg-purple-600 hover:bg-purple-700">
            Luxury Smile Makeover
          </Button>
          <Button onClick={() => applyPackage('pkg-003')} className="bg-green-600 hover:bg-green-700">
            Travel &amp; Treatment Bundle
          </Button>
        </div>

        {selectedPackage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900">
              {packages[selectedPackage as keyof typeof packages].title}
            </h3>
            <p className="text-blue-700">
              Package applied with {treatments.length} treatments
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Selected Treatments</h3>
          {treatments.length === 0 ? (
            <p className="text-gray-500">No treatments selected. Please select a package above.</p>
          ) : (
            <div className="space-y-2">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="flex justify-between items-center p-3 bg-white border rounded-md">
                  <div>
                    <span className="font-medium">{treatment.name}</span>
                    {selectedPackage && (
                      <Badge variant="outline" className="ml-2 bg-blue-50">
                        Package Item
                      </Badge>
                    )}
                  </div>
                  <span className="font-semibold">€{treatment.price}</span>
                </div>
              ))}
              
              <div className="flex justify-between items-center p-3 bg-gray-50 border-t-2 border-gray-300 font-bold">
                <span>Total</span>
                <span>€{totalPrice}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}