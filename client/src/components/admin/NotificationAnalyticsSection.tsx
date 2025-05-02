import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

// Define the analytics data structure
interface NotificationAnalytics {
  total_notifications: number;
  read_count: number;
  unread_count: number;
  engagement_rate: number;
  average_time_to_read: number | null;
  notifications_by_category: Record<string, number>;
  notifications_by_priority: Record<string, number>;
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

export default function NotificationAnalyticsSection() {
  const { t } = useTranslation();

  // Fetch notification analytics data
  const { data, isLoading, error } = useQuery<NotificationAnalytics>({
    queryKey: ['/api/notifications/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications/analytics');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive gap-2">
        <AlertTriangle className="h-8 w-8" />
        <p>{t('admin.notifications.analytics_error', 'Failed to load notification analytics')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>{t('admin.notifications.no_data', 'No analytics data available')}</p>
      </div>
    );
  }

  // Transform category data for charts
  const categoryData = Object.entries(data.notifications_by_category).map(([name, value]) => ({
    name: t(`notification.category.${name}`, name),
    value
  }));

  // Transform priority data for charts
  const priorityData = Object.entries(data.notifications_by_priority).map(([name, value]) => ({
    name: t(`notification.priority.${name}`, name),
    value
  }));

  // Data for read vs unread pie chart
  const readUnreadData = [
    { 
      name: t('admin.notifications.read', 'Read'), 
      value: data.read_count 
    },
    { 
      name: t('admin.notifications.unread', 'Unread'), 
      value: data.unread_count 
    }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">
        {t('admin.notifications.analytics_title', 'Notification Analytics')}
      </h2>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.notifications.total', 'Total Notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_notifications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.notifications.engagement', 'Engagement Rate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.engagement_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.notifications.engagement_desc', 'Percentage of notifications that have been read')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.notifications.avg_time', 'Avg. Time to Read')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.average_time_to_read !== null 
                ? `${Math.floor(data.average_time_to_read / 60)}m ${Math.floor(data.average_time_to_read % 60)}s`
                : t('admin.notifications.not_available', 'N/A')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.notifications.avg_time_desc', 'Average time before users read notifications')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.notifications.unread_count', 'Unread Notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.unread_count}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.notifications.unread_desc', 'Notifications that have not been viewed yet')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Notifications by Category */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('admin.notifications.by_category', 'Notifications by Category')}</CardTitle>
            <CardDescription>
              {t('admin.notifications.by_category_desc', 'Distribution of notifications across different categories')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Read vs Unread */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('admin.notifications.read_vs_unread', 'Read vs Unread Notifications')}</CardTitle>
            <CardDescription>
              {t('admin.notifications.read_vs_unread_desc', 'Proportion of notifications that have been read')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={readUnreadData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {readUnreadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications by Priority */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('admin.notifications.by_priority', 'Notifications by Priority')}</CardTitle>
            <CardDescription>
              {t('admin.notifications.by_priority_desc', 'Distribution of notifications by priority level')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}