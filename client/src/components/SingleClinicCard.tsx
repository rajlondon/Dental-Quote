import React from 'react';
import ClinicCard from './ClinicCard';

interface SingleClinicCardProps {
  clinic: any;
  badge: string;
}

/**
 * A component that displays a single clinic card with a promotional badge
 * Used specifically for promotional flows where only one clinic should be shown
 */
export default function SingleClinicCard({ clinic, badge }: SingleClinicCardProps) {
  return (
    <div className="mb-8">
      <ClinicCard clinic={clinic} />
      <span className="inline-block mt-2 rounded bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-700">
        {badge}
      </span>
    </div>
  );
}