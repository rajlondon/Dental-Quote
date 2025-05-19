import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const router = express.Router();

// Get all clinics
router.get('/', async (req, res) => {
  try {
    // Read clinics from the JSON file
    const clinicsFilePath = path.join(process.cwd(), 'data', 'clinics.json');
    
    if (fs.existsSync(clinicsFilePath)) {
      const clinicsData = JSON.parse(fs.readFileSync(clinicsFilePath, 'utf8'));
      return res.json(clinicsData);
    }
    
    // Fallback to default clinics if file doesn't exist
    return res.json([
      {
        id: "1",
        name: "DentSpa Istanbul",
        logo: "/images/clinic-logos/dentspa.png",
        city: "Istanbul",
        country: "Turkey",
        ratings: {
          overall: 4.8,
          cleanliness: 4.9,
          staff: 4.7,
          communication: 4.6,
          value: 4.9,
          location: 4.5
        },
        features: [
          "International Patient Department",
          "Multilingual Staff",
          "Hotel Arrangements",
          "Free WiFi",
          "Wheelchair Access",
          "Translation Services"
        ],
        specialties: [
          "Dental Implants",
          "Cosmetic Dentistry",
          "Full Mouth Restoration",
          "Veneers"
        ],
        description: "DentSpa Istanbul is a premier dental clinic specializing in cosmetic and restorative treatments with state-of-the-art facilities and experienced doctors."
      },
      {
        id: "2",
        name: "Maltepe Dental Clinic",
        logo: "/images/clinic-logos/maltepe.png",
        city: "Istanbul",
        country: "Turkey",
        ratings: {
          overall: 4.6,
          cleanliness: 4.8,
          staff: 4.5,
          communication: 4.4,
          value: 4.7,
          location: 4.8
        },
        features: [
          "International Patient Department",
          "Multilingual Staff",
          "Airport Pickup",
          "Free WiFi",
          "Translation Services"
        ],
        specialties: [
          "Dental Implants",
          "Veneers",
          "Hollywood Smile",
          "Teeth Whitening"
        ],
        description: "Maltepe Dental Clinic offers comprehensive dental treatments in a comfortable setting with personalized care for international patients."
      },
      {
        id: "3",
        name: "Beyaz Ada Dental",
        logo: "/images/clinic-logos/beyazada.png",
        city: "Istanbul",
        country: "Turkey",
        ratings: {
          overall: 4.7,
          cleanliness: 4.8,
          staff: 4.9,
          communication: 4.5,
          value: 4.8,
          location: 4.6
        },
        features: [
          "International Patient Department",
          "Multilingual Staff",
          "Hotel Arrangements",
          "Airport Pickup",
          "Free WiFi",
          "Translation Services"
        ],
        specialties: [
          "Dental Implants",
          "Zirconium Crowns",
          "Veneers",
          "Root Canal Treatment"
        ],
        description: "Beyaz Ada Dental is a trusted name in dental tourism, providing high-quality treatments with the latest technology and exceptional patient care."
      },
      {
        id: "4",
        name: "Istanbul Dental Smile",
        logo: "/images/clinic-logos/istanbuldentalsmile.png",
        city: "Istanbul",
        country: "Turkey",
        ratings: {
          overall: 4.9,
          cleanliness: 5.0,
          staff: 4.8,
          communication: 4.9,
          value: 4.7,
          location: 4.9
        },
        features: [
          "International Patient Department",
          "Multilingual Staff",
          "Luxury Hotel Arrangements",
          "Private Airport Pickup",
          "Free WiFi",
          "24/7 Support Line",
          "Translation Services"
        ],
        specialties: [
          "Dental Implants",
          "Hollywood Smile",
          "Full Mouth Restoration",
          "Zirconium Crowns",
          "Digital Smile Design"
        ],
        description: "Istanbul Dental Smile offers a premium dental tourism experience with a focus on cosmetic and restorative treatments in a luxury setting."
      },
      {
        id: "5",
        name: "MedicaGo Dental",
        logo: "/images/clinic-logos/medicago.png",
        city: "Antalya",
        country: "Turkey",
        ratings: {
          overall: 4.5,
          cleanliness: 4.7,
          staff: 4.6,
          communication: 4.3,
          value: 4.8,
          location: 4.7
        },
        features: [
          "International Patient Department",
          "Multilingual Staff",
          "Hotel Arrangements",
          "Airport Pickup",
          "Free WiFi",
          "Translation Services"
        ],
        specialties: [
          "Dental Implants",
          "Veneers",
          "Teeth Whitening",
          "Orthodontics"
        ],
        description: "MedicaGo Dental combines affordable prices with high-quality treatments in the beautiful coastal city of Antalya, perfect for those wanting to combine dental care with a beach vacation."
      }
    ]);
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return res.status(500).json({ error: 'Failed to fetch clinics data' });
  }
});

