import React from 'react';
import { Check } from 'lucide-react';

interface SatisfactionCheckProps {
  items: {
    id: string;
    text: string;
    description?: string;
  }[];
}

const SatisfactionChecks: React.FC<SatisfactionCheckProps> = ({ items }) => {
  return (
    <div className="space-y-3 mt-6">
      {items.map(item => (
        <div 
          key={item.id} 
          className="flex items-center space-x-2 group"
          tabIndex={0}
          role="group"
          aria-label={`${item.text} - ${item.description || ''}`}
        >
          <div className="flex-shrink-0 w-5 h-5 bg-green-50 rounded-full flex items-center justify-center border border-green-200 group-hover:bg-green-100 transition-colors">
            <Check className="h-3 w-3 text-green-600" aria-hidden="true" />
          </div>
          <div className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
            {item.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SatisfactionChecks;