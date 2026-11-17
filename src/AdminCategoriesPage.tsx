import React, { useState } from 'react';
import { AlertCircle, Check, Edit3, Plus, Trash2, X } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, projects, addCategory, updateCategory, deleteCategory } = useApp();

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = addCategory(newName, newDesc);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNewName('');
    setNewDesc('');
  };

  const startEdit = (id: string, name: string, desc: string) => {
    setEditingId(id);
    setEditName(name);
    setEditDesc(desc);
    setError('');
  };

  const handleSaveEdit = (id: string) => {
    setError('');
    const res = updateCategory(id, editName, editDesc);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setError('');
    const res = deleteCategory(id);
    if (res.error) {
      setError(res.error);
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Administration', to: '/admin/dashboard' },
        { label: 'Category Management' },
      ]}
    >
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add, rename, or remove unused project categories across the marketplace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">Add New Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-6">
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short category description"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Categories List */}
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {categories.map((cat) => {
            const projectCount = projects.filter(
              (p) => p.category === cat.name
            ).length;
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        ({projectCount} {projectCount === 1 ? 'project' : 'projects'})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {cat.description || 'No description'}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.id)}
                        aria-label="Save category"
                        className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel edit"
                        className="p-1.5 rounded-lg text-slate-500 border border-slate-200 hover:bg-slate-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(cat.id, cat.name, cat.description)}
                        aria-label={`Edit ${cat.name}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        aria-label={`Delete ${cat.name}`}
                        title={
                          projectCount > 0
                            ? 'Cannot delete category in use'
                            : 'Delete category'
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
