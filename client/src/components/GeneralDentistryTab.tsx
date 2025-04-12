import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const GeneralDentistryTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">General Dentistry</h3>
      <p className="text-gray-700">
        General dentistry encompasses the essential treatments for maintaining good oral health and treating common dental issues. These procedures form the foundation of comprehensive dental care.
      </p>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Even if you're primarily seeking cosmetic or restorative treatments, adding general dentistry procedures to your treatment plan can ensure your overall oral health is addressed during your visit.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Dental Examination & Cleaning</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Comprehensive dental check-up with professional cleaning to remove plaque and tartar buildup. Includes detailed assessment of your oral health status.</p>
            <p className="mt-2 font-medium text-blue-600">Average savings: 70-80% compared to UK prices</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Dental Fillings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Treatment for tooth decay using composite (tooth-colored) or amalgam (silver) materials to restore the affected tooth. Modern options include metal-free restorations.</p>
            <p className="mt-2 font-medium text-blue-600">Average savings: 65-75% compared to UK prices</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Root Canal Treatment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Procedure to save an infected tooth by removing the infected pulp, cleaning the canals, and sealing them. Usually followed by a crown for protection.</p>
            <p className="mt-2 font-medium text-blue-600">Average savings: 60-70% compared to UK prices</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Tooth Extraction</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Removal of damaged, decayed, or problematic teeth including wisdom teeth extraction. Both simple and surgical extractions available.</p>
            <p className="mt-2 font-medium text-blue-600">Average savings: 70-80% compared to UK prices</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Dental X-Rays</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Diagnostic imaging to detect hidden dental issues including panoramic X-rays, bitewing X-rays, and 3D cone beam CT scans for comprehensive assessment.</p>
            <p className="mt-2 font-medium text-blue-600">Average savings: 65-75% compared to UK prices</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Periodontal Treatment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Treatment for gum disease including deep cleaning (scaling and root planing), antibiotic therapy, and advanced procedures for severe cases.</p>
            <p className="mt-2 font-medium text-blue-600">Average savings: 60-70% compared to UK prices</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium mb-2">Why Include General Dentistry in Your Treatment Plan?</h4>
        <ul className="space-y-2">
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Address underlying issues that could affect the success of cosmetic or restorative treatments</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Take advantage of significant cost savings compared to UK prices for routine procedures</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Complete multiple procedures in a single visit, maximizing the value of your dental tourism trip</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Access high-quality diagnostic tools like 3D CT scans that may be costly add-ons in the UK</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GeneralDentistryTab;