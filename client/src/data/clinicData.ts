import { ClinicInfo } from "@/types/quote";

export const CLINIC_DATA: ClinicInfo[] = [
  {
    id: "istanbul-dental-care",
    name: "Istanbul Dental Care",
    tier: "affordable",
    priceGBP: 1700,
    priceUSD: 2190,
    location: "Şişli, Istanbul",
    rating: 4.7,
    guarantee: "5 years",
    materials: ["Standard implants", "E.max crowns", "Quality materials"],
    conciergeType: "ids",
    specialties: ["Implants", "Cosmetic Dentistry", "General Dentistry"],
    features: [
      "Modern equipment",
      "English-speaking staff",
      "City center location",
      "Transparent pricing",
      "Airport Transfer"
    ],
    description: "A reliable clinic with a focus on affordability without compromising on quality. Their team of skilled dentists provides excellent care in a comfortable environment."
  },
  {
    id: "dentgroup-istanbul",
    name: "DentGroup Istanbul",
    tier: "mid",
    priceGBP: 2100,
    priceUSD: 2700,
    location: "Nişantaşı, Istanbul",
    rating: 4.9,
    guarantee: "7 years",
    materials: ["Premium implants", "Zirconia crowns", "High-grade materials"],
    conciergeType: "ids",
    specialties: ["Implants", "Cosmetic Dentistry", "Orthodontics", "Oral Surgery"],
    features: [
      "Award-winning clinic",
      "Multilingual staff",
      "Luxury location",
      "VIP treatment options",
      "Complimentary consultations",
      "Airport Transfer",
      "Hotel Partnership"
    ],
    description: "A prestigious dental center with an excellent reputation for treating international patients. Their expert team uses cutting-edge technology to deliver exceptional results."
  },
  {
    id: "maltepe-dental-clinic",
    name: "Maltepe Dental Clinic",
    tier: "premium",
    priceGBP: 2500,
    priceUSD: 3220,
    location: "Maltepe, Istanbul",
    rating: 5.0,
    guarantee: "10 years",
    materials: ["Premium Swiss implants", "Full-ceramic restorations", "Top-tier materials"],
    conciergeType: "clinic",
    specialties: ["Implants", "Cosmetic Dentistry", "Orthodontics", "Oral Surgery", "Periodontics"],
    features: [
      "Celebrity-choice clinic",
      "Exclusive private care",
      "Advanced technology",
      "Luxury patient experience",
      "Door-to-door service",
      "Extended warranties",
      "Express Treatment",
      "Airport Transfer",
      "Hotel Partnership",
      "Tour Guide"
    ],
    description: "The premium choice for those seeking the absolute best in dental care. This exclusive clinic offers unparalleled service, the most advanced treatments, and a truly luxurious experience."
  }
];