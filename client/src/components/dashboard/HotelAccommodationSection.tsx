import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Hotel, 
  BedDouble, 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Coffee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PenLine,
  ImageIcon,
} from 'lucide-react';
import { HotelBooking, Hotel as HotelType } from '@shared/schema';
import { EXAMPLE_BOOKING } from './exampleHotelData';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Extended HotelBooking type to include hotel data
type ExtendedHotelBooking = HotelBooking & { 
  hotel: HotelType 
};

// Types for props with default values
interface HotelAccommodationSectionProps {
  hotelBooking?: ExtendedHotelBooking | null;
  isLoading?: boolean;
}

const HotelAccommodationSection: React.FC<HotelAccommodationSectionProps> = ({
  hotelBooking,
  isLoading = false,
}) => {
  // Helper function to generate hotel status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
  };

  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // If user selected "No accommodation" or data is still loading
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

  // If no hotel booking exists yet
  if (!hotelBooking) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Hotel className="mr-2 h-5 w-5" />
            Accommodation Arrangements
          </CardTitle>
          <CardDescription>
            Your accommodation details will appear here once arrangements are confirmed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-center">
            <Hotel className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Accommodation Information Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {hotelBooking === null 
                ? "You've chosen to arrange your own accommodation. When you've made arrangements, you can add your hotel details here."
                : "Your accommodation is being arranged. Details will appear here once confirmed."}
            </p>
            <Button variant="outline" className="mt-2">
              <PenLine className="h-4 w-4 mr-2" />
              {hotelBooking === null ? "Add My Hotel Details" : "Contact Us About Accommodation"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For display when hotel booking exists
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <Hotel className="mr-2 h-5 w-5" />
            Hotel Accommodation
          </CardTitle>
          {getStatusBadge(hotelBooking.status)}
        </div>
        <CardDescription>
          {hotelBooking.providedBy === 'clinic' 
            ? 'Hotel provided by your dental clinic' 
            : 'Accommodation arranged by MyDentalFly'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Hotel Details</TabsTrigger>
            <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
            <TabsTrigger value="map">Map Location</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {hotelBooking.hotel && (
              <>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-2/5">
                    {hotelBooking.hotel.mainImageUrl ? (
                      <img 
                        src={hotelBooking.hotel.mainImageUrl} 
                        alt={hotelBooking.hotel.name}
                        className="w-full h-48 md:h-60 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-60 bg-gray-200 flex items-center justify-center rounded-md">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="md:w-3/5 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold">{hotelBooking.hotel.name}</h3>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: Math.round(Number(hotelBooking.hotel.starRating) || 0) }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {hotelBooking.hotel.starRating}-star hotel
                        </span>
                      </div>
                    </div>

                    <p className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {hotelBooking.hotel.address}, {hotelBooking.hotel.city}, {hotelBooking.hotel.country}
                    </p>

                    {hotelBooking.hotel.distanceToClinic && (
                      <p className="text-sm text-gray-600">
                        {typeof hotelBooking.hotel.distanceToClinic === 'object' 
                          ? `${Object.values(hotelBooking.hotel.distanceToClinic)[0]} km to your clinic` 
                          : `${hotelBooking.hotel.distanceToClinic} km to your clinic`}
                      </p>
                    )}

                    {hotelBooking.hotel.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {hotelBooking.hotel.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Booking Details
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{formatDate(hotelBooking.checkInDate.toString())}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{formatDate(hotelBooking.checkOutDate.toString())}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-medium">{hotelBooking.roomType || 'Standard Room'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{hotelBooking.numberOfGuests}</span>
                      </li>
                      {hotelBooking.confirmationNumber && (
                        <li className="flex justify-between">
                          <span className="text-gray-600">Confirmation #:</span>
                          <span className="font-medium">{hotelBooking.confirmationNumber}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium flex items-center mb-2">
                      <BedDouble className="h-4 w-4 mr-2" />
                      Amenities & Services
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {hotelBooking.includesBreakfast && (
                        <li className="flex items-center">
                          <Coffee className="h-4 w-4 mr-2 text-green-600" />
                          <span>Breakfast included</span>
                        </li>
                      )}
                      {hotelBooking.hotel.amenities && Array.isArray(hotelBooking.hotel.amenities) && 
                        hotelBooking.hotel.amenities.slice(0, 4).map((amenity, i) => (
                          <li key={i} className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            <span>{amenity}</span>
                          </li>
                        ))
                      }
                      {hotelBooking.hotel.amenities && Array.isArray(hotelBooking.hotel.amenities) && 
                       hotelBooking.hotel.amenities.length > 4 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-sm">
                              View all {hotelBooking.hotel.amenities.length} amenities
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Hotel Amenities</DialogTitle>
                              <DialogDescription>
                                All available amenities at {hotelBooking.hotel.name}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[300px] mt-2">
                              <ul className="space-y-2">
                                {hotelBooking.hotel.amenities.map((amenity, i) => (
                                  <li key={i} className="flex items-center py-1">
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 shrink-0" />
                                    <span>{amenity}</span>
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            {hotelBooking.hotel && hotelBooking.hotel.galleryImages ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.isArray(hotelBooking.hotel.galleryImages) && hotelBooking.hotel.galleryImages.map((image, i) => (
                  <img 
                    key={i}
                    src={image} 
                    alt={`${hotelBooking.hotel?.name} - Gallery image ${i+1}`}
                    className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No gallery images available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            {hotelBooking.hotel && (hotelBooking.hotel.latitude && hotelBooking.hotel.longitude) ? (
              <div className="h-[300px] w-full bg-gray-100 rounded-md">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${hotelBooking.hotel.latitude},${hotelBooking.hotel.longitude}&z=15&output=embed`}
                  allowFullScreen
                  title="Hotel location"
                  className="rounded-md"
                ></iframe>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Map location not available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {hotelBooking.hotel?.website ? (
          <a 
            href={hotelBooking.hotel.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <Hotel className="h-4 w-4 mr-1" /> Visit hotel website
          </a>
        ) : (
          <span></span>
        )}
        
        {hotelBooking.status === 'confirmed' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">
                  <PenLine className="h-4 w-4 mr-2" />
                  Special Requests
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Make special requests for your hotel stay</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  );
};

export default HotelAccommodationSection;