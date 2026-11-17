import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export const AccountSettingsPage: React.FC<{ role: 'student' | 'client' }> = ({
  role,
}) => {
  const { currentUser, changePasswordDemo } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentUser) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    const res = changePasswordDemo(currentPassword, newPassword);
    if (res.error) {
      setError(res.error);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess('Your demonstration password has been updated in LocalStorage.');
  };

  const workspaceRoot = role === 'student' ? '/student/dashboard' : '/client/dashboard';
  const workspaceLabel = role === 'student' ? 'Student Workspace' : 'Client Workspace';

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: workspaceLabel, to: workspaceRoot },
        { label: 'Settings' },
      ]}
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage demonstration account credentials and local persistence info.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Account Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <span className="text-xs text-slate-500 block">Name</span>
              <span className="font-medium text-slate-900">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Email</span>
              <span className="font-mono text-slate-900">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Account Role</span>
              <span className="capitalize font-medium text-slate-900">
                {currentUser.role}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Account Status</span>
              <span className="capitalize font-medium text-emerald-700">
                {currentUser.status}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Update Password (Demonstration)
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Update Password
            </button>
          </form>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Authentication is simulated in browser LocalStorage for capstone evaluation and is not
              intended for production security.
            </span>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};
