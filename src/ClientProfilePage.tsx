import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isValidUrl, readFileAsDataUrl } from '../../utils/formatters';

export const ClientProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { settings } = useApp();

  const cp = currentUser?.clientProfile;
  const [name, setName] = useState(currentUser?.name || '');
  const [companyName, setCompanyName] = useState(cp?.companyName || '');
  const [companyDescription, setCompanyDescription] = useState(
    cp?.companyDescription || ''
  );
  const [logo, setLogo] = useState(cp?.logo || '');
  const [website, setWebsite] = useState(cp?.website || '');
  const [contactPhone, setContactPhone] = useState(cp?.contactPhone || '');
  const [location, setLocation] = useState(cp?.location || '');
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await readFileAsDataUrl(file, settings.maxPortfolioImageKb);
      setLogo(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload logo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !companyName.trim()) {
      setError('Full name and company name are required.');
      return;
    }
    if (!isValidUrl(website)) {
      setError('Company website URL must start with http:// or https://.');
      return;
    }

    updateProfile({
      name: name.trim(),
      clientProfile: {
        companyName: companyName.trim(),
        companyDescription: companyDescription.trim(),
        logo,
        website: website.trim(),
        contactPhone: contactPhone.trim(),
        location: location.trim(),
      },
    });
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Client Workspace', to: '/client/dashboard' },
        { label: 'Client Profile' },
      ]}
      action={
        <Link
          to={`/clients/${currentUser.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
        >
          Public Profile
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client & Company Profile</h1>
          <p className="text-sm text-slate-600 mt-1">
            Help university talent understand your organization before they submit a proposal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
            <Avatar src={logo} name={companyName || name} size="xl" />
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload Company Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="sr-only"
                />
              </label>
              {logo && (
                <button
                  type="button"
                  onClick={() => setLogo('')}
                  className="ml-3 text-xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              )}
              <p className="text-[11px] text-slate-500">
                Max {settings.maxPortfolioImageKb}KB · Saved locally in browser storage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (415) 555-0148"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.example"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Portland, OR"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Company Description
            </label>
            <textarea
              rows={4}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe your business, team culture, and typical project needs..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Save Company Profile
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
