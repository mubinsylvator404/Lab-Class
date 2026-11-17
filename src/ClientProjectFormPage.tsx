import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ExperienceLevel, ProjectStatus, ProjectType } from '../../types';

const COMMON_PROJECT_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'MongoDB',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Python',
  'SQL',
  'Figma',
  'UI/UX Design',
  'Flutter',
];

export const ClientProjectFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { projects, categories, createProject, updateProject } = useApp();

  const existingProject = isEditing
    ? projects.find((p) => p.id === id)
    : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Web Development');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [budget, setBudget] = useState('1200');
  const [projectType, setProjectType] = useState<ProjectType>('Fixed Price');
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>('Intermediate');
  const [duration, setDuration] = useState('3 weeks');
  const [deadline, setDeadline] = useState('2026-12-20');
  const [requiredStudents, setRequiredStudents] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setDescription(existingProject.description);
      setCategory(existingProject.category);
      setRequiredSkills(existingProject.requiredSkills);
      setBudget(String(existingProject.budget));
      setProjectType(existingProject.projectType);
      setExperienceLevel(existingProject.experienceLevel);
      setDuration(existingProject.duration);
      setDeadline(existingProject.deadline);
      setRequiredStudents(String(existingProject.requiredStudents));
    }
  }, [existingProject]);

  if (!currentUser) return null;

  if (isEditing && (!existingProject || existingProject.clientId !== currentUser.id)) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: 'Client Workspace', to: '/client/dashboard' },
          { label: 'Project Not Accessible' },
        ]}
      >
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Project not found or unauthorized
          </h1>
          <p className="text-sm text-slate-600">
            Only the project owner can edit this project brief.
          </p>
          <button
            type="button"
            onClick={() => navigate('/client/projects')}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg"
          >
            Back to My Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const addSkillTag = (raw: string) => {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    setRequiredSkills((prev) => {
      const next = [...prev];
      for (const p of parts) {
        if (!next.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
          next.push(p);
        }
      }
      return next;
    });
    setSkillInput('');
  };

  const removeSkillTag = (skill: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSave = (targetStatus: ProjectStatus) => {
    setError('');
    if (!title.trim() || !description.trim()) {
      setError('Project title and description are required.');
      return;
    }
    const budgetNum = Number(budget);
    if (!budgetNum || budgetNum <= 0) {
      setError('Please enter a valid budget greater than $0.');
      return;
    }
    const stuCount = Math.max(1, Number(requiredStudents) || 1);

    if (isEditing && existingProject) {
      updateProject(existingProject.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        requiredSkills,
        budget: budgetNum,
        projectType,
        experienceLevel,
        duration: duration.trim(),
        deadline,
        requiredStudents: stuCount,
        status: targetStatus,
      });
      navigate(`/client/projects/${existingProject.id}`);
    } else {
      const created = createProject({
        clientId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        category,
        requiredSkills,
        budget: budgetNum,
        projectType,
        experienceLevel,
        duration: duration.trim(),
        deadline,
        requiredStudents: stuCount,
        status: targetStatus,
      });
      if (targetStatus === 'Published') {
        navigate(`/client/recommended-students?projectId=${created.id}`);
      } else {
        navigate('/client/projects');
      }
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Client Workspace', to: '/client/dashboard' },
        { label: 'My Projects', to: '/client/projects' },
        { label: isEditing ? 'Edit Project' : 'Create Project' },
      ]}
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Project Brief' : 'Publish a New Project Request'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Specify required skills clearly—SkillBridge automatically ranks matching student
            profiles as soon as you publish.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Full-Stack Customer Portal Development"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Description *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project goals, core deliverables, and collaboration cadence..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) =>
                  setExperienceLevel(e.target.value as ExperienceLevel)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Required Skills ({requiredSkills.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkillTag(skillInput);
                  }
                }}
                placeholder="Type a skill (e.g., React, JavaScript, Node.js, MongoDB) and press Add"
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => addSkillTag(skillInput)}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillTag(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="pt-1 flex flex-wrap gap-1.5">
              {COMMON_PROJECT_SKILLS.map((s) => {
                const selected = requiredSkills.some(
                  (r) => r.toLowerCase() === s.toLowerCase()
                );
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={selected}
                    onClick={() => addSkillTag(s)}
                    className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                      selected
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-700'
                    }`}
                  >
                    + {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="Fixed Price">Fixed Price</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Budget ($) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="3 weeks"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Students Needed
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={requiredStudents}
                onChange={(e) => setRequiredStudents(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/client/projects')}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() =>
                handleSave(
                  isEditing && existingProject && existingProject.status !== 'Draft'
                    ? existingProject.status
                    : 'Published'
                )
              }
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              {isEditing ? 'Save & Update Project' : 'Publish Project Now'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
