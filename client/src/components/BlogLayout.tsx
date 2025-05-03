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
      <div className="w-full bg-white pt-8">
        <div className="container mx-auto max-w-5xl">
          <Link href="/blog" className="inline-flex items-center text-[#0071c2] hover:text-[#003b95] mb-4 ml-4 md:ml-0">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Blog</span>
          </Link>
          
          <div className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 px-4 md:px-0">{hero.title}</h1>
            
            {hero.subtitle && (
              <p className="text-lg text-gray-600 max-w-3xl mb-5 px-4 md:px-0">
                {hero.subtitle}
              </p>
            )}

            <div className="flex items-center mb-6 px-4 md:px-0">
              {hero.authorName && (
                <div className="flex items-center text-gray-600 text-sm mr-6">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span>{hero.authorName}</span>
                </div>
              )}
              
              {hero.publishDate && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{hero.publishDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full mb-10 px-4 md:px-0">
            <img
              src={hero.coverImage}
              alt={hero.title}
              className="w-full max-h-[500px] object-cover rounded-lg shadow-md"
            />
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
                    className="w-full h-48 object-cover rounded-t-lg"
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