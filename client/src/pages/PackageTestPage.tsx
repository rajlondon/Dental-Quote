import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle } from 'lucide-react';

export default function PackageTestPage() {
  const { toast } = useToast();
  const [selectedTreatments, setSelectedTreatments] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('packages');

  // Define packages
  const packages = [
    {
      id: 'pkg-001',
      title: 'Premium Implant Package',
      description: 'Get premium dental implants with 30% discount on crown work',
      price: 1200,
      promoCode: 'IMPLANTCROWN30',
      treatments: [
        { id: 'treatment-1', name: 'Dental Implant', price: 800 },
        { id: 'treatment-2', name: 'Implant Crown', price: 700 },
        { id: 'treatment-3', name: 'Panoramic X-Ray', price: 50 }
      ]
    },
    {
      id: 'pkg-002',
      title: 'Luxury Smile Makeover',
      description: '20% off on full smile makeover treatments plus luxury hotel accommodation',
      price: 2500,
      promoCode: 'LUXHOTEL20',
      treatments: [
        { id: 'treatment-4', name: 'Dental Veneers (6 Units)', price: 2400 },
        { id: 'treatment-5', name: 'Teeth Whitening', price: 350 },
        { id: 'treatment-6', name: 'Cosmetic Consultation', price: 100 }
      ]
    },
    {
      id: 'pkg-003',
      title: 'Travel & Treatment Bundle',
      description: 'Comprehensive dental treatment with complimentary airport transfers',
      price: 1800,
      promoCode: 'LUXTRAVEL',
      treatments: [
        { id: 'treatment-7', name: 'Full Mouth Restoration', price: 3500 },
        { id: 'treatment-8', name: 'Hotel Accommodation (5 Nights)', price: 750 },
        { id: 'treatment-9', name: 'Airport Transfer', price: 100 }
      ]
    }
  ];

  // Define individual treatments
  const allTreatments = [
    { id: 'treatment-1', name: 'Dental Implant', price: 800 },
    { id: 'treatment-2', name: 'Implant Crown', price: 700 },
    { id: 'treatment-3', name: 'Panoramic X-Ray', price: 50 },
    { id: 'treatment-4', name: 'Dental Veneers (Per Unit)', price: 400 },
    { id: 'treatment-5', name: 'Teeth Whitening', price: 350 },
    { id: 'treatment-6', name: 'Cosmetic Consultation', price: 100 },
    { id: 'treatment-7', name: 'Full Mouth Restoration', price: 3500 },
    { id: 'treatment-8', name: 'Hotel Accommodation (Per Night)', price: 150 },
    { id: 'treatment-9', name: 'Airport Transfer', price: 100 },
    { id: 'treatment-10', name: 'Root Canal Treatment', price: 500 },
    { id: 'treatment-11', name: 'Dental Filling', price: 150 },
    { id: 'treatment-12', name: 'Dental Crown', price: 600 }
  ];

  const applyPackage = (pkg: any) => {
    setSelectedTreatments(pkg.treatments);
    setSelectedPackage(pkg.id);
    setActiveTab('treatments');
    
    toast({
      title: "Package Applied",
      description: `${pkg.title} has been applied with ${pkg.treatments.length} treatments`
    });
  };

  const toggleTreatment = (treatment: any) => {
    // If treatment is already selected, remove it
    if (selectedTreatments.some(t => t.id === treatment.id)) {
      setSelectedTreatments(selectedTreatments.filter(t => t.id !== treatment.id));
    } else {
      // Otherwise add it
      setSelectedTreatments([...selectedTreatments, treatment]);
    }
  };

  const resetSelection = () => {
    setSelectedTreatments([]);
    setSelectedPackage(null);
    toast({
      title: "Selection Reset",
      description: "All treatments have been cleared"
    });
  };

  const totalPrice = selectedTreatments.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Dental Treatment Packages</h1>
      <p className="text-center text-gray-500 mb-8">
        Select a package or individual treatments to build your custom quote
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="packages">Treatment Packages</TabsTrigger>
          <TabsTrigger value="treatments">Selected Treatments</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`overflow-hidden transition-all duration-200 ${selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                  <CardTitle>{pkg.title}</CardTitle>
                  <CardDescription className="text-white/90">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <p className="text-2xl font-bold">${pkg.price}</p>
                    <p className="text-xs text-gray-500">Starting price</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-medium mb-2">Includes:</p>
                    {pkg.treatments.map((treatment) => (
                      <div key={treatment.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{treatment.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      onClick={() => applyPackage(pkg)}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Apply Package
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Selected Treatments</span>
                {selectedPackage && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Package Applied
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {selectedTreatments.length === 0 
                  ? "No treatments selected yet. Choose a package or add individual treatments."
                  : `You have selected ${selectedTreatments.length} treatments`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPackage && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium text-blue-700">
                      {packages.find(p => p.id === selectedPackage)?.title}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Package includes {selectedTreatments.length} treatments
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {allTreatments.map((treatment) => {
                    const isSelected = selectedTreatments.some(t => t.id === treatment.id);
                    return (
                      <Button
                        key={treatment.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`justify-between h-auto py-3 px-4 ${isSelected ? 'bg-blue-600' : ''}`}
                        onClick={() => toggleTreatment(treatment)}
                      >
                        <span>{treatment.name}</span>
                        <span>${treatment.price}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between font-medium mb-2">
                    <span>Selected Treatments</span>
                    <span>{selectedTreatments.length}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Price</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button 
                    className="flex-1" 
                    variant="default" 
                    disabled={selectedTreatments.length === 0}
                    onClick={() => {
                      toast({
                        title: "Quote Generated",
                        description: `Quote with ${selectedTreatments.length} treatments totaling $${totalPrice}`
                      });
                    }}
                  >
                    Generate Quote
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline" 
                    onClick={resetSelection}
                  >
                    Reset Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}