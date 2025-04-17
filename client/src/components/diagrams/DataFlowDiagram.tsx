import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DataFlowDiagram: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>MyDentalFly Data Flow Architecture</CardTitle>
        <CardDescription>
          Information flow between patient portal and clinic portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <svg 
            width="800" 
            height="600" 
            viewBox="0 0 800 600" 
            className="mx-auto"
          >
            {/* Background */}
            <rect x="0" y="0" width="800" height="600" fill="#f8fafc" rx="4" />
            
            {/* Headers */}
            <rect x="25" y="20" width="350" height="50" fill="#dbeafe" rx="4" />
            <text x="200" y="50" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af">Patient Portal</text>
            
            <rect x="425" y="20" width="350" height="50" fill="#e0f2fe" rx="4" />
            <text x="600" y="50" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#0c4a6e">Clinic Portal</text>
            
            {/* Main sections */}
            <rect x="50" y="100" width="300" height="450" fill="#f1f5f9" rx="4" stroke="#94a3b8" strokeWidth="1" />
            <rect x="450" y="100" width="300" height="450" fill="#f1f5f9" rx="4" stroke="#94a3b8" strokeWidth="1" />
            
            {/* Patient Portal Modules */}
            <rect x="75" y="130" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="200" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Patient Account Data</text>
            <text x="200" y="180" textAnchor="middle" fontSize="12" fill="#64748b">Contact info, preferences, GDPR consent</text>
            
            <rect x="75" y="210" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="200" y="240" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Medical History</text>
            <text x="200" y="260" textAnchor="middle" fontSize="12" fill="#64748b">Patient-provided health information</text>
            
            <rect x="75" y="290" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="200" y="320" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Dental X-rays & Photos</text>
            <text x="200" y="340" textAnchor="middle" fontSize="12" fill="#64748b">Patient-uploaded diagnostic files</text>
            
            <rect x="75" y="370" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="200" y="400" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Travel & Accommodation</text>
            <text x="200" y="420" textAnchor="middle" fontSize="12" fill="#64748b">Flight details, hotel selections</text>
            
            <rect x="75" y="450" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="200" y="480" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Appointments & Schedule</text>
            <text x="200" y="500" textAnchor="middle" fontSize="12" fill="#64748b">Consultation & treatment dates</text>
            
            {/* Clinic Portal Modules */}
            <rect x="475" y="130" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="600" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Clinic Profile Data</text>
            <text x="600" y="180" textAnchor="middle" fontSize="12" fill="#64748b">Dental services, staff, facilities</text>
            
            <rect x="475" y="210" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="600" y="240" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Treatment Plan</text>
            <text x="600" y="260" textAnchor="middle" fontSize="12" fill="#64748b">Diagnosis, procedures, pricing</text>
            
            <rect x="475" y="290" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="600" y="320" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Patient Records Review</text>
            <text x="600" y="340" textAnchor="middle" fontSize="12" fill="#64748b">X-ray assessment, notes, history</text>
            
            <rect x="475" y="370" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="600" y="400" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Accommodation Options</text>
            <text x="600" y="420" textAnchor="middle" fontSize="12" fill="#64748b">Clinic hotel partners, packages</text>
            
            <rect x="475" y="450" width="250" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="1" />
            <text x="600" y="480" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Schedule Management</text>
            <text x="600" y="500" textAnchor="middle" fontSize="12" fill="#64748b">Clinic availability, appointments</text>
            
            {/* Flow arrows - bidirectional */}
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#0ea5e9" />
            </marker>
            
            <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
            </marker>
            
            <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
            </marker>
            
            {/* Account Data - Sync */}
            <line x1="325" y1="160" x2="475" y2="160" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,5" />
            <text x="400" y="150" textAnchor="middle" fontSize="10" fill="#64748b">Limited Read</text>
            
            {/* Medical History - Clinic Receives */}
            <line x1="325" y1="240" x2="475" y2="240" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
            <text x="400" y="230" textAnchor="middle" fontSize="10" fill="#064e3b">Write/Read</text>
            
            {/* X-rays Flow - Clinic Receives */}
            <line x1="325" y1="320" x2="475" y2="320" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
            <text x="400" y="310" textAnchor="middle" fontSize="10" fill="#064e3b">Write/Read</text>
            
            {/* Travel & Accommodation - Patient Sets */}
            <line x1="325" y1="400" x2="475" y2="400" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
            <text x="400" y="390" textAnchor="middle" fontSize="10" fill="#064e3b">Patient Edits</text>
            
            {/* Treatment Plan - Clinic Creates */}
            <line x1="475" y1="240" x2="325" y2="240" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
            <text x="400" y="255" textAnchor="middle" fontSize="10" fill="#7f1d1d">Clinic Creates</text>
            
            {/* Accommodation Options - Clinic Provides */}
            <line x1="475" y1="400" x2="325" y2="400" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
            <text x="400" y="415" textAnchor="middle" fontSize="10" fill="#7f1d1d">Clinic Provides</text>
            
            {/* Appointments - Bidirectional */}
            <line x1="325" y1="480" x2="400" y2="480" stroke="#0ea5e9" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="475" y1="480" x2="400" y2="480" stroke="#0ea5e9" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="400" y="465" textAnchor="middle" fontSize="10" fill="#0369a1">Real-time Sync</text>
            
            {/* Legend */}
            <rect x="25" y="560" width="750" height="30" fill="#f1f5f9" rx="4" />
            
            <circle cx="50" cy="575" r="5" fill="#ef4444" />
            <text x="60" y="578" fontSize="10" fill="#334155" dominantBaseline="middle">Clinic Edits</text>
            
            <circle cx="150" cy="575" r="5" fill="#22c55e" />
            <text x="160" y="578" fontSize="10" fill="#334155" dominantBaseline="middle">Patient Edits</text>
            
            <circle cx="250" cy="575" r="5" fill="#0ea5e9" />
            <text x="260" y="578" fontSize="10" fill="#334155" dominantBaseline="middle">Bidirectional Sync</text>
            
            <circle cx="370" cy="575" r="5" fill="#64748b" />
            <text x="380" y="578" fontSize="10" fill="#334155" dominantBaseline="middle">Limited Read Access</text>
            
            <circle cx="500" cy="575" r="5" fill="#8b5cf6" />
            <text x="510" y="578" fontSize="10" fill="#334155" dominantBaseline="middle">MyDentalFly Platform Management</text>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFlowDiagram;