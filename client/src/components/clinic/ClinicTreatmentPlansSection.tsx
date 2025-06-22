import React from 'react';
import { TreatmentPlansSection } from './TreatmentPlansSection';

const ClinicTreatmentPlansSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Treatment Plans</h2>
          <p className="text-muted-foreground">
            Create and manage treatment plans for your patients
          </p>
        </div>
      </div>
      
      <TreatmentPlansSection />
    </div>
  );
};

export default ClinicTreatmentPlansSection;