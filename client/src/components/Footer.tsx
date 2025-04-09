import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
          <div className="md:col-span-1">
            <div className="flex flex-col space-y-2 mb-4">
              <Link href="/">
                <div className="bg-white p-3 rounded-md inline-block w-fit cursor-pointer">
                  <img 
                    src="/images/istanbul-dental-smile-logo.png" 
                    alt="Istanbul Dental Smile Logo" 
                    className="h-16 w-auto"
                  />
                </div>
              </Link>
            </div>
            <p className="text-neutral-400 mb-4">Your trusted concierge for premium dental treatments in Istanbul, offering quality care at transparent, affordable prices.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary transition-colors"><i className="fab fa-instagram"></i></a>
              <a href="https://wa.me/447572445856" target="_blank" rel="noopener noreferrer" className="text-white hover:text-secondary transition-colors"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Dental Services</h4>
            <ul className="space-y-2">
              <li><Link href="/"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Dental Veneers</span></Link></li>
              <li><Link href="/"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Dental Implants</span></Link></li>
              <li><Link href="/"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Hollywood Smile</span></Link></li>
              <li><Link href="/"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Crowns & Bridges</span></Link></li>
              <li><Link href="/"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Teeth Whitening</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/team"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Our Team</span></Link></li>
              <li><Link href="/how-it-works"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">How It Works</span></Link></li>
              <li><a href="/#testimonials" className="text-neutral-400 hover:text-white transition-colors">Client Reviews</a></li>
              <li><Link href="/faq"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">FAQs</span></Link></li>
              <li><Link href="/blog"><span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">Blog</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-envelope text-secondary mt-1 mr-3"></i>
                <a href="mailto:info@istanbuldentalsmile.co.uk" className="text-neutral-400 hover:text-white transition-colors">info@istanbuldentalsmile.co.uk</a>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt text-secondary mt-1 mr-3"></i>
                <a href="tel:+447572445856" className="text-neutral-400 hover:text-white transition-colors">+44 7572 445856</a>
              </li>
              <li className="flex items-start">
                <i className="fab fa-whatsapp text-secondary mt-1 mr-3"></i>
                <a href="https://wa.me/447572445856" className="text-neutral-400 hover:text-white transition-colors">WhatsApp Chat</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Istanbul Dental Smile. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/"><span className="text-neutral-500 hover:text-white text-sm transition-colors cursor-pointer">Privacy Policy</span></Link>
              <Link href="/"><span className="text-neutral-500 hover:text-white text-sm transition-colors cursor-pointer">Terms of Service</span></Link>
              <Link href="/"><span className="text-neutral-500 hover:text-white text-sm transition-colors cursor-pointer">Cookie Policy</span></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
