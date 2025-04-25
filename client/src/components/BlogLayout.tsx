import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface BlogHeroProps {
  title: string;
  subtitle?: string;
  coverImage: string;
  authorName?: string;
  authorImage?: string;
  publishDate?: string;
}

interface BlogLayoutProps {
  children: ReactNode;
  hero: BlogHeroProps;
  relatedPosts?: {
    title: string;
    slug: string;
    image: string;
    excerpt: string;
  }[];
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ children, hero, relatedPosts = [] }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pb-20 pt-20 bg-gray-900 text-white">
        <div className="absolute inset-0 z-0 opacity-50">
          <img
            src={hero.coverImage}
            alt={hero.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-90"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Blog</span>
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{hero.title}</h1>
          
          {hero.subtitle && (
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mb-6">
              {hero.subtitle}
            </p>
          )}
          
          <div className="flex items-center mt-6">
            {hero.authorImage && (
              <img
                src={hero.authorImage}
                alt={hero.authorName || "Author"}
                className="h-10 w-10 rounded-full mr-3 border-2 border-white/20"
              />
            )}
            
            <div>
              {hero.authorName && (
                <div className="flex items-center text-white/90 text-sm">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span>{hero.authorName}</span>
                </div>
              )}
              
              {hero.publishDate && (
                <div className="flex items-center text-white/70 text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{hero.publishDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose lg:prose-lg max-w-none">
            {children}
          </div>
          
          {/* Blog CTA */}
          <div className="my-12 bg-blue-50 border border-blue-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Looking for affordable dental treatment options abroad?
            </h3>
            <p className="text-gray-600 mb-4">
              Get a personalized quote from top-rated clinics in Turkey and save up to 70% compared to UK prices.
            </p>
            <Link href="/your-quote" className="inline-block bg-[#0071c2] hover:bg-[#00487a] text-white font-bold py-2 px-4 rounded">
              Get a Free Quote
            </Link>
          </div>
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="text-[#0071c2] font-medium hover:underline text-sm">
                      Read more
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogLayout;