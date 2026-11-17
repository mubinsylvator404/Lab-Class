import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationsPage: React.FC<{ role: 'student' | 'client' }> = ({ role }) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifs = useMemo(
    () =>
      notifications
        .filter((n) => n.userId === currentUser?.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [notifications, currentUser]
  );

  if (!currentUser) return null;

  const visible = filter === 'unread' ? userNotifs.filter((n) => !n.read) : userNotifs;
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const workspaceRoot = role === 'student' ? '/student/dashboard' : '/client/dashboard';
  const workspaceLabel = role === 'student' ? 'Student Workspace' : 'Client Workspace';

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: workspaceLabel, to: workspaceRoot },
        { label: 'Notifications' },
      ]}
      action={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllNotificationsRead(currentUser.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </button>
        ) : undefined
      }
    >
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-600 mt-1 tabular-nums">
              {unreadCount} unread · {userNotifs.length} total
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({userNotifs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="Activity alerts about project matches, applications, and reviews will appear here."
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {visible.map((item) => (
              <div
                key={item.id}
                className={`p-5 flex items-start justify-between gap-4 ${
                  item.read ? 'bg-white' : 'bg-blue-50/40'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        item.read ? 'text-slate-900' : 'text-blue-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      · {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.message}</p>
                  <div className="pt-1 flex items-center gap-4 text-xs">
                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={() => markNotificationRead(item.id)}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        View related page
                      </Link>
                    )}
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(item.id)}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  aria-label="Delete notification"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
