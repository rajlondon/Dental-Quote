import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  BadgeInfo,
  Users,
  Calendar as CalendarIcon2,
  Check,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { EXAMPLE_FLIGHT_DETAILS, FlightDetails } from './exampleHotelData';

const FlightDetailsSection: React.FC = () => {
  const [flightDetails, setFlightDetails] = useState<FlightDetails | null>(EXAMPLE_FLIGHT_DETAILS);
  const [showAddFlightDialog, setShowAddFlightDialog] = useState(false);
  const [addingOutbound, setAddingOutbound] = useState(true);
  const [currentTab, setCurrentTab] = useState('flights');
  
  // Form state for adding new flight
  const [flightForm, setFlightForm] = useState({
    flightNumber: '',
    airline: '',
    departureAirport: '',
    departureCity: '',
    departureDate: new Date(),
    departureTime: '',
    arrivalAirport: '',
    arrivalCity: '',
    arrivalDate: new Date(),
    arrivalTime: '',
    bookingReference: ''
  });

  // Form state for assistance
  const [assistanceForm, setAssistanceForm] = useState({
    assistanceNeeded: flightDetails?.assistanceNeeded || false,
    assistanceType: flightDetails?.assistanceType || '',
    pickupRequested: flightDetails?.pickupRequested || false,
    passengers: flightDetails?.passengers || 1,
    additionalInformation: flightDetails?.additionalInformation || ''
  });

  // Handler functions
  const handleAddFlight = () => {
    if (addingOutbound) {
      // Add outbound flight
      setFlightDetails(prev => {
        if (!prev) {
          return {
            outboundFlight: {
              flightNumber: flightForm.flightNumber,
              airline: flightForm.airline,
              departureAirport: flightForm.departureAirport,
              departureCity: flightForm.departureCity,
              departureDate: flightForm.departureDate,
              departureTime: flightForm.departureTime,
              arrivalAirport: flightForm.arrivalAirport,
              arrivalDate: flightForm.arrivalDate,
              arrivalTime: flightForm.arrivalTime,
              bookingReference: flightForm.bookingReference || undefined
            },
            assistanceNeeded: assistanceForm.assistanceNeeded,
            assistanceType: assistanceForm.assistanceType,
            pickupRequested: assistanceForm.pickupRequested,
            passengers: assistanceForm.passengers,
            additionalInformation: assistanceForm.additionalInformation,
            flightStatus: 'confirmed'
          };
        }
        
        return {
          ...prev,
          outboundFlight: {
            flightNumber: flightForm.flightNumber,
            airline: flightForm.airline,
            departureAirport: flightForm.departureAirport,
            departureCity: flightForm.departureCity,
            departureDate: flightForm.departureDate,
            departureTime: flightForm.departureTime,
            arrivalAirport: flightForm.arrivalAirport,
            arrivalDate: flightForm.arrivalDate,
            arrivalTime: flightForm.arrivalTime,
            bookingReference: flightForm.bookingReference || undefined
          },
          flightStatus: 'confirmed'
        };
      });
    } else {
      // Add return flight
      setFlightDetails(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          returnFlight: {
            flightNumber: flightForm.flightNumber,
            airline: flightForm.airline,
            departureAirport: flightForm.departureAirport,
            departureCity: flightForm.departureCity,
            departureDate: flightForm.departureDate,
            departureTime: flightForm.departureTime,
            arrivalAirport: flightForm.arrivalAirport,
            arrivalDate: flightForm.arrivalDate,
            arrivalTime: flightForm.arrivalTime,
            bookingReference: flightForm.bookingReference || undefined
          }
        };
      });
    }
    
    setShowAddFlightDialog(false);
    // Reset form
    setFlightForm({
      flightNumber: '',
      airline: '',
      departureAirport: '',
      departureCity: '',
      departureDate: new Date(),
      departureTime: '',
      arrivalAirport: '',
      arrivalCity: '',
      arrivalDate: new Date(),
      arrivalTime: '',
      bookingReference: ''
    });
  };

  const handleSaveAssistance = () => {
    setFlightDetails(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        assistanceNeeded: assistanceForm.assistanceNeeded,
        assistanceType: assistanceForm.assistanceType,
        pickupRequested: assistanceForm.pickupRequested,
        passengers: assistanceForm.passengers,
        additionalInformation: assistanceForm.additionalInformation
      };
    });
  };

  const handleOpenAddFlightDialog = (isOutbound: boolean) => {
    setAddingOutbound(isOutbound);
    // If editing existing flight, populate form
    if (isOutbound && flightDetails?.outboundFlight) {
      const outbound = flightDetails.outboundFlight;
      setFlightForm({
        flightNumber: outbound.flightNumber,
        airline: outbound.airline,
        departureAirport: outbound.departureAirport,
        departureCity: outbound.departureCity,
        departureDate: outbound.departureDate,
        departureTime: outbound.departureTime,
        arrivalAirport: outbound.arrivalAirport,
        arrivalCity: '',
        arrivalDate: outbound.arrivalDate,
        arrivalTime: outbound.arrivalTime,
        bookingReference: outbound.bookingReference || ''
      });
    } else if (!isOutbound && flightDetails?.returnFlight) {
      const returnFlight = flightDetails.returnFlight;
      setFlightForm({
        flightNumber: returnFlight.flightNumber,
        airline: returnFlight.airline,
        departureAirport: returnFlight.departureAirport,
        departureCity: returnFlight.departureCity,
        departureDate: returnFlight.departureDate,
        departureTime: returnFlight.departureTime,
        arrivalAirport: returnFlight.arrivalAirport,
        arrivalCity: '',
        arrivalDate: returnFlight.arrivalDate,
        arrivalTime: returnFlight.arrivalTime,
        bookingReference: returnFlight.bookingReference || ''
      });
    } else {
      // For new flights, set some defaults
      if (isOutbound) {
        setFlightForm(prev => ({
          ...prev,
          arrivalAirport: 'IST',
          arrivalCity: 'Istanbul'
        }));
      } else {
        setFlightForm(prev => ({
          ...prev,
          departureAirport: 'IST',
          departureCity: 'Istanbul'
        }));
      }
    }
    
    setShowAddFlightDialog(true);
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plane className="mr-2 h-5 w-5" /> Flight Details
        </CardTitle>
        <CardDescription>
          Add your flight information to help us coordinate your airport transfers and appointment timing
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="flights" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="flights" className="flex items-center">
              <Plane className="h-4 w-4 mr-2" />
              Flight Information
            </TabsTrigger>
            <TabsTrigger value="assistance" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Transfer & Assistance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flights">
            {!flightDetails ? (
              <div className="text-center py-8">
                <Plane className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Flight Information Added</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please add your flight details to help us coordinate your visit
                </p>
                <Button onClick={() => handleOpenAddFlightDialog(true)}>
                  Add Outbound Flight
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Outbound Flight */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <PlaneTakeoff className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Outbound Flight</h3>
                        <p className="text-sm text-gray-500">
                          {format(flightDetails.outboundFlight.departureDate, 'EEE, d MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={flightDetails.flightStatus === 'confirmed' ? 'default' : 'outline'}>
                      {flightDetails.flightStatus === 'confirmed' ? 'Confirmed' : 
                       flightDetails.flightStatus === 'pending' ? 'Pending' : 'Not Booked'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {flightDetails.outboundFlight.departureAirport} ({flightDetails.outboundFlight.departureCity})
                        </span>
                        <span className="text-sm flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {flightDetails.outboundFlight.departureTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {flightDetails.outboundFlight.airline}
                      </div>
                      <div className="flex items-center text-xs font-medium">
                        <span>{flightDetails.outboundFlight.flightNumber}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Arrival</p>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {flightDetails.outboundFlight.arrivalAirport} (Istanbul)
                        </span>
                        <span className="text-sm flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {flightDetails.outboundFlight.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {flightDetails.outboundFlight.bookingReference && (
                    <div className="mt-3 text-xs text-gray-500">
                      Booking reference: {flightDetails.outboundFlight.bookingReference}
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenAddFlightDialog(true)}
                    >
                      Edit Flight
                    </Button>
                  </div>
                </div>
                
                {/* Return Flight */}
                {flightDetails.returnFlight ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <PlaneLanding className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Return Flight</h3>
                          <p className="text-sm text-gray-500">
                            {format(flightDetails.returnFlight.departureDate, 'EEE, d MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant={flightDetails.flightStatus === 'confirmed' ? 'default' : 'outline'}>
                        {flightDetails.flightStatus === 'confirmed' ? 'Confirmed' : 
                         flightDetails.flightStatus === 'pending' ? 'Pending' : 'Not Booked'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Departure</p>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {flightDetails.returnFlight.departureAirport} (Istanbul)
                          </span>
                          <span className="text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {flightDetails.returnFlight.departureTime}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {flightDetails.returnFlight.airline}
                        </div>
                        <div className="flex items-center text-xs font-medium">
                          <span>{flightDetails.returnFlight.flightNumber}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Arrival</p>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {flightDetails.returnFlight.arrivalAirport} ({flightDetails.returnFlight.departureCity})
                          </span>
                          <span className="text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {flightDetails.returnFlight.arrivalTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {flightDetails.returnFlight.bookingReference && (
                      <div className="mt-3 text-xs text-gray-500">
                        Booking reference: {flightDetails.returnFlight.bookingReference}
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenAddFlightDialog(false)}
                      >
                        Edit Flight
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-4 text-center">
                    <PlaneLanding className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <h3 className="font-medium mb-2">Return Flight Not Added</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Add your return flight details when available
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenAddFlightDialog(false)}
                    >
                      Add Return Flight
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assistance">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="mt-0.5">
                  <Switch 
                    checked={assistanceForm.pickupRequested} 
                    onCheckedChange={(checked) => setAssistanceForm({...assistanceForm, pickupRequested: checked})}
                  />
                </div>
                <div>
                  <Label className="text-base">Airport Pickup Service</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll arrange transportation from Istanbul Airport to your accommodation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="mt-0.5">
                  <Switch 
                    checked={assistanceForm.assistanceNeeded} 
                    onCheckedChange={(checked) => setAssistanceForm({...assistanceForm, assistanceNeeded: checked})}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-base">I Need Additional Assistance</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Request special assistance during your stay
                  </p>
                  
                  {assistanceForm.assistanceNeeded && (
                    <div className="mt-3">
                      <Label htmlFor="assistance-type" className="text-sm">
                        Please describe what assistance you need:
                      </Label>
                      <Input
                        id="assistance-type"
                        className="mt-1"
                        value={assistanceForm.assistanceType}
                        onChange={(e) => setAssistanceForm({...assistanceForm, assistanceType: e.target.value})}
                        placeholder="E.g., wheelchair access, interpreter, etc."
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <Label className="text-base mb-2 block">Travel Party Details</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passengers" className="text-sm">
                      Number of Passengers
                    </Label>
                    <Input
                      id="passengers"
                      type="number"
                      min={1}
                      className="mt-1"
                      value={assistanceForm.passengers}
                      onChange={(e) => setAssistanceForm({...assistanceForm, passengers: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="additional-info" className="text-sm">
                      Additional Information
                    </Label>
                    <Input
                      id="additional-info"
                      className="mt-1"
                      value={assistanceForm.additionalInformation}
                      onChange={(e) => setAssistanceForm({...assistanceForm, additionalInformation: e.target.value})}
                      placeholder="Special requests, luggage details, etc."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveAssistance}>
                  Save Assistance Preferences
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Add/Edit Flight Dialog */}
      <Dialog open={showAddFlightDialog} onOpenChange={setShowAddFlightDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {addingOutbound ? 'Outbound Flight Details' : 'Return Flight Details'}
            </DialogTitle>
            <DialogDescription>
              {addingOutbound 
                ? 'Enter details for your flight to Istanbul' 
                : 'Enter details for your return flight from Istanbul'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="airline" className="text-sm">
                  Airline
                </Label>
                <Input
                  id="airline"
                  value={flightForm.airline}
                  onChange={(e) => setFlightForm({...flightForm, airline: e.target.value})}
                  placeholder="e.g. British Airways"
                />
              </div>
              
              <div>
                <Label htmlFor="flightNumber" className="text-sm">
                  Flight Number
                </Label>
                <Input
                  id="flightNumber"
                  value={flightForm.flightNumber}
                  onChange={(e) => setFlightForm({...flightForm, flightNumber: e.target.value})}
                  placeholder="e.g. BA123"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Departure Information */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center text-sm">
                <PlaneTakeoff className="h-4 w-4 mr-1" /> Departure Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureAirport" className="text-sm">
                    Departure Airport Code
                  </Label>
                  <Input
                    id="departureAirport"
                    value={flightForm.departureAirport}
                    onChange={(e) => setFlightForm({...flightForm, departureAirport: e.target.value})}
                    placeholder="e.g. LHR"
                  />
                </div>
                
                <div>
                  <Label htmlFor="departureCity" className="text-sm">
                    Departure City
                  </Label>
                  <Input
                    id="departureCity"
                    value={flightForm.departureCity}
                    onChange={(e) => setFlightForm({...flightForm, departureCity: e.target.value})}
                    placeholder="e.g. London"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureDate" className="text-sm">
                    Departure Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !flightForm.departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightForm.departureDate ? (
                          format(flightForm.departureDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={flightForm.departureDate}
                        onSelect={(date) => setFlightForm({...flightForm, departureDate: date || new Date()})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="departureTime" className="text-sm">
                    Departure Time
                  </Label>
                  <Input
                    id="departureTime"
                    value={flightForm.departureTime}
                    onChange={(e) => setFlightForm({...flightForm, departureTime: e.target.value})}
                    placeholder="e.g. 09:45"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Arrival Information */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center text-sm">
                <PlaneLanding className="h-4 w-4 mr-1" /> Arrival Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arrivalAirport" className="text-sm">
                    Arrival Airport Code
                  </Label>
                  <Input
                    id="arrivalAirport"
                    value={flightForm.arrivalAirport}
                    onChange={(e) => setFlightForm({...flightForm, arrivalAirport: e.target.value})}
                    placeholder="e.g. IST"
                  />
                </div>
                
                <div>
                  <Label htmlFor="arrivalCity" className="text-sm">
                    Arrival City
                  </Label>
                  <Input
                    id="arrivalCity"
                    disabled={addingOutbound}
                    value={addingOutbound ? 'Istanbul' : flightForm.arrivalCity}
                    onChange={(e) => setFlightForm({...flightForm, arrivalCity: e.target.value})}
                    placeholder="e.g. Istanbul"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arrivalDate" className="text-sm">
                    Arrival Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !flightForm.arrivalDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightForm.arrivalDate ? (
                          format(flightForm.arrivalDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={flightForm.arrivalDate}
                        onSelect={(date) => setFlightForm({...flightForm, arrivalDate: date || new Date()})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="arrivalTime" className="text-sm">
                    Arrival Time
                  </Label>
                  <Input
                    id="arrivalTime"
                    value={flightForm.arrivalTime}
                    onChange={(e) => setFlightForm({...flightForm, arrivalTime: e.target.value})}
                    placeholder="e.g. 15:30"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bookingReference" className="text-sm">
                Booking Reference (Optional)
              </Label>
              <Input
                id="bookingReference"
                value={flightForm.bookingReference}
                onChange={(e) => setFlightForm({...flightForm, bookingReference: e.target.value})}
                placeholder="e.g. ABC123"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFlightDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFlight}>Save Flight Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FlightDetailsSection;