import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";

const teamMembers = [
  {
    id: "raj-singh",
    name: "Raj Singh",
    role: "Managing Director",
    bio: `Raj Singh founded MyDentalFly.com after years of helping people navigate healthcare decisions across the UK. Born to Scottish parents and raised in Glasgow, Raj later moved to London where he worked in wills and estate planning, as well as the hair, dental care, and back pain sectors. He holds a BA in Legal Services from Glasgow Caledonian University.

A true people person at heart, Raj's mission is to make dental travel feel effortless, safe, and rewarding. He personally visits and vets every clinic in Istanbul that the company partners with, ensuring clients receive only the highest standards of quality, hygiene, and care.

Raj is based between London and Istanbul and speaks English, Hindi, Punjabi, and basic Turkish.`,
    image: "/images/team/raj.jpg",
    languages: ["English", "Hindi", "Punjabi", "Basic Turkish"],
    contactEmail: "rajsingh140186@googlemail.com"
  },
  {
    id: "destina-yasar",
    name: "Destina Yasar",
    role: "Chief Patient Coordinator",
    bio: `Destina Yasar oversees all patient coordination at MyDentalFly.com, ensuring seamless experiences from initial inquiry to post-treatment care. Born and raised in Istanbul, Destina brings invaluable local knowledge and cultural understanding to the team.

With a background in healthcare administration and tourism management, Destina excels at creating personalized treatment plans that consider both clinical needs and travel preferences. Her warm, empathetic approach has helped hundreds of international patients navigate their dental tourism journey with confidence.

Destina is fluent in Turkish, English, and German, making her the perfect liaison between international patients and Istanbul's top dental professionals.`,
    image: "/images/team/destina.jpg",
    languages: ["Turkish", "English", "German"],
    contactEmail: "destina@mydentalfly.com"
  }
];

export default function TeamPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>Meet Our Team | MyDentalFly.com</title>
        <meta name="description" content="Meet the MyDentalFly.com team - dedicated professionals committed to providing exceptional dental tourism experiences in Istanbul, Turkey." />
      </Helmet>
      
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-primary">Our Team</h1>
              <div className="h-1 w-32 bg-secondary mx-auto my-6"></div>
              <p className="text-lg text-neutral-600">
                Our experienced team is dedicated to providing exceptional dental tourism experiences, connecting you with Istanbul's top clinics while offering personalized support every step of the way.
              </p>
            </div>
          </div>
        </section>
        
        {/* Team Members */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-16">
              {teamMembers.map(member => (
                <div key={member.id} className="flex flex-col md:flex-row items-start gap-12">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="rounded-lg overflow-hidden shadow-md bg-neutral-100" style={{ maxWidth: "450px" }}>
                      <OptimizedImage 
                        src={member.image}
                        alt={member.name}
                        className="w-full h-auto object-cover"
                        style={{ aspectRatio: "1/1" }}
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-3xl font-bold text-primary mb-2">{member.name} - {member.role}</h2>
                    <div className="h-1 w-20 bg-secondary mb-6"></div>
                    
                    <div className="mb-6 space-y-4 text-neutral-700">
                      {member.bio.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {member.languages.map(language => (
                        <span key={language} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {language}
                        </span>
                      ))}
                    </div>
                    
                    <a 
                      href={`mailto:${member.contactEmail}`} 
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {member.contactEmail}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team Values */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Our Core Values</h2>
              <p className="text-lg text-neutral-600">
                These principles guide everything we do at MyDentalFly.com, from patient interactions to clinic partnerships.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Trust & Transparency</h3>
                <p className="text-neutral-700">
                  We provide complete transparency in pricing, treatment options, and clinic credentials, ensuring you can make informed decisions with confidence.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Quality Assurance</h3>
                <p className="text-neutral-700">
                  We partner only with clinics that meet our rigorous standards for facilities, hygiene, technology, and patient outcomes.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Personalized Care</h3>
                <p className="text-neutral-700">
                  Each patient receives a customized experience tailored to their dental needs, budget, travel preferences, and cultural background.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">Let's Start Your Dental Journey Together</h2>
              <p className="text-lg text-neutral-700 mb-8">
                Our team is ready to answer your questions and help you plan your dental treatment in Istanbul.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/pricing"
                  className="py-3 px-6 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-center"
                >
                  Get a Free Quote
                </a>
                <a
                  href="mailto:info@mydentalfly.com"
                  className="py-3 px-6 rounded-lg bg-white border border-primary text-primary hover:bg-primary/5 transition-colors text-center"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}