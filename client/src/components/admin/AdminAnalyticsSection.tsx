import React from 'react';
// Removed react-i18next
import { BarChart3, LineChart, ArrowRight, ArrowUp, ArrowDown, DollarSign, Users, Calendar, Clipboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationAnalyticsSection from './NotificationAnalyticsSection';

const AdminAnalyticsSection: React.FC = () => {
  // Translation removed

  // Sample analytics data
  const conversionStats = [
    { label: 'Quote Requests', total: 243, change: 12.5, trend: 'up' },
    { label: 'Consultations', total: 189, change: 8.3, trend: 'up' },
    { label: 'Bookings', total: 142, change: 5.7, trend: 'up' },
    { label: 'Treatments Completed', total: 98, change: -2.1, trend: 'down' },
  ];

  const revenueData = [
    { month: 'Jan', value: 5200 },
    { month: 'Feb', value: 4800 },
    { month: 'Mar', value: 6300 },
    { month: 'Apr', value: 7100 },
    { month: 'May', value: 9200 },
  ];

  const treatmentStats = [
    { treatment: 'Dental Implants', count: 78, percentage: 30 },
    { treatment: 'Veneers', count: 52, percentage: 20 },
    { treatment: 'Crowns', count: 39, percentage: 15 },
    { treatment: 'Whitening', count: 31, percentage: 12 },
    { treatment: 'Others', count: 60, percentage: 23 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t("admin.analytics.overview", "Overview")}</TabsTrigger>
          <TabsTrigger value="bookings">{t("admin.analytics.bookings", "Bookings")}</TabsTrigger>
          <TabsTrigger value="revenue">{t("admin.analytics.revenue", "Revenue")}</TabsTrigger>
          <TabsTrigger value="treatments">{t("admin.analytics.treatments", "Treatments")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("admin.analytics.notifications", "Notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {conversionStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-md ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === 1 ? 'bg-green-100 text-green-600' :
                      index === 2 ? 'bg-purple-100 text-purple-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {index === 0 ? <Clipboard className="h-5 w-5" /> :
                       index === 1 ? <Users className="h-5 w-5" /> :
                       index === 2 ? <Calendar className="h-5 w-5" /> :
                       <DollarSign className="h-5 w-5" />}
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold">{stat.total}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.analytics.revenue_trend", "Revenue Trend")}</CardTitle>
                <CardDescription>{t("admin.analytics.last_months", "Last 5 months")}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[300px] relative">
                  {/* Simplified chart representation */}
                  <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                    {revenueData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-primary w-10 rounded-t-md" 
                          style={{ 
                            height: `${(item.value / Math.max(...revenueData.map(d => d.value))) * 200}px` 
                          }}
                        ></div>
                        <span className="text-xs mt-2">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-0 right-0 p-4">
                    <div className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
                      +15.3% YoY
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button variant="outline" size="sm" className="ml-auto gap-1">
                  {t("admin.analytics.detailed_report", "Detailed Report")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>

            {/* Treatment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.analytics.treatment_distribution", "Treatment Distribution")}</CardTitle>
                <CardDescription>{t("admin.analytics.by_popularity", "Breakdown by popularity")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentStats.map((treatment, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{treatment.treatment}</span>
                        <span className="text-sm text-gray-500">{treatment.count} ({treatment.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-amber-500' :
                            'bg-gray-500'
                          }`} 
                          style={{ width: `${treatment.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button variant="outline" size="sm" className="ml-auto gap-1">
                  {t("admin.analytics.treatment_insights", "Treatment Insights")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Placeholder content for other tabs */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.analytics.booking_analytics", "Booking Analytics")}</CardTitle>
              <CardDescription>
                {t("admin.analytics.booking_analytics_desc", "Detailed booking metrics and analytics")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{t("admin.analytics.coming_soon", "Analytics Coming Soon")}</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {t("admin.analytics.coming_soon_desc", "Detailed booking analytics are under development. You'll soon be able to analyze booking trends, conversion rates, and treatment preferences.")}
              </p>
              <Button variant="outline" className="gap-2">
                {t("admin.analytics.learn_more", "Learn More")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.analytics.revenue_analytics", "Revenue Analytics")}</CardTitle>
              <CardDescription>
                {t("admin.analytics.revenue_analytics_desc", "Financial performance and revenue tracking")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <LineChart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{t("admin.analytics.coming_soon", "Analytics Coming Soon")}</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {t("admin.analytics.revenue_coming_soon_desc", "Detailed revenue analytics are under development. You'll soon be able to track financial performance, revenue by treatment types, and growth trends.")}
              </p>
              <Button variant="outline" className="gap-2">
                {t("admin.analytics.learn_more", "Learn More")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.analytics.treatment_analytics", "Treatment Analytics")}</CardTitle>
              <CardDescription>
                {t("admin.analytics.treatment_analytics_desc", "Analysis of treatment preferences and trends")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{t("admin.analytics.coming_soon", "Analytics Coming Soon")}</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {t("admin.analytics.treatment_coming_soon_desc", "Detailed treatment analytics are under development. You'll soon be able to analyze popular procedures, patient demographics, and treatment outcomes.")}
              </p>
              <Button variant="outline" className="gap-2">
                {t("admin.analytics.learn_more", "Learn More")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Analytics */}
        <TabsContent value="notifications">
          <NotificationAnalyticsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalyticsSection;