import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useRoute, useLocation } from "wouter";
import EbookDownloadForm from "../components/EbookDownloadForm";
import { useState, useEffect } from "react";

// Type definition for blog posts
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  author: string;
  content?: string;
  related?: string[];
}

// Mock blog posts data - in a real app, these would come from a database or CMS
const blogPostsData: Record<string, BlogPost> = {
  "dental-tourism-istanbul": {
    id: "dental-tourism-istanbul",
    title: "10 Reasons Why Istanbul Is Perfect For Dental Treatment",
    excerpt: "Discover why thousands of patients are choosing Istanbul for their dental procedures, from cost savings to world-class clinics.",
    image: "/blog/istanbul-dental.svg",
    date: "March 28, 2024",
    category: "dental-tourism",
    author: "Dr. Sarah Johnson",
    content: `
      <h2>Introduction</h2>
      
      <p>Istanbul, the vibrant city that bridges Europe and Asia, has emerged as one of the world's leading destinations for dental tourism. With its blend of cutting-edge technology, highly qualified professionals, and significantly lower costs, it's no wonder that thousands of international patients are flocking to Istanbul for their dental treatments.</p>
      
      <p>In this comprehensive guide, we'll explore the top 10 reasons why Istanbul has become the go-to destination for everything from routine dental check-ups to complex procedures like full mouth restorations and dental implant surgery.</p>
      
      <h2>1. Significant Cost Savings Without Compromising Quality</h2>
      
      <p>Perhaps the most compelling reason to consider Istanbul for dental treatment is the remarkable cost advantage. Patients from Western Europe, the UK, and North America can save between 50-70% on dental procedures compared to their home countries. This substantial saving applies across all treatments, from basic procedures like fillings to more complex interventions such as implants, veneers, and full smile makeovers.</p>
      
      <p>For example, a single dental implant that might cost £2,500-4,000 in the UK typically costs just £600-1,000 in Istanbul. A full set of porcelain veneers could save you thousands of pounds, all while receiving treatment that meets or exceeds international standards.</p>
      
      <h2>2. World-Class Dental Facilities with Advanced Technology</h2>
      
      <p>Istanbul's leading dental clinics boast state-of-the-art facilities equipped with the latest technology. Many clinics cater specifically to international patients, offering comprehensive services under one roof:</p>
      
      <ul>
        <li>Digital X-rays and 3D imaging for precise diagnostics</li>
        <li>CAD/CAM technology for same-day restorations</li>
        <li>Computer-guided implant surgery</li>
        <li>Laser dentistry for minimally invasive procedures</li>
        <li>Digital smile design software</li>
      </ul>
      
      <p>These technological advantages mean treatments that might take weeks or months in other countries can often be completed in days in Istanbul, with equally impressive results.</p>
      
      <h2>3. Highly Qualified Dental Professionals</h2>
      
      <p>Turkish dental education is rigorous and competitive, producing dentists who are exceptionally skilled. Many dentists in Istanbul have:</p>
      
      <ul>
        <li>International training and certifications</li>
        <li>Memberships in prestigious global dental associations</li>
        <li>Specialized expertise in cosmetic dentistry, implantology, or orthodontics</li>
        <li>Extensive experience treating international patients</li>
        <li>Fluency in English and often other European languages</li>
      </ul>
      
      <p>This combination of education, experience, and international outlook ensures that patients receive care from professionals who understand both their dental needs and their expectations.</p>
      
      <h2>4. Minimal Waiting Times</h2>
      
      <p>Unlike many Western healthcare systems where waiting lists for dental care can stretch for months, Istanbul clinics typically offer immediate appointments. This efficiency extends to treatment plans as well:</p>
      
      <ul>
        <li>Consultations can usually be arranged within days of contacting a clinic</li>
        <li>Treatment can often begin immediately after consultation</li>
        <li>Multi-stage procedures are efficiently scheduled to minimize the patient's time away from home</li>
      </ul>
      
      <p>This streamlined approach is particularly valuable for international patients who want to maximize their time in Istanbul.</p>
      
      <h2>5. Comprehensive Treatment Planning</h2>
      
      <p>Istanbul's dental clinics excel at providing comprehensive care. Rather than addressing problems one by one, Turkish dentists typically offer holistic treatment plans that:</p>
      
      <ul>
        <li>Address all dental issues in a coordinated approach</li>
        <li>Prioritize long-term oral health alongside aesthetic improvements</li>
        <li>Consider the relationship between oral health and overall wellbeing</li>
        <li>Provide detailed cost estimates with no hidden fees</li>
      </ul>
      
      <p>This comprehensive approach ensures optimal results and helps patients understand the full scope of their treatment journey.</p>
      
      <h2>6. Multilingual Services and International Patient Coordinators</h2>
      
      <p>Leading dental clinics in Istanbul provide seamless service to international patients through:</p>
      
      <ul>
        <li>Dedicated international patient coordinators</li>
        <li>Staff fluent in multiple languages</li>
        <li>Translation services when needed</li>
        <li>Clear communication throughout the treatment process</li>
        <li>Assistance with practical aspects of the visit</li>
      </ul>
      
      <p>These services help overcome language barriers and ensure patients fully understand their treatment options, procedures, and aftercare instructions.</p>
      
      <h2>7. All-Inclusive Dental Tourism Packages</h2>
      
      <p>Many Istanbul clinics offer comprehensive packages for international patients that include:</p>
      
      <ul>
        <li>Airport transfers</li>
        <li>Accommodation arrangements</li>
        <li>Transportation to and from dental appointments</li>
        <li>City tours and sightseeing opportunities</li>
        <li>24/7 support during the stay</li>
      </ul>
      
      <p>These all-inclusive packages make the entire process stress-free, allowing patients to focus on their treatment and recovery while also enjoying Istanbul's cultural riches.</p>
      
      <h2>8. An Opportunity to Explore a Fascinating City</h2>
      
      <p>Combining dental treatment with tourism is a significant advantage of choosing Istanbul. Between appointments, patients can:</p>
      
      <ul>
        <li>Visit iconic sites like the Hagia Sophia and Blue Mosque</li>
        <li>Explore the Grand Bazaar and Spice Market</li>
        <li>Take a cruise on the Bosphorus</li>
        <li>Experience Turkish baths and wellness traditions</li>
        <li>Enjoy world-renowned Turkish cuisine</li>
      </ul>
      
      <p>This touristic aspect transforms a medical journey into a memorable cultural experience that many patients treasure long after their dental work is complete.</p>
      
      <h2>9. Stringent Infection Control and Safety Standards</h2>
      
      <p>Top dental clinics in Istanbul adhere to strict international standards for safety and hygiene:</p>
      
      <ul>
        <li>Sterilization protocols that meet or exceed European standards</li>
        <li>Use of single-use products where appropriate</li>
        <li>Regular inspections and certifications</li>
        <li>Transparent communication about safety measures</li>
        <li>Adherence to international best practices</li>
      </ul>
      
      <p>These high standards ensure that patients receive safe, hygienic care throughout their treatment.</p>
      
      <h2>10. Excellent Aftercare and Follow-up Services</h2>
      
      <p>Quality aftercare is a hallmark of Istanbul's dental clinics. Patients benefit from:</p>
      
      <ul>
        <li>Detailed aftercare instructions in their own language</li>
        <li>Digital follow-up consultations after returning home</li>
        <li>Long-term guarantees on treatments (often 5-10 years)</li>
        <li>Emergency contact information for any concerns</li>
        <li>Coordination with local dentists for ongoing care</li>
      </ul>
      
      <p>This commitment to long-term results gives patients confidence that their investment in dental tourism will provide lasting benefits.</p>
      
      <h2>Conclusion</h2>
      
      <p>Istanbul offers an unbeatable combination of cost savings, high-quality care, technological advancement, and cultural experience. Whether you're considering a simple cosmetic procedure or complex restorative work, the city's dental professionals provide world-class treatment in a vibrant, welcoming environment.</p>
      
      <p>As dental costs continue to rise in Western countries and waiting lists grow longer, Istanbul's appeal as a dental tourism destination only increases. By choosing Istanbul for your dental care, you're not just saving money—you're accessing some of the best dental professionals and facilities in the world while experiencing one of history's most fascinating cities.</p>
    `,
    related: ["veneers-vs-crowns", "dental-implant-myths", "istanbul-travel-guide"]
  },
  
  // Other post stubs
  "veneers-vs-crowns": {
    id: "veneers-vs-crowns",
    title: "Veneers vs. Crowns: Which Is Right For You?",
    excerpt: "Understanding the key differences between dental veneers and crowns to help you make the best choice for your smile.",
    image: "/blog/veneers-vs-crowns.svg",
    date: "March 15, 2024",
    category: "treatments",
    author: "Dr. Michael Chen"
    // Full content would be added here for a complete implementation
  },
  
  "dental-implant-myths": {
    id: "dental-implant-myths",
    title: "5 Myths About Dental Implants Debunked",
    excerpt: "Separating fact from fiction when it comes to dental implants and what you should actually expect.",
    image: "/blog/implant-myths.svg",
    date: "March 10, 2024",
    category: "treatments",
    author: "Dr. Anna Petrov"
    // Full content would be added here for a complete implementation
  },
  
  "istanbul-travel-guide": {
    id: "istanbul-travel-guide",
    title: "Patient's Travel Guide to Istanbul",
    excerpt: "Everything you need to know about traveling to Istanbul for dental treatment - from accommodations to sightseeing.",
    image: "/blog/istanbul-guide.svg",
    date: "February 25, 2024",
    category: "travel",
    author: "Maria Thompson"
    // Full content would be added here for a complete implementation
  }
};

