import React from "react";

interface Testimonial {
  id: string;
  quote: string;
  image: string;
  name: string;
  treatment: string;
  country: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "HealthMatch took all the stress out of finding a reliable clinic. The dental work I had done in Istanbul was exceptional—half the price I was quoted at home with even better quality.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    name: "Maria S.",
    treatment: "Dental Veneers",
    country: "Germany"
  },
  {
    id: "2",
    quote: "From airport pickup to my final check-up, everything was perfectly organized. My hair transplant results are incredible, and the entire experience felt more like a luxury holiday than a medical trip.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Thomas K.",
    treatment: "Hair Transplant",
    country: "UK"
  },
  {
    id: "3",
    quote: "As someone who was nervous about having medical treatment abroad, HealthMatch was exactly what I needed. They answered all my questions, arranged everything, and the results of my laser eye surgery have been life-changing.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Sophie L.",
    treatment: "Laser Eye Surgery",
    country: "France"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Client Success Stories</h2>
          <p className="text-neutral-600">Don't just take our word for it. Here's what our clients have to say about their experience.</p>
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
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4" 
                />
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
