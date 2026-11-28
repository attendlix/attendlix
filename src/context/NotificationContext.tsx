"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppNotification, ToastMessage, UserRole, User } from "@/lib/types";
import {
  getNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  getCurrentUser,
} from "@/lib/store";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  X,
  Bell,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id"> & { id?: string }) => string;
  dismissToast: (id: string) => void;
  notify: (
    data: Omit<AppNotification, "id" | "created_at" | "read"> & {
      showToast?: boolean;
    }
  ) => AppNotification;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  refreshNotifications: () => void;
  isBellOpen: boolean;
  setIsBellOpen: (open: boolean) => void;
  toggleBell: () => void;
  activeUser: User | null;
  setUserContext: (user: User | null) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  toasts: [],
  showToast: () => "",
  dismissToast: () => {},
  notify: () => ({} as AppNotification),
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
  refreshNotifications: () => {},
  isBellOpen: false,
  setIsBellOpen: () => {},
  toggleBell: () => {},
  activeUser: null,
  setUserContext: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isRtl } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const setUserContext = useCallback((user: User | null) => {
    setActiveUser(user);
  }, []);

  const refreshNotifications = useCallback(() => {
    if (typeof window === "undefined") return;
    const user = activeUser || getCurrentUser();
    const list = getNotifications(user?.school_id, user?.role, user?.id);
    setNotifications(list);
  }, [activeUser]);

  useEffect(() => {
    refreshNotifications();

    const handleUpdate = () => {
      refreshNotifications();
    };

    const handleNewNotif = (e: any) => {
      refreshNotifications();
      const notif: AppNotification = e.detail;
      if (notif) {
        // Automatically display matching toast
        showToast({
          title: isRtl && notif.title_ur ? notif.title_ur : notif.title,
          message: isRtl && notif.message_ur ? notif.message_ur : notif.message,
          type: notif.type,
          duration: 3500,
        });
      }
    };

    window.addEventListener("attendlix:notification", handleNewNotif);
    window.addEventListener("attendlix:notification-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("attendlix:notification", handleNewNotif);
      window.removeEventListener("attendlix:notification-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshNotifications, isRtl]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id"> & { id?: string }): string => {
      const id = toast.id || "toast-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6);
      const newToast: ToastMessage = {
        id,
        title: toast.title,
        message: toast.message,
        type: toast.type,
        duration: toast.duration || 3500,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // max 3 concurrent toasts

      // Auto dismiss
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);

      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (
      data: Omit<AppNotification, "id" | "created_at" | "read"> & {
        showToast?: boolean;
      }
    ) => {
      const user = activeUser || getCurrentUser();
      const notif = addNotification({
        school_id:
          data.school_id ||
          (user?.role === "SUPER_ADMIN" ? "GLOBAL" : user?.school_id || "school-beacon-001"),
        target_role: data.target_role || (user?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ALL"),
        target_user_id: data.target_user_id,
        title: data.title,
        title_ur: data.title_ur,
        message: data.message,
        message_ur: data.message_ur,
        type: data.type || "INFO",
        category: data.category || (user?.role === "SUPER_ADMIN" ? "TENANT" : "SYSTEM"),
        action_url: data.action_url,
      });

      refreshNotifications();

      if (data.showToast !== false) {
        showToast({
          title: isRtl && data.title_ur ? data.title_ur : data.title,
          message: isRtl && data.message_ur ? data.message_ur : data.message,
          type: data.type || "INFO",
          duration: 3500,
        });
      }

      return notif;
    },
    [activeUser, refreshNotifications, showToast, isRtl]
  );

  const markRead = useCallback(
    (id: string) => {
      // 1. Instant optimistic update so badge count & visual dot update immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      // 2. Persist to storage & Supabase
      markNotificationAsRead(id);
    },
    []
  );

  const markAllRead = useCallback(() => {
    // 1. Instant optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // 2. Persist
    const user = activeUser || getCurrentUser();
    markAllNotificationsAsRead(user?.school_id, user?.role, user?.id);
  }, [activeUser]);

  const clearAll = useCallback(() => {
    // 1. Instant optimistic update
    setNotifications([]);
    // 2. Persist
    const user = activeUser || getCurrentUser();
    clearAllNotifications(user?.school_id, user?.role, user?.id);
  }, [activeUser]);

  const toggleBell = useCallback(() => {
    setIsBellOpen((prev) => !prev);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        dismissToast,
        notify,
        markRead,
        markAllRead,
        clearAll,
        refreshNotifications,
        isBellOpen,
        setIsBellOpen,
        toggleBell,
        activeUser,
        setUserContext,
      }}
    >
      {children}

      {/* Global Instant Toast Container */}
      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rtl:right-auto rtl:left-4 rtl:sm:left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0"
        aria-live="polite"
      >
        {toasts.slice(0, 3).map((toast) => {
          const typeStyles = {
            SUCCESS: {
              border: "border-emerald-200 bg-emerald-50/95 text-emerald-950 shadow-emerald-500/10",
              badge: "bg-emerald-500 text-white",
              icon: CheckCircle2,
              iconColor: "text-emerald-600",
            },
            INFO: {
              border: "border-indigo-200 bg-indigo-50/95 text-indigo-950 shadow-indigo-500/10",
              badge: "bg-indigo-500 text-white",
              icon: Info,
              iconColor: "text-indigo-600",
            },
            WARNING: {
              border: "border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-500/10",
              badge: "bg-amber-500 text-white",
              icon: AlertTriangle,
              iconColor: "text-amber-600",
            },
            ALERT: {
              border: "border-rose-200 bg-rose-50/95 text-rose-950 shadow-rose-500/10",
              badge: "bg-rose-500 text-white",
              icon: AlertCircle,
              iconColor: "text-rose-600",
            },
          }[toast.type || "INFO"];

          const IconComponent = typeStyles.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-slideUp ${typeStyles.border}`}
            >
              <div className="p-1 rounded-xl bg-white/80 shadow-2xs flex-shrink-0 mt-0.5">
                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${typeStyles.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  {toast.title}
                </div>
                {toast.message && (
                  <div className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug line-clamp-2">
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
                aria-label="Close Toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
