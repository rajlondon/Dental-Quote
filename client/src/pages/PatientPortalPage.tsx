import React, { useState } from 'react';
import { Layout } from '../components/layouts/Layout';

const QuotesSection = () => (
  <div className="quotes-section">
    <h2 className="text-2xl font-bold mb-4">Your Treatment Quotes</h2>
    <p className="mb-4">You can view your saved quotes here once you create them.</p>
    <a href="/quote" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Create a New Quote
    </a>
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