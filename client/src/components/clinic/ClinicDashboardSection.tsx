import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, ClipboardList, Users } from 'lucide-react';

const ClinicDashboardSection: React.FC = () => {
  const { t } = useTranslation();

  // Sample data - in a real app, this would come from an API
  const stats = [
    {
      title: t("clinic.dashboard.patients", "Patients"),
      value: "124",
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: t("clinic.dashboard.quotes", "Quotes"),
      value: "38",
      icon: <ClipboardList className="h-5 w-5 text-primary" />,
      change: "+5%",
      changeType: "positive"
    },
    {
      title: t("clinic.dashboard.appointments", "Appointments"),
      value: "27",
      icon: <Calendar className="h-5 w-5 text-primary" />,
      change: "+8%",
      changeType: "positive"
    },
    {
      title: t("clinic.dashboard.revenue", "Revenue"),
      value: "£24,560",
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      change: "+15%",
      changeType: "positive"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.dashboard.title", "Clinic Dashboard")}</CardTitle>
          <CardDescription>
            {t("clinic.dashboard.description", "Overview of your clinic's performance and recent activity")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/10 p-2 rounded-full">{stat.icon}</span>
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">
                  {t("clinic.dashboard.upcoming_appts", "Upcoming Appointments")}
                </TabsTrigger>
                <TabsTrigger value="recent">
                  {t("clinic.dashboard.recent_quotes", "Recent Quotes")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">John D.</h4>
                              <p className="text-sm text-muted-foreground">Dental Implant Consultation</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">10:30 AM</div>
                            <div className="text-sm text-muted-foreground">15 Apr 2025</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center">
                              <ClipboardList className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">Sarah M.</h4>
                              <p className="text-sm text-muted-foreground">Full Mouth Restoration</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">£4,860</div>
                            <div className="text-sm text-muted-foreground">12 Apr 2025</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicDashboardSection;