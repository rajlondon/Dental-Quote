import { useState, useEffect } from 'react';

// Custom hook to parse search params from the URL
const useSearchParams = () => {
  const getParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };
  
  const [searchParams] = useState(getParams());
  
  return [searchParams];
};

// Define package data interface for better type safety
interface PackageData {
  id: string;
  clinicId: string;
  title: string;
}

interface UsePackageDetectionProps {
  source?: string;
  setSource?: (source: string) => void;
  packageId?: string;
  setPackageId?: (id: string) => void;
  clinicId?: string;
  setClinicId?: (id: string) => void;
  isPackageFlow?: boolean;
}

export function usePackageDetection({
  source,
  setSource,
  packageId,
  setPackageId,
  clinicId,
  setClinicId,
  isPackageFlow
}: UsePackageDetectionProps = {}) {
  const [searchParams] = useSearchParams();
  const [packageData, setPackageData] = useState<PackageData | null>(null);

  // Run this effect once on component mount
  useEffect(() => {
    console.log("Initializing package data from all possible sources");
    
    // First check URL parameters for packageId and package JSON params
    const packageIdFromUrl = searchParams.get('packageId');
    const packageJsonFromUrl = searchParams.get('package');
    
    console.log("Package info from URL:", {
      packageId: packageIdFromUrl,
      packageJsonExists: !!packageJsonFromUrl,
      clinicId: searchParams.get('clinicId'),
      source: searchParams.get('source')
    });
    
    // Try to read package from special "package" JSON parameter first
    if (packageJsonFromUrl) {
      try {
        // The 'package' parameter contains a JSON string with complete package details
        const packageInfo = JSON.parse(decodeURIComponent(packageJsonFromUrl));
        console.log("Successfully parsed package JSON from URL param:", packageInfo);
        
        // Save it to multiple storages for maximum availability
        sessionStorage.setItem('activePackage', JSON.stringify(packageInfo));
        sessionStorage.setItem('pendingPackage', JSON.stringify(packageInfo));
        localStorage.setItem('selectedPackage', JSON.stringify(packageInfo));
        
        // Also save it to the treatment plan format for compatibility
        sessionStorage.setItem('pendingTreatmentPlan', JSON.stringify({
          id: `package-${packageInfo.id}`,
          packageId: packageInfo.id,
          clinicId: packageInfo.clinicId,
          treatments: [{
            treatmentType: 'treatment-package',
            name: packageInfo.title,
            packageId: packageInfo.id
          }]
        }));
        
        setPackageData(packageInfo);
        return;
      } catch (error) {
        console.error("Error parsing package JSON from URL:", error);
      }
    }
    
    // If there's a package ID in the URL parameters, create a package object
    if (packageIdFromUrl) {
      console.log("Package parameters found in URL parameters:");
      console.log("- Package ID:", packageIdFromUrl);
      console.log("- Clinic ID:", searchParams.get('clinicId'));
      console.log("- Package Title:", searchParams.get('packageTitle'));
      
      const packageInfo = {
        id: packageIdFromUrl,
        clinicId: searchParams.get('clinicId') || '',
        title: searchParams.get('packageTitle') || 'Treatment Package'
      };
      
      console.log("Created package data from URL params:", packageInfo);
      
      // Save to multiple storage locations for redundancy
      sessionStorage.setItem('activePackage', JSON.stringify(packageInfo));
      localStorage.setItem('selectedPackage', JSON.stringify(packageInfo));
      
      // Also save as a treatment plan for compatibility with treatment builder
      sessionStorage.setItem('pendingTreatmentPlan', JSON.stringify({
        id: `package-${packageInfo.id}`,
        packageId: packageInfo.id,
        clinicId: packageInfo.clinicId,
        treatments: [{
          treatmentType: 'treatment-package',
          name: packageInfo.title,
          packageId: packageInfo.id
        }]
      }));
      
      setPackageData(packageInfo);
      return;
    }
    
    // If not in URL, check localStorage first (most recent)
    const storedPackageLS = localStorage.getItem('selectedPackage');
    if (storedPackageLS) {
      try {
        const packageInfo = JSON.parse(storedPackageLS);
        console.log("Retrieved package from localStorage:", packageInfo);
        
        // Sync it to sessionStorage as well
        sessionStorage.setItem('activePackage', JSON.stringify(packageInfo));
        
        setPackageData(packageInfo);
        return;
      } catch (error) {
        console.error("Error parsing package from localStorage:", error);
      }
    }
    
    // Then check sessionStorage
    const storedPackage = sessionStorage.getItem('activePackage');
    if (storedPackage) {
      try {
        const packageInfo = JSON.parse(storedPackage);
        console.log("Retrieved package from sessionStorage:", packageInfo);
        setPackageData(packageInfo);
        return;
      } catch (error) {
        console.error("Error parsing package from sessionStorage:", error);
      }
    }
    
    // Also check for pendingPackage which may happen when redirected after login
    const pendingPackageData = sessionStorage.getItem('pendingPackage');
    if (pendingPackageData) {
      try {
        const packageInfo = JSON.parse(pendingPackageData);
        console.log("Found pendingPackage in sessionStorage:", packageInfo);
        
        // Convert to the right format
        const formattedPackage = {
          id: packageInfo.id,
          title: packageInfo.title || packageInfo.name || 'Treatment Package',
          clinicId: packageInfo.clinicId || ''
        };
        
        // Store it to other locations but don't remove yet
        sessionStorage.setItem('activePackage', JSON.stringify(formattedPackage));
        localStorage.setItem('selectedPackage', JSON.stringify(formattedPackage));
        
        console.log("Converted pendingPackage to activePackage:", formattedPackage);
        setPackageData(formattedPackage);
        return;
      } catch (error) {
        console.error("Error parsing pendingPackage from sessionStorage:", error);
      }
    }
    
    // Finally check for treatment plan data that might contain package info
    const pendingTreatmentPlan = sessionStorage.getItem('pendingTreatmentPlan');
    if (pendingTreatmentPlan) {
      try {
        const planData = JSON.parse(pendingTreatmentPlan);
        console.log("Found pendingTreatmentPlan in sessionStorage:", planData);
        
        // Check if this is a package-based treatment plan
        if (planData.packageId || (planData.treatments && planData.treatments.some((t: any) => t.packageId))) {
          const packageId = planData.packageId || planData.treatments.find((t: any) => t.packageId)?.packageId;
          const packageTitle = planData.treatments?.find((t: any) => t.packageId)?.name || 'Treatment Package';
          
          if (packageId) {
            console.log("Found package ID in treatment plan:", packageId);
            
            const formattedPackage = {
              id: packageId,
              title: packageTitle,
              clinicId: planData.clinicId || ''
            };
            
            // Save to both storages for consistency
            sessionStorage.setItem('activePackage', JSON.stringify(formattedPackage));
            localStorage.setItem('selectedPackage', JSON.stringify(formattedPackage));
            
            console.log("Created package data from treatment plan:", formattedPackage);
            setPackageData(formattedPackage);
            return;
          }
        }
      } catch (error) {
        console.error("Error parsing pendingTreatmentPlan from sessionStorage:", error);
      }
    }
    
    // If we've reached here, we don't have package data
    console.log("No package data found in any source");
    
  }, [
    searchParams, 
    source, 
    packageId, 
    clinicId, 
    isPackageFlow,
    setSource,
    setPackageId,
    setClinicId
  ]);

  return { packageData, setPackageData };
}