import React, { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "clinics",
    question: "How do you select the clinics and doctors in your network?",
    answer: "We have a rigorous vetting process that includes verifying certifications, conducting site visits, reviewing past patient outcomes, and performing regular quality checks. We only partner with facilities that meet international standards and have consistent positive reviews from international patients."
  },
  {
    id: "complications",
    question: "What happens if there are complications after my treatment?",
    answer: "All of our partner clinics provide guarantees for their work. In the rare case of complications, we coordinate with the clinic for necessary follow-up care. We can also help arrange virtual consultations with your provider after returning home. Additionally, we offer optional medical travel insurance that covers unexpected complications."
  },
  {
    id: "language",
    question: "Do I need to speak Turkish to get treatment in Istanbul?",
    answer: "No, all our partner clinics have English-speaking staff, and we provide translation services as needed. Your HealthMatch concierge will accompany you to important appointments to ensure clear communication between you and your healthcare providers."
  },
  {
    id: "payments",
    question: "How do payments work?",
    answer: "We use a secure payment system where you pay HealthMatch directly. We typically require a 20% deposit to secure your booking, with 40% paid upon arrival at the clinic and the remaining 40% after successful completion of your treatment. This payment structure helps ensure quality service and gives you added protection."
  },
  {
    id: "stay",
    question: "How long should I plan to stay in Istanbul for my treatment?",
    answer: "The required stay depends on your specific treatment. Dental work may require 5-7 days, hair transplants typically 3-4 days, and more complex procedures may require 7-14 days. We'll provide detailed guidance based on your specific treatment plan and help optimize your schedule for both treatment and recovery."
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
          <h2 className="font-display font-bold text-3xl md:text-4xl text-neutral-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-neutral-600">Find answers to common questions about our services and medical travel to Istanbul.</p>
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
