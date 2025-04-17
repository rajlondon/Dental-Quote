import React, { useState } from 'react';
import { 
  Hotel, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Star, 
  Check, 
  Coffee, 
  Car, 
  Info,
  ArrowRight,
  Palmtree,
  DollarSign,
  Clock,
  Users,
  BadgeCheck
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HotelOption,
  EXAMPLE_CLINIC_HOTEL_OPTIONS,
  EXAMPLE_SELF_ARRANGED_STATUS
} from './exampleHotelData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';

interface HotelSelectionSectionProps {
  hotelOptions?: HotelOption[];
  isLoading?: boolean;
  defaultOption?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  showSelfArrangedOption?: boolean;
  selfArrangedStatus?: typeof EXAMPLE_SELF_ARRANGED_STATUS;
  numberOfGuests?: number;
  clinicName?: string;
  onSelectHotel?: (hotelId: number) => void;
  onAddSelfArranged?: (data: any) => void;
}

const HotelSelectionSection: React.FC<HotelSelectionSectionProps> = ({
  hotelOptions = EXAMPLE_CLINIC_HOTEL_OPTIONS,
  isLoading = false,
  defaultOption = 'standard',
  checkInDate = new Date('2025-06-10'),
  checkOutDate = new Date('2025-06-17'),
  showSelfArrangedOption = true,
  selfArrangedStatus,
  numberOfGuests = 2,
  clinicName = 'DentGroup Istanbul',
  onSelectHotel,
  onAddSelfArranged
}) => {
  const [selectedHotelOption, setSelectedHotelOption] = useState<HotelOption | null>(
    hotelOptions.find(option => option.tier === defaultOption) || null
  );
  const [accommodationType, setAccommodationType] = useState<'clinic' | 'self' | null>(
    selfArrangedStatus ? 'self' : 'clinic'
  );
  const [showDialog, setShowDialog] = useState(false);
  const [selfArrangedForm, setSelfArrangedForm] = useState({
    hotelName: selfArrangedStatus?.patientHotelName || '',
    hotelAddress: selfArrangedStatus?.patientHotelAddress || '',
    hotelPhone: selfArrangedStatus?.patientHotelPhone || '',
    specialRequests: selfArrangedStatus?.specialRequests || '',
  });

  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleSelectHotel = (option: HotelOption) => {
    setSelectedHotelOption(option);
    if (onSelectHotel) {
      onSelectHotel(option.hotel.id);
    }
  };

  const handleAccommodationTypeChange = (type: 'clinic' | 'self') => {
    setAccommodationType(type);
    if (type === 'clinic' && hotelOptions.length > 0 && !selectedHotelOption) {
      setSelectedHotelOption(hotelOptions[0]);
    }
  };

  const handleSelfArrangedSubmit = () => {
    if (onAddSelfArranged) {
      onAddSelfArranged({
        ...selfArrangedForm,
        checkInDate,
        checkOutDate
      });
    }
    setShowDialog(false);
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEE, dd MMM yyyy');
  };

  if (isLoading) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Hotel className="mr-2 h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full max-w-[250px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selfArrangedStatus && accommodationType === 'self') {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-xl">
              <Hotel className="mr-2 h-5 w-5" />
              Self-Arranged Accommodation
            </CardTitle>
            <Badge className="bg-blue-500">Self-Arranged</Badge>
          </div>
          <CardDescription>
            You've chosen to arrange your own accommodation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-700">
                Your accommodation details have been saved and shared with the clinic
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Hotel className="h-4 w-4 mr-2" />
                Your Hotel Details
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Hotel Name:</span>
                  <span className="font-medium">{selfArrangedStatus.patientHotelName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{selfArrangedStatus.patientHotelAddress}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selfArrangedStatus.patientHotelPhone}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Stay Details
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formatDate(selfArrangedStatus.checkInDate)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formatDate(selfArrangedStatus.checkOutDate)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{nights} nights</span>
                </li>
              </ul>
            </div>
          </div>

          {selfArrangedStatus.specialRequests && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Info className="h-4 w-4 mr-2" />
                Special Requests
              </h4>
              <p className="text-sm text-gray-700">{selfArrangedStatus.specialRequests}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full flex flex-col md:flex-row gap-2 justify-between">
            <Button variant="outline" onClick={() => handleAccommodationTypeChange('clinic')}>
              View Clinic Hotel Options
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              Edit My Hotel Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <Hotel className="mr-2 h-5 w-5" />
            Accommodation Options
          </CardTitle>
        </div>
        <CardDescription>
          Select your preferred accommodation during your stay in Istanbul
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Accommodation Type Selector */}
        <div className="mb-6">
          <RadioGroup 
            className="flex flex-col md:flex-row gap-4"
            defaultValue={accommodationType || 'clinic'}
            onValueChange={(value) => handleAccommodationTypeChange(value as 'clinic' | 'self')}
          >
            <div className={`border rounded-md p-4 flex-1 ${accommodationType === 'clinic' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <RadioGroupItem value="clinic" id="clinic" className="sr-only" />
              <Label htmlFor="clinic" className="flex items-start cursor-pointer">
                <div className="h-5 w-5 mr-2 mt-0.5 rounded-full border flex items-center justify-center">
                  {accommodationType === 'clinic' && <Check className="h-3 w-3 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{clinicName} Accommodation Packages</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose from hotel options selected by your clinic with special rates and dental patient amenities
                  </p>
                </div>
              </Label>
            </div>
            
            {showSelfArrangedOption && (
              <div className={`border rounded-md p-4 flex-1 ${accommodationType === 'self' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <RadioGroupItem value="self" id="self" className="sr-only" />
                <Label htmlFor="self" className="flex items-start cursor-pointer">
                  <div className="h-5 w-5 mr-2 mt-0.5 rounded-full border flex items-center justify-center">
                    {accommodationType === 'self' && <Check className="h-3 w-3 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">I'll Arrange My Own Accommodation</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Book your own hotel and provide the details to the clinic for treatment scheduling
                    </p>
                  </div>
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>

        {accommodationType === 'self' && (
          <div className="border rounded-lg p-6 text-center">
            <Hotel className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Enter Your Hotel Details</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide details about where you'll be staying so we can coordinate your treatment schedule
            </p>
            <Button onClick={() => setShowDialog(true)}>
              Add My Hotel Information
            </Button>
          </div>
        )}

        {/* Hotel Options */}
        {accommodationType === 'clinic' && (
          <>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {formatDate(checkInDate)} - {formatDate(checkOutDate)} ({nights} nights, {numberOfGuests} {numberOfGuests === 1 ? 'guest' : 'guests'})
              </span>
            </div>

            <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 mb-6">
              {hotelOptions.map((option, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex-shrink-0 w-[300px] ${selectedHotelOption?.hotel.id === option.hotel.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                >
                  <div className="relative h-40">
                    <img 
                      src={option.hotel.mainImageUrl} 
                      alt={option.hotel.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`
                        ${option.tier === 'premium' ? 'bg-purple-600' : 
                          option.tier === 'standard' ? 'bg-blue-600' : 
                          'bg-green-600'}
                      `}>
                        {option.tier === 'premium' ? 'Premium' : 
                          option.tier === 'standard' ? 'Standard' : 
                          'Economy'}
                      </Badge>
                    </div>
                    {option.includedInPrice && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600">
                          Included
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{option.hotel.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm ml-1">{option.hotel.starRating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 flex items-start">
                      <MapPin className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{option.hotel.address}</span>
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      {typeof option.hotel.distanceToClinic === 'object' 
                        ? `${Object.values(option.hotel.distanceToClinic)[0]} km from clinic` 
                        : `${option.hotel.distanceToClinic} km from clinic`}
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      {/* Key features */}
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {option.breakfastIncluded && (
                          <div className="flex items-center">
                            <Coffee className="h-3 w-3 mr-1 text-green-600" />
                            <span>Breakfast</span>
                          </div>
                        )}
                        {option.transferIncluded && (
                          <div className="flex items-center">
                            <Car className="h-3 w-3 mr-1 text-green-600" />
                            <span>Transfer</span>
                          </div>
                        )}
                        {option.availableRooms && option.availableRooms.length > 0 && (
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1 text-gray-600" />
                            <span>{option.availableRooms.length} room types</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                          <span>{option.hotel.amenities.length} amenities</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        {!option.includedInPrice && option.additionalCost && (
                          <div className="font-medium">
                            +{option.additionalCost} {option.currency}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant={selectedHotelOption?.hotel.id === option.hotel.id ? "default" : "outline"}
                        onClick={() => handleSelectHotel(option)}
                      >
                        {selectedHotelOption?.hotel.id === option.hotel.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedHotelOption && (
              <div className="border rounded-lg p-5 bg-gray-50">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="lg:w-2/3 space-y-4">
                    <div className="flex items-center">
                      <BadgeCheck className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium">Selected Hotel: {selectedHotelOption.hotel.name}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-700">
                      {selectedHotelOption.hotel.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Room options</span>
                        <span className="text-sm">
                          {selectedHotelOption.availableRooms?.join(', ') || 'Standard Room'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Stay duration</span>
                        <span className="text-sm">{nights} nights, {numberOfGuests} guests</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Price</span>
                        <span className="text-sm">
                          {selectedHotelOption.includedInPrice 
                            ? 'Included in treatment price' 
                            : `+${selectedHotelOption.additionalCost} ${selectedHotelOption.currency} (additional)`}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-sm mt-2">Package includes:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4">
                      {selectedHotelOption.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:w-1/3 flex flex-col justify-end">
                    <Button className="mb-2 w-full">
                      Confirm Selection
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Hotel Details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Your Hotel Information</DialogTitle>
            <DialogDescription>
              Please enter details about where you'll be staying in Istanbul.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hotel-name" className="text-right">
                Hotel name
              </Label>
              <Input
                id="hotel-name"
                value={selfArrangedForm.hotelName}
                className="col-span-3"
                onChange={(e) => setSelfArrangedForm({...selfArrangedForm, hotelName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hotel-address" className="text-right">
                Address
              </Label>
              <Input 
                id="hotel-address" 
                value={selfArrangedForm.hotelAddress} 
                className="col-span-3"
                onChange={(e) => setSelfArrangedForm({...selfArrangedForm, hotelAddress: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hotel-phone" className="text-right">
                Phone
              </Label>
              <Input 
                id="hotel-phone" 
                value={selfArrangedForm.hotelPhone} 
                className="col-span-3"
                onChange={(e) => setSelfArrangedForm({...selfArrangedForm, hotelPhone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="special-requests" className="text-right pt-2">
                Requests
              </Label>
              <textarea 
                id="special-requests" 
                value={selfArrangedForm.specialRequests} 
                className="col-span-3 min-h-[100px] border rounded-md p-2"
                placeholder="Any special requests or notes for the clinic"
                onChange={(e) => setSelfArrangedForm({...selfArrangedForm, specialRequests: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSelfArrangedSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HotelSelectionSection;