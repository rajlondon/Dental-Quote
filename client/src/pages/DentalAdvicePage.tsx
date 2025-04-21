import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Pre-defined treatment types for the dropdown
const treatmentTypes = [
  "Dental Implants",
  "Veneers",
  "Crowns",
  "Teeth Whitening",
  "Root Canal",
  "Dental Bridges",
  "Dentures",
  "Extractions",
  "Invisalign",
  "Dental Fillings",
  "Dental Bonding",
  "Gum Surgery",
  "Teeth Cleaning",
  "Other"
];

const DentalAdvicePage: React.FC = () => {
  const [treatmentType, setTreatmentType] = useState<string>("");
  const [patientConcerns, setPatientConcerns] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!treatmentType) {
      toast({
        title: "Treatment type required",
        description: "Please select a treatment type to get advice",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      setAdvice("");
      
      const response = await apiRequest('POST', '/api/gemini/treatment-advice', {
        treatmentType,
        patientConcerns,
        budget
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAdvice(data.advice);
        toast({
          title: "Advice generated",
          description: "Your dental treatment advice has been generated successfully",
        });
      } else {
        throw new Error(data.message || "Failed to generate advice");
      }
    } catch (error) {
      console.error("Error generating advice:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate advice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">AI Dental Treatment Advisor</h1>
          <p className="text-muted-foreground">
            Get personalized advice about dental treatments powered by AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Information</CardTitle>
              <CardDescription>
                Provide details about the treatment you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treatmentType">Treatment Type</Label>
                  <Select
                    value={treatmentType}
                    onValueChange={setTreatmentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientConcerns">Your Concerns (Optional)</Label>
                  <Textarea
                    id="patientConcerns"
                    placeholder="Describe any specific concerns or questions you have about this treatment"
                    value={patientConcerns}
                    onChange={(e) => setPatientConcerns(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    placeholder="Your approximate budget for this treatment"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Advice...
                    </>
                  ) : (
                    "Get Advice"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Advice</CardTitle>
              <CardDescription>
                AI-generated information about your dental treatment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : advice ? (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: advice.replace(/\n/g, '<br />') 
                  }} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Fill out the form and click "Get Advice" to generate treatment information</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <p>
                Note: This advice is generated by AI and should not replace professional medical consultation. 
                Always consult with a qualified dentist or healthcare provider before making decisions about 
                your dental health.
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DentalAdvicePage;