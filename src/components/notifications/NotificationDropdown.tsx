import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationDropdown: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const userNotifications = notifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const notificationsRoute =
    currentUser.role === 'student'
      ? '/student/notifications'
      : currentUser.role === 'client'
      ? '/client/notifications'
      : '/admin/dashboard';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-700 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500 tabular-nums">
                {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead(currentUser.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {userNotifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                You have no notifications yet.
              </div>
            ) : (
              userNotifications.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                    item.read ? 'bg-white' : 'bg-blue-50/40'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold truncate ${
                          item.read ? 'text-slate-800' : 'text-blue-900'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      {item.link && (
                        <Link
                          to={item.link}
                          onClick={() => {
                            markNotificationRead(item.id);
                            setOpen(false);
                          }}
                          className="text-xs font-medium text-blue-700 hover:underline"
                        >
                          Open
                        </Link>
                      )}
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(item.id)}
                          className="text-xs text-slate-500 hover:text-slate-900"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    aria-label="Delete notification"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {currentUser.role !== 'admin' && (
            <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 text-center">
              <Link
                to={notificationsRoute}
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
