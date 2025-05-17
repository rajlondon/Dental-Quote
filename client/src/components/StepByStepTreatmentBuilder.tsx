import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Info, Smile, Heart, AlertTriangle, Check, ArrowRight, HelpCircle, Timer } from 'lucide-react';
import TreatmentPlanBuilder, { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { DentalChart } from '@/components/DentalChart';

// Define symptom tags that users can select
const SYMPTOM_TAGS = [
  { id: 'pain', label: 'Pain', icon: <AlertTriangle className="h-3 w-3" /> },
  { id: 'cosmetic', label: 'Cosmetic', icon: <Smile className="h-3.5 w-3.5" /> },
  { id: 'function', label: 'Function', icon: <Info className="h-3.5 w-3.5" /> },
  { id: 'sensitivity', label: 'Sensitivity', icon: <Heart className="h-3.5 w-3.5" /> },
  { id: 'missing', label: 'Missing', icon: <Info className="h-3.5 w-3.5" /> }
];

// Define oral health concerns
const ORAL_HEALTH_CONCERNS = [
  { 
    id: 'missing_teeth', 
    label: 'Missing Teeth', 
    description: 'I have gaps from missing teeth and want to replace them',
    icon: <Info className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['dental_implant_standard', 'dental_bridge', 'all_on_4_implants']
  },
  { 
    id: 'cosmetic', 
    label: 'Cosmetic Improvement', 
    description: 'I want to improve the appearance of my smile',
    icon: <Smile className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['porcelain_veneer', 'composite_veneer', 'zoom_whitening']
  },
  { 
    id: 'chewing_function', 
    label: 'Difficulty Chewing', 
    description: 'I have trouble chewing or biting food comfortably',
    icon: <Info className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['dental_implant_standard', 'porcelain_crown', 'zirconia_crown']
  },
  { 
    id: 'pain', 
    label: 'Dental Pain', 
    description: 'I have pain or discomfort in my teeth or gums',
    icon: <AlertTriangle className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['root_canal', 'tooth_extraction', 'gum_treatment']
  },
  { 
    id: 'crooked', 
    label: 'Crooked Teeth', 
    description: 'My teeth are misaligned or crooked',
    icon: <Smile className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['orthodontics_invisalign', 'orthodontics_braces']
  },
  { 
    id: 'full_makeover', 
    label: 'Full Mouth Makeover', 
    description: 'I want a complete smile transformation',
    icon: <Smile className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['full_smile_makeover', 'hollywood_smile', 'full_mouth_restoration']
  },
  { 
    id: 'preventive', 
    label: 'Preventive Care', 
    description: 'I need a check-up and cleaning',
    icon: <Heart className="h-10 w-10 text-primary/70" />,
    relatedTreatments: ['dental_checkup_cleaning', 'tooth_fillings']
  }
];

interface TimelineItem {
  index: number;
  label: string;
  description?: string;
}

interface QuestionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  progress: number;
  onNext: () => void;
  onBack?: () => void;
  canContinue?: boolean;
  timelineItems: TimelineItem[];
  currentStep: number;
}

// Question component for consistent styling and layout
const Question: React.FC<QuestionProps> = ({ 
  title, 
  description, 
  children, 
  progress, 
  onNext, 
  onBack,
  canContinue = true,
  timelineItems,
  currentStep
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">Your progress</span>
          <span className="text-xs font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 w-full" />
      </div>
      
      {/* Timeline */}
      <div className="flex items-center justify-between space-x-2 mb-6 mt-4 overflow-x-auto pb-2">
        {timelineItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center min-w-[60px]">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 text-xs font-medium 
              ${currentStep >= item.index 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 text-gray-500'}`}
            >
              {item.index + 1}
            </div>
            <div className={`text-xs text-center whitespace-nowrap ${currentStep >= item.index ? 'text-primary font-medium' : 'text-gray-500'}`}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Question header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      
      {/* Question content */}
      <div className="mb-8">
        {children}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        {onBack ? (
          <Button 
            variant="outline" 
            onClick={() => {
              // Preserve scroll position when going back
              const currentPosition = window.scrollY;
              onBack();
              setTimeout(() => window.scrollTo(0, currentPosition), 0);
            }} 
            className="px-6"
          >
            Back
          </Button>
        ) : (
          <div></div> // Empty div to maintain flex layout
        )}
        
        <Button 
          onClick={() => {
            // Preserve scroll position when going forward
            const currentPosition = window.scrollY;
            onNext();
            setTimeout(() => window.scrollTo(0, currentPosition), 0);
          }} 
          disabled={!canContinue}
          className="px-6"
        >
          {currentStep === 5 ? "Get My Personalized Quote" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface StepByStepTreatmentBuilderProps {
  onTreatmentsChange?: (treatments: TreatmentItem[]) => void;
  initialTreatments?: TreatmentItem[];
  onComplete?: (dentalChartData: { id: number; name: string; condition: string | null; treatment: string | null; notes: string }[], treatments: TreatmentItem[]) => void;
}

const StepByStepTreatmentBuilder: React.FC<StepByStepTreatmentBuilderProps> = ({
  onTreatmentsChange,
  initialTreatments = [],
  onComplete
}) => {
  const { toast } = useToast();
  
  // Helper function for changing steps while preserving scroll position
  const changeStep = (newStep: number) => {
    const currentPosition = window.scrollY;
    setCurrentStep(newStep);
    setTimeout(() => window.scrollTo(0, currentPosition), 0);
  };
  // Step tracking
  const [currentStep, setCurrentStep] = useState(0);
  // Define the Tooth type to match DentalChart component
  type Tooth = {
    id: number;
    name: string;
    condition: string | null;
    treatment: string | null;
    notes: string;
  };
  // Initialize teeth state with tooth objects (this will be overridden if we pass initialTeeth)
  const [teeth, setTeeth] = useState<Tooth[]>([
    { id: 1, name: 'Upper Right Third Molar (1)', condition: null, treatment: null, notes: '' },
    { id: 2, name: 'Upper Right Second Molar (2)', condition: null, treatment: null, notes: '' },
    { id: 3, name: 'Upper Right First Molar (3)', condition: null, treatment: null, notes: '' },
    { id: 4, name: 'Upper Right Second Premolar (4)', condition: null, treatment: null, notes: '' },
    { id: 5, name: 'Upper Right First Premolar (5)', condition: null, treatment: null, notes: '' },
    { id: 6, name: 'Upper Right Canine (6)', condition: null, treatment: null, notes: '' },
    { id: 7, name: 'Upper Right Lateral Incisor (7)', condition: null, treatment: null, notes: '' },
    { id: 8, name: 'Upper Right Central Incisor (8)', condition: null, treatment: null, notes: '' },
    { id: 9, name: 'Upper Left Central Incisor (9)', condition: null, treatment: null, notes: '' },
    { id: 10, name: 'Upper Left Lateral Incisor (10)', condition: null, treatment: null, notes: '' },
    { id: 11, name: 'Upper Left Canine (11)', condition: null, treatment: null, notes: '' },
    { id: 12, name: 'Upper Left First Premolar (12)', condition: null, treatment: null, notes: '' },
    { id: 13, name: 'Upper Left Second Premolar (13)', condition: null, treatment: null, notes: '' },
    { id: 14, name: 'Upper Left First Molar (14)', condition: null, treatment: null, notes: '' },
    { id: 15, name: 'Upper Left Second Molar (15)', condition: null, treatment: null, notes: '' },
    { id: 16, name: 'Upper Left Third Molar (16)', condition: null, treatment: null, notes: '' },
    { id: 17, name: 'Lower Left Third Molar (17)', condition: null, treatment: null, notes: '' },
    { id: 18, name: 'Lower Left Second Molar (18)', condition: null, treatment: null, notes: '' },
    { id: 19, name: 'Lower Left First Molar (19)', condition: null, treatment: null, notes: '' },
    { id: 20, name: 'Lower Left First Premolar (20)', condition: null, treatment: null, notes: '' },
    { id: 21, name: 'Lower Left Second Premolar (21)', condition: null, treatment: null, notes: '' },
    { id: 22, name: 'Lower Left Canine (22)', condition: null, treatment: null, notes: '' },
    { id: 23, name: 'Lower Left Lateral Incisor (23)', condition: null, treatment: null, notes: '' },
    { id: 24, name: 'Lower Left Central Incisor (24)', condition: null, treatment: null, notes: '' },
    { id: 25, name: 'Lower Right Central Incisor (25)', condition: null, treatment: null, notes: '' },
    { id: 26, name: 'Lower Right Lateral Incisor (26)', condition: null, treatment: null, notes: '' },
    { id: 27, name: 'Lower Right Canine (27)', condition: null, treatment: null, notes: '' },
    { id: 28, name: 'Lower Right First Premolar (28)', condition: null, treatment: null, notes: '' },
    { id: 29, name: 'Lower Right Second Premolar (29)', condition: null, treatment: null, notes: '' },
    { id: 30, name: 'Lower Right First Molar (30)', condition: null, treatment: null, notes: '' },
    { id: 31, name: 'Lower Right Second Molar (31)', condition: null, treatment: null, notes: '' },
    { id: 32, name: 'Lower Right Third Molar (32)', condition: null, treatment: null, notes: '' }
  ]);
  // const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  // const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  // const [toothDialogOpen, setToothDialogOpen] = useState(false);
  
  // User answers
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [hasPreviousDentalWork, setHasPreviousDentalWork] = useState<string | null>(null);
  const [desiredOutcomes, setDesiredOutcomes] = useState<string[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState<number[]>([1500]);
  const [hasXrays, setHasXrays] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Treatment plans
  const [treatments, setTreatments] = useState<TreatmentItem[]>(initialTreatments);
  
  // Calculate the progress percentage
  const totalSteps = 6; // Total number of steps in the questionnaire
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // Timeline items
  const timelineItems: TimelineItem[] = [
    { index: 0, label: 'Concerns' },
    { index: 1, label: 'Dental Map' },
    { index: 2, label: 'History' },
    { index: 3, label: 'Goals' },
    { index: 4, label: 'Timeline & Budget' },
    { index: 5, label: 'Treatments' }
  ];
  
  // Update parent component when treatments change
  useEffect(() => {
    if (onTreatmentsChange) {
      onTreatmentsChange(treatments);
    }
  }, [treatments, onTreatmentsChange]);
  
  // Handle dental chart updates
  const handleTeethUpdate = (updatedTeeth: Tooth[]) => {
    setTeeth(updatedTeeth);
  };
  
  // Generate recommended treatments based on user responses
  const generateRecommendedTreatments = () => {
    // Start with an empty array of recommended treatments
    let recommendedTreatments: TreatmentItem[] = [];
    
    // Add a sample treatment based on dental conditions
    const teethWithIssues = teeth.filter(tooth => tooth.condition || tooth.treatment);
    const missingTeeth = teeth.filter(tooth => tooth.condition === 'missing');
    const cosmeticTeeth = teeth.filter(tooth => tooth.condition === 'cosmetic');
    const painTeeth = teeth.filter(tooth => tooth.condition === 'pain');
    
    // Add implant treatments for missing teeth
    if (missingTeeth.length > 0) {
      if (missingTeeth.length >= 5) {
        // For multiple missing teeth, suggest All-on-4 or dentures
        recommendedTreatments.push({
          id: `${Date.now()}-1`,
          category: 'implants',
          name: 'All-on-4 Implants (Full Arch)',
          quantity: 1,
          priceGBP: 4200, // 35% of UK price
          priceUSD: 5390,
          subtotalGBP: 4200,
          subtotalUSD: 5390,
          guarantee: '10-year'
        });
      } else {
        // For fewer missing teeth, suggest individual implants
        recommendedTreatments.push({
          id: `${Date.now()}-2`,
          category: 'implants',
          name: 'Dental Implant (Standard)',
          quantity: missingTeeth.length,
          priceGBP: 306, // 35% of UK price
          priceUSD: 392,
          subtotalGBP: 306 * missingTeeth.length,
          subtotalUSD: 392 * missingTeeth.length,
          guarantee: '5-year'
        });
      }
    }
    
    // Add crown/veneer treatments for cosmetic issues
    if (cosmeticTeeth.length > 0) {
      if (cosmeticTeeth.length >= 6) {
        // For multiple teeth with cosmetic issues, suggest veneers
        recommendedTreatments.push({
          id: `${Date.now()}-3`,
          category: 'crowns_veneers',
          name: 'Porcelain Veneer',
          quantity: cosmeticTeeth.length,
          priceGBP: 210, // 35% of UK price
          priceUSD: 270,
          subtotalGBP: 210 * cosmeticTeeth.length,
          subtotalUSD: 270 * cosmeticTeeth.length,
          guarantee: '3-year'
        });
      } else {
        // For fewer teeth, suggest crowns
        recommendedTreatments.push({
          id: `${Date.now()}-4`,
          category: 'crowns_veneers',
          name: 'Porcelain Crown',
          quantity: cosmeticTeeth.length,
          priceGBP: 227, // 35% of UK price
          priceUSD: 292,
          subtotalGBP: 227 * cosmeticTeeth.length,
          subtotalUSD: 292 * cosmeticTeeth.length,
          guarantee: '3-year'
        });
      }
    }
    
    // Add root canal for teeth with pain
    if (painTeeth.length > 0) {
      recommendedTreatments.push({
        id: `${Date.now()}-5`,
        category: 'general',
        name: 'Root Canal Treatment',
        quantity: painTeeth.length,
        priceGBP: 105, // 35% of UK price
        priceUSD: 135,
        subtotalGBP: 105 * painTeeth.length,
        subtotalUSD: 135 * painTeeth.length
      });
    }
    
    // Add treatments based on selected concerns
    if (selectedConcerns.includes('missing_teeth') && recommendedTreatments.length === 0) {
      recommendedTreatments.push({
        id: `${Date.now()}-6`,
        category: 'implants',
        name: 'Dental Implant (Standard)',
        quantity: 1,
        priceGBP: 306,
        priceUSD: 392,
        subtotalGBP: 306,
        subtotalUSD: 392,
        guarantee: '5-year'
      });
    }
    
    if (selectedConcerns.includes('cosmetic') && !recommendedTreatments.some(t => t.name.includes('Veneer'))) {
      recommendedTreatments.push({
        id: `${Date.now()}-7`,
        category: 'crowns_veneers',
        name: 'Porcelain Veneer',
        quantity: 4,
        priceGBP: 210,
        priceUSD: 270,
        subtotalGBP: 840,
        subtotalUSD: 1080,
        guarantee: '3-year'
      });
    }
    
    if (selectedConcerns.includes('pain') && !recommendedTreatments.some(t => t.name.includes('Root Canal'))) {
      recommendedTreatments.push({
        id: `${Date.now()}-8`,
        category: 'general',
        name: 'Root Canal Treatment',
        quantity: 1,
        priceGBP: 105,
        priceUSD: 135,
        subtotalGBP: 105,
        subtotalUSD: 135
      });
    }
    
    // Based on desired outcomes
    if (desiredOutcomes.includes('appearance') && !recommendedTreatments.some(t => t.name.includes('Whitening'))) {
      recommendedTreatments.push({
        id: `${Date.now()}-9`,
        category: 'whitening',
        name: 'Zoom Whitening Treatment',
        quantity: 1,
        priceGBP: 140,
        priceUSD: 180,
        subtotalGBP: 140,
        subtotalUSD: 180
      });
    }
    
    // Add default treatment if nothing else is selected
    if (recommendedTreatments.length === 0) {
      recommendedTreatments.push({
        id: `${Date.now()}-10`,
        category: 'general',
        name: 'Dental Check-up & Cleaning',
        quantity: 1,
        priceGBP: 42,
        priceUSD: 54,
        subtotalGBP: 42,
        subtotalUSD: 54
      });
      
      recommendedTreatments.push({
        id: `${Date.now()}-11`,
        category: 'whitening',
        name: 'Zoom Whitening Treatment',
        quantity: 1,
        priceGBP: 140,
        priceUSD: 180,
        subtotalGBP: 140,
        subtotalUSD: 180
      });
    }
    
    return recommendedTreatments;
  };
  
  // Update treatments when moving to the final step
  useEffect(() => {
    if (currentStep === 5 && treatments.length === 0) {
      const recommendedTreatments = generateRecommendedTreatments();
      setTreatments(recommendedTreatments);
    }
  }, [currentStep, treatments.length]);
  
  // Handle final submission
  const handleComplete = () => {
    const currentPosition = window.scrollY;
    if (onComplete) {
      onComplete(teeth, treatments);
    }
    // Maintain scroll position after completion
    setTimeout(() => window.scrollTo(0, currentPosition), 0);
  };
  
  // Handle concern selection
  const handleConcernToggle = (concernId: string) => {
    if (selectedConcerns.includes(concernId)) {
      setSelectedConcerns(selectedConcerns.filter(id => id !== concernId));
    } else {
      setSelectedConcerns([...selectedConcerns, concernId]);
    }
  };
  
  // Handle outcome selection
  const handleOutcomeToggle = (outcomeId: string) => {
    if (desiredOutcomes.includes(outcomeId)) {
      setDesiredOutcomes(desiredOutcomes.filter(id => id !== outcomeId));
    } else {
      setDesiredOutcomes([...desiredOutcomes, outcomeId]);
    }
  };
  
  const handleTreatmentsChange = (items: TreatmentItem[]) => {
    setTreatments(items);
  };
  
  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && (
            <Question 
              title="What dental concerns are you experiencing?"
              description="Select all that apply to help us understand your needs"
              progress={progress}
              onNext={() => changeStep(1)}
              canContinue={selectedConcerns.length > 0}
              timelineItems={timelineItems}
              currentStep={currentStep}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ORAL_HEALTH_CONCERNS.map((concern) => (
                  <div 
                    key={concern.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 
                      ${selectedConcerns.includes(concern.id) 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                    onClick={() => handleConcernToggle(concern.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3">
                        {concern.icon}
                      </div>
                      <h3 className="font-medium mb-1">{concern.label}</h3>
                      <p className="text-sm text-gray-500 mb-3">{concern.description}</p>
                      
                      {selectedConcerns.includes(concern.id) && (
                        <Badge className="bg-primary/90">
                          <Check className="h-3.5 w-3.5 mr-1" /> Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Question>
          )}
          
          {currentStep === 1 && (
            <Question 
              title="Map Your Dental Concerns"
              description="Mark any teeth that have issues or concerns"
              progress={progress}
              onNext={() => changeStep(2)}
              onBack={() => changeStep(0)}
              timelineItems={timelineItems}
              currentStep={currentStep}
            >
              <div className="bg-white rounded-lg p-4 mb-6">
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium text-lg mb-2">Symptom Tags</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Use these tags when marking teeth on the dental chart below:
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOM_TAGS.map(tag => (
                      <Badge 
                        key={tag.id} 
                        variant="outline"
                        className="flex items-center gap-1.5 px-3 py-1"
                      >
                        {tag.icon}
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  {/* Use the existing DentalChart component */}
                  <div className="max-w-5xl mx-auto">
                    <DentalChart 
                      onTeethUpdate={handleTeethUpdate}
                      initialTeeth={teeth}
                    />
                  </div>
                  
                  {/* Badge showing selected teeth count - this is additional beyond what's in the DentalChart */}
                  <div className="flex justify-end mt-2">
                    <Badge variant="outline" className="mr-2">
                      {teeth.filter(tooth => tooth.condition || tooth.treatment).length} teeth selected
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-blue-50 rounded-lg p-4 max-w-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">
                        Don't worry if you're unsure about specific dental terms. 
                        The clinics will review your information and provide a professional assessment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Question>
          )}
          
          {currentStep === 2 && (
            <Question 
              title="Have you had dental work done in the past?"
              description="Tell us about your dental history to help determine the best treatment options"
              progress={progress}
              onNext={() => changeStep(3)}
              onBack={() => changeStep(1)}
              canContinue={hasPreviousDentalWork !== null}
              timelineItems={timelineItems}
              currentStep={currentStep}
            >
              <div className="max-w-lg mx-auto">
                <RadioGroup 
                  value={hasPreviousDentalWork || ""} 
                  onValueChange={setHasPreviousDentalWork}
                  className="space-y-3"
                >
                  <div className={`border rounded-lg p-4 transition-all duration-200 
                    ${hasPreviousDentalWork === 'yes' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="yes" id="previous-yes" className="mt-1" />
                      <div>
                        <Label htmlFor="previous-yes" className="text-base font-medium mb-1 block">
                          Yes, I've had dental work done
                        </Label>
                        <p className="text-sm text-gray-500">
                          I've had fillings, crowns, implants, or other dental treatments in the past
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg p-4 transition-all duration-200 
                    ${hasPreviousDentalWork === 'no' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="no" id="previous-no" className="mt-1" />
                      <div>
                        <Label htmlFor="previous-no" className="text-base font-medium mb-1 block">
                          No, I haven't had major dental work
                        </Label>
                        <p className="text-sm text-gray-500">
                          I've only had routine check-ups and cleanings
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg p-4 transition-all duration-200 
                    ${hasPreviousDentalWork === 'unsure' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="unsure" id="previous-unsure" className="mt-1" />
                      <div>
                        <Label htmlFor="previous-unsure" className="text-base font-medium mb-1 block">
                          I'm not sure
                        </Label>
                        <p className="text-sm text-gray-500">
                          I don't remember or I'm unsure about my dental history
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                
                {hasPreviousDentalWork === 'yes' && (
                  <div className="mt-6">
                    <Label htmlFor="dental-notes" className="mb-2 block">
                      Please provide any details about your previous dental work:
                    </Label>
                    <Textarea 
                      id="dental-notes" 
                      placeholder="E.g., I have 2 implants on my lower jaw, and several fillings..."
                      className="resize-none"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </Question>
          )}
          
          {currentStep === 3 && (
            <Question 
              title="What are your treatment goals?"
              description="Select what matters most to you for your dental treatment"
              progress={progress}
              onNext={() => changeStep(4)}
              onBack={() => changeStep(2)}
              canContinue={desiredOutcomes.length > 0}
              timelineItems={timelineItems}
              currentStep={currentStep}
            >
              <div className="max-w-xl mx-auto grid grid-cols-1 gap-3">
                <div 
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer
                    ${desiredOutcomes.includes('function') ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handleOutcomeToggle('function')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={desiredOutcomes.includes('function')}
                      id="goal-function"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="goal-function" className="text-base font-medium mb-1 block">
                        Improved Function
                      </Label>
                      <p className="text-sm text-gray-500">
                        I want to be able to eat, chew, and speak normally without discomfort
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer
                    ${desiredOutcomes.includes('appearance') ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handleOutcomeToggle('appearance')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={desiredOutcomes.includes('appearance')}
                      id="goal-appearance"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="goal-appearance" className="text-base font-medium mb-1 block">
                        Better Appearance
                      </Label>
                      <p className="text-sm text-gray-500">
                        I want to improve the appearance of my smile and feel more confident
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer
                    ${desiredOutcomes.includes('health') ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handleOutcomeToggle('health')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={desiredOutcomes.includes('health')}
                      id="goal-health"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="goal-health" className="text-base font-medium mb-1 block">
                        Long-term Oral Health
                      </Label>
                      <p className="text-sm text-gray-500">
                        I want a solution that promotes long-term dental health and prevents future problems
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer
                    ${desiredOutcomes.includes('pain') ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handleOutcomeToggle('pain')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={desiredOutcomes.includes('pain')}
                      id="goal-pain"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="goal-pain" className="text-base font-medium mb-1 block">
                        Pain Relief
                      </Label>
                      <p className="text-sm text-gray-500">
                        I want to address pain or discomfort I'm currently experiencing
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer
                    ${desiredOutcomes.includes('cost') ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handleOutcomeToggle('cost')}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={desiredOutcomes.includes('cost')}
                      id="goal-cost"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="goal-cost" className="text-base font-medium mb-1 block">
                        Cost Effectiveness
                      </Label>
                      <p className="text-sm text-gray-500">
                        I want to find the most affordable solution that meets my needs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Question>
          )}
          
          {currentStep === 4 && (
            <Question 
              title="What's your timeline and budget?"
              description="Help us understand your preferences for treatment timing and cost"
              progress={progress}
              onNext={() => changeStep(5)}
              onBack={() => changeStep(3)}
              canContinue={selectedTimeframe !== null}
              timelineItems={timelineItems}
              currentStep={currentStep}
            >
              <div className="max-w-xl mx-auto space-y-8">
                <div>
                  <h3 className="font-medium text-lg mb-4">When would you like to get treatment?</h3>
                  <RadioGroup 
                    value={selectedTimeframe || ""} 
                    onValueChange={setSelectedTimeframe}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    <Label 
                      htmlFor="time-urgent" 
                      className={`border rounded-lg p-4 text-center transition-all duration-200 block cursor-pointer
                        ${selectedTimeframe === 'urgent' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RadioGroupItem value="urgent" id="time-urgent" className="sr-only" />
                        <Timer className="h-6 w-6 text-primary/80" />
                        <div>
                          <span className="text-base font-medium mb-1 block">
                            As Soon as Possible
                          </span>
                          <p className="text-xs text-gray-500">
                            Within the next month
                          </p>
                        </div>
                      </div>
                    </Label>
                    
                    <Label 
                      htmlFor="time-soon"
                      className={`border rounded-lg p-4 text-center transition-all duration-200 block cursor-pointer
                        ${selectedTimeframe === 'soon' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RadioGroupItem value="soon" id="time-soon" className="sr-only" />
                        <Timer className="h-6 w-6 text-primary/80" />
                        <div>
                          <span className="text-base font-medium mb-1 block">
                            Within 3 Months
                          </span>
                          <p className="text-xs text-gray-500">
                            I'm planning ahead
                          </p>
                        </div>
                      </div>
                    </Label>
                    
                    <Label
                      htmlFor="time-flexible"
                      className={`border rounded-lg p-4 text-center transition-all duration-200 block cursor-pointer
                        ${selectedTimeframe === 'flexible' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RadioGroupItem value="flexible" id="time-flexible" className="sr-only" />
                        <Timer className="h-6 w-6 text-primary/80" />
                        <div>
                          <span className="text-base font-medium mb-1 block">
                            Flexible
                          </span>
                          <p className="text-xs text-gray-500">
                            I'm just exploring options
                          </p>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">Your budget range:</h3>
                    <div className="font-medium text-lg">
                      £{budgetRange[0].toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <Slider
                      defaultValue={budgetRange}
                      max={10000}
                      min={500}
                      step={100}
                      onValueChange={setBudgetRange}
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>£500</span>
                      <span>£10,000+</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        This budget is just to help guide our recommendations. The clinics will provide exact 
                        pricing after reviewing your specific needs.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox 
                      id="has-xrays"
                      checked={hasXrays}
                      onCheckedChange={(checked) => setHasXrays(checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="has-xrays" className="text-base font-medium mb-1 block">
                        I have dental X-rays or scans
                      </Label>
                      <p className="text-sm text-gray-500">
                        You'll be able to upload these later in the process
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Question>
          )}
          
          {currentStep === 5 && (
            <Question 
              title="Recommended Treatments"
              description="Based on your answers, here are the treatments that might be suitable for you. You can still modify these options."
              progress={progress}
              onNext={handleComplete}
              onBack={() => changeStep(4)}
              timelineItems={timelineItems}
              currentStep={currentStep}
            >
              <div className="bg-white rounded-lg">
                <TreatmentPlanBuilder 
                  initialTreatments={treatments}
                  onTreatmentsChange={handleTreatmentsChange}
                  hideHeader={true}
                />
              </div>
            </Question>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepByStepTreatmentBuilder;