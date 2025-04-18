import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container } from '../components/ui/container';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClinicTreatmentComparison from '../components/ClinicTreatmentComparison';
import { sampleTreatmentMap, sampleClinics, clinicFeatures } from '../data/sampleTreatmentMap';
import { Clinic } from '../types/treatmentMapper';

const TreatmentComparisonPage: React.FC = () => {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([
    'Dental Implant', 'Zirconia Crown'
  ]);

  const handleSelectTreatment = (treatmentName: string) => {
    setSelectedTreatments(prev => {
      if (prev.includes(treatmentName)) {
        return prev.filter(t => t !== treatmentName);
      } else {
        return [...prev, treatmentName];
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Treatment Comparison | MyDentalFly</title>
        <meta name="description" content="Compare dental treatments across our partner clinics in Istanbul" />
      </Helmet>
      
      <Navbar />
      
      <Container className="py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">Treatment Comparison</h1>
          <p className="text-neutral-600 mb-8">
            Compare dental treatments and prices across our partner clinics in Turkey
          </p>
          
          <ClinicTreatmentComparison
            treatmentMap={sampleTreatmentMap}
            clinics={sampleClinics}
            clinicFeatures={clinicFeatures as any}
            selectedTreatments={selectedTreatments}
            onSelectTreatment={handleSelectTreatment}
          />
        </div>
      </Container>
      
      <Footer />
    </>
  );
};

export default TreatmentComparisonPage;