import { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  formatPriceInCurrency,
  CurrencyCode
} from '@/utils/format-utils';
import { Loader2, Plus, Check } from 'lucide-react';

interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  clinicId?: string;
  clinicName?: string;
  imageUrl?: string;
}

interface TreatmentListProps {
  treatments: Treatment[];
  onSelectTreatment?: (treatment: Treatment) => void;
  onRemoveTreatment?: (treatmentId: string) => void;
  selectedTreatments?: Treatment[];
  loading?: boolean;
  currency?: CurrencyCode;
  showActions?: boolean;
  showClinic?: boolean;
  showCategory?: boolean;
}

const TreatmentList = ({
  treatments,
  onSelectTreatment,
  onRemoveTreatment,
  selectedTreatments = [],
  loading = false,
  currency = 'USD',
  showActions = true,
  showClinic = false,
  showCategory = true
}: TreatmentListProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Get unique categories for filter dropdown
  const categories = ['all', ...Array.from(new Set(treatments.map(t => t.category)))];
  
  // Filter treatments based on selected category and search query
  const filteredTreatments = treatments.filter(treatment => {
    const matchesCategory = categoryFilter === 'all' || treatment.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Check if a treatment is selected
  const isTreatmentSelected = (treatmentId: string) => {
    return selectedTreatments.some(t => t.id === treatmentId);
  };
  
  // Handle treatment selection
  const handleSelectTreatment = (treatment: Treatment) => {
    if (onSelectTreatment) {
      onSelectTreatment(treatment);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading treatments...</span>
      </div>
    );
  }
  
  if (treatments.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No treatments available.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        {showCategory && (
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Treatments Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              {showCategory && <TableHead>Category</TableHead>}
              {showClinic && <TableHead>Clinic</TableHead>}
              <TableHead className="text-right">Price</TableHead>
              {showActions && <TableHead className="w-[100px]">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTreatments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showCategory ? 4 : 3} className="h-24 text-center">
                  No treatments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTreatments.map(treatment => (
                <TableRow key={treatment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{treatment.name}</p>
                      <p className="text-sm text-muted-foreground">{treatment.description}</p>
                    </div>
                  </TableCell>
                  
                  {showCategory && (
                    <TableCell>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        {treatment.category}
                      </span>
                    </TableCell>
                  )}
                  
                  {showClinic && (
                    <TableCell>
                      {treatment.clinicName || 'N/A'}
                    </TableCell>
                  )}
                  
                  <TableCell className="text-right font-medium">
                    {formatPriceInCurrency(treatment.price, currency)}
                  </TableCell>
                  
                  {showActions && (
                    <TableCell>
                      {isTreatmentSelected(treatment.id) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex items-center justify-center text-success"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Added
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex items-center justify-center"
                          onClick={() => handleSelectTreatment(treatment)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TreatmentList;