import { HotelBooking, Hotel as HotelType } from '@shared/schema';

// Example hotel data for demonstration - Premium option
export const EXAMPLE_HOTEL_PREMIUM: HotelType = {
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
  website: 'https://www.grand-istanbul-hotel.com',
  isActive: true,
  isPartner: true,
  adminNotes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Standard hotel option
export const EXAMPLE_HOTEL_STANDARD: HotelType = {
  id: 2,
  name: 'Istanbul Comfort Suites',
  address: 'Sisli District, Istanbul',
  city: 'Istanbul',
  country: 'Turkey',
  starRating: 3.5,
  description: 'Clean and comfortable accommodations within 3km of the dental clinic. Enjoy modern rooms, a restaurant with Turkish cuisine, and easy access to public transportation.',
  amenities: ['Free WiFi', 'Free Breakfast', 'Restaurant', 'Airport Shuttle (surcharge)', 'Daily Housekeeping', 'Laundry Service'],
  mainImageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  ],
  latitude: 41.0565,
  longitude: 28.9902,
  distanceToClinic: { '1': 3.0 },
  contactPhone: '+90 212 456 7890',
  contactEmail: 'info@istanbulcomfortsuites.com',
  website: 'https://www.istanbul-comfort-suites.com',
  isActive: true,
  isPartner: true,
  adminNotes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Economy hotel option
export const EXAMPLE_HOTEL_ECONOMY: HotelType = {
  id: 3,
  name: 'Istanbul Budget Stay',
  address: 'Fatih District, Istanbul',
  city: 'Istanbul',
  country: 'Turkey',
  starRating: 2.5,
  description: 'Affordable lodging option for budget-conscious travelers. Simple rooms with the necessities, located near public transportation with easy clinic access.',
  amenities: ['Free WiFi', 'Shared Kitchen', '24h Reception', 'Luggage Storage', 'Air Conditioning'],
  mainImageUrl: 'https://images.unsplash.com/photo-1683741595609-9a77c8baeba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=684&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1657586640569-da0d2950e631?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1072&q=80',
    'https://images.unsplash.com/photo-1671465451278-5720c7dff654?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    'https://images.unsplash.com/photo-1671465452148-61e85bf8b5c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  ],
  latitude: 41.0099,
  longitude: 28.9770,
  distanceToClinic: { '1': 4.5 },
  contactPhone: '+90 212 876 5432',
  contactEmail: 'info@istanbulbudgetstay.com',
  website: 'https://www.istanbul-budget-stay.com',
  isActive: true,
  isPartner: true,
  adminNotes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// For backward compatibility
export const EXAMPLE_HOTEL = EXAMPLE_HOTEL_PREMIUM;

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
  hotel: EXAMPLE_HOTEL_PREMIUM
};

// Types for multi-option hotel scenarios
export type HotelOption = {
  hotel: HotelType;
  tier: 'economy' | 'standard' | 'premium';
  includedInPrice: boolean;
  additionalCost?: number;
  currency?: string;
  availableRooms?: string[];
  transferIncluded: boolean;
  breakfastIncluded: boolean;
  benefits: string[];
  recommendedFor?: string[];
};

// Example hotel options offered by clinic
export const EXAMPLE_CLINIC_HOTEL_OPTIONS: HotelOption[] = [
  {
    hotel: EXAMPLE_HOTEL_PREMIUM,
    tier: 'premium',
    includedInPrice: false,
    additionalCost: 350,
    currency: 'GBP',
    availableRooms: ['Deluxe Room', 'Executive Suite'],
    transferIncluded: true,
    breakfastIncluded: true,
    benefits: [
      'Daily shuttle to clinic',
      'Post-treatment room service',
      'Special dental patient amenities',
      'Premium toiletries suitable after dental work',
      'Diet-specific menu options'
    ],
    recommendedFor: ['Extended stays', 'Premium treatments', 'Patients wanting luxury']
  },
  {
    hotel: EXAMPLE_HOTEL_STANDARD,
    tier: 'standard',
    includedInPrice: true,
    availableRooms: ['Standard Room', 'Superior Room'],
    transferIncluded: true,
    breakfastIncluded: true,
    benefits: [
      'Daily shuttle to clinic',
      'Welcome package',
      'Dental care kit',
      'Special diet menu available'
    ]
  },
  {
    hotel: EXAMPLE_HOTEL_ECONOMY,
    tier: 'economy',
    includedInPrice: true,
    availableRooms: ['Standard Room'],
    transferIncluded: false,
    breakfastIncluded: false,
    benefits: [
      'Affordable option',
      'Near public transportation',
      'Basic dental care kit'
    ],
    recommendedFor: ['Budget-conscious patients', 'Short stays']
  }
];

// Self-arranged accommodation status
export const EXAMPLE_SELF_ARRANGED_STATUS = {
  arrangedByPatient: true,
  patientHotelName: 'Hotel of my choice',
  patientHotelAddress: '123 Example Street, Istanbul',
  patientHotelPhone: '+90 123 456 7890',
  checkInDate: new Date('2025-06-10'),
  checkOutDate: new Date('2025-06-17'),
  specialRequests: 'Please arrange transport from this hotel to the clinic',
  clinicAcknowledged: true
};

// Flight information types and examples
export type FlightDetails = {
  outboundFlight: {
    flightNumber: string;
    airline: string;
    departureAirport: string;
    departureCity: string;
    departureDate: Date;
    departureTime: string;
    arrivalAirport: string;
    arrivalDate: Date;
    arrivalTime: string;
    bookingReference?: string;
  };
  returnFlight?: {
    flightNumber: string;
    airline: string;
    departureAirport: string;
    departureCity: string;
    departureDate: Date;
    departureTime: string;
    arrivalAirport: string;
    arrivalDate: Date;
    arrivalTime: string;
    bookingReference?: string;
  };
  assistanceNeeded: boolean;
  assistanceType?: string;
  pickupRequested: boolean;
  passengers: number;
  additionalInformation?: string;
  flightStatus?: 'confirmed' | 'pending' | 'not_booked';
};

export const EXAMPLE_FLIGHT_DETAILS: FlightDetails = {
  outboundFlight: {
    flightNumber: 'BA678',
    airline: 'British Airways',
    departureAirport: 'LHR',
    departureCity: 'London',
    departureDate: new Date('2025-06-10'),
    departureTime: '09:45',
    arrivalAirport: 'IST',
    arrivalDate: new Date('2025-06-10'),
    arrivalTime: '15:30',
    bookingReference: 'XYZABC'
  },
  returnFlight: {
    flightNumber: 'BA679',
    airline: 'British Airways',
    departureAirport: 'IST',
    departureCity: 'Istanbul',
    departureDate: new Date('2025-06-17'),
    departureTime: '16:45',
    arrivalAirport: 'LHR',
    arrivalDate: new Date('2025-06-17'),
    arrivalTime: '19:20',
    bookingReference: 'XYZABC'
  },
  assistanceNeeded: true,
  assistanceType: 'Airport pickup and drop-off',
  pickupRequested: true,
  passengers: 2,
  additionalInformation: 'I will have one large suitcase per person',
  flightStatus: 'confirmed'
};