import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!user) return;
    const list = await base44.entities.Notification.filter({ user_id: user.id }, "-created_date", 30);
    setNotifications(list);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = async (notification) => {
    if (!notification.read) {
      await base44.entities.Notification.update(notification.id, { read: true });
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    }
    navigate(`/watch/${notification.video_id}`);
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => base44.entities.Notification.update(n.id, { read: true })));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4 text-center">No notifications yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleOpen(n)}
                className={`flex flex-col items-start gap-0.5 whitespace-normal cursor-pointer ${
                  !n.read ? "bg-accent/50" : ""
                }`}
              >
                <span className="text-sm font-medium">{n.video_title}</span>
                {n.creator_name && <span className="text-xs text-muted-foreground">{n.creator_name}</span>}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}