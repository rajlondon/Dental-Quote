import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Image, FileQuestion, User, Archive } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Document['category']>('other');
  const [patientId, setPatientId] = useState('');
  const [shared, setShared] = useState(false);
  const [description, setDescription] = useState('');
  
  // Get document icon based on file type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-700" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Initialize form when document changes
  useEffect(() => {
    if (document) {
      setName(document.name);
      setCategory(document.category);
      setPatientId(document.patientId || 'none');
      setShared(document.shared);
      setDescription(document.description || '');
    }
  }, [document]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document) return;
    
    const updatedDocument: Document = {
      ...document,
      name,
      category,
      patientId: patientId === 'none' ? undefined : patientId,
      shared,
      description: description || undefined
    };
    
    onSave(updatedDocument);
    onOpenChange(false);
  };
  
  if (!document) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {getDocumentIcon(document.type)}
            <span className="ml-2">Edit Document</span>
          </DialogTitle>
          <DialogDescription>
            Update document details and sharing settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Name</Label>
            <Input
              id="document-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup value={category} onValueChange={(value) => setCategory(value as Document['category'])}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient_record" id="patient_record" />
                  <Label htmlFor="patient_record">
                    Patient Records
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="x_ray" id="x_ray" />
                  <Label htmlFor="x_ray">
                    X-Rays & Scans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="treatment_plan" id="treatment_plan" />
                  <Label htmlFor="treatment_plan">
                    Treatment Plans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consent_form" id="consent_form" />
                  <Label htmlFor="consent_form">
                    Consent Forms
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lab_report" id="lab_report" />
                  <Label htmlFor="lab_report">
                    Lab Reports
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">
                    Other
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-select">
              Assign to Patient
            </Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  No patient (general document)
                </SelectItem>
                <SelectItem value="PT001">John Smith</SelectItem>
                <SelectItem value="PT002">Sarah Johnson</SelectItem>
                <SelectItem value="PT003">Michael Brown</SelectItem>
                <SelectItem value="PT004">Emma Davis</SelectItem>
                <SelectItem value="PT005">William Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-description">
              Description
            </Label>
            <Textarea
              id="document-description"
              placeholder="Add a description for this document..."
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="share_with_patient" 
              checked={shared}
              onCheckedChange={(checked) => setShared(checked === true)}
            />
            <Label htmlFor="share_with_patient">
              Share with patient
            </Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditor;