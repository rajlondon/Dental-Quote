import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, SearchIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SearchBar: React.FC = () => {
  const [locationValue, setLocationValue] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    if (locationValue) params.append('location', locationValue);
    if (date) params.append('date', format(date, 'yyyy-MM-dd'));
    
    // Navigate to quote flow with parameters
    navigate(`/quote-flow?${params.toString()}`);
  };

  return (
    <div className="bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Treatment city
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  type="text"
                  placeholder="Istanbul"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                When?
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </form>
        </div>
        
        <div className="flex justify-center mt-4 text-white text-sm space-x-6">
          <div className="flex items-center">
            <span>17k quotes generated</span>
          </div>
          <div className="flex items-center">
            <span>•</span>
          </div>
          <div className="flex items-center">
            <span>4.5 average clinic rating</span>
          </div>
          <div className="flex items-center">
            <span>•</span>
          </div>
          <div className="flex items-center">
            <span>Save up to 70%</span>
          </div>
          <div className="flex items-center">
            <span>•</span>
          </div>
          <div className="flex items-center">
            <span>Data fully encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;