import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { 
  Plane as PlaneIcon, 
  Search,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface BlogPostProps {
  title: string;
  slug: string;
  image: string;
  excerpt: string;
  author: string;
  publishDate: string;
}

const BlogPage: React.FC = () => {
  const blogPosts: BlogPostProps[] = [
    {
      title: "How MyDentalFly.com Works",
      slug: "blog/how-it-works",
      image: "/images/clinics/dentgroup.jpg",
      excerpt: "Your complete guide to affordable, high-quality dental treatment in Istanbul with our full-service concierge experience.",
      author: "MyDentalFly Team",
      publishDate: "April 24, 2025"
    },
    {
      title: "The Complete Guide to Dental Implants",
      slug: "dental-implants",
      image: "/images/treatments/implants.jpg",
      excerpt: "Everything you need to know about dental implants, including types, procedures, costs, and what to expect during recovery.",
      author: "Dr. Sarah Johnson",
      publishDate: "April 20, 2025"
    },
    {
      title: "Comparing Veneers and Crowns: Which is Right for You?",
      slug: "veneers",
      image: "/images/treatments/veneers.jpg",
      excerpt: "A comprehensive comparison of dental veneers and crowns to help you understand the benefits, limitations, and costs of each option.",
      author: "Dr. Michael Chen",
      publishDate: "April 18, 2025"
    },
    {
      title: "The Hollywood Smile: Transform Your Appearance",
      slug: "hollywood-smile",
      image: "/images/treatments/hollywood.jpg",
      excerpt: "Learn about the Hollywood Smile procedure and how it combines multiple treatments to create that perfect celebrity smile.",
      author: "Dr. Emily Taylor",
      publishDate: "April 15, 2025"
    },
    {
      title: "Full Mouth Reconstruction: A New Beginning",
      slug: "full-mouth",
      image: "/images/treatments/fullmouth.jpg",
      excerpt: "Discover how full mouth reconstruction can address multiple dental issues and completely restore your oral health and appearance.",
      author: "Dr. James Wilson",
      publishDate: "April 10, 2025"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section - Styled like HeroSimple */}
      <section className="relative pb-12 overflow-hidden">
        {/* Booking.com style dark blue background */}
        <div className="bg-[#003b95] pb-8 pt-8">
          <div className="container mx-auto px-4">
            {/* Service navigation tabs - Booking.com style */}
            <div className="flex items-center space-x-6 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0">
              <Link href="/dental-implants" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 20.668v-6.667M17 20.668v-6.667M7 14.001h10M12 7.334v6.667M9.5 3.334C9.5 2.597 10.12 2 10.888 2h2.224c.768 0 1.388.597 1.388 1.334 0 .736-.62 1.333-1.388 1.333h-2.224c-.768 0-1.388-.597-1.388-1.333z" />
                </svg>
                Dental Implants
              </Link>
              <Link href="/veneers" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12c0-3.771 0-5.657 1.172-6.828C4.343 4 6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172C22 6.343 22 8.229 22 12c0 3.771 0 5.657-1.172 6.828C19.657 20 17.771 20 14 20h-4c-3.771 0-5.657 0-6.828-1.172C2 17.657 2 15.771 2 12z" />
                  <path d="M12 4v16" />
                </svg>
                Veneers & Crowns
              </Link>
              <Link href="/hollywood-smile" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7.5 12c0 1-1.795 2-4 2-1 0-1.5-.5-1.5-1.5S2 9.962 2 8.5C2 4.962 4.5 3 7.5 3s4.5 2 4.5 4.5M16.5 12c0 1 1.795 2 4 2 1 0 1.5-.5 1.5-1.5s0-2.538 0-4C22 4.962 19.5 3 16.5 3s-4.5 2-4.5 4.5M21 16c-.5 1.5-2.477 3-5.5 3-2.5 0-4.5-1.105-5.5-3-1 1.895-3 3-5.5 3-3.023 0-5-1.5-5.5-3" />
                </svg>
                Hollywood Smile
              </Link>
              <Link href="/full-mouth" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19v-1a4 4 0 00-4-4h-1M2 19v-1a4 4 0 014-4h1M13 5a4 4 0 11-8 0 4 4 0 018 0zm9 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Full Mouth Reconstruction
              </Link>
              <Link href="/blog" className="flex items-center text-white opacity-90 hover:opacity-100 whitespace-nowrap border-b-2 border-white pb-2 px-1 text-sm font-medium">
                <BookOpen className="h-5 w-5 mr-2" />
                Blog
              </Link>
            </div>
      
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
                Dental Tourism Blog
              </h1>
              <p className="text-white text-sm md:text-base">
                Expert advice, guides, and information about dental treatments abroad. Discover everything you need to know about dental procedures, costs, and what to expect.
              </p>
            </div>
            
            {/* CTA Button */}
            <Link href="/your-quote" className="inline-flex items-center bg-white text-[#0071c2] hover:bg-gray-100 font-bold py-2 px-4 rounded-lg shadow mb-4">
              Get Your Free Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {/* Trust bar (optional) */}
        <div className="container mx-auto px-4 mt-3">
          <div className="max-w-5xl mx-auto text-center text-[11px] text-gray-500 flex flex-wrap items-center justify-center">
            <span className="flex items-center">35+ informative articles</span>
            <span className="mx-2">•</span>
            <span className="flex items-center">Expert dental information</span>
            <span className="mx-2">•</span>
            <span>Updated monthly</span>
          </div>
        </div>
      </section>
      
      <main className="flex-grow">
        {/* Blog Articles */}
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
                  <a href={`/${post.slug}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />
                  </a>
                  <div className="p-6">
                    <a href={`/${post.slug}`}>
                      <h2 className="font-bold text-xl mb-3 text-primary hover:text-primary/80">{post.title}</h2>
                    </a>
                    <p className="text-neutral-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <span>{post.author}</span>
                      <span>{post.publishDate}</span>
                    </div>
                    <a href={`/${post.slug}`} className="mt-4 inline-block text-[#0071c2] font-medium hover:underline">
                      Read more →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-8 border border-blue-100">
              <h2 className="text-2xl font-bold mb-4 text-primary">Ready to Start Your Dental Journey?</h2>
              <p className="text-lg text-neutral-700 mb-6">
                Get your personalized quote today and save up to 70% on high-quality dental treatment in Istanbul.
              </p>
              <a href="/your-quote" className="inline-block bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-3 px-6 rounded-lg">
                Get Your Free Quote
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPage;