import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './button';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/contexts/NotificationContext';

const NotificationBell: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    // Mark all as read when dropdown is opened
    if (open && unreadCount > 0) {
      setTimeout(() => {
        markAllAsRead();
      }, 1000);
    }
  };

  const renderNotificationItem = (notification: Notification) => (
    <DropdownMenuItem 
      key={notification.id}
      className={`p-3 cursor-default ${notification.read ? 'opacity-60' : 'font-medium'}`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start">
          <span>{notification.title}</span>
          <span className="text-xs text-gray-500 ml-4">{formatTime(notification.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-500">{notification.message}</p>
      </div>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearNotifications}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map(renderNotificationItem)}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;