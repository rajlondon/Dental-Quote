import React, { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "clinics",
    question: "How do you select the dental clinics and doctors in your network?",
    answer: "We have a rigorous vetting process specifically for dental clinics that includes verifying dental certifications, conducting site visits, reviewing past dental patient outcomes, and performing regular quality checks. We only partner with dental facilities that meet international standards and have consistent positive reviews from international patients."
  },
  {
    id: "quality",
    question: "What is the quality of dental materials used in Istanbul clinics?",
    answer: "Our partner dental clinics use the same high-quality, internationally-certified materials as those used in Europe and North America. This includes premium implant brands, porcelain for veneers and crowns, and the latest composite materials. We can provide detailed information about the specific brands and materials used for your treatment."
  },
  {
    id: "complications",
    question: "What happens if there are complications after my dental treatment?",
    answer: "All of our partner dental clinics provide guarantees for their work, typically ranging from 5-10 years depending on the procedure. In the rare case of complications, we coordinate with the clinic for necessary follow-up care. We also help arrange virtual consultations with your dentist after returning home, and can facilitate communication with local dentists for minor adjustments if needed."
  },
  {
    id: "language",
    question: "Do I need to speak Turkish to get dental treatment in Istanbul?",
    answer: "No, all our partner dental clinics have English-speaking staff, and we provide translation services as needed. Your dental concierge will accompany you to all dental appointments to ensure clear communication between you and your dental providers."
  },
  {
    id: "stay",
    question: "How long should I plan to stay in Istanbul for my dental treatment?",
    answer: "For most dental treatments, we recommend planning a 5-7 day stay in Istanbul. Simple procedures like professional cleaning or basic fillings may require just 1-2 days, while more complex work like full mouth rehabilitation with implants might require 7-10 days or multiple visits. We'll provide a detailed timeline based on your specific dental treatment plan."
  },
  {
    id: "payments",
    question: "How do payments work for dental treatments?",
    answer: "We use a secure payment system where you pay directly. We typically require a 20% deposit to secure your booking, with 40% paid upon arrival at the dental clinic and the remaining 40% after successful completion of your treatment. This payment structure helps ensure quality service and gives you added protection."
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleFAQ = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="faqs" className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Dental Treatment FAQs</h2>
          <p className="text-neutral-600">Find answers to common questions about dental treatments in Istanbul and our concierge services.</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item) => (
            <div key={item.id} className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
              <button 
                className="w-full text-left p-5 flex justify-between items-center focus:outline-none" 
                onClick={() => toggleFAQ(item.id)}
              >
                <h3 className="font-display font-semibold text-lg">{item.question}</h3>
                <i className={`fas fa-chevron-down text-primary transition-transform ${openItems[item.id] ? 'rotate-180' : ''}`}></i>
              </button>
              <div className={`px-5 pb-5 pt-0 ${openItems[item.id] ? 'block' : 'hidden'}`}>
                <p className="text-neutral-600">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-neutral-600 mb-4">Don't see your question? Contact us directly:</p>
          <a href="mailto:info@healthmatchistanbul.com" className="text-primary hover:underline font-medium">info@healthmatchistanbul.com</a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
