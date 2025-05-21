// Utility to generate sample data for development and testing purposes
// This will be removed once the real data from the database is available

import { addDays, subDays, format, addHours, addMinutes } from 'date-fns';

// Function to generate sample appointment data for patient portal
export function generateSampleAppointments(userId: number) {
  const today = new Date();
  const appointments = [
    // Upcoming appointments
    {
      id: '1',
      clinicId: 1,
      clinicName: 'DentSpa Istanbul',
      clinicLogo: '/images/clinics/dentspa-logo.png',
      clinicAddress: 'Bağdat Caddesi No:123, Kadıköy, Istanbul',
      date: format(addDays(today, 5), 'yyyy-MM-dd'),
      time: '10:00',
      duration: '60',
      endTime: '11:00',
      type: 'Initial Consultation',
      status: 'confirmed',
      notes: 'Please arrive 15 minutes early to complete paperwork.',
      virtualOption: false,
      doctorName: 'Mehmet Yılmaz',
      doctorId: '1',
      directions: 'Located on the 3rd floor of the Bağdat Plaza shopping center. Public transportation available - bus stops 5 min walk away.'
    },
    {
      id: '2',
      clinicId: 2,
      clinicName: 'Beyaz Ada Dental Clinic',
      clinicLogo: '/images/clinics/beyazada-logo.png',
      clinicAddress: 'Teşvikiye Mah, Nişantaşı, Istanbul',
      date: format(addDays(today, 10), 'yyyy-MM-dd'),
      time: '14:30',
      duration: '120',
      endTime: '16:30',
      type: 'Dental Implant Procedure',
      status: 'pending',
      notes: 'First session of dental implant treatment. Please follow pre-procedure instructions.',
      virtualOption: false,
      doctorName: 'Ayşe Demir',
      doctorId: '2',
      promotionCode: 'NEWPATIENT25',
      promotionDiscount: 25
    },
    // Past appointment
    {
      id: '3',
      clinicId: 1,
      clinicName: 'DentSpa Istanbul',
      clinicLogo: '/images/clinics/dentspa-logo.png',
      clinicAddress: 'Bağdat Caddesi No:123, Kadıköy, Istanbul',
      date: format(subDays(today, 7), 'yyyy-MM-dd'),
      time: '13:00',
      duration: '30',
      endTime: '13:30',
      type: 'Virtual Consultation',
      status: 'completed',
      virtualOption: true,
      meetLink: 'https://meet.google.com/abc-defg-hij',
      doctorName: 'Mehmet Yılmaz',
      doctorId: '1'
    },
    // Cancelled appointment
    {
      id: '4',
      clinicId: 3,
      clinicName: 'Premium Dental Care',
      clinicLogo: '/images/clinics/premium-logo.png',
      clinicAddress: 'Istiklal Street, Beyoğlu, Istanbul',
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      time: '09:15',
      duration: '45',
      endTime: '10:00',
      type: 'Check-up and Cleaning',
      status: 'cancelled',
      virtualOption: false,
      doctorName: 'Ahmet Şahin',
      doctorId: '5'
    }
  ];

  return appointments;
}

// Generate sample messages for the messaging section
export function generateSampleMessages(userId: number) {
  const today = new Date();
  
  return [
    {
      conversationId: '1',
      clinicId: 1,
      clinicName: 'DentSpa Istanbul',
      clinicLogo: '/images/clinics/dentspa-logo.png',
      unreadCount: 2,
      lastMessage: {
        id: 'msg-5',
        senderId: 1,
        senderType: 'clinic',
        content: 'Do you have any other questions about your upcoming appointment?',
        timestamp: addMinutes(subDays(today, 1), -45).toISOString()
      },
      bookingId: 1
    },
    {
      conversationId: '2',
      clinicId: 2,
      clinicName: 'Beyaz Ada Dental Clinic',
      clinicLogo: '/images/clinics/beyazada-logo.png',
      unreadCount: 0,
      lastMessage: {
        id: 'msg-10',
        senderId: userId,
        senderType: 'patient',
        content: 'Thank you for the information. I will complete the pre-procedure forms.',
        timestamp: addHours(subDays(today, 3), -2).toISOString()
      },
      bookingId: 2
    }
  ];
}