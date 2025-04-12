import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronUp, ChevronDown, Users, Calendar, 
  ClipboardList, CreditCard, 
  ArrowRight, MessageSquare, Stethoscope, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dummy data for the dashboard
const stats = [
  { 
    id: 'patients', 
    title: 'Active Patients', 
    value: 38, 
    change: 8.3, 
    trend: 'up', 
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  { 
    id: 'appointments', 
    title: 'Appointments Today', 
    value: 8, 
    change: 25.0, 
    trend: 'up', 
    icon: <Calendar className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  { 
    id: 'quotes', 
    title: 'Pending Quotes', 
    value: 12, 
    change: 4.5, 
    trend: 'up', 
    icon: <ClipboardList className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  { 
    id: 'revenue', 
    title: 'Monthly Revenue', 
    value: '£28,950', 
    change: 10.2, 
    trend: 'up', 
    icon: <CreditCard className="h-5 w-5" />,
    color: 'bg-amber-500'
  },
];

const upcomingAppointments = [
  { 
    id: 1, 
    patientName: 'Michael Brown', 
    treatmentType: 'Dental Implants', 
    time: '09:30 AM', 
    duration: '120 min',
    status: 'confirmed',
    patientOrigin: 'UK'
  },
  { 
    id: 2, 
    patientName: 'Sarah Johnson', 
    treatmentType: 'Consultation', 
    time: '11:00 AM', 
    duration: '45 min',
    status: 'confirmed',
    patientOrigin: 'Netherlands'
  },
  { 
    id: 3, 
    patientName: 'David Smith', 
    treatmentType: 'Crown Placement', 
    time: '01:30 PM', 
    duration: '60 min',
    status: 'confirmed',
    patientOrigin: 'Germany'
  },
  { 
    id: 4, 
    patientName: 'Lisa Taylor', 
    treatmentType: 'Veneers', 
    time: '03:00 PM', 
    duration: '90 min',
    status: 'pending',
    patientOrigin: 'UK'
  },
];

const pendingReports = [
  { id: 1, patientName: 'Michael Brown', treatmentType: 'Dental Implants', dueDate: 'Today', status: 'urgent' },
  { id: 2, patientName: 'David Smith', treatmentType: 'Crown Placement', dueDate: 'Tomorrow', status: 'normal' },
  { id: 3, patientName: 'Emily Wilson', treatmentType: 'Post-Treatment Check', dueDate: 'May, 25', status: 'normal' },
];

const ClinicDashboardSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-primary text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t("clinic.dashboard.welcome", "Welcome to Maltepe Dental Clinic Portal")}
              </h2>
              <p className="text-primary-foreground/80">
                {t("clinic.dashboard.welcome_message", "Manage your patients, appointments, and quotes in one place.")}
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-full">
              <Stethoscope className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.color} p-3 rounded-full`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className={`text-xs font-medium flex items-center ${
                  stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                } px-2 py-1 rounded-full`}>
                  {stat.trend === 'up' ? (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Schedule and Pending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>{t("clinic.dashboard.todays_schedule", "Today's Schedule")}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                {t("clinic.dashboard.view_all", "View Full Calendar")}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription>
              {t("clinic.dashboard.schedule_desc", "Appointments scheduled for today")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {appointment.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{appointment.patientName}</p>
                      <Badge 
                        variant={appointment.status === 'confirmed' ? 'outline' : 'secondary'}
                        className={appointment.status === 'confirmed' ? 'border-green-200 bg-green-50 text-green-700' : ''}
                      >
                        {appointment.status === 'confirmed' 
                          ? t("clinic.dashboard.confirmed", "Confirmed") 
                          : t("clinic.dashboard.pending", "Pending")}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="text-xs text-gray-500 flex items-center mr-3">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {appointment.time} ({appointment.duration})
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Stethoscope className="h-3 w-3 mr-1 text-gray-400" />
                        {appointment.treatmentType}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-gray-500 mr-3">
                        {t("clinic.dashboard.patient_from", "From")}: {appointment.patientOrigin}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        {t("clinic.dashboard.view_details", "View Details")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4 flex justify-center">
            <Button variant="outline" className="gap-1">
              {t("clinic.dashboard.manage_appointments", "Manage Appointments")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Medical Reports */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>{t("clinic.dashboard.pending_reports", "Pending Reports")}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                {t("clinic.dashboard.view_all", "View All")}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription>
              {t("clinic.dashboard.reports_desc", "Medical reports pending completion")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div key={report.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <FileCheck className={`h-5 w-5 mr-2 ${
                        report.status === 'urgent' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                      <span className="font-medium">{report.patientName}</span>
                    </div>
                    <Badge 
                      variant={report.status === 'urgent' ? 'default' : 'outline'}
                      className={report.status === 'urgent' ? 'bg-red-500' : 'border-amber-200 bg-amber-50 text-amber-700'}
                    >
                      {report.status === 'urgent' 
                        ? t("clinic.dashboard.urgent", "Urgent") 
                        : t("clinic.dashboard.normal", "Normal")}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">{report.treatmentType}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {t("clinic.dashboard.due", "Due")}: <span className={report.status === 'urgent' ? 'font-medium text-red-600' : ''}>{report.dueDate}</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {t("clinic.dashboard.complete_report", "Complete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4 flex justify-center">
            <Button variant="outline" className="gap-1">
              {t("clinic.dashboard.manage_reports", "Manage Reports")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Treatment Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.dashboard.treatment_performance", "Treatment Performance")}</CardTitle>
          <CardDescription>
            {t("clinic.dashboard.performance_desc", "Success rates and patient satisfaction by treatment type")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm font-medium">Dental Implants</span>
                </div>
                <div className="text-sm font-medium">98% Success Rate</div>
              </div>
              <Progress value={98} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>42 Procedures</span>
                <span>4.9/5 Patient Rating</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">Veneers</span>
                </div>
                <div className="text-sm font-medium">96% Success Rate</div>
              </div>
              <Progress value={96} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>36 Procedures</span>
                <span>4.8/5 Patient Rating</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm font-medium">Crowns</span>
                </div>
                <div className="text-sm font-medium">100% Success Rate</div>
              </div>
              <Progress value={100} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>28 Procedures</span>
                <span>4.7/5 Patient Rating</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm font-medium">Whitening</span>
                </div>
                <div className="text-sm font-medium">99% Success Rate</div>
              </div>
              <Progress value={99} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>24 Procedures</span>
                <span>4.9/5 Patient Rating</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-center">
          <Button variant="outline" className="gap-1">
            {t("clinic.dashboard.view_detailed_analytics", "View Detailed Analytics")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="py-6 flex justify-center gap-2">
          <Calendar className="h-5 w-5" />
          {t("clinic.dashboard.schedule_appointment", "Schedule Appointment")}
        </Button>
        <Button variant="outline" className="py-6 flex justify-center gap-2">
          <FileCheck className="h-5 w-5" />
          {t("clinic.dashboard.upload_report", "Upload Medical Report")}
        </Button>
        <Button variant="secondary" className="py-6 flex justify-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {t("clinic.dashboard.create_quote", "Create Quote")}
        </Button>
        <Button variant="outline" className="py-6 flex justify-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t("clinic.dashboard.message_patient", "Message Patient")}
        </Button>
      </div>
    </div>
  );
};

export default ClinicDashboardSection;