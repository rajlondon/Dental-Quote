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
          <Button variant="outline" onClick={onBack} className="px-6">
            Back
          </Button>
        ) : (
          <div></div> // Empty div to maintain flex layout
        )}
        
        <Button 
          onClick={onNext} 
          disabled={!canContinue}
          className="px-6"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
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
  const [teeth, setTeeth] = useState<Tooth[]>([]);
  // We don't need these state variables anymore since the DentalChart component manages them internally
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
  
  // Handle final submission
  const handleComplete = () => {
    if (onComplete) {
      onComplete(teeth, treatments);
    }
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
              onNext={() => setCurrentStep(1)}
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
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
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
                      {teeth.length} teeth selected
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
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
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
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
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
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
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
                    <div className={`border rounded-lg p-4 text-center transition-all duration-200 
                      ${selectedTimeframe === 'urgent' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RadioGroupItem value="urgent" id="time-urgent" className="sr-only" />
                        <Timer className="h-6 w-6 text-primary/80" />
                        <div>
                          <Label htmlFor="time-urgent" className="text-base font-medium mb-1 block">
                            As Soon as Possible
                          </Label>
                          <p className="text-xs text-gray-500">
                            Within the next month
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`border rounded-lg p-4 text-center transition-all duration-200 
                      ${selectedTimeframe === 'soon' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RadioGroupItem value="soon" id="time-soon" className="sr-only" />
                        <Timer className="h-6 w-6 text-primary/80" />
                        <div>
                          <Label htmlFor="time-soon" className="text-base font-medium mb-1 block">
                            Within 3 Months
                          </Label>
                          <p className="text-xs text-gray-500">
                            I'm planning ahead
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`border rounded-lg p-4 text-center transition-all duration-200 
                      ${selectedTimeframe === 'flexible' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RadioGroupItem value="flexible" id="time-flexible" className="sr-only" />
                        <Timer className="h-6 w-6 text-primary/80" />
                        <div>
                          <Label htmlFor="time-flexible" className="text-base font-medium mb-1 block">
                            Flexible
                          </Label>
                          <p className="text-xs text-gray-500">
                            I'm just exploring options
                          </p>
                        </div>
                      </div>
                    </div>
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
              onBack={() => setCurrentStep(4)}
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