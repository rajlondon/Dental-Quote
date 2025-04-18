import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Phone, 
  Home, 
  Calendar, 
  Flag, 
  Languages,
  Save,
  Edit,
  CreditCard,
  AlertCircle,
  Info,
  PencilLine,
  CheckCircle2,
  Globe,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  preferredLanguage: string;
  passportNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  medicalInfo: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
}

// Mock user profile data
const mockUserProfile: UserProfile = {
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "+44 7123 456789",
  address: "123 High Street, London, UK",
  dateOfBirth: "1985-06-15",
  nationality: "British",
  preferredLanguage: "English",
  passportNumber: "GB123456789",
  emergencyContact: {
    name: "Jane Smith",
    relationship: "Spouse",
    phone: "+44 7987 654321",
    email: "jane.smith@example.com"
  },
  medicalInfo: {
    allergies: ["Penicillin", "Latex"],
    medications: ["Lisinopril 10mg daily"],
    conditions: ["Hypertension"],
    notes: "Please ensure local anesthetic does not contain epinephrine due to hypertension."
  }
};

const ProfileSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockUserProfile);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showMedicalDialog, setShowMedicalDialog] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  
  // Function to handle saving profile changes
  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setEditMode(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  // Function to handle cancelling profile changes
  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setEditMode(false);
  };
  
  // Function to handle updating emergency contact
  const handleSaveEmergencyContact = () => {
    setProfile({
      ...profile,
      emergencyContact: editedProfile.emergencyContact
    });
    
    setShowEmergencyDialog(false);
    
    toast({
      title: "Emergency Contact Updated",
      description: "Your emergency contact information has been updated successfully.",
    });
  };
  
  // Function to add new allergy
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    
    const updatedMedicalInfo = {
      ...editedProfile.medicalInfo,
      allergies: [...editedProfile.medicalInfo.allergies, newAllergy.trim()]
    };
    
    setEditedProfile({
      ...editedProfile,
      medicalInfo: updatedMedicalInfo
    });
    
    setNewAllergy('');
  };
  
  // Function to remove allergy
  const handleRemoveAllergy = (allergy: string) => {
    const updatedAllergies = editedProfile.medicalInfo.allergies.filter(a => a !== allergy);
    
    const updatedMedicalInfo = {
      ...editedProfile.medicalInfo,
      allergies: updatedAllergies
    };
    
    setEditedProfile({
      ...editedProfile,
      medicalInfo: updatedMedicalInfo
    });
  };
  
  // Function to add new medication
  const handleAddMedication = () => {
    if (!newMedication.trim()) return;
    
    const updatedMedicalInfo = {
      ...editedProfile.medicalInfo,
      medications: [...editedProfile.medicalInfo.medications, newMedication.trim()]
    };
    
    setEditedProfile({
      ...editedProfile,
      medicalInfo: updatedMedicalInfo
    });
    
    setNewMedication('');
  };
  
  // Function to remove medication
  const handleRemoveMedication = (medication: string) => {
    const updatedMedications = editedProfile.medicalInfo.medications.filter(m => m !== medication);
    
    const updatedMedicalInfo = {
      ...editedProfile.medicalInfo,
      medications: updatedMedications
    };
    
    setEditedProfile({
      ...editedProfile,
      medicalInfo: updatedMedicalInfo
    });
  };
  
  // Function to add new medical condition
  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    
    const updatedMedicalInfo = {
      ...editedProfile.medicalInfo,
      conditions: [...editedProfile.medicalInfo.conditions, newCondition.trim()]
    };
    
    setEditedProfile({
      ...editedProfile,
      medicalInfo: updatedMedicalInfo
    });
    
    setNewCondition('');
  };
  
  // Function to remove medical condition
  const handleRemoveCondition = (condition: string) => {
    const updatedConditions = editedProfile.medicalInfo.conditions.filter(c => c !== condition);
    
    const updatedMedicalInfo = {
      ...editedProfile.medicalInfo,
      conditions: updatedConditions
    };
    
    setEditedProfile({
      ...editedProfile,
      medicalInfo: updatedMedicalInfo
    });
  };
  
  // Function to save medical information
  const handleSaveMedicalInfo = () => {
    setProfile({
      ...profile,
      medicalInfo: editedProfile.medicalInfo
    });
    
    setShowMedicalDialog(false);
    
    toast({
      title: "Medical Information Updated",
      description: "Your medical information has been updated successfully.",
    });
  };
  
  // Format date of birth for display
  const formatDateOfBirth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Details</CardTitle>
            {!editMode ? (
              <Button 
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveProfile}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
          <CardDescription>
            View and update your personal information
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <Tabs defaultValue="personal" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Details</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
              <TabsTrigger value="medical">Medical Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {editMode ? (
                    <Input 
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  {editMode ? (
                    <Input 
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  {editMode ? (
                    <Input 
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  {editMode ? (
                    <Input 
                      type="date"
                      value={editedProfile.dateOfBirth}
                      onChange={(e) => setEditedProfile({...editedProfile, dateOfBirth: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{formatDateOfBirth(profile.dateOfBirth)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  {editMode ? (
                    <Input 
                      value={editedProfile.address}
                      onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <Home className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  {editMode ? (
                    <Input 
                      value={editedProfile.nationality}
                      onChange={(e) => setEditedProfile({...editedProfile, nationality: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <Flag className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.nationality}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  {editMode ? (
                    <select 
                      className="w-full h-10 px-3 rounded-md border bg-background"
                      value={editedProfile.preferredLanguage}
                      onChange={(e) => setEditedProfile({...editedProfile, preferredLanguage: e.target.value})}
                    >
                      <option value="English">English</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Dutch">Dutch</option>
                      <option value="Italian">Italian</option>
                    </select>
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <Languages className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.preferredLanguage}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Passport Number</Label>
                  {editMode ? (
                    <Input 
                      value={editedProfile.passportNumber}
                      onChange={(e) => setEditedProfile({...editedProfile, passportNumber: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.passportNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Why We Need Your Information</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your personal details help us coordinate your dental care and travel arrangements. 
                      This information is shared with your dental clinic to prepare for your treatment.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="emergency" className="pt-4">
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Important</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Please provide emergency contact information for someone who is not traveling with you. 
                      This person will be contacted in case of emergency during your treatment or stay.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Emergency Contact</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditedProfile({...profile});
                      setShowEmergencyDialog(true);
                    }}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-500">Name</Label>
                    <div className="mt-1 font-medium">{profile.emergencyContact.name}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">Relationship</Label>
                    <div className="mt-1 font-medium">{profile.emergencyContact.relationship}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">Phone</Label>
                    <div className="mt-1 font-medium flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      {profile.emergencyContact.phone}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <div className="mt-1 font-medium flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      {profile.emergencyContact.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">When We Contact Your Emergency Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>If there's a medical emergency during your treatment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>If we're unable to reach you for critical appointment updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>In case of emergency situations during your stay in Istanbul</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="medical" className="pt-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">Medical Information</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This information will be shared with your dental clinic to ensure safe treatment
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setEditedProfile({...profile});
                    setShowMedicalDialog(true);
                  }}
                >
                  <PencilLine className="h-4 w-4 mr-2" />
                  Update Medical Info
                </Button>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.medicalInfo.allergies.length > 0 ? (
                      <ul className="space-y-1">
                        {profile.medicalInfo.allergies.map((allergy, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 mr-2"></span>
                            {allergy}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No allergies recorded</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                      Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.medicalInfo.medications.length > 0 ? (
                      <ul className="space-y-1">
                        {profile.medicalInfo.medications.map((medication, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></span>
                            {medication}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No medications recorded</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-amber-500" />
                      Medical Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.medicalInfo.conditions.length > 0 ? (
                      <ul className="space-y-1">
                        {profile.medicalInfo.conditions.map((condition, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mr-2"></span>
                            {condition}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No medical conditions recorded</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Info className="h-4 w-4 mr-2 text-gray-500" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.medicalInfo.notes ? (
                      <p className="text-sm">{profile.medicalInfo.notes}</p>
                    ) : (
                      <p className="text-gray-500 text-sm">No additional notes</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Why is my medical information important?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Your medical information helps ensure your dental treatment is safe and appropriate. 
                        Certain conditions, allergies, and medications can affect:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>The type of anesthesia that can be used</li>
                        <li>Medications prescribed for pain or infection</li>
                        <li>The dental procedures recommended for you</li>
                        <li>Precautions needed during your treatment</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 p-4">
          <div className="w-full flex justify-between items-center text-sm text-gray-500">
            <div>
              <p>Need help with your profile? Contact our support team</p>
            </div>
            <div>
              <Button 
                variant="link" 
                size="sm"
                className="text-blue-600 p-0 h-auto"
                onClick={() => {
                  toast({
                    title: "Support",
                    description: "Please visit the Support tab to contact our team.",
                  });
                }}
              >
                Get Help
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Emergency Contact Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Update Emergency Contact
            </DialogTitle>
            <DialogDescription>
              Who should we contact in case of emergency?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={editedProfile.emergencyContact.name}
                onChange={(e) => setEditedProfile({
                  ...editedProfile, 
                  emergencyContact: {
                    ...editedProfile.emergencyContact,
                    name: e.target.value
                  }
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Input 
                value={editedProfile.emergencyContact.relationship}
                onChange={(e) => setEditedProfile({
                  ...editedProfile, 
                  emergencyContact: {
                    ...editedProfile.emergencyContact,
                    relationship: e.target.value
                  }
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                value={editedProfile.emergencyContact.phone}
                onChange={(e) => setEditedProfile({
                  ...editedProfile, 
                  emergencyContact: {
                    ...editedProfile.emergencyContact,
                    phone: e.target.value
                  }
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email"
                value={editedProfile.emergencyContact.email}
                onChange={(e) => setEditedProfile({
                  ...editedProfile, 
                  emergencyContact: {
                    ...editedProfile.emergencyContact,
                    email: e.target.value
                  }
                })}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEmergencyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEmergencyContact}
              disabled={!editedProfile.emergencyContact.name || !editedProfile.emergencyContact.phone}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Medical Information Dialog */}
      <Dialog open={showMedicalDialog} onOpenChange={setShowMedicalDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Update Medical Information
            </DialogTitle>
            <DialogDescription>
              Please provide your medical information to ensure safe dental treatment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                Allergies
              </h3>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedProfile.medicalInfo.allergies.map((allergy, index) => (
                    <div 
                      key={index} 
                      className="bg-red-50 text-red-700 text-sm px-2 py-1 rounded border border-red-200 flex items-center"
                    >
                      {allergy}
                      <button 
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveAllergy(allergy)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Add allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAllergy.trim()) {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddAllergy}
                    disabled={!newAllergy.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2 text-blue-500" />
                Current Medications
              </h3>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedProfile.medicalInfo.medications.map((medication, index) => (
                    <div 
                      key={index} 
                      className="bg-blue-50 text-blue-700 text-sm px-2 py-1 rounded border border-blue-200 flex items-center"
                    >
                      {medication}
                      <button 
                        type="button"
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={() => handleRemoveMedication(medication)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Add medication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMedication.trim()) {
                        e.preventDefault();
                        handleAddMedication();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddMedication}
                    disabled={!newMedication.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-amber-500" />
                Medical Conditions
              </h3>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedProfile.medicalInfo.conditions.map((condition, index) => (
                    <div 
                      key={index} 
                      className="bg-amber-50 text-amber-700 text-sm px-2 py-1 rounded border border-amber-200 flex items-center"
                    >
                      {condition}
                      <button 
                        type="button"
                        className="ml-1 text-amber-500 hover:text-amber-700"
                        onClick={() => handleRemoveCondition(condition)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Add medical condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCondition.trim()) {
                        e.preventDefault();
                        handleAddCondition();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddCondition}
                    disabled={!newCondition.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-gray-500" />
                Additional Notes
              </h3>
              
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[100px]"
                placeholder="Any additional information your dental team should know"
                value={editedProfile.medicalInfo.notes}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  medicalInfo: {
                    ...editedProfile.medicalInfo,
                    notes: e.target.value
                  }
                })}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowMedicalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMedicalInfo}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Medical Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSection;