import React, { useMemo, useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { getStorageUsageInfo } from '../../services/storageService';
import { formatDate } from '../../utils/formatters';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllDemoData } = useApp();

  const [platformName, setPlatformName] = useState(settings.platformName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [maxKb, setMaxKb] = useState(String(settings.maxPortfolioImageKb));
  const [resetOpen, setResetOpen] = useState(false);

  const storageInfo = useMemo(() => getStorageUsageInfo(), [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformName: platformName.trim() || 'SkillBridge',
      tagline: tagline.trim() || 'Your Skills. Your Opportunities.',
      supportEmail: supportEmail.trim(),
      maxPortfolioImageKb: Math.max(50, Math.min(1024, Number(maxKb) || 350)),
    });
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Administration', to: '/admin/dashboard' },
        { label: 'Settings' },
      ]}
    >
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Settings & Storage Inspector
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure demonstration parameters, inspect browser LocalStorage usage, or reset seed
            data.
          </p>
        </div>

        {/* Platform Configuration */}
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Platform Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Uploaded Image Size (KB)
              </label>
              <input
                type="number"
                min={50}
                max={1024}
                value={maxKb}
                onChange={(e) => setMaxKb(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Save Platform Settings
            </button>
          </div>
        </form>

        {/* Demo Data Management */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Demonstration Data Management
            </h2>
            <p className="text-xs text-slate-600">
              Seeded on {formatDate(settings.demoInitializedAt)}. Resetting restores the original
              10 students, 5 clients, 15 projects, and 20 applications.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </section>

        {/* LocalStorage Inspector */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-700" />
              <h2 className="text-base font-semibold text-slate-900">
                Browser LocalStorage Inspector
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-600 tabular-nums">
              Total Used: {storageInfo.totalKb} KB
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Storage Key</th>
                  <th className="py-2.5 px-4 text-right">Records</th>
                  <th className="py-2.5 px-4 text-right">Size (KB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {storageInfo.breakdown.map((row) => (
                  <tr key={row.key}>
                    <td className="py-2.5 px-4 font-mono text-slate-800">{row.key}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {row.recordsCount}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-900 tabular-nums">
                      {row.kb} KB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset All Demonstration Data"
        message="This will overwrite any newly registered accounts, created projects, or submitted applications with the original factory demo dataset."
        confirmLabel="Reset Demo Data"
        onConfirm={() => {
          resetAllDemoData();
          setResetOpen(false);
        }}
        onCancel={() => setResetOpen(false)}
      />
    </DashboardLayout>
  );
};
