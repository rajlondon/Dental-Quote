import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Matcher } from 'react-day-picker';
import { 
  Plane, 
  Hotel, 
  Calendar,
  MapPin,
  Clock,
  Phone,
  CreditCard,
  ExternalLink,
  Info,
  Check,
  SearchIcon,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface FlightBooking {
  id: string;
  bookingReference: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureDate: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalDate: string;
  arrivalTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  passengerName: string;
  bookingAgency?: string;
  returnFlightNumber?: string;
  returnDepartureDate?: string;
  returnDepartureTime?: string;
  returnArrivalDate?: string;
  returnArrivalTime?: string;
  price?: number;
  currency?: string;
  isPaid: boolean;
  isRoundTrip: boolean;
  hasSelfArranged: boolean;
}

interface HotelBooking {
  id: string;
  bookingReference: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  numberOfGuests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationNumber?: string;
  bookingAgency?: string;
  price?: number;
  currency?: string;
  providedBy: 'clinic' | 'platform' | 'self';
  isPaid: boolean;
  includedInPackage: boolean;
  packageName?: string;
  hasSelfArranged: boolean;
}

const TravelSection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State variables for travel data
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flights');
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  
  // Flight search state
  const [showFlightSearch, setShowFlightSearch] = useState(false);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [departureCity, setDepartureCity] = useState('');
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [tripType, setTripType] = useState('roundTrip');
  const [adults, setAdults] = useState(1);
  const [flightClass, setFlightClass] = useState('economy');
  
  // Hotel search state
  const [showHotelSearch, setShowHotelSearch] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [destination, setDestination] = useState('Istanbul');
  const [guests, setGuests] = useState(1);
  const [isSearchingHotels, setIsSearchingHotels] = useState(false);
  
  // Add/manage self-arranged travel
  const [showSelfArrangedFlight, setShowSelfArrangedFlight] = useState(false);
  const [showSelfArrangedHotel, setShowSelfArrangedHotel] = useState(false);
  
  // View details dialogs
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [showHotelDetails, setShowHotelDetails] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightBooking | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelBooking | null>(null);
  
  // Self-arranged travel form data
  const [selfFlightData, setSelfFlightData] = useState({
    airline: '',
    flightNumber: '',
    departureDate: '',
    departureTime: '',
    departureAirport: '',
    arrivalDate: '',
    arrivalTime: '',
    bookingReference: '',
    isRoundTrip: false,
    returnFlightNumber: '',
    returnDepartureDate: '',
    returnDepartureTime: '',
    returnArrivalDate: '',
    returnArrivalTime: '',
  });
  
  const [selfHotelData, setSelfHotelData] = useState({
    hotelName: '',
    hotelAddress: '',
    hotelPhone: '',
    checkInDate: '',
    checkOutDate: '',
    roomType: 'Standard Room',
    numberOfGuests: 1,
    bookingReference: '',
  });
  
  // Fetch travel data
  useEffect(() => {
    const fetchTravelData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // In a real application, these would be API calls to fetch the data
        // For now, using sample data
        
        // Sample flight data
        const sampleFlights: FlightBooking[] = [
          {
            id: '1',
            bookingReference: 'FLYTK123456',
            airline: 'Turkish Airlines',
            flightNumber: 'TK1984',
            departureAirport: 'LHR',
            departureDate: '2025-06-15',
            departureTime: '10:45',
            arrivalAirport: 'IST',
            arrivalDate: '2025-06-15',
            arrivalTime: '16:35',
            status: 'confirmed',
            passengerName: user.email || 'Patient',
            bookingAgency: 'MyDentalFly',
            returnFlightNumber: 'TK1985',
            returnDepartureDate: '2025-06-22',
            returnDepartureTime: '18:20',
            returnArrivalDate: '2025-06-22',
            returnArrivalTime: '20:10',
            price: 420,
            currency: 'GBP',
            isPaid: true,
            isRoundTrip: true,
            hasSelfArranged: false
          }
        ];
        
        // Sample hotel data
        const sampleHotels: HotelBooking[] = [
          {
            id: '1',
            bookingReference: 'HTL789012',
            hotelName: 'Istanbul Grand Hotel',
            hotelAddress: 'Şişli, Istanbul 34367, Turkey',
            hotelPhone: '+90 212 555 1234',
            checkInDate: '2025-06-15',
            checkOutDate: '2025-06-22',
            roomType: 'Deluxe Double Room',
            numberOfGuests: 2,
            status: 'confirmed',
            confirmationNumber: 'IGH4567890',
            bookingAgency: 'MyDentalFly',
            price: 560,
            currency: 'GBP',
            providedBy: 'platform',
            isPaid: true,
            includedInPackage: false,
            hasSelfArranged: false
          },
          {
            id: '2',
            bookingReference: 'CLN123456',
            hotelName: 'Dental Comfort Suites',
            hotelAddress: 'Kadıköy, Istanbul 34720, Turkey',
            hotelPhone: '+90 216 555 6789',
            checkInDate: '2025-06-15',
            checkOutDate: '2025-06-20',
            roomType: 'Suite with View',
            numberOfGuests: 1,
            status: 'confirmed',
            providedBy: 'clinic',
            isPaid: true,
            includedInPackage: true,
            packageName: 'Premium Dental Implant Package',
            hasSelfArranged: false
          }
        ];
        
        setFlightBookings(sampleFlights);
        setHotelBookings(sampleHotels);
      } catch (error) {
        console.error('Error fetching travel data:', error);
        toast({
          title: t('common.error', 'Error'),
          description: t('patient.travel.fetch_error', 'Failed to load travel information'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTravelData();
  }, [user?.id, t, toast]);
  
  // Handle flight search submission
  const handleFlightSearch = () => {
    if (!departureDate || !departureCity) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields for flight search.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSearchingFlights(true);
    
    // Simulate flight search API call
    setTimeout(() => {
      toast({
        title: 'Flight Options Available',
        description: 'Your travel specialist will contact you shortly with flight options.',
      });
      setIsSearchingFlights(false);
      setShowFlightSearch(false);
      
      // Reset form
      setDepartureDate(undefined);
      setReturnDate(undefined);
      setDepartureCity('');
    }, 2000);
  };
  
  // Handle hotel search submission
  const handleHotelSearch = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields for hotel search.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSearchingHotels(true);
    
    // Simulate hotel search API call
    setTimeout(() => {
      toast({
        title: 'Hotel Options Available',
        description: 'Your travel specialist will contact you shortly with hotel options.',
      });
      setIsSearchingHotels(false);
      setShowHotelSearch(false);
      
      // Reset form
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
    }, 2000);
  };
  
  // Submit self-arranged flight
  const handleSubmitSelfFlight = async () => {
    // Validate form
    if (!selfFlightData.airline || !selfFlightData.flightNumber || !selfFlightData.departureDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields about your flight.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // In a real app, this would send the data to the server
      console.log('Submitting self-arranged flight data:', selfFlightData);
      
      // Create a new flight booking object
      const newFlight: FlightBooking = {
        id: `self-${Date.now()}`,
        bookingReference: selfFlightData.bookingReference || 'Self-arranged',
        airline: selfFlightData.airline,
        flightNumber: selfFlightData.flightNumber,
        departureAirport: selfFlightData.departureAirport,
        departureDate: selfFlightData.departureDate,
        departureTime: selfFlightData.departureTime,
        arrivalAirport: 'IST', // Assuming Istanbul
        arrivalDate: selfFlightData.arrivalDate || selfFlightData.departureDate,
        arrivalTime: selfFlightData.arrivalTime || '00:00',
        status: 'confirmed',
        passengerName: user?.email || 'Patient',
        returnFlightNumber: selfFlightData.isRoundTrip ? selfFlightData.returnFlightNumber : undefined,
        returnDepartureDate: selfFlightData.isRoundTrip ? selfFlightData.returnDepartureDate : undefined,
        returnDepartureTime: selfFlightData.isRoundTrip ? selfFlightData.returnDepartureTime : undefined,
        returnArrivalDate: selfFlightData.isRoundTrip ? selfFlightData.returnArrivalDate : undefined,
        returnArrivalTime: selfFlightData.isRoundTrip ? selfFlightData.returnArrivalTime : undefined,
        isPaid: true,
        isRoundTrip: selfFlightData.isRoundTrip,
        hasSelfArranged: true
      };
      
      // Add to state
      setFlightBookings([...flightBookings, newFlight]);
      
      toast({
        title: 'Flight Information Saved',
        description: 'Your flight details have been saved successfully.',
      });
      
      // Reset and close
      setSelfFlightData({
        airline: '',
        flightNumber: '',
        departureDate: '',
        departureTime: '',
        departureAirport: '',
        arrivalDate: '',
        arrivalTime: '',
        bookingReference: '',
        isRoundTrip: false,
        returnFlightNumber: '',
        returnDepartureDate: '',
        returnDepartureTime: '',
        returnArrivalDate: '',
        returnArrivalTime: '',
      });
      setShowSelfArrangedFlight(false);
    } catch (error) {
      console.error('Error saving self-arranged flight:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your flight information.',
        variant: 'destructive'
      });
    }
  };
  
  // Submit self-arranged hotel
  const handleSubmitSelfHotel = async () => {
    // Validate form
    if (!selfHotelData.hotelName || !selfHotelData.checkInDate || !selfHotelData.checkOutDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields about your hotel.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // In a real app, this would send the data to the server
      console.log('Submitting self-arranged hotel data:', selfHotelData);
      
      // Create a new hotel booking object
      const newHotel: HotelBooking = {
        id: `self-${Date.now()}`,
        bookingReference: selfHotelData.bookingReference || 'Self-arranged',
        hotelName: selfHotelData.hotelName,
        hotelAddress: selfHotelData.hotelAddress,
        hotelPhone: selfHotelData.hotelPhone,
        checkInDate: selfHotelData.checkInDate,
        checkOutDate: selfHotelData.checkOutDate,
        roomType: selfHotelData.roomType,
        numberOfGuests: selfHotelData.numberOfGuests,
        status: 'confirmed',
        providedBy: 'self',
        isPaid: true,
        includedInPackage: false,
        hasSelfArranged: true
      };
      
      // Add to state
      setHotelBookings([...hotelBookings, newHotel]);
      
      toast({
        title: 'Hotel Information Saved',
        description: 'Your hotel details have been saved successfully.',
      });
      
      // Reset and close
      setSelfHotelData({
        hotelName: '',
        hotelAddress: '',
        hotelPhone: '',
        checkInDate: '',
        checkOutDate: '',
        roomType: 'Standard Room',
        numberOfGuests: 1,
        bookingReference: '',
      });
      setShowSelfArrangedHotel(false);
    } catch (error) {
      console.error('Error saving self-arranged hotel:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your hotel information.',
        variant: 'destructive'
      });
    }
  };
  
  // Function to format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('patient.travel.title', 'Travel & Accommodation')}</h2>
          <p className="text-muted-foreground">{t('patient.travel.description', 'Manage your travel arrangements for your dental treatment')}</p>
        </div>
      </div>
      
      <Tabs defaultValue="flights" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="flights">
            <Plane className="h-4 w-4 mr-2" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels">
            <Hotel className="h-4 w-4 mr-2" />
            Hotels
          </TabsTrigger>
        </TabsList>
        
        {/* Flights Tab */}
        <TabsContent value="flights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Flight Bookings</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFlightSearch(true)}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Find Flights
              </Button>
              <Button 
                variant="default"
                onClick={() => setShowSelfArrangedFlight(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                I Have My Own Flight
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : flightBookings.length === 0 ? (
            <Card className="py-8">
              <CardContent className="text-center">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Flights Booked</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any flights booked for your dental treatment yet.
                </p>
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFlightSearch(true)}
                  >
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Find Flights
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => setShowSelfArrangedFlight(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    I Have My Own Flight
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {flightBookings.map(flight => (
                <Card key={flight.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="mr-3 p-2 bg-blue-50 rounded-md">
                          <Plane className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{flight.airline}</CardTitle>
                          <CardDescription className="text-xs">
                            {flight.hasSelfArranged ? 'Self-arranged' : 'Booked via MyDentalFly'}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(flight.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Departure</p>
                          <div className="flex items-center">
                            <div className="font-medium">{flight.departureAirport}</div>
                            <ArrowRight className="h-3 w-3 mx-2" />
                            <div className="font-medium">{flight.arrivalAirport}</div>
                          </div>
                          <p className="text-xs">
                            {formatDate(flight.departureDate)} • {flight.departureTime}
                          </p>
                        </div>
                        
                        {flight.isRoundTrip && flight.returnFlightNumber && (
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Return</p>
                            <div className="flex items-center">
                              <div className="font-medium">{flight.arrivalAirport}</div>
                              <ArrowRight className="h-3 w-3 mx-2" />
                              <div className="font-medium">{flight.departureAirport}</div>
                            </div>
                            <p className="text-xs">
                              {flight.returnDepartureDate ? formatDate(flight.returnDepartureDate) : 'N/A'} • {flight.returnDepartureTime || 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                          Flight {flight.flightNumber}
                        </div>
                        {flight.isRoundTrip && flight.returnFlightNumber && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded-md ml-2">
                            Return Flight {flight.returnFlightNumber}
                          </div>
                        )}
                        {flight.bookingReference && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded-md ml-2">
                            Ref: {flight.bookingReference}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowFlightDetails(true);
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Hotels Tab */}
        <TabsContent value="hotels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Hotel Bookings</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowHotelSearch(true)}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Find Hotels
              </Button>
              <Button 
                variant="default"
                onClick={() => setShowSelfArrangedHotel(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                I Have My Own Hotel
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hotelBookings.length === 0 ? (
            <Card className="py-8">
              <CardContent className="text-center">
                <Hotel className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Hotels Booked</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any hotel accommodations booked for your dental treatment yet.
                </p>
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowHotelSearch(true)}
                  >
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Find Hotels
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => setShowSelfArrangedHotel(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    I Have My Own Hotel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {hotelBookings.map(hotel => (
                <Card key={hotel.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="mr-3 p-2 bg-green-50 rounded-md">
                          <Hotel className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{hotel.hotelName}</CardTitle>
                          <CardDescription className="text-xs">
                            {hotel.providedBy === 'clinic' ? 'Provided by clinic' :
                            hotel.providedBy === 'platform' ? 'Booked via MyDentalFly' :
                            'Self-arranged'}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(hotel.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                        <div className="text-xs">{hotel.hotelAddress}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Check-in</p>
                            <p className="font-medium">{formatDate(hotel.checkInDate)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Check-out</p>
                            <p className="font-medium">{formatDate(hotel.checkOutDate)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                          {hotel.roomType}
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-md ml-2">
                          {hotel.numberOfGuests} {hotel.numberOfGuests > 1 ? 'Guests' : 'Guest'}
                        </div>
                        {hotel.bookingReference && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded-md ml-2">
                            Ref: {hotel.bookingReference}
                          </div>
                        )}
                      </div>
                      
                      {hotel.includedInPackage && hotel.packageName && (
                        <div className="mt-2 bg-blue-50 text-blue-800 p-2 rounded-md text-xs flex items-center">
                          <Info className="h-3.5 w-3.5 mr-1.5" />
                          <span>Included in your {hotel.packageName}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedHotel(hotel);
                        setShowHotelDetails(true);
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Flight Search Dialog */}
      <Dialog open={showFlightSearch} onOpenChange={setShowFlightSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plane className="h-5 w-5 mr-2 text-primary" />
              Find Flights
            </DialogTitle>
            <DialogDescription>
              Search for flights to Istanbul for your dental treatment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Trip Type</Label>
              <RadioGroup 
                defaultValue="roundTrip" 
                className="flex gap-4"
                value={tripType}
                onValueChange={setTripType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="roundTrip" id="roundTrip" />
                  <Label htmlFor="roundTrip">Round Trip</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oneWay" id="oneWay" />
                  <Label htmlFor="oneWay">One Way</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departureCity">Flying From</Label>
              <Input
                id="departureCity"
                placeholder="City or Airport"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      initialFocus
                      disabled={(date: Date): boolean => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {tripType === 'roundTrip' && (
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                        disabled={(date: Date): boolean => 
                          date < new Date() || 
                          (departureDate !== undefined && date < departureDate)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Passengers</Label>
                <Select value={adults.toString()} onValueChange={(value) => setAdults(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Adult</SelectItem>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">3 Adults</SelectItem>
                    <SelectItem value="4">4 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={flightClass} onValueChange={setFlightClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle>Concierge Service</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                Our travel specialists will find the best flight options based on your preferences and treatment schedule.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFlightSearch(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFlightSearch}
              disabled={!departureDate || !departureCity || isSearchingFlights}
            >
              {isSearchingFlights && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Search Flights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hotel Search Dialog */}
      <Dialog open={showHotelSearch} onOpenChange={setShowHotelSearch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Hotel className="h-5 w-5 mr-2 text-primary" />
              Find Hotels
            </DialogTitle>
            <DialogDescription>
              Search for hotels in Istanbul for your dental treatment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="City"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      initialFocus
                      disabled={(date: Date): boolean => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      initialFocus
                      disabled={(date: Date): boolean => 
                        date < new Date() || 
                        (checkInDate !== undefined && date <= checkInDate)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Guests</Label>
              <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="3">3 Guests</SelectItem>
                  <SelectItem value="4">4 Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle>Special Clinic Rates</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                Our partner clinics offer special rates at nearby hotels. Your travel specialist will help you find the best option for your stay.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowHotelSearch(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleHotelSearch}
              disabled={!checkInDate || !checkOutDate || isSearchingHotels}
            >
              {isSearchingHotels && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Search Hotels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Self-arranged Flight Dialog */}
      <Dialog open={showSelfArrangedFlight} onOpenChange={setShowSelfArrangedFlight}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plane className="h-5 w-5 mr-2 text-primary" />
              Add Your Own Flight Details
            </DialogTitle>
            <DialogDescription>
              Enter your flight information so our team can coordinate your dental treatment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="airline">Airline</Label>
              <Input
                id="airline"
                placeholder="e.g. Turkish Airlines, British Airways"
                value={selfFlightData.airline}
                onChange={(e) => setSelfFlightData({...selfFlightData, airline: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flightNumber">Flight Number</Label>
                <Input
                  id="flightNumber"
                  placeholder="e.g. TK1984"
                  value={selfFlightData.flightNumber}
                  onChange={(e) => setSelfFlightData({...selfFlightData, flightNumber: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bookingReference">Booking Reference</Label>
                <Input
                  id="bookingReference"
                  placeholder="Optional"
                  value={selfFlightData.bookingReference}
                  onChange={(e) => setSelfFlightData({...selfFlightData, bookingReference: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departureAirport">Departure Airport</Label>
              <Input
                id="departureAirport"
                placeholder="e.g. LHR, JFK"
                value={selfFlightData.departureAirport}
                onChange={(e) => setSelfFlightData({...selfFlightData, departureAirport: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={selfFlightData.departureDate}
                  onChange={(e) => setSelfFlightData({...selfFlightData, departureDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={selfFlightData.departureTime}
                  onChange={(e) => setSelfFlightData({...selfFlightData, departureTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isRoundTrip" 
                checked={selfFlightData.isRoundTrip}
                onCheckedChange={(checked) => 
                  setSelfFlightData({...selfFlightData, isRoundTrip: checked === true})
                }
              />
              <Label htmlFor="isRoundTrip">This is a round-trip flight</Label>
            </div>
            
            {selfFlightData.isRoundTrip && (
              <div className="space-y-4 border-t border-gray-100 pt-4 mt-4">
                <h4 className="font-medium">Return Flight Details</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="returnFlightNumber">Return Flight Number</Label>
                  <Input
                    id="returnFlightNumber"
                    placeholder="e.g. TK1985"
                    value={selfFlightData.returnFlightNumber}
                    onChange={(e) => setSelfFlightData({...selfFlightData, returnFlightNumber: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="returnDepartureDate">Return Date</Label>
                    <Input
                      id="returnDepartureDate"
                      type="date"
                      value={selfFlightData.returnDepartureDate}
                      onChange={(e) => setSelfFlightData({...selfFlightData, returnDepartureDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="returnDepartureTime">Return Time</Label>
                    <Input
                      id="returnDepartureTime"
                      type="time"
                      value={selfFlightData.returnDepartureTime}
                      onChange={(e) => setSelfFlightData({...selfFlightData, returnDepartureTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowSelfArrangedFlight(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSelfFlight}
            >
              Save Flight Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Self-arranged Hotel Dialog */}
      <Dialog open={showSelfArrangedHotel} onOpenChange={setShowSelfArrangedHotel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Hotel className="h-5 w-5 mr-2 text-primary" />
              Add Your Own Hotel Details
            </DialogTitle>
            <DialogDescription>
              Enter your hotel information so our team can coordinate your dental treatment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="hotelName">Hotel Name</Label>
              <Input
                id="hotelName"
                placeholder="e.g. Istanbul Grand Hotel"
                value={selfHotelData.hotelName}
                onChange={(e) => setSelfHotelData({...selfHotelData, hotelName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hotelAddress">Hotel Address</Label>
              <Input
                id="hotelAddress"
                placeholder="Full address in Istanbul"
                value={selfHotelData.hotelAddress}
                onChange={(e) => setSelfHotelData({...selfHotelData, hotelAddress: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelPhone">Hotel Phone</Label>
                <Input
                  id="hotelPhone"
                  placeholder="Optional"
                  value={selfHotelData.hotelPhone}
                  onChange={(e) => setSelfHotelData({...selfHotelData, hotelPhone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bookingReference">Booking Reference</Label>
                <Input
                  id="bookingReference"
                  placeholder="Optional"
                  value={selfHotelData.bookingReference}
                  onChange={(e) => setSelfHotelData({...selfHotelData, bookingReference: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={selfHotelData.checkInDate}
                  onChange={(e) => setSelfHotelData({...selfHotelData, checkInDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={selfHotelData.checkOutDate}
                  onChange={(e) => setSelfHotelData({...selfHotelData, checkOutDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select 
                  value={selfHotelData.roomType} 
                  onValueChange={(value) => setSelfHotelData({...selfHotelData, roomType: value})}
                >
                  <SelectTrigger id="roomType">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Room">Standard Room</SelectItem>
                    <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numberOfGuests">Number of Guests</Label>
                <Select 
                  value={selfHotelData.numberOfGuests.toString()} 
                  onValueChange={(value) => setSelfHotelData({...selfHotelData, numberOfGuests: parseInt(value)})}
                >
                  <SelectTrigger id="numberOfGuests">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowSelfArrangedHotel(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSelfHotel}
            >
              Save Hotel Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Flight Details Dialog */}
      <Dialog open={showFlightDetails} onOpenChange={setShowFlightDetails}>
        <DialogContent className="max-w-md">
          {selectedFlight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Plane className="h-5 w-5 mr-2 text-primary" />
                  Flight Details
                </DialogTitle>
                <DialogDescription>
                  {selectedFlight.airline} • {selectedFlight.flightNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{selectedFlight.airline}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedFlight.hasSelfArranged ? 'Self-arranged flight' : 'Booked via MyDentalFly'}
                    </p>
                  </div>
                  {getStatusBadge(selectedFlight.status)}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Outbound Flight</h4>
                  
                  <div className="bg-gray-50 p-3 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Flight</p>
                        <p className="font-medium">{selectedFlight.flightNumber}</p>
                      </div>
                      
                      {selectedFlight.bookingReference && (
                        <div>
                          <p className="text-xs text-muted-foreground">Booking Reference</p>
                          <p className="font-medium">{selectedFlight.bookingReference}</p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start">
                      <div className="w-1/2 pr-2">
                        <p className="text-xs text-muted-foreground">Departure</p>
                        <p className="font-medium">{selectedFlight.departureAirport}</p>
                        <p className="text-sm">{formatDate(selectedFlight.departureDate)}</p>
                        <p className="text-sm">{selectedFlight.departureTime}</p>
                      </div>
                      
                      <div className="w-1/2 pl-2 border-l border-gray-200">
                        <p className="text-xs text-muted-foreground">Arrival</p>
                        <p className="font-medium">{selectedFlight.arrivalAirport}</p>
                        <p className="text-sm">{formatDate(selectedFlight.arrivalDate)}</p>
                        <p className="text-sm">{selectedFlight.arrivalTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedFlight.isRoundTrip && selectedFlight.returnFlightNumber && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Return Flight</h4>
                    
                    <div className="bg-gray-50 p-3 rounded-md space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Flight</p>
                        <p className="font-medium">{selectedFlight.returnFlightNumber}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-start">
                        <div className="w-1/2 pr-2">
                          <p className="text-xs text-muted-foreground">Departure</p>
                          <p className="font-medium">{selectedFlight.arrivalAirport}</p>
                          <p className="text-sm">
                            {selectedFlight.returnDepartureDate ? formatDate(selectedFlight.returnDepartureDate) : 'N/A'}
                          </p>
                          <p className="text-sm">{selectedFlight.returnDepartureTime || 'N/A'}</p>
                        </div>
                        
                        <div className="w-1/2 pl-2 border-l border-gray-200">
                          <p className="text-xs text-muted-foreground">Arrival</p>
                          <p className="font-medium">{selectedFlight.departureAirport}</p>
                          <p className="text-sm">
                            {selectedFlight.returnArrivalDate ? formatDate(selectedFlight.returnArrivalDate) : 'N/A'}
                          </p>
                          <p className="text-sm">{selectedFlight.returnArrivalTime || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedFlight.price && (
                  <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-medium">
                        {selectedFlight.price} {selectedFlight.currency || 'GBP'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Status</p>
                      <p className="font-medium">
                        {selectedFlight.isPaid ? (
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                
                {!selectedFlight.hasSelfArranged && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Need changes?</AlertTitle>
                    <AlertDescription className="text-blue-700 text-sm">
                      Contact your MyDentalFly travel specialist for any changes to your flight booking.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => setShowFlightDetails(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Hotel Details Dialog */}
      <Dialog open={showHotelDetails} onOpenChange={setShowHotelDetails}>
        <DialogContent className="max-w-md">
          {selectedHotel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Hotel className="h-5 w-5 mr-2 text-primary" />
                  Hotel Details
                </DialogTitle>
                <DialogDescription>
                  {selectedHotel.hotelName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{selectedHotel.hotelName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedHotel.providedBy === 'clinic' ? 'Provided by clinic' :
                       selectedHotel.providedBy === 'platform' ? 'Booked via MyDentalFly' :
                       'Self-arranged accommodation'}
                    </p>
                  </div>
                  {getStatusBadge(selectedHotel.status)}
                </div>
                
                <Separator />
                
                <div className="bg-gray-50 p-3 rounded-md space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm">{selectedHotel.hotelAddress}</p>
                    </div>
                  </div>
                  
                  {selectedHotel.hotelPhone && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm">{selectedHotel.hotelPhone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Check-in</p>
                        <p className="text-sm font-medium">{formatDate(selectedHotel.checkInDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Check-out</p>
                        <p className="text-sm font-medium">{formatDate(selectedHotel.checkOutDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Room Type</p>
                      <p className="font-medium">{selectedHotel.roomType}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Guests</p>
                      <p className="font-medium">{selectedHotel.numberOfGuests} {selectedHotel.numberOfGuests > 1 ? 'Guests' : 'Guest'}</p>
                    </div>
                  </div>
                  
                  {selectedHotel.bookingReference && (
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Reference</p>
                      <p className="font-medium">{selectedHotel.bookingReference}</p>
                    </div>
                  )}
                  
                  {selectedHotel.confirmationNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground">Confirmation Number</p>
                      <p className="font-medium">{selectedHotel.confirmationNumber}</p>
                    </div>
                  )}
                </div>
                
                {selectedHotel.price && (
                  <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-medium">
                        {selectedHotel.price} {selectedHotel.currency || 'GBP'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Status</p>
                      <p className="font-medium">
                        {selectedHotel.isPaid ? (
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedHotel.includedInPackage && selectedHotel.packageName && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle>Package Inclusion</AlertTitle>
                    <AlertDescription className="text-green-700 text-sm">
                      This accommodation is included in your {selectedHotel.packageName}. No additional payment required.
                    </AlertDescription>
                  </Alert>
                )}
                
                {selectedHotel.providedBy === 'clinic' && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Clinic Provided</AlertTitle>
                    <AlertDescription className="text-blue-700 text-sm">
                      This accommodation is arranged by your dental clinic. Contact your clinic coordinator for any changes.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => setShowHotelDetails(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelSection;