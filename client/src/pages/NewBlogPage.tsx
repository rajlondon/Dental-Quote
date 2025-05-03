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
  // Featured blog posts
  const featuredPosts: BlogPostProps[] = [
    {
      title: "How MyDentalFly.com Works",
      slug: "blog/how-it-works",
      image: "/images/treatments/illustrations/mydentalfly-works.png",
      excerpt: "Your complete guide to affordable, high-quality dental treatment in Istanbul with our full-service concierge experience. Learn how we connect you with top-rated clinics, handle your travel arrangements, and provide support throughout your dental journey.",
      author: "MyDentalFly Team",
      publishDate: "April 24, 2025"
    },
    {
      title: "The Complete Guide to Dental Implants",
      slug: "dental-implants",
      image: "/images/treatments/illustrations/dental-implants1.png",
      excerpt: "Everything you need to know about dental implants, including types, procedures, costs, and what to expect during recovery. Learn why so many patients choose Turkey for affordable, high-quality implant treatments.",
      author: "Dr. Sarah Johnson",
      publishDate: "April 20, 2025"
    }
  ];
  
  // Recent blog posts
  const recentPosts: BlogPostProps[] = [
    {
      title: "Comparing Veneers and Crowns",
      slug: "veneers",
      image: "/images/treatments/illustrations/veneers-and-crowns.png",
      excerpt: "A comprehensive comparison of dental veneers and crowns to help you understand the benefits, limitations, and costs of each option.",
      author: "Dr. Michael Chen",
      publishDate: "April 18, 2025"
    },
    {
      title: "The Hollywood Smile Treatment",
      slug: "hollywood-smile",
      image: "/images/treatments/illustrations/hollywood-smile.png",
      excerpt: "Learn about the Hollywood Smile procedure and how it combines multiple treatments to create that perfect celebrity smile.",
      author: "Dr. Emily Taylor",
      publishDate: "April 15, 2025"
    },
    {
      title: "Full Mouth Reconstruction",
      slug: "full-mouth",
      image: "/images/treatments/illustrations/full-mouth-reconstruction.png",
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
        {/* Featured Posts Section */}
        <section className="w-full bg-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-10 text-gray-900">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <div key={index} className="blog-card bg-white rounded-xl overflow-hidden shadow-lg h-full border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <Link href={`/${post.slug}`} className="block relative">
                    <div className="absolute top-4 left-4 bg-[#0071c2] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {index === 0 ? "FEATURED" : "POPULAR"}
                    </div>
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-64 object-contain bg-[#f8f9fa]"
                    />
                  </Link>
                  <div className="p-8">
                    <Link href={`/${post.slug}`}>
                      <h2 className="font-bold text-2xl mb-3 text-gray-900 hover:text-[#0071c2] transition-colors">{post.title}</h2>
                    </Link>
                    <p className="text-gray-600 mb-4 text-base">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 mt-4 border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <span>{post.author}</span>
                      </div>
                      <span>{post.publishDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
          
        {/* Recent Posts Section */}
        <section className="w-full bg-gray-50 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-10 text-gray-900">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post, index) => (
                <div key={index} className="blog-card bg-white rounded-xl overflow-hidden shadow-md h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <Link href={`/${post.slug}`}>
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-56 object-contain bg-[#f8f9fa]"
                    />
                  </Link>
                  <div className="p-6">
                    <Link href={`/${post.slug}`}>
                      <h2 className="font-bold text-xl mb-3 text-gray-900 hover:text-[#0071c2] transition-colors">{post.title}</h2>
                    </Link>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                      <span>{post.publishDate}</span>
                      <Link href={`/${post.slug}`} className="inline-flex items-center text-[#0071c2] font-medium hover:underline">
                        Read more
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-blue-50 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#003b95] to-[#0071c2] rounded-xl p-8 text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Smile?</h2>
                  <p className="text-blue-100 max-w-xl">
                    Get your personalized quote today and save up to 70% on high-quality dental treatment in Istanbul with our trusted network of clinics.
                  </p>
                </div>
                <Link href="/your-quote" className="whitespace-nowrap bg-white hover:bg-blue-50 text-[#003b95] font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1">
                  Get Your Free Quote
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewBlogPage;