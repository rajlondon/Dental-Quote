import { HotelBooking, Hotel as HotelType } from '@shared/schema';

// Example hotel data for demonstration
export const EXAMPLE_HOTEL: HotelType = {
  id: 1,
  name: 'Grand Istanbul Hotel',
  address: 'Taksim Square, Beyoglu',
  city: 'Istanbul',
  country: 'Turkey',
  starRating: 4.5,
  description: 'A luxury hotel located in the heart of Istanbul, just 10 minutes walk from your dental clinic. Featuring spacious rooms with city views, a spa, and an indoor pool.',
  amenities: ['Free WiFi', 'Spa & Wellness Center', 'Room Service', 'Airport Shuttle', 'Restaurant', 'Fitness Center', 'Swimming Pool', 'Bar'],
  mainImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80',
    'https://images.unsplash.com/photo-1605346534396-7a35ce761c3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80'
  ],
  latitude: 41.0370,
  longitude: 28.9850,
  distanceToClinic: { '1': 1.2 },
  contactPhone: '+90 212 123 4567',
  contactEmail: 'info@grandistanbulhotel.com',
  website: 'https://www.example-hotel.com',
  isActive: true,
  isPartner: true,
  adminNotes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Example booking data for demonstration
export const EXAMPLE_BOOKING: HotelBooking & { hotel: HotelType } = {
  id: 1,
  userId: 1,
  bookingId: 1,
  treatmentPlanId: 1,
  hotelId: 1,
  checkInDate: new Date('2025-06-10'),
  checkOutDate: new Date('2025-06-17'),
  roomType: 'Deluxe Room with City View',
  numberOfGuests: 2,
  accommodationPackage: 'premium',
  status: 'confirmed',
  confirmationNumber: 'DENT123456',
  providedBy: 'clinic',
  providerDetails: { contactName: 'Clinic Concierge', contactPhone: '+90 212 987 6543' },
  totalCost: 0, // Included in treatment package
  currency: 'GBP',
  includesBreakfast: true,
  additionalServices: { airportTransfer: true, cityTour: false },
  specialRequests: 'Non-smoking room on a high floor if possible',
  adminNotes: '',
  createdById: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  // Including the hotel relation
  hotel: EXAMPLE_HOTEL
};