import React from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronUp, ChevronDown, Users, Calendar, 
  ClipboardList, CreditCard, Activity, 
  ArrowRight, MessageSquare, UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dummy data for the dashboard
const stats = [
  { 
    id: 'patients', 
    title: 'Total Patients', 
    value: 476, 
    change: 12.5, 
    trend: 'up', 
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  { 
    id: 'quotes', 
    title: 'Quote Requests', 
    value: 38, 
    change: 23.1, 
    trend: 'up', 
    icon: <ClipboardList className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  { 
    id: 'bookings', 
    title: 'Active Bookings', 
    value: 29, 
    change: 4.3, 
    trend: 'up', 
    icon: <Calendar className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  { 
    id: 'revenue', 
    title: 'Monthly Revenue', 
    value: '£9,274', 
    change: -2.4, 
    trend: 'down', 
    icon: <CreditCard className="h-5 w-5" />,
    color: 'bg-amber-500'
  },
];

const recentPatients = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@example.com', date: '2 days ago', status: 'Quoted' },
  { id: 2, name: 'Michael Brown', email: 'michael.b@example.com', date: '3 days ago', status: 'Booked' },
  { id: 3, name: 'David Smith', email: 'david.s@example.com', date: '1 week ago', status: 'Treatment' },
  { id: 4, name: 'Emily Wilson', email: 'emily.w@example.com', date: '2 weeks ago', status: 'Completed' },
];

const upcomingBookings = [
  { id: 1, patient: 'Michael Brown', treatment: 'Dental Implants', date: 'June 15, 2025', clinic: 'Maltepe Dental Clinic' },
  { id: 2, patient: 'Lisa Taylor', treatment: 'Veneers (8 units)', date: 'June 17, 2025', clinic: 'DentGroup Istanbul' },
  { id: 3, patient: 'Robert Wilson', treatment: 'Full Mouth Restoration', date: 'June 20, 2025', clinic: 'Maltepe Dental Clinic' },
];

const pendingQuotes = [
  { id: 1, patient: 'Sarah Johnson', treatments: 'Dental Implants, Crowns', date: 'May 10, 2025', status: 'Pending' },
  { id: 2, patient: 'James Williams', treatments: 'Veneers, Whitening', date: 'May 12, 2025', status: 'Pending' },
  { id: 3, patient: 'Patricia Davis', treatments: 'Full Mouth Reconstruction', date: 'May 13, 2025', status: 'In Progress' },
];

const AdminDashboardSection: React.FC = () => {
  // Translation removed
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
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

      {/* Recent Activity and Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Quotes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Pending Quotes</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription>
              Quote requests requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {quote.patient.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{quote.patient}</p>
                      <p className="text-xs text-gray-500 mt-1">{quote.treatments}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{quote.date}</span>
                        <Badge variant={quote.status === 'Pending' ? 'outline' : 'secondary'} className="text-xs">
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription>
              Scheduled treatments and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2.5 rounded-full text-purple-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.patient}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.treatment}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">{booking.date} • {booking.clinic}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate and Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Rate */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>
              Quote to booking conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">67%</div>
              <p className="text-sm text-green-600 flex items-center justify-center mt-1">
                <ChevronUp className="h-4 w-4 mr-1" />
                7% from last month
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Quotes to Consultations</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Consultations to Bookings</span>
                  <span className="font-medium">86%</span>
                </div>
                <Progress value={86} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Bookings to Treatments</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2 bg-gray-100" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button variant="outline" className="text-xs w-full gap-1">
              View Detailed Report
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Patients */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Patients</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription>
              Recently added patients and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Added</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{patient.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-500">{patient.email}</td>
                      <td className="py-3 text-gray-500">{patient.date}</td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={`${
                            patient.status === 'Quoted' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                            patient.status === 'Booked' ? 'border-green-200 bg-green-50 text-green-600' :
                            patient.status === 'Treatment' ? 'border-purple-200 bg-purple-50 text-purple-600' :
                            'border-gray-200 bg-gray-50 text-gray-600'
                          }`}
                        >
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-gray-500">
              Showing 4 of 476 patients
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <UserPlus className="h-4 w-4 mr-1" />
              Add Patient
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          className="py-6 flex justify-center gap-2"
          onClick={() => {
            // Directly navigate using window.location for now
            window.location.href = "/admin/new-quote";
          }}
        >
          <ClipboardList className="h-5 w-5" />
          Create New Quote
        </Button>
        <Button variant="outline" className="py-6 flex justify-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Consultation Call
        </Button>
        <Button variant="secondary" className="py-6 flex justify-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Message a Patient
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardSection;