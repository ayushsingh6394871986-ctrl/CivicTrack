'use client';

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { getStoredNotifications, saveStoredNotifications } from '../lib/store';
import { NotificationItem } from '../lib/types';
import Link from 'next/link';

export default function NotificationBell() {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotifications(getStoredNotifications());
    const handleStorage = () => setNotifications(getStoredNotifications());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'nearby_issue': return <AlertTriangle className="w-4 h-4 text-[#D95F02]" />;
      case 'resolution':   return <CheckCircle className="w-4 h-4 text-[#176B3A]" />;
      case 'deadline_warning':
      case 'escalation':   return <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />;
      default:             return <Clock className="w-4 h-4 text-[#1A56A4]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6B6860] hover:text-[#1E2328] rounded-lg hover:bg-[#E8E5DF] border border-[#C9C4BA] transition-all"
        title="Civic Notifications"
        aria-label="Civic Notifications"
      >
        <Bell className="w-4 h-4 text-[#D95F02]" />
        {mounted && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D95F02] text-[9px] font-extrabold text-white shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border-2 border-[#C9C4BA] z-50 overflow-hidden text-[#1E2328]">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F0EEE9] border-b border-[#C9C4BA]">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[#D95F02]" />
                <span className="font-extrabold text-xs text-[#1E2328]">Civic Alerts & Updates</span>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-[#1A56A4] hover:text-[#1245A8] font-bold">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E5DF]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6B6860] font-medium">
                  No alerts right now. You are all caught up!
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors ${notif.read ? 'bg-white' : 'bg-[#FEF0E7]'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-[#F0EEE9] border border-[#C9C4BA]">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-[#1E2328]">{notif.title}</p>
                        <p className="text-xs text-[#6B6860] mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-[#9CA3AF] font-mono-data">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {notif.complaint_number && (
                            <Link
                              href={`/track/${notif.complaint_number}`}
                              onClick={() => setIsOpen(false)}
                              className="text-[10px] font-mono-data font-bold text-[#1A56A4] hover:text-[#1245A8] inline-flex items-center"
                            >
                              {notif.complaint_number}
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-[#F0EEE9] border-t border-[#C9C4BA] text-center">
              <span className="text-[10px] text-[#6B6860] font-medium">
                Geofence: Auto-monitoring 200m radius around your location
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
