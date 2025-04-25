import React from "react";
import { Link } from "wouter";
import { Mail, Phone, Facebook, Instagram, Twitter, Send, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gradient-to-b from-blue-900 to-blue-950 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          <div className="lg:col-span-2">
            <div className="flex flex-col space-y-4 mb-6">
              <Link href="/">
                <div className="inline-block w-fit cursor-pointer">
                  <img 
                    src="/images/my-dental-fly-logo.png" 
                    alt="MyDentalFly Logo" 
                    className="h-10 w-auto"
                  />
                </div>
              </Link>
              <p className="text-blue-200 text-sm md:text-base leading-relaxed">
                MyDentalFly connects patients with top-rated dental clinics in Turkey, offering up to 70% savings compared to UK costs with the peace of mind of verified, quality care.
              </p>
            </div>
            
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/how-it-works"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">How It Works</span></Link></li>
              <li><Link href="/your-quote"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Get a Quote</span></Link></li>
              <li><Link href="/team"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Our Team</span></Link></li>
              <li><Link href="/faq"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">FAQs</span></Link></li>
              <li><a href="/blog" onClick={(e) => { e.preventDefault(); window.location.href = "/blog"; }}><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Blog</span></a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Treatments</h4>
            <ul className="space-y-3">
              <li><Link href="/your-quote?treatment=veneers"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Veneers</span></Link></li>
              <li><Link href="/your-quote?treatment=dental-implants"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Dental Implants</span></Link></li>
              <li><Link href="/your-quote?treatment=hollywood-smile"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Hollywood Smile</span></Link></li>
              <li><Link href="/your-quote?treatment=crowns"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Crowns & Bridges</span></Link></li>
              <li><Link href="/your-quote?treatment=whitening"><span className="text-blue-200 hover:text-white transition-colors cursor-pointer text-sm">Teeth Whitening</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-300 mt-0.5" />
                <a href="mailto:info@mydentalfly.com" className="text-blue-200 hover:text-white transition-colors text-sm">info@mydentalfly.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-300 mt-0.5" />
                <a href="tel:+447572445856" className="text-blue-200 hover:text-white transition-colors text-sm">+44 7572 445856</a>
              </li>
              <li className="flex items-start gap-3">
                <Send className="w-5 h-5 text-blue-300 mt-0.5" />
                <a href="https://wa.me/447572445856" className="text-blue-200 hover:text-white transition-colors text-sm">WhatsApp Chat</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-300 mt-0.5" />
                <span className="text-blue-200 text-sm">London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-800 pt-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} MyDentalFly. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              <Link href="/privacy-policy"><span className="text-blue-400 hover:text-white text-sm transition-colors cursor-pointer">Privacy Policy</span></Link>
              <Link href="/terms-of-service"><span className="text-blue-400 hover:text-white text-sm transition-colors cursor-pointer">Terms of Service</span></Link>
              <Link href="/cookies-policy"><span className="text-blue-400 hover:text-white text-sm transition-colors cursor-pointer">Cookie Policy</span></Link>
              <Link href="/clinics"><span className="text-blue-400 hover:text-white text-sm transition-colors cursor-pointer">For Clinics</span></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
