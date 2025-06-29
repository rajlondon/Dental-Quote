import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Search, MapPin, Star, Building, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clinic } from "@/types/clinic";

export default function AdminAssignQuotePage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id ? parseInt(params.id) : undefined;
  const { toast } = useToast();
  
  const { getQuoteQuery, assignClinicMutation } = useQuotes();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Load specific quote if ID is provided
  const quoteQuery = quoteId ? getQuoteQuery(quoteId) : null;

  // Fetch all clinics 
  const clinicsQuery = useQuery<Clinic[]>({
    queryKey: ["/api/clinics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clinics");
      return response.json();
    },
  });

  useEffect(() => {
    if (quoteId) {
      // Ensure query is refetched when component mounts
      quoteQuery?.refetch();
    }
    
    // Fetch clinics when component mounts
    clinicsQuery.refetch();
  }, [quoteId]);

  if (!quoteId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Quote ID is required</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/admin/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  // Handle loading states
  if (quoteQuery?.isLoading || clinicsQuery.isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Handle error states
  if (quoteQuery?.error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading quote: {quoteQuery?.error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/admin/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  if (clinicsQuery.error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading clinics: {clinicsQuery.error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/admin/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  const quoteRequest = quoteQuery?.data?.quoteRequest;
  const clinics = clinicsQuery.data || [];

  if (!quoteRequest) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Quote not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/admin/quotes")}
          >
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  // Filter clinics based on search term
  const filteredClinics = clinics.filter(clinic => 
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (clinic.specialties && clinic.specialties.some(s => 
      s.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleAssignClinic = async (clinicId: number) => {
    try {
      await assignClinicMutation.mutateAsync({
        quoteId,
        clinicId
      });
      
      toast({
        title: "Quote assigned",
        description: "The quote has been successfully assigned to the clinic.",
      });
      
      // Redirect back to the quote details
      setLocation(`/admin/quotes/${quoteId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign the quote to the clinic.",
        variant: "destructive",
      });
    }
  };

  const handleSmartAssign = async () => {
    try {
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/smart-assign`);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Smart Assignment Complete",
          description: `Quote assigned to ${result.data.assignedClinic.name} based on patient preferences.`,
        });
        
        // Redirect back to the quote details
        setLocation(`/admin/quotes/${quoteId}`);
      } else {
        toast({
          title: "No Match Found",
          description: result.message || "No suitable clinics found for this quote.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform smart assignment.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setLocation(`/admin/quotes/${quoteId}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Assign Quote to Clinic"
        description={`Select a clinic to handle quote request #${quoteId} for ${quoteRequest.treatment}`}
        actions={
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quote
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{quoteRequest.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-medium">{quoteRequest.email}</p>
              </div>
              {quoteRequest.patientCountry && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Country</p>
                  <p className="font-medium">{quoteRequest.patientCountry}</p>
                </div>
              )}
              {quoteRequest.patientLanguage && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preferred Language</p>
                  <p className="font-medium">{quoteRequest.patientLanguage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center relative max-w-md flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search clinics by name, location, or specialties..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            onClick={handleSmartAssign}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 px-6"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Smart Assign
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClinics.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No clinics found matching your search criteria.</p>
            </div>
          ) : (
            filteredClinics.map((clinic) => (
              <Card key={clinic.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
                  {clinic.logo ? (
                    <img 
                      src={clinic.logo} 
                      alt={clinic.name} 
                      className="h-16 object-contain" 
                    />
                  ) : (
                    <Building className="h-16 w-16 text-primary/20" />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{clinic.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {clinic.city}, {clinic.country}
                      </CardDescription>
                    </div>
                    {clinic.verified && (
                      <Badge variant="outline" className="ml-2">Verified</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < (clinic.rating || 0) ? 'fill-current' : 'text-muted stroke-current fill-none'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm ml-2">
                      {clinic.rating?.toFixed(1) || "No"} rating
                      {clinic.reviewCount ? ` (${clinic.reviewCount})` : ""}
                    </span>
                  </div>
                  
                  {clinic.specialties && clinic.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {clinic.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="font-normal">
                          {specialty}
                        </Badge>
                      ))}
                      {clinic.specialties.length > 3 && (
                        <Badge variant="outline" className="font-normal">
                          +{clinic.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    {clinic.staffCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{clinic.staffCount} staff</span>
                      </div>
                    )}
                    {clinic.founded && (
                      <div>Est. {clinic.founded}</div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full"
                    onClick={() => handleAssignClinic(clinic.id)}
                    disabled={assignClinicMutation.isPending}
                  >
                    {assignClinicMutation.isPending && assignClinicMutation.variables?.clinicId === clinic.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Quote to This Clinic"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}