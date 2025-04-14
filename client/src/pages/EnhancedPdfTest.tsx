import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnhancedPdfGenerator from "@/components/EnhancedPdfGenerator";

const EnhancedPdfTest: React.FC = () => {
  // Sample data for the quote
  const sampleData = {
    patientName: "Test Patient",
    patientEmail: "test@example.com",
    patientPhone: "+44 7123 456789",
    referenceNumber: "MDF-20250414-074",
    plannedTravel: "July",
    departureCity: "London",
    treatments: [
      {
        name: "Dental Veneers",
        quantity: 8,
        unitPrice: 250,
        guarantee: "5 Years"
      },
      {
        name: "Teeth Whitening",
        quantity: 1,
        unitPrice: 180,
        guarantee: "1 Year"
      }
    ],
    clinics: [
      {
        name: "DentGroup Istanbul",
        location: "Istanbul",
        price: 2071,
        guarantee: "5 Years",
        rating: 5,
        features: "5-Star Reviews, Premium Service"
      },
      {
        name: "Vera Smile",
        location: "Istanbul",
        price: 2006,
        guarantee: "5 Years",
        rating: 5,
        features: "Central Location, Experienced Surgeons"
      },
      {
        name: "LuxClinic Turkey",
        location: "Istanbul",
        price: 2180,
        guarantee: "5 Years",
        rating: 5,
        features: "Luxury Experience, 10 Year Guarantee"
      }
    ]
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Enhanced PDF Quote Test</h1>
        
        <div className="p-6 bg-white border rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate Enhanced PDF Quote</h2>
          <p className="mb-6">
            This page demonstrates our enhanced PDF quote generator that follows the comprehensive 
            multi-page layout seen in the Istanbul Dental Smile example.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-medium mb-2">Quote Details:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Patient: {sampleData.patientName}</li>
              <li>Reference: {sampleData.referenceNumber}</li>
              <li>Treatments: 
                {sampleData.treatments.map((t, i) => (
                  <span key={i}> {t.quantity}x {t.name}{i < sampleData.treatments.length - 1 ? "," : ""}</span>
                ))}
              </li>
              <li>Travel: {sampleData.plannedTravel} from {sampleData.departureCity}</li>
            </ul>
          </div>
          
          <EnhancedPdfGenerator 
            patientName={sampleData.patientName}
            patientEmail={sampleData.patientEmail}
            patientPhone={sampleData.patientPhone}
            referenceNumber={sampleData.referenceNumber}
            plannedTravel={sampleData.plannedTravel}
            departureCity={sampleData.departureCity}
            treatments={sampleData.treatments}
            clinics={sampleData.clinics}
            buttonText="Generate Enhanced PDF Quote"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EnhancedPdfTest;