import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { 
  ArrowRight,
  Home,
  Star
} from "lucide-react";

interface BlogPostProps {
  title: string;
  slug: string;
  image: string;
  excerpt: string;
  author: string;
  publishDate: string;
}

const NewBlogPage: React.FC = () => {
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
      
      {/* Hero Section with Blue Background */}
      <section className="bg-[#003b95] py-8">
        <div className="container mx-auto px-4">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-6 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0">
            <Link href="/" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link href="/how-it-works" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              How It Works
            </Link>
            <Link href="/clinics" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Clinics
            </Link>
            <Link href="/dental-chart" className="flex items-center text-white opacity-70 hover:opacity-100 whitespace-nowrap pb-2 px-1 text-sm">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 12.5l1.5 2.5l1.5-2.5M7 20c0-4 4-4 4-8a4 4 0 10-8 0c0 4 4 4 4 8z" />
                <path d="M17 12.5l1.5 2.5l1.5-2.5M17 20c0-4 4-4 4-8a4 4 0 10-8 0c0 4 4 4 4 8z" />
              </svg>
              Dental Chart
            </Link>
            <Link href="/blog" className="flex items-center text-white opacity-90 hover:opacity-100 whitespace-nowrap border-b-2 border-white pb-2 px-1 text-sm font-medium">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
              </svg>
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
      </section>
      
      {/* Trust bar */}
      <div className="container mx-auto px-4 mt-3">
        <div className="max-w-5xl mx-auto text-center text-[11px] text-gray-500 flex flex-wrap items-center justify-center">
          <span className="flex items-center">35+ informative articles</span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500 mr-0.5" />
            Expert dental information
          </span>
          <span className="mx-2">•</span>
          <span>Updated monthly</span>
        </div>
      </div>
      
      <main className="flex-grow">
        {/* Blog Articles */}
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
                  <Link href={`/${post.slug}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />
                  </Link>
                  <div className="p-6">
                    <Link href={`/${post.slug}`}>
                      <h2 className="font-bold text-xl mb-3 text-primary hover:text-primary/80">{post.title}</h2>
                    </Link>
                    <p className="text-neutral-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <span>{post.author}</span>
                      <span>{post.publishDate}</span>
                    </div>
                    <Link href={`/${post.slug}`} className="mt-4 inline-block text-[#0071c2] font-medium hover:underline">
                      Read more →
                    </Link>
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
              <Link href="/your-quote" className="inline-block bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-3 px-6 rounded-lg">
                Get Your Free Quote
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewBlogPage;