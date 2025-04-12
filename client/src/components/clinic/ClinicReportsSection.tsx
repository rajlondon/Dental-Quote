import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, Calendar, Clock, Upload, Download, File, 
  Search, Filter, CheckCircle2, Camera, Stethoscope,
  X, Trash, ArrowRight, ChevronDown, Plus, Info
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Sample patient reports data
const patientReports = [
  {
    id: "MR-1001",
    patientName: "Michael Brown",
    patientId: "PT-2023",
    treatmentType: "Dental Implants",
    reportType: "Treatment Plan",
    dateCreated: "May 10, 2025",
    status: "Completed",
    lastUpdated: "May 12, 2025",
    images: 5,
    documents: 2
  },
  {
    id: "MR-1002",
    patientName: "Sarah Johnson",
    patientId: "PT-2045",
    treatmentType: "Consultation",
    reportType: "Initial Assessment",
    dateCreated: "May 15, 2025",
    status: "In Progress",
    lastUpdated: "May 15, 2025",
    images: 2,
    documents: 1
  },
  {
    id: "MR-1003",
    patientName: "David Smith",
    patientId: "PT-2067",
    treatmentType: "Crown Placement",
    reportType: "Procedure Report",
    dateCreated: "May 5, 2025",
    status: "Completed",
    lastUpdated: "May 8, 2025",
    images: 4,
    documents: 3
  },
  {
    id: "MR-1004",
    patientName: "Lisa Taylor",
    patientId: "PT-2089",
    treatmentType: "Veneers",
    reportType: "Treatment Plan",
    dateCreated: "May 18, 2025",
    status: "Pending",
    lastUpdated: "May 18, 2025",
    images: 0,
    documents: 1
  },
  {
    id: "MR-1005",
    patientName: "Robert Wilson",
    patientId: "PT-2103",
    treatmentType: "Full Mouth Restoration",
    reportType: "Progress Report",
    dateCreated: "May 2, 2025",
    status: "In Progress",
    lastUpdated: "May 13, 2025",
    images: 8,
    documents: 4
  }
];

// Sample report types for dropdown
const reportTypes = [
  "Initial Assessment",
  "Treatment Plan",
  "Procedure Report",
  "Progress Report",
  "Post-Treatment Evaluation",
  "Follow-up Assessment"
];

const ClinicReportsSection: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filter reports based on search and status
  const filteredReports = patientReports.filter(report => {
    const matchesSearch = 
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      report.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsViewReportOpen(true);
  };

  const handleFileSelect = () => {
    // Simulate file upload process
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("clinic.reports.search_placeholder", "Search by ID, patient name or ID...")}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                className="pl-2 pr-8 py-2 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("clinic.reports.all_statuses", "All Statuses")}</option>
                <option value="pending">{t("clinic.reports.pending", "Pending")}</option>
                <option value="in progress">{t("clinic.reports.in_progress", "In Progress")}</option>
                <option value="completed">{t("clinic.reports.completed", "Completed")}</option>
              </select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t("clinic.reports.filter", "More Filters")}
              </Button>
              
              <Button onClick={() => setIsAddReportOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("clinic.reports.new_report", "New Report")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("clinic.reports.medical_reports", "Medical Reports")}</CardTitle>
          <CardDescription>
            {t("clinic.reports.manage_desc", "Manage patient medical reports and documentation")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clinic.reports.id", "Report ID")}</TableHead>
                <TableHead>{t("clinic.reports.patient", "Patient")}</TableHead>
                <TableHead>{t("clinic.reports.type", "Report Type")}</TableHead>
                <TableHead>{t("clinic.reports.treatment", "Treatment")}</TableHead>
                <TableHead>{t("clinic.reports.date", "Date Created")}</TableHead>
                <TableHead>{t("clinic.reports.status", "Status")}</TableHead>
                <TableHead className="text-right">{t("clinic.reports.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {report.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{report.patientName}</div>
                          <div className="text-xs text-gray-500">{report.patientId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{report.reportType}</TableCell>
                    <TableCell>{report.treatmentType}</TableCell>
                    <TableCell>{report.dateCreated}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`
                          ${report.status === 'Pending' ? 'border-amber-200 bg-amber-50 text-amber-700' : ''}
                          ${report.status === 'In Progress' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                          ${report.status === 'Completed' ? 'border-green-200 bg-green-50 text-green-700' : ''}
                        `}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleViewReport(report)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          {t("clinic.reports.view", "View")}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          {t("clinic.reports.download", "Download")}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    {t("clinic.reports.no_results", "No reports found matching the criteria")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <div className="text-sm text-gray-500">
            {t("clinic.reports.showing_results", "Showing {{count}} reports", { count: filteredReports.length })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {t("clinic.reports.previous", "Previous")}
            </Button>
            <Button variant="outline" size="sm">
              {t("clinic.reports.next", "Next")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Add New Report Dialog */}
      <Dialog open={isAddReportOpen} onOpenChange={setIsAddReportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("clinic.reports.new_report", "Create New Medical Report")}</DialogTitle>
            <DialogDescription>
              {t("clinic.reports.new_report_desc", "Add a new medical report for a patient")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">{t("clinic.reports.select_patient", "Select Patient")}</Label>
              <select 
                id="patient"
                className="w-full pl-3 pr-10 py-2 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled selected>Select a patient...</option>
                <option value="PT-2023">Michael Brown (PT-2023)</option>
                <option value="PT-2045">Sarah Johnson (PT-2045)</option>
                <option value="PT-2067">David Smith (PT-2067)</option>
                <option value="PT-2089">Lisa Taylor (PT-2089)</option>
                <option value="PT-2103">Robert Wilson (PT-2103)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">{t("clinic.reports.report_type", "Report Type")}</Label>
                <select 
                  id="report-type"
                  className="w-full pl-3 pr-10 py-2 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20"
                >
                  {reportTypes.map((type, index) => (
                    <option key={index} value={type.toLowerCase().replace(/\s+/g, '-')}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatment">{t("clinic.reports.treatment_type", "Treatment Type")}</Label>
                <select 
                  id="treatment"
                  className="w-full pl-3 pr-10 py-2 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="dental-implants">Dental Implants</option>
                  <option value="veneers">Veneers</option>
                  <option value="crowns">Crowns</option>
                  <option value="root-canal">Root Canal</option>
                  <option value="full-mouth">Full Mouth Restoration</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">{t("clinic.reports.report_notes", "Report Notes")}</Label>
              <Textarea 
                id="notes"
                placeholder={t("clinic.reports.notes_placeholder", "Enter medical report details...")}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t("clinic.reports.upload_files", "Upload Files")}</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                <label 
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">
                    {t("clinic.reports.drag_drop", "Drag and drop files here or click to browse")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("clinic.reports.file_types", "Supported formats: PDF, JPEG, PNG, DICOM")}
                  </p>
                </label>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddReportOpen(false)}>
              {t("clinic.reports.cancel", "Cancel")}
            </Button>
            <Button type="submit">
              {t("clinic.reports.create_report", "Create Report")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      {selectedReport && (
        <Dialog open={isViewReportOpen} onOpenChange={setIsViewReportOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {t("clinic.reports.report_details", "Report Details")} - {selectedReport.id}
              </DialogTitle>
              <DialogDescription>
                {selectedReport.reportType} for {selectedReport.patientName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">{t("clinic.reports.patient_details", "Patient Details")}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedReport.patientName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedReport.patientName}</p>
                        <p className="text-sm text-gray-500">{selectedReport.patientId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">{t("clinic.reports.report_info", "Report Information")}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">{t("clinic.reports.report_type", "Report Type")}:</div>
                      <div>{selectedReport.reportType}</div>
                      
                      <div className="text-gray-500">{t("clinic.reports.treatment", "Treatment")}:</div>
                      <div>{selectedReport.treatmentType}</div>
                      
                      <div className="text-gray-500">{t("clinic.reports.created", "Created")}:</div>
                      <div>{selectedReport.dateCreated}</div>
                      
                      <div className="text-gray-500">{t("clinic.reports.last_updated", "Last Updated")}:</div>
                      <div>{selectedReport.lastUpdated}</div>
                      
                      <div className="text-gray-500">{t("clinic.reports.status", "Status")}:</div>
                      <div>
                        <Badge 
                          variant="outline"
                          className={`
                            ${selectedReport.status === 'Pending' ? 'border-amber-200 bg-amber-50 text-amber-700' : ''}
                            ${selectedReport.status === 'In Progress' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                            ${selectedReport.status === 'Completed' ? 'border-green-200 bg-green-50 text-green-700' : ''}
                          `}
                        >
                          {selectedReport.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t("clinic.reports.report_content", "Report Contents")}</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 border rounded-md text-center">
                        <p className="font-medium mb-1">
                          <Camera className="h-4 w-4 inline mr-1" />
                          {t("clinic.reports.images", "Images")}
                        </p>
                        <p className="text-2xl font-bold">{selectedReport.images}</p>
                      </div>
                      <div className="flex-1 p-3 border rounded-md text-center">
                        <p className="font-medium mb-1">
                          <File className="h-4 w-4 inline mr-1" />
                          {t("clinic.reports.documents", "Documents")}
                        </p>
                        <p className="text-2xl font-bold">{selectedReport.documents}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">{t("clinic.reports.report_actions", "Report Actions")}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full gap-1">
                        <Download className="h-4 w-4" />
                        {t("clinic.reports.download", "Download")}
                      </Button>
                      <Button variant="outline" className="w-full gap-1">
                        <Upload className="h-4 w-4" />
                        {t("clinic.reports.add_files", "Add Files")}
                      </Button>
                      <Button variant="default" className="w-full gap-1">
                        <Stethoscope className="h-4 w-4" />
                        {t("clinic.reports.update_report", "Update Report")}
                      </Button>
                      <Button variant="secondary" className="w-full gap-1">
                        <Info className="h-4 w-4" />
                        {t("clinic.reports.treatment_history", "Treatment History")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-medium">{t("clinic.reports.treatment_notes", "Treatment Notes")}</h3>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {selectedReport.id === "MR-1001" ? (
                    <p>Patient received dental implant treatment on May 10. Procedure was successful with no complications. Healing progress is good. Recommended follow-up in 2 weeks for assessment. Patient reported minimal discomfort post-procedure.</p>
                  ) : selectedReport.id === "MR-1003" ? (
                    <p>Crown placement completed successfully. Patient is satisfied with the aesthetics and function. No sensitivity reported. Occlusion is balanced and requires no adjustment.</p>
                  ) : (
                    <p>Treatment notes will appear here. This section contains detailed notes about the treatment progress, procedures performed, and patient's response to treatment.</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("clinic.reports.attached_files", "Attached Files")}</h3>
                {(selectedReport.images > 0 || selectedReport.documents > 0) ? (
                  <div className="space-y-2">
                    {selectedReport.images > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Array.from({ length: Math.min(3, selectedReport.images) }).map((_, index) => (
                          <div key={index} className="border rounded-md p-2">
                            <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                              <Camera className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-xs font-medium truncate">
                              {selectedReport.treatmentType.toLowerCase().replace(/\s+/g, '-')}-image-{index + 1}.jpg
                            </p>
                          </div>
                        ))}
                        {selectedReport.images > 3 && (
                          <div className="border rounded-md p-2 flex items-center justify-center">
                            <Button variant="link" className="text-xs">
                              + {selectedReport.images - 3} more images
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedReport.documents > 0 && (
                      <div className="space-y-2">
                        {Array.from({ length: Math.min(2, selectedReport.documents) }).map((_, index) => (
                          <div key={index} className="flex items-center border rounded-md p-2">
                            <File className="h-5 w-5 text-blue-500 mr-2" />
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">
                                {selectedReport.reportType.toLowerCase().replace(/\s+/g, '-')}-document-{index + 1}.pdf
                              </p>
                              <p className="text-xs text-gray-500">PDF Document • 2.4 MB</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {selectedReport.documents > 2 && (
                          <Button variant="link" className="text-xs">
                            + {selectedReport.documents - 2} more documents
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-sm text-gray-500">
                      {t("clinic.reports.no_files", "No files have been attached to this report yet")}
                    </p>
                    <Button variant="link" size="sm" className="mt-2">
                      {t("clinic.reports.add_files", "Add Files")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="border-t pt-4 flex gap-2">
              <Button variant="outline" onClick={() => setIsViewReportOpen(false)}>
                {t("clinic.reports.close", "Close")}
              </Button>
              {selectedReport.status !== 'Completed' && (
                <Button variant="default">
                  {selectedReport.status === 'Pending' 
                    ? t("clinic.reports.start_report", "Start Report") 
                    : t("clinic.reports.complete_report", "Complete Report")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClinicReportsSection;