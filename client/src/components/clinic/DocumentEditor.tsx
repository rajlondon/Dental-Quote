import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, FileQuestion, Save, FileEdit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  category: 'patient_record' | 'x_ray' | 'treatment_plan' | 'consent_form' | 'lab_report' | 'other';
  size: number;
  uploaded: string;
  uploadedBy: string;
  patientId?: string;
  patientName?: string;
  shared: boolean;
  thumbnail?: string;
  description?: string;
}

interface DocumentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onSave: (updatedDocument: Document) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  open, 
  onOpenChange, 
  document, 
  onSave 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [editedDocument, setEditedDocument] = useState<Document | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Update local state when document prop changes
  React.useEffect(() => {
    if (document) {
      setEditedDocument({...document});
    } else {
      setEditedDocument(null);
    }
  }, [document]);
  
  if (!editedDocument) return null;
  
  const handleInputChange = (field: keyof Document, value: any) => {
    setEditedDocument(prev => prev ? {...prev, [field]: value} : null);
  };
  
  const handleSave = () => {
    if (!editedDocument) return;
    
    setSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onSave(editedDocument);
      
      toast({
        title: t("clinic.documents.saved", "Document Updated"),
        description: t("clinic.documents.save_success", "Document details have been updated successfully."),
      });
      
      setSaving(false);
      onOpenChange(false);
    }, 500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileEdit className="h-5 w-5 mr-2" />
            {t("clinic.documents.edit_document", "Edit Document")}
          </DialogTitle>
          <DialogDescription>
            {t("clinic.documents.edit_description", "Update document details and properties.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="document-name">
              {t("clinic.documents.name", "Document Name")}
            </Label>
            <Input 
              id="document-name" 
              value={editedDocument.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-description">
              {t("clinic.documents.description", "Description (Optional)")}
            </Label>
            <Textarea 
              id="document-description" 
              value={editedDocument.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t("clinic.documents.description_placeholder", "Enter a brief description of this document...")}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>
              {t("clinic.documents.category", "Document Category")}
            </Label>
            <RadioGroup 
              value={editedDocument.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient_record" id="edit-patient-record" />
                  <Label htmlFor="edit-patient-record">
                    {t("clinic.documents.categories.patient_record", "Patient Records")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="x_ray" id="edit-x-ray" />
                  <Label htmlFor="edit-x-ray">
                    {t("clinic.documents.categories.x_ray", "X-Rays & Scans")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="treatment_plan" id="edit-treatment-plan" />
                  <Label htmlFor="edit-treatment-plan">
                    {t("clinic.documents.categories.treatment_plan", "Treatment Plan")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consent_form" id="edit-consent-form" />
                  <Label htmlFor="edit-consent-form">
                    {t("clinic.documents.categories.consent_form", "Consent Form")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lab_report" id="edit-lab-report" />
                  <Label htmlFor="edit-lab-report">
                    {t("clinic.documents.categories.lab_report", "Lab Report")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="edit-other" />
                  <Label htmlFor="edit-other">
                    {t("clinic.documents.categories.other", "Other")}
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-select">
              {t("clinic.documents.assign_patient", "Assign to Patient")}
            </Label>
            <Select 
              value={editedDocument.patientId || ''} 
              onValueChange={(value) => {
                const patientMap: {[key: string]: string} = {
                  'PT001': 'John Smith',
                  'PT002': 'Sarah Johnson',
                  'PT003': 'Michael Brown',
                  'PT004': 'Emma Davis',
                  'PT005': 'William Wilson',
                };
                
                handleInputChange('patientId', value || undefined);
                handleInputChange('patientName', value ? patientMap[value] : undefined);
              }}
            >
              <SelectTrigger id="patient-select">
                <SelectValue placeholder={t("clinic.documents.select_patient", "Select a patient")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {t("clinic.documents.no_patient", "No specific patient")}
                </SelectItem>
                <SelectItem value="PT001">John Smith</SelectItem>
                <SelectItem value="PT002">Sarah Johnson</SelectItem>
                <SelectItem value="PT003">Michael Brown</SelectItem>
                <SelectItem value="PT004">Emma Davis</SelectItem>
                <SelectItem value="PT005">William Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="document-shared" 
              checked={editedDocument.shared}
              onCheckedChange={(checked) => handleInputChange('shared', checked)}
            />
            <Label htmlFor="document-shared">
              {t("clinic.documents.shared_with_patient", "Share with Patient")}
            </Label>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving 
              ? t("clinic.documents.saving", "Saving...") 
              : t("clinic.documents.save", "Save Changes")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditor;