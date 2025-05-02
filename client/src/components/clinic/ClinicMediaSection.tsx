import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, Camera, Video, MessageSquare } from 'lucide-react';
import { MediaGallery } from '@/components/clinic-media/MediaGallery';
import { MediaType } from '@/hooks/use-clinic-media';

interface ClinicMediaSectionProps {
  // Add props as needed
}

export default function ClinicMediaSection({}: ClinicMediaSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<number | null>(null);
  
  // Get the clinic ID from the authenticated user
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        // For admin users, we'll need to get the selected clinic from somewhere
        // For now, we'll use a hardcoded value for demonstration
        setClinicId(1);
      } else if (user.role === 'clinic_staff' && user.clinicId) {
        setClinicId(user.clinicId);
      }
      setLoading(false);
    }
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  if (!clinicId) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No clinic association found. Please make sure your account is linked to a clinic.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinic Media Management</h2>
          <p className="text-muted-foreground">
            Manage your clinic's media content including before/after images, clinic tour videos, and testimonials.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="before_after">Before/After Images</TabsTrigger>
          <TabsTrigger value="clinic_tour">Clinic Tour</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Before/After Images</CardTitle>
                <Camera className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Upload before and after treatment images to showcase your results.
                </p>
                <div className="mt-4">
                  <MediaGallery 
                    clinicId={clinicId} 
                    mediaTypes={[MediaType.BEFORE_AFTER]}
                    allowUploads={false}
                    className="max-h-[300px] overflow-y-auto"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Clinic Tour</CardTitle>
                <Video className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Upload videos showcasing your clinic facilities and equipment.
                </p>
                <div className="mt-4">
                  <MediaGallery 
                    clinicId={clinicId} 
                    mediaTypes={[MediaType.CLINIC_TOUR]}
                    allowUploads={false}
                    className="max-h-[300px] overflow-y-auto"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Patient Testimonials</CardTitle>
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Share videos of satisfied patients sharing their experience.
                </p>
                <div className="mt-4">
                  <MediaGallery 
                    clinicId={clinicId} 
                    mediaTypes={[MediaType.TESTIMONIAL]}
                    allowUploads={false}
                    className="max-h-[300px] overflow-y-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="before_after">
          <Card>
            <CardHeader>
              <CardTitle>Before/After Treatment Images</CardTitle>
              <CardDescription>
                Upload and manage before and after treatment images to showcase your results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery 
                clinicId={clinicId} 
                mediaTypes={[MediaType.BEFORE_AFTER]}
                title="Before/After Treatment Images"
                allowUploads={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinic_tour">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Tour Videos</CardTitle>
              <CardDescription>
                Upload and manage videos showcasing your clinic facilities and equipment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery 
                clinicId={clinicId} 
                mediaTypes={[MediaType.CLINIC_TOUR]}
                title="Clinic Tour Videos"
                allowUploads={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Patient Testimonials</CardTitle>
              <CardDescription>
                Upload and manage patient testimonial videos and images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery 
                clinicId={clinicId} 
                mediaTypes={[MediaType.TESTIMONIAL]}
                title="Patient Testimonial Media"
                allowUploads={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}