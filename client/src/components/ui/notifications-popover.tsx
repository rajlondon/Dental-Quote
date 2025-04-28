import React from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function NotificationsPopover() {
  const { t } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  const [open, setOpen] = React.useState(false);
  
  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleDelete = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="bg-green-100 text-green-600 p-2 rounded-full"><Check className="h-4 w-4" /></div>;
      case 'warning':
        return <div className="bg-amber-100 text-amber-600 p-2 rounded-full"><Bell className="h-4 w-4" /></div>;
      case 'error':
        return <div className="bg-red-100 text-red-600 p-2 rounded-full"><X className="h-4 w-4" /></div>;
      case 'info':
      default:
        return <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Bell className="h-4 w-4" /></div>;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 bg-primary/5">
          <h3 className="font-medium">{t('notifications.title', 'Notifications')}</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              {t('notifications.mark_all_read', 'Mark all as read')}
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[500px]">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-muted-foreground">
                {t('notifications.empty', 'No notifications yet')}
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <div 
                    className={cn(
                      "flex gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors", 
                      !notification.isRead && "bg-primary/5"
                    )}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        !notification.isRead && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.action && (
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            {notification.action}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-70 hover:opacity-100 self-start flex-shrink-0"
                      onClick={(e) => handleDelete(e, notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}