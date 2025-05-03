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
      slug: "blog/dental-implants",
      image: "/images/treatments/illustrations/dental-implants1.png",
      excerpt: "Everything you need to know about dental implants, including types, procedures, costs, and what to expect during recovery. Learn why so many patients choose Turkey for affordable, high-quality implant treatments.",
      author: "Dr. Robert Johnson",
      publishDate: "April 20, 2025"
    }
  ];
  
  // Recent blog posts
  const recentPosts: BlogPostProps[] = [
    {
      title: "Comparing Veneers and Crowns",
      slug: "blog/veneers",
      image: "/images/treatments/illustrations/veneers-and-crowns.png",
      excerpt: "A comprehensive comparison of dental veneers and crowns to help you understand the benefits, limitations, and costs of each option.",
      author: "Dr. Michael Chen",
      publishDate: "April 18, 2025"
    },
    {
      title: "The Hollywood Smile Treatment",
      slug: "blog/hollywood-smile",
      image: "/images/treatments/illustrations/hollywood-smile.png",
      excerpt: "Learn about the Hollywood Smile procedure and how it combines multiple treatments to create that perfect celebrity smile.",
      author: "Dr. Emily Taylor",
      publishDate: "April 15, 2025"
    },
    {
      title: "Full Mouth Reconstruction",
      slug: "blog/full-mouth",
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
      <section className="bg-[#003b95] py-10">
        <div className="container mx-auto px-4">
          {/* Simplified header */}
          <div className="space-y-4">
            <h1 className="text-white text-3xl md:text-4xl font-bold">
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