export default function BlogPost() {
  const { t } = useTranslation();
  const [, params] = useRoute('/blog/:id');
  const [location, setLocation] = useLocation();
  const [showEbookForm, setShowEbookForm] = useState<boolean>(false);
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  
  useEffect(() => {
    // Set page title
    document.title = `Blog | MyDentalFly.com`;
    
    if (params) {
      const postId = params.id;
      if (postId && typeof postId === 'string') {
        const currentPost = blogPostsData[postId as keyof typeof blogPostsData];
        
        if (currentPost) {
          setPost(currentPost);
          // Update title with blog post title
          document.title = `${currentPost.title} | MyDentalFly.com`;
          
          // Get related posts if the current post has related posts
          if (currentPost.related && Array.isArray(currentPost.related)) {
            const related = currentPost.related
              .map((relId: string) => blogPostsData[relId as keyof typeof blogPostsData])
              .filter((p: any) => p); // Filter out any undefined posts
            setRelatedPosts(related);
          } else {
            setRelatedPosts([]);
          }
        } else {
          // Post not found, redirect to blog index
          setLocation('/blog');
        }
      }
    }
  }, [params, setLocation]);
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="w-full h-64 md:h-96 bg-gray-200 relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(`Failed to load image: ${post.image}`);
              const target = e.target as HTMLImageElement;
              // Generate a SVG placeholder with the post title instead of using external placeholder service
              const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
                  <rect width="1200" height="600" fill="#f3f4f6"/>
                  <text x="600" y="300" font-family="Arial" font-size="24" fill="#4b5563" text-anchor="middle" dominant-baseline="middle">${post.title}</text>
                </svg>
              `;
              const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
              target.src = URL.createObjectURL(svgBlob);
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="container mx-auto px-4 py-8">
              <div className="text-white">
                <span className="bg-primary-600 text-white text-xs uppercase px-3 py-1 rounded-full mb-2 inline-block">
                  {post.category}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-4xl mb-2">
                  {post.title}
                </h1>
                <div className="flex items-center gap-2 text-sm">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Article content */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 mb-8 font-medium">
                  {post.excerpt}
                </p>
                
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              
              {/* Author info */}
              <div className="border-t border-gray-200 mt-12 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random`}
                      alt={post.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('blog.writtenBy')}</div>
                    <div className="font-medium">{post.author}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* E-book download promo */}
              <div className="bg-primary-50 p-6 rounded-xl mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-bold text-lg">{t('blog.ebook.title')}</h3>
                </div>
                
                <p className="text-gray-700 text-sm mb-4">
                  {t('blog.ebook.description')}
                </p>
                
                <Button 
                  onClick={() => setShowEbookForm(true)} 
                  className="w-full"
                >
                  {t('blog.ebook.button')}
                </Button>
              </div>
              
              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">{t('blog.relatedPosts')}</h3>
                  <div className="space-y-4">
                    {relatedPosts.map(related => (
                      <div key={related.id} className="group">
                        <Link href={`/blog/${related.id}`} className="flex gap-3">
                          <div className="w-20 h-20 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                            <img 
                              src={related.image} 
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              onError={(e) => {
                                console.error(`Failed to load related image: ${related.image}`);
                                const target = e.target as HTMLImageElement;
                                // Generate a SVG placeholder with a dental icon
                                const svg = `
                                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
                                    <rect width="80" height="80" fill="#f3f4f6"/>
                                    <path d="M40,20 C35,15 30,15 25,25 C20,35 20,45 25,55 C30,65 35,65 40,60 C45,65 50,65 55,55 C60,45 60,35 55,25 C50,15 45,15 40,20 Z" fill="#d1d5db"/>
                                  </svg>
                                `;
                                const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
                                target.src = URL.createObjectURL(svgBlob);
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                              {related.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {related.date}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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