// Get a specific clinic by ID
router.get('/:id', async (req, res) => {
  try {
    const clinicId = req.params.id;
    
    // Read clinics from the JSON file
    const clinicsFilePath = path.join(process.cwd(), 'data', 'clinics.json');
    let clinics = [];
    
    if (fs.existsSync(clinicsFilePath)) {
      clinics = JSON.parse(fs.readFileSync(clinicsFilePath, 'utf8'));
    } else {
      // Fallback to default clinics if file doesn't exist
      clinics = [
        {
          id: "1",
          name: "DentSpa Istanbul",
          logo: "/images/clinic-logos/dentspa.png",
          city: "Istanbul",
          country: "Turkey",
          ratings: {
            overall: 4.8,
            cleanliness: 4.9,
            staff: 4.7,
            communication: 4.6,
            value: 4.9,
            location: 4.5
          },
          features: [
            "International Patient Department",
            "Multilingual Staff",
            "Hotel Arrangements",
            "Free WiFi",
            "Wheelchair Access",
            "Translation Services"
          ],
          technology: [
            "Digital X-Rays",
            "3D CBCT Scanner",
            "CAD/CAM Technology",
            "Intraoral Scanners",
            "Laser Dentistry",
            "Digital Smile Design"
          ],
          specialties: [
            "Dental Implants",
            "Cosmetic Dentistry",
            "Full Mouth Restoration",
            "Veneers"
          ],
          description: "DentSpa Istanbul is a premier dental clinic specializing in cosmetic and restorative treatments with state-of-the-art facilities and experienced doctors.",
          doctors: [
            {
              name: "Dr. Ahmet Yılmaz",
              title: "Implantologist & Cosmetic Dentist",
              photo: "/images/doctors/doctor1.jpg",
              specialties: ["Dental Implants", "Cosmetic Dentistry"],
              qualifications: [
                "DDS - Istanbul University",
                "PhD in Oral Implantology",
                "15+ years of experience"
              ]
            },
            {
              name: "Dr. Leyla Kaya",
              title: "Prosthodontist",
              photo: "/images/doctors/doctor2.jpg",
              specialties: ["Prosthodontics", "Full Mouth Reconstruction"],
              qualifications: [
                "DDS - Ankara University",
                "Specialist in Prosthodontics",
                "12+ years of experience"
              ]
            }
          ]
        },
        {
          id: "2",
          name: "Maltepe Dental Clinic",
          logo: "/images/clinic-logos/maltepe.png",
          city: "Istanbul",
          country: "Turkey",
          ratings: {
            overall: 4.6,
            cleanliness: 4.8,
            staff: 4.5,
            communication: 4.4,
            value: 4.7,
            location: 4.8
          },
          features: [
            "International Patient Department",
            "Multilingual Staff",
            "Airport Pickup",
            "Free WiFi",
            "Translation Services"
          ],
          technology: [
            "Digital X-Rays",
            "3D CBCT Scanner",
            "CAD/CAM Technology",
            "Intraoral Scanners"
          ],
          specialties: [
            "Dental Implants",
            "Veneers",
            "Hollywood Smile",
            "Teeth Whitening"
          ],
          description: "Maltepe Dental Clinic offers comprehensive dental treatments in a comfortable setting with personalized care for international patients.",
          doctors: [
            {
              name: "Dr. Mehmet Kara",
              title: "Cosmetic Dentist",
              photo: "/images/doctors/doctor3.jpg",
              specialties: ["Veneers", "Hollywood Smile"],
              qualifications: [
                "DDS - Ege University",
                "Certificate in Advanced Cosmetic Dentistry",
                "10+ years of experience"
              ]
            }
          ]
        },
        {
          id: "3",
          name: "Beyaz Ada Dental",
          logo: "/images/clinic-logos/beyazada.png",
          city: "Istanbul",
          country: "Turkey",
          ratings: {
            overall: 4.7,
            cleanliness: 4.8,
            staff: 4.9,
            communication: 4.5,
            value: 4.8,
            location: 4.6
          },
          features: [
            "International Patient Department",
            "Multilingual Staff",
            "Hotel Arrangements",
            "Airport Pickup",
            "Free WiFi",
            "Translation Services"
          ],
          technology: [
            "Digital X-Rays",
            "3D CBCT Scanner",
            "CAD/CAM Technology",
            "Intraoral Scanners",
            "Laser Dentistry"
          ],
          specialties: [
            "Dental Implants",
            "Zirconium Crowns",
            "Veneers",
            "Root Canal Treatment"
          ],
          description: "Beyaz Ada Dental is a trusted name in dental tourism, providing high-quality treatments with the latest technology and exceptional patient care.",
          doctors: [
            {
              name: "Dr. Selin Arslan",
              title: "Endodontist & Implantologist",
              photo: "/images/doctors/doctor4.jpg",
              specialties: ["Root Canal Treatment", "Dental Implants"],
              qualifications: [
                "DDS - Marmara University",
                "Specialist in Endodontics",
                "14+ years of experience"
              ]
            },
            {
              name: "Dr. Emre Demir",
              title: "Prosthodontist",
              photo: "/images/doctors/doctor5.jpg",
              specialties: ["Zirconium Crowns", "Veneers"],
              qualifications: [
                "DDS - Istanbul University",
                "MS in Prosthodontics",
                "8+ years of experience"
              ]
            }
          ]
        },
        {
          id: "4",
          name: "Istanbul Dental Smile",
          logo: "/images/clinic-logos/istanbuldentalsmile.png",
          city: "Istanbul",
          country: "Turkey",
          ratings: {
            overall: 4.9,
            cleanliness: 5.0,
            staff: 4.8,
            communication: 4.9,
            value: 4.7,
            location: 4.9
          },
          features: [
            "International Patient Department",
            "Multilingual Staff",
            "Luxury Hotel Arrangements",
            "Private Airport Pickup",
            "Free WiFi",
            "24/7 Support Line",
            "Translation Services"
          ],
          technology: [
            "Digital X-Rays",
            "3D CBCT Scanner",
            "CAD/CAM Technology",
            "Intraoral Scanners",
            "Laser Dentistry",
            "Digital Smile Design",
            "Dental Microscope"
          ],
          specialties: [
            "Dental Implants",
            "Hollywood Smile",
            "Full Mouth Restoration",
            "Zirconium Crowns",
            "Digital Smile Design"
          ],
          description: "Istanbul Dental Smile offers a premium dental tourism experience with a focus on cosmetic and restorative treatments in a luxury setting.",
          doctors: [
            {
              name: "Dr. Can Öztürk",
              title: "Cosmetic & Implant Dentist",
              photo: "/images/doctors/doctor6.jpg",
              specialties: ["Dental Implants", "Hollywood Smile"],
              qualifications: [
                "DDS - Hacettepe University",
                "PhD in Implant Dentistry",
                "Fellowship in Aesthetic Dentistry - USA",
                "18+ years of experience"
              ]
            },
            {
              name: "Dr. Ayşe Yıldız",
              title: "Prosthodontist & Smile Designer",
              photo: "/images/doctors/doctor7.jpg",
              specialties: ["Digital Smile Design", "Full Mouth Restoration"],
              qualifications: [
                "DDS - Gazi University",
                "MS in Prosthodontics",
                "Certificate in Digital Smile Design",
                "15+ years of experience"
              ]
            },
            {
              name: "Dr. Ali Kaya",
              title: "Oral Surgeon",
              photo: "/images/doctors/doctor8.jpg",
              specialties: ["Dental Implants", "Bone Grafting"],
              qualifications: [
                "DDS - Istanbul University",
                "Specialist in Oral Surgery",
                "12+ years of experience"
              ]
            }
          ]
        },
        {
          id: "5",
          name: "MedicaGo Dental",
          logo: "/images/clinic-logos/medicago.png",
          city: "Antalya",
          country: "Turkey",
          ratings: {
            overall: 4.5,
            cleanliness: 4.7,
            staff: 4.6,
            communication: 4.3,
            value: 4.8,
            location: 4.7
          },
          features: [
            "International Patient Department",
            "Multilingual Staff",
            "Hotel Arrangements",
            "Airport Pickup",
            "Free WiFi",
            "Translation Services"
          ],
          technology: [
            "Digital X-Rays",
            "3D CBCT Scanner",
            "CAD/CAM Technology",
            "Intraoral Scanners"
          ],
          specialties: [
            "Dental Implants",
            "Veneers",
            "Teeth Whitening",
            "Orthodontics"
          ],
          description: "MedicaGo Dental combines affordable prices with high-quality treatments in the beautiful coastal city of Antalya, perfect for those wanting to combine dental care with a beach vacation.",
          doctors: [
            {
              name: "Dr. Berk Aydın",
              title: "General & Cosmetic Dentist",
              photo: "/images/doctors/doctor9.jpg",
              specialties: ["Dental Implants", "Veneers"],
              qualifications: [
                "DDS - Ege University",
                "Certificate in Implant Dentistry",
                "9+ years of experience"
              ]
            },
            {
              name: "Dr. Zeynep Kılıç",
              title: "Orthodontist",
              photo: "/images/doctors/doctor10.jpg",
              specialties: ["Orthodontics", "Clear Aligners"],
              qualifications: [
                "DDS - Ankara University",
                "MS in Orthodontics",
                "7+ years of experience"
              ]
            }
          ]
        }
      ];
    }
    
    // Find the clinic with the matching ID
    const clinic = clinics.find(c => c.id === clinicId);
    
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    
    return res.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return res.status(500).json({ error: 'Failed to fetch clinic data' });
  }
});

export default router;