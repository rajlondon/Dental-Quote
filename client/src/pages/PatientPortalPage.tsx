import React, { useState } from 'react';
import Layout from '../components/layouts/Layout';

const QuotesSection = () => (
  <div className="quotes-section">
    <h2 className="text-2xl font-bold mb-4">Your Treatment Quotes</h2>
    <p className="mb-4">You can view your saved quotes here once you create them.</p>
    <div className="flex flex-col space-y-4 mb-6">
      <a href="/enhanced-quote" className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
        Create a New Quote
      </a>
      <a href="/enhanced-quote?specialOffer=true" className="inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded hover:from-green-700 hover:to-green-800 transition-all shadow-md">
        View Special Offers
      </a>
    </div>
    
    <div className="mt-8 bg-gray-50 p-5 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-3">Recent Quotes</h3>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <span className="font-medium">Dental Implant Package</span>
            <span className="text-blue-600">€2,450</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">Created on May 15, 2025</div>
          <div className="mt-3">
            <a href="/enhanced-quote?id=q12345" className="text-blue-600 text-sm hover:underline">View Quote</a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function PatientPortalPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'quotes':
        return <QuotesSection />;
      case 'profile':
        return <div><h2 className="text-2xl font-bold mb-4">Profile Information</h2><p>Profile content here</p></div>;
      case 'appointments':
        return <div><h2 className="text-2xl font-bold mb-4">Your Appointments</h2><p>Appointments content here</p></div>;
      default:
        return <div><h2 className="text-2xl font-bold mb-4">Profile Information</h2><p>Profile content here</p></div>;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Patient Portal</h1>
        
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'appointments' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'quotes' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            Quotes
          </button>
        </div>
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
}