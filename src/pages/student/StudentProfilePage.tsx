import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AvailabilityStatus, ExperienceLevel } from '../../types';
import { isValidUrl, readFileAsDataUrl } from '../../utils/formatters';

export const StudentProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { settings } = useApp();

  const sp = currentUser?.studentProfile;
  const [name, setName] = useState(currentUser?.name || '');
  const [photo, setPhoto] = useState(sp?.photo || '');
  const [university, setUniversity] = useState(sp?.university || '');
  const [department, setDepartment] = useState(sp?.department || '');
  const [studentId, setStudentId] = useState(sp?.studentId || '');
  const [bio, setBio] = useState(sp?.bio || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    sp?.experienceLevel || 'Entry Level'
  );
  const [education, setEducation] = useState(sp?.education || '');
  const [githubUrl, setGithubUrl] = useState(sp?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(sp?.linkedinUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(sp?.websiteUrl || '');
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    sp?.availability || 'Available Now'
  );
  const [error, setError] = useState('');

  if (!currentUser || !sp) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await readFileAsDataUrl(file, settings.maxPortfolioImageKb);
      setPhoto(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload photo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !university.trim() || !department.trim() || !bio.trim()) {
      setError('Full name, university, department, and biography are required.');
      return;
    }
    if (!isValidUrl(githubUrl) || !isValidUrl(linkedinUrl) || !isValidUrl(websiteUrl)) {
      setError('External links must start with http:// or https://.');
      return;
    }

    const completed =
      Boolean(university.trim() && department.trim() && bio.trim()) &&
      sp.skills.length > 0;

    updateProfile({
      name: name.trim(),
      studentProfile: {
        ...sp,
        photo,
        university: university.trim(),
        department: department.trim(),
        studentId: studentId.trim(),
        bio: bio.trim(),
        experienceLevel,
        education: education.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
        availability,
        profileCompleted: completed,
      },
    });
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Student Workspace', to: '/student/dashboard' },
        { label: 'My Profile' },
      ]}
      action={
        <Link
          to={`/students/${currentUser.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
        >
          Preview Public Profile
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Student Profile</h1>
            <p className="text-sm text-slate-600 mt-1">
              Keep your academic details, bio, and links accurate so clients can review your fit.
            </p>
          </div>
          <Link
            to="/student/skills"
            className="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap"
          >
            Edit Skills ({sp.skills.length}) →
          </Link>
        </div>

        {sp.skills.length === 0 && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-4">
            <span>
              Remember to add at least one skill on the <strong>My Skills</strong> page to mark your
              profile as complete for project applications.
            </span>
            <Link
              to="/student/skills"
              className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-medium whitespace-nowrap"
            >
              Add Skills
            </Link>
          </div>
        )}

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

          {/* Profile Photo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
            <Avatar src={photo} name={name || currentUser.name} size="xl" />
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="ml-3 text-xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              )}
              <p className="text-[11px] text-slate-500">
                PNG, JPG, or WebP under {settings.maxPortfolioImageKb}KB (stored locally in
                browser).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., PTU-2026-1042"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                University *
              </label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Pacific Tech University"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Education / Degree
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="B.S. Computer Science (Class of 2027)"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Available Now">Available Now</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Weekends Only">Weekends Only</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Biography *
            </label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summarize your technical focus, coursework projects, and areas where you deliver the most value..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Personal Website
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
