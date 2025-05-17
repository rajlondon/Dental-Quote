import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  formatPrice, 
  formatPriceInCurrency,
  CurrencyCode 
} from '@/utils/format-utils';

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
  treatments = [],
  onSelectTreatment,
  onRemoveTreatment,
  selectedTreatments = [],
  loading = false,
  currency = 'USD',
  showActions = true,
  showClinic = false,
  showCategory = true,
}: TreatmentListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter treatments based on search term
  const filteredTreatments = treatments.filter(
    (treatment) => 
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (treatment.category && treatment.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (treatment.clinicName && treatment.clinicName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleSelectTreatment = (treatment: Treatment) => {
    if (onSelectTreatment) {
      onSelectTreatment(treatment);
      
      toast({
        title: 'Treatment Added',
        description: `${treatment.name} has been added to your quote.`,
        variant: 'success',
      });
    }
  };
  
  const handleRemoveTreatment = (treatmentId: string, treatmentName: string) => {
    if (onRemoveTreatment) {
      onRemoveTreatment(treatmentId);
      
      toast({
        title: 'Treatment Removed',
        description: `${treatmentName} has been removed from your quote.`,
      });
    }
  };
  
  const isTreatmentSelected = (treatmentId: string) => {
    return selectedTreatments.some(treatment => treatment.id === treatmentId);
  };
  
  if (loading) {
    return (
      <div className="w-full p-4 text-center">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (treatments.length === 0) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-muted-foreground">No treatments available.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search treatments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border border-input rounded-md bg-background"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
      </div>
      
      {/* Treatments Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              {showCategory && <TableHead>Category</TableHead>}
              {showClinic && <TableHead>Clinic</TableHead>}
              <TableHead className="text-right">Price</TableHead>
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTreatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold">{treatment.name}</p>
                    <p className="text-sm text-muted-foreground">{treatment.description}</p>
                  </div>
                </TableCell>
                {showCategory && (
                  <TableCell>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                      {treatment.category}
                    </span>
                  </TableCell>
                )}
                {showClinic && (
                  <TableCell>
                    {treatment.clinicName || 'No clinic assigned'}
                  </TableCell>
                )}
                <TableCell className="text-right font-medium">
                  {formatPriceInCurrency(treatment.price, currency)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    {isTreatmentSelected(treatment.id) ? (
                      <button
                        onClick={() => handleRemoveTreatment(treatment.id, treatment.name)}
                        className="px-3 py-1 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectTreatment(treatment)}
                        className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Add to Quote
                      </button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TreatmentList;