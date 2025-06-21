The code will be modified to include the ConsistentPageHeader component in the BlogPage, replacing the Navbar and adding a blue banner style.
```

```replit_final_file
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import ConsistentPageHeader from '@/components/ConsistentPageHeader';
import Footer from '@/components/Footer';
import { useLocation } from 'wouter';
import { 
  Plane as PlaneIcon, 
  Home,
  Star,
  Users,
  Search
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
  const [location, setLocation] = useLocation();

  const blogPosts: BlogPostProps[] = [
    {
      title: "How MyDentalFly.com Works",
      slug: "blog/how-it-works",
      image: "/images/treatments/illustrations/mydentalfly-works.png",
      excerpt: "Your complete guide to affordable, high-quality dental treatment in Istanbul with our full-service concierge experience.",
      author: "MyDentalFly Team",
      publishDate: "April 24, 2025"
    },
    {
      title: "The Complete Guide to Dental Implants",
      slug: "dental-implants",
      image: "/images/treatments/illustrations/dental-implants1.png",
      excerpt: "Everything you need to know about dental implants, including types, procedures, costs, and what to expect during recovery.",
      author: "Dr. Sarah Johnson",
      publishDate: "April 20, 2025"
    },
    {
      title: "Comparing Veneers and Crowns: Which is Right for You?",
      slug: "veneers",
      image: "/images/treatments/illustrations/veneers-and-crowns.png",
      excerpt: "A comprehensive comparison of dental veneers and crowns to help you understand the benefits, limitations, and costs of each option.",
      author: "Dr. Michael Chen",
      publishDate: "April 18, 2025"
    },
    {
      title: "The Hollywood Smile: Transform Your Appearance",
      slug: "hollywood-smile",
      image: "/images/treatments/illustrations/hollywood-smile.png",
      excerpt: "Learn about the Hollywood Smile procedure and how it combines multiple treatments to create that perfect celebrity smile.",
      author: "Dr. Emily Taylor",
      publishDate: "April 15, 2025"
    },
    {
      title: "Full Mouth Reconstruction: A New Beginning",
      slug: "full-mouth",
      image: "/images/treatments/illustrations/full-mouth-reconstruction.png",
      excerpt: "Discover how full mouth reconstruction can address multiple dental issues and completely restore your oral health and appearance.",
      author: "Dr. James Wilson",
      publishDate: "April 10, 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsistentPageHeader
        title="MyDentalFly Blog"
        subtitle="Expert insights on dental treatments, Istanbul travel tips, and patient stories"
        showBackButton={true}
        backButtonText="Back to Home"
        onBack={() => setLocation('/')}
      />

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
                      className="w-full h-56 object-cover bg-[#f8f9fa]"
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

export default BlogPage;