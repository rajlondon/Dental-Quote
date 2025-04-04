import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import EbookDownloadForm from "../components/EbookDownloadForm";

// Mock blog post data
const blogPosts = [
  {
    id: "dental-tourism-istanbul",
    title: "10 Reasons Why Istanbul Is Perfect For Dental Treatment",
    excerpt: "Discover why thousands of patients are choosing Istanbul for their dental procedures, from cost savings to world-class clinics.",
    image: "/blog/istanbul-dental.svg",
    date: "March 28, 2024",
    category: "dental-tourism",
    featured: true
  },
  {
    id: "veneers-vs-crowns",
    title: "Veneers vs. Crowns: Which Is Right For You?",
    excerpt: "Understanding the key differences between dental veneers and crowns to help you make the best choice for your smile.",
    image: "/blog/veneers-vs-crowns.svg",
    date: "March 15, 2024",
    category: "treatments"
  },
  {
    id: "dental-implant-myths",
    title: "5 Myths About Dental Implants Debunked",
    excerpt: "Separating fact from fiction when it comes to dental implants and what you should actually expect.",
    image: "/blog/implant-myths.svg",
    date: "March 10, 2024",
    category: "treatments"
  },
  {
    id: "istanbul-travel-guide",
    title: "Patient's Travel Guide to Istanbul",
    excerpt: "Everything you need to know about traveling to Istanbul for dental treatment - from accommodations to sightseeing.",
    image: "/blog/istanbul-guide.svg",
    date: "February 25, 2024",
    category: "travel"
  }
];

export default function Blog() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showEbookForm, setShowEbookForm] = useState<boolean>(false);
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${t('blog.title')} | Istanbul Dental Smile`;
  }, [t]);

  // Filter posts by category
  const filteredPosts = activeCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section with free ebook CTA */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t('blog.title')}
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  {t('blog.subtitle')}
                </p>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{t('blog.ebook.title')}</h3>
                    <p className="text-sm text-gray-600">{t('blog.ebook.subtitle')}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {t('blog.ebook.description')}
                </p>
                
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{t('blog.ebook.benefit1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{t('blog.ebook.benefit2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{t('blog.ebook.benefit3')}</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => setShowEbookForm(true)} 
                  className="w-full"
                >
                  {t('blog.ebook.button')}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured post */}
        {featuredPost && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('blog.featuredPost')}
                </h2>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-auto bg-gray-200">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load featured image: ${featuredPost.image}`);
                        const target = e.target as HTMLImageElement;
                        // Generate a SVG placeholder with the post title
                        const svg = `
                          <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
                            <rect width="600" height="400" fill="#f3f4f6"/>
                            <text x="300" y="200" font-family="Arial" font-size="20" fill="#4b5563" text-anchor="middle" dominant-baseline="middle">${featuredPost.title}</text>
                          </svg>
                        `;
                        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
                        target.src = URL.createObjectURL(svgBlob);
                      }}
                    />
                  </div>
                  
                  <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-primary-600 font-semibold mb-1">
                      {featuredPost.date}
                    </div>
                    <Link href={`/blog/${featuredPost.id}`} className="block mt-1 text-2xl font-semibold text-gray-900 hover:text-primary-600 transition">
                      {featuredPost.title}
                    </Link>
                    <p className="mt-4 text-gray-600">
                      {featuredPost.excerpt}
                    </p>
                    <Link href={`/blog/${featuredPost.id}`} className="mt-6 inline-flex items-center text-primary-600 hover:text-primary-700">
                      {t('blog.readMore')}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Blog post listing */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('blog.latestPosts')}
              </h2>
              
              <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full max-w-lg mx-auto">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="all">{t('blog.categories.all')}</TabsTrigger>
                  <TabsTrigger value="dental-tourism">{t('blog.categories.dentalTourism')}</TabsTrigger>
                  <TabsTrigger value="treatments">{t('blog.categories.treatments')}</TabsTrigger>
                  <TabsTrigger value="travel">{t('blog.categories.travel')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      onError={(e) => {
                        console.error(`Failed to load post image: ${post.image}`);
                        const target = e.target as HTMLImageElement;
                        // Generate a SVG placeholder with a dental icon
                        const svg = `
                          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                            <rect width="400" height="300" fill="#f3f4f6"/>
                            <g transform="translate(160, 100)">
                              <path d="M40,0 C35,-5 30,-5 25,5 C20,15 20,25 25,35 C30,45 35,45 40,40 C45,45 50,45 55,35 C60,25 60,15 55,5 C50,-5 45,-5 40,0 Z" fill="#d1d5db"/>
                            </g>
                            <text x="200" y="200" font-family="Arial" font-size="16" fill="#4b5563" text-anchor="middle" dominant-baseline="middle">${post.title.substring(0, 25)}${post.title.length > 25 ? '...' : ''}</text>
                          </svg>
                        `;
                        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
                        target.src = URL.createObjectURL(svgBlob);
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="text-xs text-gray-500 mb-2">
                      {post.date}
                    </div>
                    <Link href={`/blog/${post.id}`} className="block text-xl font-semibold text-gray-900 hover:text-primary-600 transition mb-2">
                      {post.title}
                    </Link>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <Link href={`/blog/${post.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                      {t('blog.readMore')}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* E-book download modal */}
      {showEbookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full relative">
            <button 
              onClick={() => setShowEbookForm(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {t('blog.ebook.downloadTitle')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('blog.ebook.downloadDescription')}
              </p>
              
              <EbookDownloadForm onSuccess={() => setShowEbookForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}