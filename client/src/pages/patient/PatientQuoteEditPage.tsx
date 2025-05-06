import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

/**
 * Patient Quote Edit Page
 * Allows patients to directly edit their quote requests
 */
export default function PatientQuoteEditPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const quoteId = params?.id;

  // Local state for form values
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    treatment: "",
    specificTreatment: "",
    otherTreatment: "",
    notes: ""
  });

  // Fetch quote data
  const { data: quoteData, isLoading, error } = useQuery({
    queryKey: ['/api/quotes', quoteId],
    queryFn: async () => {
      try {
        console.log(`[DEBUG] Fetching quote details for ID: ${quoteId}`);
        const response = await apiRequest('GET', `/api/quotes/${quoteId}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load quote data');
        }
        
        console.log('[DEBUG] Quote data loaded successfully:', data);
        return data.data?.quoteRequest || null;
      } catch (err) {
        console.error('[ERROR] Failed to fetch quote:', err);
        throw err;
      }
    },
    enabled: !!quoteId
  });

  // Update form values when quote data is loaded
  useEffect(() => {
    if (quoteData) {
      setFormValues({
        name: quoteData.name || "",
        email: quoteData.email || "",
        phone: quoteData.phone || "",
        treatment: quoteData.treatment || "",
        specificTreatment: quoteData.specificTreatment || "",
        otherTreatment: quoteData.otherTreatment || "",
        notes: quoteData.notes || ""
      });
    }
  }, [quoteData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mutation for saving changes
  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await apiRequest('PATCH', `/api/quotes/${quoteId}`, updatedData);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update quote');
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/user'] });
      
      toast({
        title: "Quote Updated",
        description: "Your quote has been successfully updated",
        variant: "default"
      });
      
      // Navigate back to quote details
      setLocation(`/patient/quotes/${quoteId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your quote",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the data for update
    const updateData = {
      ...formValues
    };
    
    console.log('[DEBUG] Submitting quote update:', updateData);
    updateMutation.mutate(updateData);
  };

  // Handle back navigation
  const handleBack = () => {
    setLocation(`/patient/quotes/${quoteId || ''}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg">Loading quote data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-red-500 text-xl mb-4">
                Error loading quote: {(error as Error).message}
              </div>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quote
            </Button>
            <CardTitle className="text-xl">Edit Quote #{quoteId}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Treatment Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment Type</Label>
                <Input 
                  id="treatment"
                  name="treatment"
                  value={formValues.treatment}
                  onChange={handleInputChange}
                  placeholder="Type of treatment needed"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specificTreatment">Specific Treatment Details</Label>
                <Textarea 
                  id="specificTreatment"
                  name="specificTreatment"
                  value={formValues.specificTreatment}
                  onChange={handleInputChange}
                  placeholder="Please describe the specific treatment you're looking for"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherTreatment">Additional Treatment Information</Label>
                <Textarea 
                  id="otherTreatment"
                  name="otherTreatment"
                  value={formValues.otherTreatment || ""}
                  onChange={handleInputChange}
                  placeholder="Any other treatment details you'd like to mention"
                  rows={2}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes"
                name="notes"
                value={formValues.notes || ""}
                onChange={handleInputChange}
                placeholder="Any additional information or requests"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleBack}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex items-center"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}