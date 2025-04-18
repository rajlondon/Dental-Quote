import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PatientInfo } from '@/components/PatientInfoForm';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Check, AlertTriangle, UserCheck, Mail, Phone, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { validatePatientInfo, standardizePatientInfo } from '@/utils/patientInfoValidator';

interface PatientInfoVerificationProps {
  patientInfo: Partial<PatientInfo> | null | undefined;
  onContinue: (updatedInfo: Partial<PatientInfo>) => void;
  onEdit: () => void;
}

const PatientInfoVerification: React.FC<PatientInfoVerificationProps> = ({
  patientInfo,
  onContinue,
  onEdit
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [email, setEmail] = useState(patientInfo?.email || '');
  const [phone, setPhone] = useState(patientInfo?.phone || '');
  
  const { isValid, missingFields, hasCriticalFields } = validatePatientInfo(patientInfo);
  const standardizedInfo = standardizePatientInfo(patientInfo);

  const handleQuickFix = () => {
    setShowEditDialog(true);
  };
  
  const handleSaveQuickInfo = () => {
    const updatedInfo = {
      ...standardizedInfo,
      email,
      phone
    };
    
    setShowEditDialog(false);
    onContinue(updatedInfo);
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Verify Your Information</CardTitle>
        <CardDescription>
          Please confirm your information before proceeding to payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isValid && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Information</AlertTitle>
            <AlertDescription>
              We're missing some important information about you. Please {missingFields.length > 3 ? 'fill out your information' : 'provide ' + missingFields.join(', ')} to ensure we can process your request properly.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <UserCheck className={`h-5 w-5 ${standardizedInfo.fullName !== 'Guest User' ? 'text-green-600' : 'text-amber-500'} mt-0.5`} />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient Name</h3>
              <p className="font-medium">{standardizedInfo.fullName}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className={`h-5 w-5 ${standardizedInfo.email !== 'guest@mydentalfly.com' ? 'text-green-600' : 'text-amber-500'} mt-0.5`} />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
              <p className="font-medium">{standardizedInfo.email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className={`h-5 w-5 ${standardizedInfo.phone !== 'Not provided' ? 'text-green-600' : 'text-amber-500'} mt-0.5`} />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
              <p className="font-medium">{standardizedInfo.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className={`h-5 w-5 ${standardizedInfo.travelMonth !== 'Flexible' ? 'text-green-600' : 'text-gray-400'} mt-0.5`} />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Travel Month</h3>
              <p className="font-medium">{standardizedInfo.travelMonth}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className={`h-5 w-5 ${standardizedInfo.departureCity !== 'Not specified' ? 'text-green-600' : 'text-gray-400'} mt-0.5`} />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Departure City</h3>
              <p className="font-medium">{standardizedInfo.departureCity}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Preference</h3>
              <p className="font-medium capitalize">{standardizedInfo.preferredContactMethod}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {!isValid ? (
            <>
              <Button variant="default" onClick={handleQuickFix} className="flex-1">
                Quick Fix
              </Button>
              <Button variant="outline" onClick={onEdit} className="flex-1">
                Edit Full Profile
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" onClick={() => onContinue(standardizedInfo)} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Confirm and Continue
              </Button>
              <Button variant="outline" onClick={onEdit} className="flex-1">
                Edit Information
              </Button>
            </>
          )}
        </div>
      </CardContent>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Fix</DialogTitle>
            <DialogDescription>
              Please provide the essential information to proceed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
              />
              <p className="text-xs text-gray-500">Required for payment confirmation</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+44 123 456 7890" 
              />
              <p className="text-xs text-gray-500">Required for clinic communication</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuickInfo} disabled={!email || !phone}>
              Save and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatientInfoVerification;