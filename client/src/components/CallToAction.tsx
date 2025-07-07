import React from "react";
import { useLocation } from "wouter";

const CallToAction: React.FC = () => {
  const [location, navigate] = useLocation();

  const handleGetQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/your-quote');
  };

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Ready to Transform Your Health & Beauty Journey?</h2>
        <p className="text-white/90 text-lg max-w-3xl mx-auto mb-8">Get personalized options from Istanbul's top clinics at a fraction of European prices—with our full concierge support every step of the way.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleGetQuote}
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-neutral-100 transition-colors"
          >
            Get Your Free Quote
          </button>
          <a href="mailto:info@healthmatchistanbul.com" className="inline-block bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">Contact Us Directly</a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
```

```jsx
import React from "react";
import { useLocation } from "wouter";

const CallToAction: React.FC = () => {
  const [location, navigate] = useLocation();

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Ready to Transform Your Health & Beauty Journey?</h2>
        <p className="text-white/90 text-lg max-w-3xl mx-auto mb-8">Get personalized options from Istanbul's top clinics at a fraction of European prices—with our full concierge support every step of the way.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#quote-form" className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-neutral-100 transition-colors" onClick={() => navigate('/your-quote')}>Get Your Free Quote</a>
          <a href="mailto:info@healthmatchistanbul.com" className="inline-block bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">Contact Us Directly</a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
```

```python
import React from "react";
import { useLocation } from "wouter";

const CallToAction: React.FC = () => {
  const [location, navigate] = useLocation();

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Ready to Transform Your Health & Beauty Journey?</h2>
        <p className="text-white/90 text-lg max-w-3xl mx-auto mb-8">Get personalized options from Istanbul's top clinics at a fraction of European prices—with our full concierge support every step of the way.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#quote-form"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-neutral-100 transition-colors"
            onClick={() => navigate("/your-quote")}
          >
            Get Your Free Quote
          </a>
          <a
            href="mailto:info@healthmatchistanbul.com"
            className="inline-block bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            Contact Us Directly
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;