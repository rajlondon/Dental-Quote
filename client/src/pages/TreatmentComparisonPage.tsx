import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClinicTreatmentComparison } from '@/components/ClinicTreatmentComparison';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';

/**
 * Page showing a comparison of different clinics' treatments
 * This is a sample page to demonstrate the ClinicTreatmentComparison component
 */
const TreatmentComparisonPage: React.FC = () => {
  // Sample selected treatments
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentItem[]>([
    { id: 'dental_implant_standard', name: 'Dental Implant (Standard)', quantity: 2 },
    { id: 'porcelain_crown', name: 'Porcelain Crown', quantity: 3 },
    { id: 'zoom_whitening', name: 'Zoom Whitening (In-office)', quantity: 1 },
  ]);

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compare Clinic Offers</h1>
        <p className="text-muted-foreground mt-2">
          See how each clinic offers your selected treatments
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Selected Treatments</CardTitle>
          <CardDescription>
            The treatments you've selected for your dental journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {selectedTreatments.map((treatment) => (
              <li key={treatment.id} className="flex justify-between items-center">
                <span>{treatment.name}</span>
                <span className="text-muted-foreground">Quantity: {treatment.quantity}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Separator />
      
      <ClinicTreatmentComparison treatments={selectedTreatments} />
      
      <div className="flex justify-center">
        <Button variant="outline" className="mr-2">Download Full Comparison</Button>
        <Button>Contact a Treatment Coordinator</Button>
      </div>
    </div>
  );
};

export default TreatmentComparisonPage;