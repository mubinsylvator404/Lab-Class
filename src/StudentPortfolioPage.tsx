import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  ExternalLink,
  FolderGit2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PortfolioItem } from '../../types';
import { formatDate, isValidUrl, readFileAsDataUrl } from '../../utils/formatters';

const PRESET_IMAGES = [
  { label: 'Storefront UI', url: '/src/assets/images/portfolio_ecommerce_1794886462032.jpg' },
  { label: 'Analytics Dashboard', url: '/src/assets/images/portfolio_analytics_1794886462482.jpg' },
  { label: 'Mobile App UI', url: '/src/assets/images/portfolio_mobile_ui_1794886463533.jpg' },
];

export const StudentPortfolioPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    portfolios,
    categories,
    settings,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
  } = useApp();

  const myPortfolios = useMemo(
    () =>
      portfolios
        .filter((p) => p.studentId === currentUser?.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [portfolios, currentUser]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Web Development');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setTechnologies('');
    setCategory(categories[0]?.name || 'Web Development');
    setImage(PRESET_IMAGES[0].url);
    setGithubUrl('');
    setLiveUrl('');
    setCompletionDate(new Date().toISOString().slice(0, 10));
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setTechnologies(item.technologies.join(', '));
    setCategory(item.category);
    setImage(item.image);
    setGithubUrl(item.githubUrl);
    setLiveUrl(item.liveUrl);
    setCompletionDate(item.completionDate);
    setError('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await readFileAsDataUrl(file, settings.maxPortfolioImageKb);
      setImage(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Project title and description are required.');
      return;
    }
    if (!isValidUrl(githubUrl) || !isValidUrl(liveUrl)) {
      setError('GitHub and Live Demo URLs must start with http:// or https://.');
      return;
    }

    const techList = technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      updatePortfolioItem(editingItem.id, {
        title: title.trim(),
        description: description.trim(),
        technologies: techList,
        category,
        image,
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        completionDate,
      });
    } else {
      addPortfolioItem({
        studentId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        technologies: techList,
        category,
        image,
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        completionDate,
      });
    }

    setModalOpen(false);
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Student Workspace', to: '/student/dashboard' },
        { label: 'My Portfolio' },
      ]}
      action={
        <div className="flex items-center gap-2">
          <Link
            to={`/students/${currentUser.id}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            Public View
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Portfolio Project
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfolio Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Showcase case studies, code repositories, and live builds on your public profile.
          </p>
        </div>

        {myPortfolios.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="Your portfolio is empty"
            description="Add at least two completed coursework or freelance projects so clients can evaluate your work."
            actionLabel="Add First Portfolio Project"
            onAction={openCreateModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {myPortfolios.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-slate-100 border-b border-slate-100 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-xs text-slate-500">
                      {item.category} · {formatDate(item.completionDate)}
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-500 pt-1">
                      {item.technologies.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Preview
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      aria-label={`Edit ${item.title}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.title}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {editingItem ? 'Edit Portfolio Project' : 'Add Portfolio Project'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="portfolio-form"
              onSubmit={handleSave}
              className="p-6 overflow-y-auto space-y-4"
            >
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Campus Bookstore React App"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem solved, architecture, and key deliverables..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="React, JavaScript, Node.js, Tailwind CSS"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Project Preview Image (Upload ≤ {settings.maxPortfolioImageKb}KB or Pick Preset)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                        image === preset.url
                          ? 'bg-blue-50 border-blue-600 text-blue-800 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {image && (
                  <img
                    src={image}
                    alt="Selected preview"
                    className="h-32 w-full object-cover rounded-lg border border-slate-200 mt-2"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://demo.example"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="portfolio-form"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                {editingItem ? 'Save Changes' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{previewItem.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Close preview"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {previewItem.image && (
                <img
                  src={previewItem.image}
                  alt={previewItem.title}
                  className="w-full max-h-80 object-cover rounded-lg border border-slate-200"
                />
              )}
              <div className="text-xs text-slate-500">
                {previewItem.category} · Completed {formatDate(previewItem.completionDate)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{previewItem.description}</p>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">Technologies:</strong>{' '}
                {previewItem.technologies.join(' · ')}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {previewItem.githubUrl && (
                  <a
                    href={previewItem.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    GitHub Repo
                  </a>
                )}
                {previewItem.liveUrl && (
                  <a
                    href={previewItem.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Portfolio Project"
        message={`Are you sure you want to remove "${deleteTarget?.title}" from your portfolio?`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deletePortfolioItem(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};
