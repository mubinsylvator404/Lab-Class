import React, { useMemo, useState } from 'react';
import { Eye, Search, ShieldCheck, ShieldOff, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { User, UserRole } from '../../types';
import { formatDate, getUserStatusStyle } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, setUserStatus, deleteUser } = useApp();

  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 200);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (q) {
        const hay = `${u.name} ${u.email} ${u.studentProfile?.university || ''} ${
          u.clientProfile?.companyName || ''
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, debounced, roleFilter]);

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Administration', to: '/admin/dashboard' },
        { label: 'User Management' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Inspect student and client profiles, suspend accounts, or remove demonstration
              records.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            {filtered.length} of {users.length} users
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, university, or company..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <select
            aria-label="Filter users by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="client">Clients</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization / University</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((user) => {
                  const st = getUserStatusStyle(user.status);
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.studentProfile?.photo || user.clientProfile?.logo}
                            name={user.name}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-slate-900">{user.name}</div>
                            <div className="text-xs font-mono text-slate-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-700">
                        {user.role}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {user.studentProfile?.university ||
                          user.clientProfile?.companyName ||
                          'SkillBridge Administration'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium border capitalize ${st.bg} ${st.text} ${st.border}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectUser(user)}
                            aria-label={`Inspect ${user.name}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isSelf && user.role !== 'admin' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setUserStatus(
                                    user.id,
                                    user.status === 'active' ? 'suspended' : 'active'
                                  )
                                }
                                title={
                                  user.status === 'active'
                                    ? 'Suspend account'
                                    : 'Reactivate account'
                                }
                                className={`p-1.5 rounded-lg border ${
                                  user.status === 'active'
                                    ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                                    : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                }`}
                              >
                                {user.status === 'active' ? (
                                  <ShieldOff className="w-4 h-4" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(user)}
                                aria-label={`Delete ${user.name}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspect User Modal */}
      {inspectUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar
                  src={
                    inspectUser.studentProfile?.photo ||
                    inspectUser.clientProfile?.logo
                  }
                  name={inspectUser.name}
                  size="md"
                />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {inspectUser.name}
                  </h2>
                  <p className="text-xs font-mono text-slate-500">{inspectUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                aria-label="Close modal"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong>Role:</strong>{' '}
                <span className="capitalize">{inspectUser.role}</span> ·{' '}
                <strong>Status:</strong>{' '}
                <span className="capitalize">{inspectUser.status}</span>
              </p>
              {inspectUser.studentProfile && (
                <>
                  <p>
                    <strong>University:</strong>{' '}
                    {inspectUser.studentProfile.university || '—'} (
                    {inspectUser.studentProfile.department || '—'})
                  </p>
                  <p>
                    <strong>Skills:</strong>{' '}
                    {inspectUser.studentProfile.skills.map((s) => s.name).join(', ') ||
                      'None'}
                  </p>
                  <p className="text-xs text-slate-600 pt-1">
                    {inspectUser.studentProfile.bio}
                  </p>
                </>
              )}
              {inspectUser.clientProfile && (
                <>
                  <p>
                    <strong>Company:</strong>{' '}
                    {inspectUser.clientProfile.companyName}
                  </p>
                  <p className="text-xs text-slate-600 pt-1">
                    {inspectUser.clientProfile.companyDescription}
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              {inspectUser.role === 'student' && (
                <Link
                  to={`/students/${inspectUser.id}`}
                  className="px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg"
                >
                  Open Public Profile
                </Link>
              )}
              {inspectUser.role === 'client' && (
                <Link
                  to={`/clients/${inspectUser.id}`}
                  className="px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg"
                >
                  Open Client Profile
                </Link>
              )}
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Demonstration Account"
        message={`Remove "${deleteTarget?.name}" (${deleteTarget?.email}) from LocalStorage?`}
        confirmLabel="Delete Account"
        onConfirm={() => {
          if (deleteTarget) deleteUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};
