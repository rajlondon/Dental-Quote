import React, { useState, useEffect } from 'react';
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
  Heart,
  Loader2
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
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface MedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  notes: string;
}

interface UserProfile {
  // Basic details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  preferredLanguage: string;
  passportNumber: string;
  
  // Complex fields
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
}

// Default empty profile structure - used only until actual data loads
const emptyProfile: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  dateOfBirth: "",
  nationality: "",
  preferredLanguage: "English",
  passportNumber: "",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
    email: ""
  },
  medicalInfo: {
    allergies: [],
    medications: [],
    conditions: [],
    notes: ""
  }
};

const ProfileSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for profile data
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(emptyProfile);
  
  // State for emergency and medical dialogs
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showMedicalDialog, setShowMedicalDialog] = useState(false);
  
  // State for new medical items
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  
  // State for loading indicators
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isMedicalLoading, setIsMedicalLoading] = useState(true);
  
  // Fetch basic profile data from auth user
  const { 
    data: basicProfileData, 
    isLoading: basicLoading,
    refetch: refetchBasicProfile
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      // The auth context already fetches this data, so we're just ensuring it's fresh
      const res = await apiRequest('GET', '/api/auth/user');
      const userData = await res.json();
      return userData || null;
    },
    enabled: !!user // Only run query if user is authenticated
  });
  
  // Fetch extended profile data (medical and emergency info)
  const {
    data: extendedProfileData,
    isLoading: extendedLoading,
    refetch: refetchExtendedProfile
  } = useQuery({
    queryKey: ['/api/portal/extended-profile'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/portal/extended-profile');
        const data = await res.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error('Error fetching extended profile:', error);
        return null;
      }
    },
    enabled: !!user // Only run query if user is authenticated
  });
  
  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const res = await apiRequest('POST', '/api/portal/update-profile', profileData);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully.",
        });
        
        // Refresh the query data to show the latest information
        refetchBasicProfile();
        refetchExtendedProfile();
        
        // Exit edit mode
        setEditMode(false);
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "There was an error updating your profile. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to merge profile data and set state
  useEffect(() => {
    const isLoading = basicLoading || extendedLoading;
    setIsProfileLoading(isLoading);
    
    console.log('ProfileSection data status:', { 
      isLoading, 
      basicLoading, 
      extendedLoading,
      hasUser: !!user,
      hasBasicData: !!basicProfileData,
      hasExtendedData: !!extendedProfileData
    });
    
    if (user) {
      console.log('User data available:', { 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email 
      });
    }
    
    if (extendedProfileData) {
      console.log('Extended profile data:', extendedProfileData);
    }
    
    if (!isLoading && basicProfileData && user) {
      // Start with basic info from the authenticated user
      const mergedProfile = {
        ...emptyProfile,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      };
      
      console.log('Merged basic profile:', mergedProfile);
      
      // Add extended profile info if available
      if (extendedProfileData) {
        mergedProfile.address = extendedProfileData.address || '';
        mergedProfile.dateOfBirth = extendedProfileData.dateOfBirth || '';
        mergedProfile.nationality = extendedProfileData.nationality || '';
        mergedProfile.preferredLanguage = extendedProfileData.preferredLanguage || 'English';
        mergedProfile.passportNumber = extendedProfileData.passportNumber || '';
        
        // Add emergency contact if available
        if (extendedProfileData.emergencyContact) {
          mergedProfile.emergencyContact = extendedProfileData.emergencyContact;
        }
        
        // Add medical info if available
        if (extendedProfileData.medicalInfo) {
          mergedProfile.medicalInfo = extendedProfileData.medicalInfo;
        }
        
        console.log('Merged full profile:', mergedProfile);
      }
      
      // Update state with the merged profile
      setProfile(mergedProfile);
      setEditedProfile(mergedProfile);
    }
  }, [basicProfileData, extendedProfileData, basicLoading, extendedLoading, user]);
  
  // Handler for medical info loading state
  useEffect(() => {
    setIsMedicalLoading(extendedLoading);
  }, [extendedLoading]);
  
  // Function to handle saving profile changes
  const handleSaveProfile = () => {
    // Submit the updated profile to the API
    updateProfileMutation.mutate({
      firstName: editedProfile.firstName,
      lastName: editedProfile.lastName,
      email: editedProfile.email,
      phone: editedProfile.phone,
      address: editedProfile.address,
      dateOfBirth: editedProfile.dateOfBirth,
      nationality: editedProfile.nationality,
      preferredLanguage: editedProfile.preferredLanguage,
      passportNumber: editedProfile.passportNumber,
      emergencyContact: editedProfile.emergencyContact,
      medicalInfo: editedProfile.medicalInfo
    });
    
    // The mutation's onSuccess will handle toast and edit mode
  };
  
  // Function to handle cancelling profile changes
  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setEditMode(false);
  };
  
  // Function to handle updating emergency contact
  const handleSaveEmergencyContact = () => {
    // Create partial profile update with just the emergency contact
    const profileUpdate = {
      emergencyContact: editedProfile.emergencyContact
    };
    
    // Send to the API
    updateProfileMutation.mutate(profileUpdate);
    
    // Close the dialog - the mutation success handler will handle the toasts
    setShowEmergencyDialog(false);
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
    // Create partial profile update with just the medical info
    const profileUpdate = {
      medicalInfo: editedProfile.medicalInfo
    };
    
    // Send to the API
    updateProfileMutation.mutate(profileUpdate);
    
    // Close the dialog - mutation success handler will take care of toast and state updates
    setShowMedicalDialog(false);
  };
  
  // Format date of birth for display
  const formatDateOfBirth = (dateStr: string) => {
    if (!dateStr) return 'Not provided';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateStr;
    }
  };
  
  console.log('ProfileSection render state:', {
    isProfileLoading,
    isMedicalLoading,
    editMode,
    tabsVisible: true,
    profileDataPresent: Object.keys(profile).length > 0
  });

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
              {isProfileLoading ? (
                <div className="flex items-center justify-center w-full p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      {editMode ? (
                        <Input 
                          value={editedProfile.firstName}
                          onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{profile.firstName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      {editMode ? (
                        <Input 
                          value={editedProfile.lastName}
                          onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 rounded-md border bg-gray-50">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{profile.lastName}</span>
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
                </>
              )}
            </TabsContent>
            
            <TabsContent value="emergency" className="pt-4">
              {isProfileLoading ? (
                <div className="flex items-center justify-center w-full p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
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
                        <div className="mt-1 font-medium">{profile.emergencyContact.name || 'Not provided'}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Relationship</Label>
                        <div className="mt-1 font-medium">{profile.emergencyContact.relationship || 'Not provided'}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Phone</Label>
                        <div className="mt-1 font-medium flex items-center">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          {profile.emergencyContact.phone || 'Not provided'}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Email</Label>
                        <div className="mt-1 font-medium flex items-center">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          {profile.emergencyContact.email || 'Not provided'}
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
                </>
              )}
            </TabsContent>
            
            <TabsContent value="medical" className="pt-4">
              {isMedicalLoading ? (
                <div className="flex items-center justify-center w-full p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Medical Information</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        This information will be shared with your dental clinic to ensure safe treatment
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditedProfile({...profile});
                        setShowMedicalDialog(true);
                      }}
                    >
                      <PencilLine className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Globe className="h-5 w-5 text-amber-500 mr-2" />
                        <h4 className="font-medium">Allergies</h4>
                      </div>
                      <div className="pl-7">
                        {profile.medicalInfo.allergies.length > 0 ? (
                          <ul className="space-y-1">
                            {profile.medicalInfo.allergies.map((allergy, index) => (
                              <li key={`allergy-${index}`} className="text-sm">{allergy}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No known allergies</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium">Current Medications</h4>
                      </div>
                      <div className="pl-7">
                        {profile.medicalInfo.medications.length > 0 ? (
                          <ul className="space-y-1">
                            {profile.medicalInfo.medications.map((medication, index) => (
                              <li key={`medication-${index}`} className="text-sm">{medication}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No current medications</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Heart className="h-5 w-5 text-red-500 mr-2" />
                        <h4 className="font-medium">Medical Conditions</h4>
                      </div>
                      <div className="pl-7">
                        {profile.medicalInfo.conditions.length > 0 ? (
                          <ul className="space-y-1">
                            {profile.medicalInfo.conditions.map((condition, index) => (
                              <li key={`condition-${index}`} className="text-sm">{condition}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No medical conditions</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {profile.medicalInfo.notes && (
                    <div className="mt-6 border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Additional Notes</h4>
                      <p className="text-sm">{profile.medicalInfo.notes}</p>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 rounded-lg p-4 mt-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Medical Information Privacy</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Your medical information is only shared with healthcare providers directly involved in your treatment.
                          It's stored securely and handled according to privacy regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Emergency Contact Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Emergency Contact</DialogTitle>
            <DialogDescription>
              Provide details of someone we can contact in case of an emergency.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ec-name" className="text-right">
                Name
              </Label>
              <Input
                id="ec-name"
                className="col-span-3"
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ec-relationship" className="text-right">
                Relationship
              </Label>
              <Input
                id="ec-relationship"
                className="col-span-3"
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ec-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="ec-phone"
                className="col-span-3"
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ec-email" className="text-right">
                Email
              </Label>
              <Input
                id="ec-email"
                type="email"
                className="col-span-3"
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
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEmergencyDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEmergencyContact}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Medical Information Dialog */}
      <Dialog open={showMedicalDialog} onOpenChange={setShowMedicalDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Medical Information</DialogTitle>
            <DialogDescription>
              This information helps ensure your safety during treatment. It will only be shared with healthcare providers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Allergies</h4>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a new allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                  />
                  <Button onClick={handleAddAllergy}>Add</Button>
                </div>
                <div className="space-y-1">
                  {editedProfile.medicalInfo.allergies.map((allergy, index) => (
                    <div key={`allergy-edit-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{allergy}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveAllergy(allergy)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Current Medications</h4>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a medication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMedication();
                      }
                    }}
                  />
                  <Button onClick={handleAddMedication}>Add</Button>
                </div>
                <div className="space-y-1">
                  {editedProfile.medicalInfo.medications.map((medication, index) => (
                    <div key={`medication-edit-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{medication}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveMedication(medication)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Medical Conditions</h4>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a medical condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCondition();
                      }
                    }}
                  />
                  <Button onClick={handleAddCondition}>Add</Button>
                </div>
                <div className="space-y-1">
                  {editedProfile.medicalInfo.conditions.map((condition, index) => (
                    <div key={`condition-edit-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{condition}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveCondition(condition)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="medical-notes">Additional Notes</Label>
              <textarea
                id="medical-notes"
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
                placeholder="Any other important medical information"
                value={editedProfile.medicalInfo.notes}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  medicalInfo: {
                    ...editedProfile.medicalInfo,
                    notes: e.target.value
                  }
                })}
              ></textarea>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowMedicalDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveMedicalInfo}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSection;