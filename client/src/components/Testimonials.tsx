import React from "react";
import dentalLogo from "@assets/image_1743447435671.png";

interface Testimonial {
  id: string;
  quote: string;
  image: string;
  name: string;
  treatment: string;
  country: string;
}

// Instead of using external random user images that might not load,
// we'll use our dental logo as a placeholder
const defaultAvatar = dentalLogo;

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "This dental concierge service took all the stress out of finding a reliable clinic. The dental veneers I had done in Istanbul were exceptional—half the price I was quoted at home with even better quality and service.",
    image: defaultAvatar,
    name: "Maria S.",
    treatment: "Dental Veneers",
    country: "Germany"
  },
  {
    id: "2",
    quote: "My dental implant procedure in Istanbul was seamless from start to finish. The clinic was state-of-the-art, the dentists were highly skilled, and the aftercare was excellent. I saved over €4,000 compared to prices back home.",
    image: defaultAvatar,
    name: "Thomas K.",
    treatment: "Dental Implants",
    country: "UK"
  },
  {
    id: "3",
    quote: "I was nervous about getting my smile makeover abroad, but this service made everything easy. They arranged everything from airport transfers to accommodation, and my new smile looks absolutely amazing. The dentists were true artists.",
    image: defaultAvatar,
    name: "Sophie L.",
    treatment: "Hollywood Smile",
    country: "France"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Dental Treatment Success Stories</h2>
          <p className="text-neutral-600">Don't just take our word for it. Here's what our clients have to say about their dental treatment experience in Istanbul.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-neutral-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-secondary">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="italic text-neutral-700 mb-4">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full mr-4 bg-sky-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-8 h-8 object-contain" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500">{testimonial.treatment} • From {testimonial.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
