import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Notification } from '@/hooks/use-notifications';

interface NotificationsPopoverProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead?: (id: string) => void;
  markAllAsRead?: () => void;
}

export function NotificationsPopover({ 
  notifications, 
  unreadCount, 
  markAsRead = () => {}, 
  markAllAsRead = () => {} 
}: NotificationsPopoverProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [_, setLocation] = useLocation();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
    setIsOpen(false);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <div className="bg-blue-100 text-blue-600 p-2 rounded-full">💬</div>;
      case 'appointment':
        return <div className="bg-green-100 text-green-600 p-2 rounded-full">📅</div>;
      case 'system':
        return <div className="bg-orange-100 text-orange-600 p-2 rounded-full">📋</div>;
      case 'update':
        return <div className="bg-purple-100 text-purple-600 p-2 rounded-full">✈️</div>;
      default:
        return <div className="bg-gray-100 text-gray-600 p-2 rounded-full">🔔</div>;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">
              {t('notifications.title', 'Notifications')}
            </CardTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={markAllAsRead}
              >
                {t('notifications.mark_all_read', 'Mark all as read')}
              </Button>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {t('notifications.empty', 'No notifications yet')}
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-blue-800' : 'text-gray-800'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="p-3 justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => setLocation('/patient-portal?section=messages')}
            >
              {t('notifications.view_all', 'View all')}
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}