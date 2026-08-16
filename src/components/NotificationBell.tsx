'use client';

import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Info, Sparkles, Trash2, X } from 'lucide-react';
import { usePFI } from '@/lib/store';
import { AppNotification } from '@/lib/types';

export const NotificationBell: React.FC = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications, currentUser } = usePFI();
  const [isOpen, setIsOpen] = useState(false);

  const userNotifications = notifications.filter(
    (n) => n.user_id === currentUser.id || n.user_id === 'all'
  );

  const unreadCount = userNotifications.filter((n) => !n.leido).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-unipaz-orange text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-4 shadow-2xl z-50 text-slate-900 dark:text-white space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-unipaz-orange" />
                <span className="font-black text-xs">Centro de Notificaciones</span>
              </div>
              {userNotifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpiar
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {userNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No tienes notificaciones pendientes en este momento.
                </div>
              ) : (
                userNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      notif.leido
                        ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 opacity-70'
                        : 'bg-orange-50/60 dark:bg-unipaz-orange/10 border-orange-200 dark:border-unipaz-orange/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs leading-tight">{notif.titulo}</span>
                      {!notif.leido && (
                        <span className="w-2 h-2 rounded-full bg-unipaz-orange flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {notif.mensaje}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-mono">
                      {new Date(notif.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.fecha).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
