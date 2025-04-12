import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Zap, Shield, Sparkles, HeartPulse, Banknote } from "lucide-react";

const GeneralDentistryTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">General Dentistry Treatments</h3>
      <p className="text-gray-700">
        Maintaining good oral health starts with essential general dentistry services. Many patients combine these treatments 
        with more advanced procedures during their dental tourism journey.
      </p>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Including general dentistry treatments in your Turkish dental package often results in significant savings 
          compared to UK prices, even after factoring in travel costs.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <HeartPulse className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">Dental Check-up & Cleaning</h4>
              <p className="text-sm text-gray-600 mb-2">
                Comprehensive examination, professional cleaning, and preventative care advice.
              </p>
              <div className="bg-green-50 px-3 py-1 rounded text-sm inline-flex items-center">
                <Banknote className="h-3 w-3 mr-1 text-green-600" />
                <span className="font-medium text-green-800">Save up to 70% vs UK prices</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                UK avg: £70-120 | Turkey from: £25-40
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">Dental X-rays (Panoramic)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Full-mouth panoramic X-ray for comprehensive diagnosis and treatment planning.
              </p>
              <div className="bg-green-50 px-3 py-1 rounded text-sm inline-flex items-center">
                <Banknote className="h-3 w-3 mr-1 text-green-600" />
                <span className="font-medium text-green-800">Save up to 65% vs UK prices</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                UK avg: £50-90 | Turkey from: £20-35
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">Tooth Fillings</h4>
              <p className="text-sm text-gray-600 mb-2">
                High-quality composite (tooth-colored) fillings to repair cavities and tooth damage.
              </p>
              <div className="bg-green-50 px-3 py-1 rounded text-sm inline-flex items-center">
                <Banknote className="h-3 w-3 mr-1 text-green-600" />
                <span className="font-medium text-green-800">Save up to 75% vs UK prices</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                UK avg: £100-250 | Turkey from: £30-60 per filling
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">Teeth Whitening</h4>
              <p className="text-sm text-gray-600 mb-2">
                Professional in-chair whitening for a brighter, more confident smile.
              </p>
              <div className="bg-green-50 px-3 py-1 rounded text-sm inline-flex items-center">
                <Banknote className="h-3 w-3 mr-1 text-green-600" />
                <span className="font-medium text-green-800">Save up to 70% vs UK prices</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                UK avg: £300-700 | Turkey from: £90-200
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <HeartPulse className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">Root Canal Treatment</h4>
              <p className="text-sm text-gray-600 mb-2">
                Modern, minimally painful root canal therapy to save damaged teeth.
              </p>
              <div className="bg-green-50 px-3 py-1 rounded text-sm inline-flex items-center">
                <Banknote className="h-3 w-3 mr-1 text-green-600" />
                <span className="font-medium text-green-800">Save up to 80% vs UK prices</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                UK avg: £500-1,000 | Turkey from: £100-200 per tooth
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-base mb-1">Tooth Extraction</h4>
              <p className="text-sm text-gray-600 mb-2">
                Quick, painless tooth extraction including wisdom teeth removal.
              </p>
              <div className="bg-green-50 px-3 py-1 rounded text-sm inline-flex items-center">
                <Banknote className="h-3 w-3 mr-1 text-green-600" />
                <span className="font-medium text-green-800">Save up to 75% vs UK prices</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                UK avg: £100-300 (simple), £300-600 (surgical) | Turkey from: £40-150
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-medium text-base mb-2">Why Include General Dentistry in Your Treatment Plan?</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Maximize your investment by addressing all dental needs in one visit</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Ensure your new cosmetic or restorative work has a healthy foundation</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Reduce the need for emergency treatments when you return home</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Take advantage of significant cost savings on procedures you might delay at home</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GeneralDentistryTab;