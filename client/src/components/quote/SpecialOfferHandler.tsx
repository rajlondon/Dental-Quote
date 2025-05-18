import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFlaskIntegration } from '@/hooks/use-flask-integration';
import { useLocation } from 'wouter';

interface SpecialOfferHandlerProps {
  children: React.ReactNode;
}

/**
 * This component detects special offer parameters in the URL
 * and handles the flow to direct users through the quiz, dental chart,
 * and pre-fill package selection
 */
export function SpecialOfferHandler({ children }: SpecialOfferHandlerProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { promoCode } = useAutoApplyCode();
  const { isInitialized, api } = useFlaskIntegration();
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startQuiz, setStartQuiz] = useState(false);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [packageName, setPackageName] = useState<string | null>(null);

  // Extract parameters from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      
      // Get package info if available
      const pkgId = params.get('packageId');
      const pkgName = params.get('packageName');
      const shouldStartQuiz = params.get('startQuiz') === 'true';
      
      if (pkgId) {
        console.log('📦 Package ID detected:', pkgId);
        setPackageId(pkgId);
        
        if (pkgName) {
          setPackageName(decodeURIComponent(pkgName));
        }
        
        // If startQuiz is true, we should automatically start the quiz
        if (shouldStartQuiz) {
          console.log('🔄 Auto-starting quiz flow');
          setStartQuiz(true);
        }

        // Show notification for better user experience
        toast({
          title: 'Special Offer Selected',
          description: `Preparing your ${pkgName ? decodeURIComponent(pkgName) : 'selected'} package`,
          duration: 3000,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      setLoading(false);
    }
  }, [toast]);

  // If we have a package ID, fetch package details
  useEffect(() => {
    if (!isInitialized || !packageId) return;
    
    const fetchPackageDetails = async () => {
      try {
        console.log('🔍 Fetching package details for:', packageId);
        const response = await api.getTreatmentPackage(packageId);
        
        if (response.success && response.data) {
          console.log('✅ Package details retrieved:', response.data);
          setPackageInfo(response.data);
        } else {
          console.error('❌ Failed to get package details:', response.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching package details:', error);
      }
    };
    
    fetchPackageDetails();
  }, [isInitialized, packageId, api]);

  // Start quiz flow if needed
  useEffect(() => {
    if (startQuiz && packageId && isInitialized) {
      // Store package info in session storage for retrieval after quiz
      if (packageInfo) {
        sessionStorage.setItem('selectedPackage', JSON.stringify(packageInfo));
      } else {
        sessionStorage.setItem('pendingPackageId', packageId);
        if (packageName) {
          sessionStorage.setItem('pendingPackageName', packageName);
        }
      }
      
      // Store promo code for retrieval after quiz
      if (promoCode) {
        sessionStorage.setItem('pendingPromoCode', promoCode);
      }
      
      // Redirect to dental quiz
      console.log('🚀 Starting quiz flow with package:', packageId);
      navigate('/dental-quiz?returnToQuote=true');
    }
  }, [startQuiz, packageId, packageInfo, promoCode, packageName, isInitialized, navigate]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // If we detected a package but startQuiz is false, show info alert
  if (packageId && !startQuiz) {
    return (
      <div className="space-y-4">
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Package className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Special offer package <span className="font-medium">{packageName || packageId}</span> will be automatically applied.
            {promoCode && (
              <> Promo code <span className="font-medium">{promoCode}</span> will also be applied.</>
            )}
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Otherwise just render children
  return <>{children}</>;
}