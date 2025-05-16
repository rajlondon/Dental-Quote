import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Quote {
  id: string;
  createdAt: string;
  treatments: any[];
  total: number;
}

interface QuotesListProps {
  patientId?: string;
  clinicId?: string;
}

export function QuotesList({ patientId, clinicId }: QuotesListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchQuotes() {
      try {
        setLoading(true);
        
        // Different endpoints based on whether it's patient or clinic
        const endpoint = patientId 
          ? `/api/quotes/patient/${patientId}`
          : `/api/quotes/clinic/${clinicId}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        
        const data = await response.json();
        setQuotes(data.quotes || []);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError('Unable to load your quotes. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (patientId || clinicId) {
      fetchQuotes();
    } else {
      // If neither patientId nor clinicId is provided, show empty state
      setLoading(false);
    }
  }, [patientId, clinicId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading your quotes...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }
  
  if (quotes.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-lg">
        <p className="text-gray-500 mb-4">You don't have any quotes yet.</p>
        <Button as={Link} href="/quote">Create Your First Quote</Button>
      </div>
    );
  }
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="quotes-list grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quotes.map(quote => (
        <div key={quote.id} className="quote-card bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="quote-header border-b border-gray-100 p-4">
            <h3 className="font-semibold text-primary">Quote #{quote.id.substring(0, 8)}</h3>
            <span className="text-sm text-gray-500">{formatDate(new Date(quote.createdAt))}</span>
          </div>
          
          <div className="quote-summary p-4">
            <p className="text-sm text-gray-600">{quote.treatments.length} treatment{quote.treatments.length !== 1 ? 's' : ''}</p>
            <p className="text-lg font-bold text-gray-800 mt-2">{formatCurrency(quote.total)}</p>
          </div>
          
          <div className="quote-actions p-4 pt-0 flex justify-between">
            <Button as={Link} href={`/quotes/${quote.id}`} variant="outline" size="sm">
              View Details
            </Button>
            <Button as={Link} href={`/quotes/${quote.id}/print`} variant="ghost" size="sm">
              Print
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}