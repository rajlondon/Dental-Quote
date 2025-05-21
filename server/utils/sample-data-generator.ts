/**
 * Sample Data Generator for Development Environment
 * 
 * This utility generates sample appointment data for the patient portal
 * during development while the real database implementation is in progress.
 */

interface SampleAppointment {
  id: string;
  userId: number;
  clinicId: number;
  promotionId?: string | null;
  bookingId?: number | null;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'in_progress';
  type: string;
  clinicName: string;
  clinicAddress: string;
  clinicImage?: string;
  isDentalAppointment: boolean;
  isPromotion: boolean;
  promotionDetails?: {
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    expiryDate: Date | null;
  } | null;
  reminderSent: boolean;
  reminderTime: Date | null;
  notes: string | null;
  documents: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Generates a set of sample appointments for a given user ID
 * @param userId - The user ID to generate appointments for
 * @returns An array of sample appointments
 */
export function generateSampleAppointments(userId: number): SampleAppointment[] {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  
  // Sample clinic data
  const clinics = [
    { 
      id: 1, 
      name: "DentSpa Istanbul", 
      address: "Bağdat Caddesi No:123, Kadıköy, Istanbul",
      image: "https://example.com/dentspa.jpg"
    },
    { 
      id: 2, 
      name: "Istanbul Dental Center", 
      address: "Istiklal Street No:456, Beyoğlu, Istanbul",
      image: "https://example.com/istanbuldental.jpg"
    },
    { 
      id: 3, 
      name: "Smile Clinic Turkey", 
      address: "Taksim Square No:789, Beyoğlu, Istanbul",
      image: "https://example.com/smileclinic.jpg"
    }
  ];
  
  // Generate 5 sample appointments, some with promotions
  return [
    // Upcoming appointment with promotion
    {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      userId,
      clinicId: clinics[0].id,
      promotionId: "promo_summer2025",
      bookingId: 1001,
      title: "Initial Consultation & Dental Imaging",
      description: "First appointment to assess treatment needs with X-rays and 3D scans.",
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      status: 'scheduled',
      type: 'consultation',
      clinicName: clinics[0].name,
      clinicAddress: clinics[0].address,
      clinicImage: clinics[0].image,
      isDentalAppointment: true,
      isPromotion: true,
      promotionDetails: {
        title: "Summer 2025 Special",
        description: "Get 20% off on all dental implants",
        discountType: 'percentage',
        discountValue: 20,
        expiryDate: new Date('2025-09-30')
      },
      reminderSent: false,
      reminderTime: new Date(tomorrow.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      notes: "Please bring your recent dental records if available",
      documents: [],
      created_at: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updated_at: today
    },
    
    // Next week appointment (dental treatment)
    {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      userId,
      clinicId: clinics[0].id,
      bookingId: 1001,
      title: "Dental Implant Procedure - Stage 1",
      description: "First stage of implant placement for teeth 14, 15, 24, and 25.",
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 180 * 60 * 1000), // 3 hours later
      status: 'scheduled',
      type: 'treatment',
      clinicName: clinics[0].name,
      clinicAddress: clinics[0].address,
      clinicImage: clinics[0].image,
      isDentalAppointment: true,
      isPromotion: false,
      promotionDetails: null,
      reminderSent: false,
      reminderTime: new Date(nextWeek.getTime() - 48 * 60 * 60 * 1000), // 2 days before
      notes: "Pre-procedure antibiotics required. Start taking them 24h before appointment.",
      documents: ["pre_op_instructions.pdf", "patient_consent_form.pdf"],
      created_at: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updated_at: today
    },
    
    // Past appointment (completed)
    {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      userId,
      clinicId: clinics[1].id,
      bookingId: 1001,
      title: "Pre-Treatment Assessment",
      description: "Initial assessment and treatment planning",
      startTime: lastWeek,
      endTime: new Date(lastWeek.getTime() + 45 * 60 * 1000), // 45 minutes later
      status: 'completed',
      type: 'assessment',
      clinicName: clinics[1].name,
      clinicAddress: clinics[1].address,
      clinicImage: clinics[1].image,
      isDentalAppointment: true,
      isPromotion: false,
      promotionDetails: null,
      reminderSent: true,
      reminderTime: new Date(lastWeek.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      notes: "Patient is a good candidate for implants. Treatment plan created.",
      documents: ["treatment_plan_summary.pdf", "dental_imaging_results.pdf"],
      created_at: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updated_at: lastWeek
    },
    
    // Non-dental appointment with promotion (hotel consultation)
    {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      userId,
      clinicId: clinics[0].id,
      promotionId: "promo_luxury_stay",
      bookingId: 1001,
      title: "Hotel Accommodation Consultation",
      description: "Discussion about your hotel preferences and booking options",
      startTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after tomorrow
      endTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 minutes later
      status: 'scheduled',
      type: 'accommodation',
      clinicName: clinics[0].name,
      clinicAddress: clinics[0].address,
      clinicImage: clinics[0].image,
      isDentalAppointment: false,
      isPromotion: true,
      promotionDetails: {
        title: "Luxury Stay Package",
        description: "5-star hotel accommodation included with your dental treatment",
        discountType: 'fixed_amount',
        discountValue: 200,
        expiryDate: new Date('2025-12-31')
      },
      reminderSent: false,
      reminderTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), // 1 day before
      notes: null,
      documents: [],
      created_at: today,
      updated_at: today
    },
    
    // Distant future appointment with post-treatment check
    {
      id: "app_" + Math.random().toString(36).substring(2, 11),
      userId,
      clinicId: clinics[0].id,
      bookingId: 1001,
      title: "Post-Treatment Checkup",
      description: "Follow-up examination after implant placement",
      startTime: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endTime: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes later
      status: 'scheduled',
      type: 'checkup',
      clinicName: clinics[0].name,
      clinicAddress: clinics[0].address,
      clinicImage: clinics[0].image,
      isDentalAppointment: true,
      isPromotion: false,
      promotionDetails: null,
      reminderSent: false,
      reminderTime: new Date(today.getTime() + 29 * 24 * 60 * 60 * 1000), // 1 day before
      notes: "Assess healing progress and adjust treatment plan if necessary",
      documents: [],
      created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updated_at: today
    }
  ];
}