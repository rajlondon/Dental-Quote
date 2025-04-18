import React from "react";
import userMaleAvatar from "../assets/user-male-enhanced.svg";
import userFemaleAvatar from "../assets/user-female-enhanced.svg";

interface Testimonial {
  id: string;
  quote: string;
  image: string;
  name: string;
  treatment: string;
  country: string;
  gender: "male" | "female";
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "This dental concierge service took all the stress out of finding a reliable clinic. The dental veneers I had done in Istanbul were exceptional—half the price I was quoted at home with even better quality and service.",
    image: userFemaleAvatar,
    name: "Maria S.",
    treatment: "Dental Veneers",
    country: "Germany",
    gender: "female"
  },
  {
    id: "2",
    quote: "My dental implant procedure in Istanbul was seamless from start to finish. The clinic was state-of-the-art, the dentists were highly skilled, and the aftercare was excellent. I saved over £3,500 compared to prices back home.",
    image: userMaleAvatar,
    name: "Thomas K.",
    treatment: "Dental Implants",
    country: "UK",
    gender: "male"
  },
  {
    id: "3",
    quote: "I was nervous about getting my smile makeover abroad, but this service made everything easy. They arranged everything from airport transfers to accommodation, and my new smile looks absolutely amazing. The dentists were true artists.",
    image: userFemaleAvatar,
    name: "Sophie L.",
    treatment: "Hollywood Smile",
    country: "France",
    gender: "female"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-sky-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">
            Happy Smiles, Real Stories
          </h2>
          <div className="h-1 w-20 bg-primary-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-neutral-600">Don't just take our word for it. Here's what our clients have to say about their dental treatment experience in Istanbul.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-100 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="relative mb-6">
                <svg className="absolute top-0 left-0 w-8 h-8 text-gray-200 transform -translate-x-6 -translate-y-6 opacity-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
                  <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
                </svg>
                <p className="italic text-neutral-700 mb-4">{testimonial.quote}</p>
              </div>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full mr-4 shadow-sm flex items-center justify-center overflow-hidden border-2 border-sky-100">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500">
                    <span className="text-primary-600 font-medium">{testimonial.treatment}</span> • From {testimonial.country}
                  </p>
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
