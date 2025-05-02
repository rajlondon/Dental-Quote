import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { 
  Bell, BellOff, WifiOff, RefreshCw, MessageSquare, CalendarClock, 
  FileText, CreditCard, AlertCircle, Megaphone, ShieldAlert, Trash2
} from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { NotificationCategory } from '@shared/notifications';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationsPopoverProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead?: (id: string) => void;
  markAllAsRead?: () => void;
  deleteNotification?: (id: string) => void;
  connected?: boolean;
  onRetryConnection?: () => void;
}

export function NotificationsPopover({ 
  notifications, 
  unreadCount, 
  markAsRead = () => {}, 
  markAllAsRead = () => {},
  deleteNotification = () => {},
  connected = true,
  onRetryConnection = () => {}
}: NotificationsPopoverProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [_, setLocation] = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Show connectivity tooltip after short delay when disconnected
  useEffect(() => {
    let tooltipTimer: NodeJS.Timeout | null = null;
    
    if (!connected) {
      tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 5000);
    } else {
      setShowTooltip(false);
    }
    
    return () => {
      if (tooltipTimer) {
        clearTimeout(tooltipTimer);
      }
    };
  }, [connected]);

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
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case 'appointment':
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <CalendarClock className="h-4 w-4" />
          </div>
        );
      case 'treatment':
        return (
          <div className="bg-teal-100 text-teal-600 p-2 rounded-full">
            <FileText className="h-4 w-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="bg-violet-100 text-violet-600 p-2 rounded-full">
            <CreditCard className="h-4 w-4" />
          </div>
        );
      case 'document':
        return (
          <div className="bg-amber-100 text-amber-600 p-2 rounded-full">
            <FileText className="h-4 w-4" />
          </div>
        );
      case 'system':
        return (
          <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
            <AlertCircle className="h-4 w-4" />
          </div>
        );
      case 'offer':
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <Megaphone className="h-4 w-4" />
          </div>
        );
      case 'update':
        return (
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
            <ShieldAlert className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        {showTooltip && !connected && (
          <div className="absolute -top-10 -right-1 bg-amber-50 text-amber-800 border border-amber-200 shadow-sm rounded-md p-2 text-xs w-48 z-50">
            <div className="flex items-center gap-1 mb-1">
              <WifiOff className="h-3 w-3" />
              <span className="font-bold">Connection issue</span>
            </div>
            <p className="mb-1">Real-time notifications may be delayed</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs p-1 hover:bg-amber-100"
              onClick={(e) => {
                e.stopPropagation();
                onRetryConnection();
                setShowTooltip(false);
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reconnect
            </Button>
          </div>
        )}
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            {connected ? (
              <Bell className="h-5 w-5" />
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <BellOff className="h-5 w-5 text-amber-500" />
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Notification service disconnected</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
      </div>
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
                      className={`relative p-4 hover:bg-gray-50 group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div 
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
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
                      
                      {/* Delete button with tooltip */}
                      <div className="absolute right-2 top-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{t('notifications.delete', 'Delete notification')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="p-3 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => setIsOpen(false)}
            >
              {t('common.close', 'Close')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600"
              onClick={() => {
                setLocation('/patient-portal?section=messages');
                setIsOpen(false);
              }}
            >
              {t('notifications.view_all', 'View all')}
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}