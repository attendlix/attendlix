"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Bell,
  CheckCheck,
  Trash2,
  CalendarCheck,
  CreditCard,
  BookOpen,
  Award,
  UserCheck,
  UserPlus,
  MessageSquare,
  MessageCircle,
  Clock,
  KeyRound,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { AppNotification, NotificationCategory } from "@/lib/types";

function getRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case "ATTENDANCE":
      return { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    case "FEE":
      return { icon: CreditCard, color: "text-emerald-700 bg-emerald-100 border-emerald-300" };
    case "HOMEWORK":
      return { icon: BookOpen, color: "text-amber-600 bg-amber-50 border-amber-200" };
    case "EXAM":
      return { icon: Award, color: "text-purple-600 bg-purple-50 border-purple-200" };
    case "STAFF":
      return { icon: UserCheck, color: "text-blue-600 bg-blue-50 border-blue-200" };
    case "ADMISSION":
      return { icon: UserPlus, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    case "ANNOUNCEMENT":
      return { icon: MessageSquare, color: "text-sky-600 bg-sky-50 border-sky-200" };
    case "CHAT":
      return { icon: MessageCircle, color: "text-teal-600 bg-teal-50 border-teal-200" };
    case "TIMETABLE":
      return { icon: Clock, color: "text-amber-700 bg-amber-100 border-amber-300" };
    case "ACCOUNT":
      return { icon: KeyRound, color: "text-cyan-700 bg-cyan-50 border-cyan-200" };
    case "TENANT":
      return { icon: Building2, color: "text-emerald-800 bg-emerald-100 border-emerald-300" };
    case "SYSTEM":
    default:
      return { icon: ShieldCheck, color: "text-slate-600 bg-slate-100 border-slate-200" };
  }
}

interface NotificationDropdownProps {
  onClose?: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { isRtl } = useLanguage();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    clearAll,
    setIsBellOpen,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<"ALL" | "UNREAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsBellOpen, onClose]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "UNREAD") return !n.read;
    return true;
  });

  return (
    <div
      ref={dropdownRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-full sm:mt-2 sm:right-0 rtl:sm:right-auto rtl:sm:left-0 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[75vh] sm:max-h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col z-50 animate-scaleUp text-slate-900"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <span>{isRtl ? "اطلاعات و نوٹیفیکیشنز" : "Notifications"}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {unreadCount} {isRtl ? "نئے" : "New"}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isRtl ? "تمام حالیہ کارروائیاں اور لائیو الرٹس" : "Real-time updates & activity"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
              className="px-2 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 min-h-[36px] transition-colors"
              title={isRtl ? "تمام پڑھے ہوئے نشان زد کریں" : "Mark all read"}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold">{isRtl ? "سب پڑھ لیں" : "Mark read"}</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
              title={isRtl ? "تمام صاف کریں" : "Clear all"}
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsBellOpen(false);
              if (onClose) onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 border-b border-slate-100 bg-white flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1 rounded-full text-xs font-bold min-h-[32px] transition-all ${
            activeFilter === "ALL"
              ? "bg-slate-900 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isRtl ? "تمام" : "All"} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("UNREAD")}
          className={`px-3 py-1 rounded-full text-xs font-bold min-h-[32px] transition-all ${
            activeFilter === "UNREAD"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isRtl ? "غیر پڑھے ہوئے" : "Unread"} ({unreadCount})
        </button>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[360px] sm:max-h-[380px] sidebar-scroll overscroll-contain">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-800">
              {isRtl ? "کوئی نیا نوٹیفیکیشن نہیں ہے!" : "All caught up!"}
            </div>
            <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
              {activeFilter === "UNREAD"
                ? isRtl
                  ? "کوئی غیر پڑھا ہوا نوٹیفیکیشن باقی نہیں ہے۔"
                  : "No unread notifications left."
                : isRtl
                ? "حالیہ نوٹیفیکیشنز یہاں ظاہر ہوں گے۔"
                : "No recent notifications in your feed."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const iconConfig = getCategoryIcon(notif.category);
            const Icon = iconConfig.icon;
            const timeAgo = getRelativeTime(notif.created_at);

            return (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!notif.read) markRead(notif.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!notif.read) markRead(notif.id);
                  }
                }}
                className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative hover:bg-slate-50/80 min-h-[48px] touch-manipulation active:bg-slate-100 focus:outline-none focus:bg-slate-50 ${
                  !notif.read ? "bg-emerald-50/40" : "bg-white"
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${iconConfig.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs truncate ${
                        !notif.read ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {isRtl && notif.title_ur ? notif.title_ur : notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {isRtl && notif.message_ur ? notif.message_ur : notif.message}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!notif.read && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 flex-shrink-0 mt-2"
                    title="Unread"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center flex-shrink-0">
        <span className="text-[10px] font-semibold text-slate-400">
          ⚡ {isRtl ? "اٹینڈلکس لائیو نوٹیفیکیشن سروس" : "Attendlix Live Notification Feed"}
        </span>
      </div>
    </div>
  );
}
