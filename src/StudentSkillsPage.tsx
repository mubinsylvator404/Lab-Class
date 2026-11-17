import React, { useMemo, useState } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getRecommendedProjectsForStudent } from '../../services/matchingService';
import { generateId } from '../../services/storageService';
import { SkillProficiency, StudentSkill } from '../../types';

const SUGGESTED_SKILLS: { name: string; category: 'technical' | 'creative' }[] = [
  { name: 'React', category: 'technical' },
  { name: 'JavaScript', category: 'technical' },
  { name: 'TypeScript', category: 'technical' },
  { name: 'Node.js', category: 'technical' },
  { name: 'HTML', category: 'technical' },
  { name: 'CSS', category: 'technical' },
  { name: 'Tailwind CSS', category: 'technical' },
  { name: 'MongoDB', category: 'technical' },
  { name: 'Python', category: 'technical' },
  { name: 'SQL', category: 'technical' },
  { name: 'Figma', category: 'creative' },
  { name: 'UI/UX Design', category: 'creative' },
  { name: 'Brand Identity', category: 'creative' },
  { name: 'Copywriting', category: 'creative' },
];

export const StudentSkillsPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { projects, showToast } = useApp();

  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState<'technical' | 'creative'>('technical');
  const [proficiency, setProficiency] = useState<SkillProficiency>('Intermediate');
  const [error, setError] = useState('');

  const sp = currentUser?.studentProfile;

  const matchingCount = useMemo(() => {
    return getRecommendedProjectsForStudent(currentUser, projects).filter(
      (r) => r.match.matchPercentage > 0
    ).length;
  }, [currentUser, projects]);

  if (!currentUser || !sp) return null;

  const saveSkills = (nextSkills: StudentSkill[]) => {
    const profileCompleted =
      Boolean(sp.university.trim() && sp.department.trim() && sp.bio.trim()) &&
      nextSkills.length > 0;
    updateProfile({
      studentProfile: {
        ...sp,
        skills: nextSkills,
        profileCompleted,
      },
    });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleaned = skillName.trim();
    if (!cleaned) {
      setError('Please enter a skill name.');
      return;
    }
    const exists = sp.skills.some(
      (s) => s.name.toLowerCase() === cleaned.toLowerCase()
    );
    if (exists) {
      setError(`"${cleaned}" is already in your skill list.`);
      return;
    }

    const newSkill: StudentSkill = {
      id: generateId('sk'),
      name: cleaned,
      category: skillCategory,
      proficiency,
    };
    saveSkills([...sp.skills, newSkill]);
    setSkillName('');
  };

  const handleQuickAdd = (item: { name: string; category: 'technical' | 'creative' }) => {
    const exists = sp.skills.some(
      (s) => s.name.toLowerCase() === item.name.toLowerCase()
    );
    if (exists) {
      showToast(`${item.name} is already added`, 'info');
      return;
    }
    const newSkill: StudentSkill = {
      id: generateId('sk'),
      name: item.name,
      category: item.category,
      proficiency: 'Intermediate',
    };
    saveSkills([...sp.skills, newSkill]);
  };

  const handleUpdateProficiency = (id: string, nextProf: SkillProficiency) => {
    const nextSkills = sp.skills.map((s) =>
      s.id === id ? { ...s, proficiency: nextProf } : s
    );
    saveSkills(nextSkills);
  };

  const handleRemoveSkill = (id: string) => {
    const nextSkills = sp.skills.filter((s) => s.id !== id);
    saveSkills(nextSkills);
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Student Workspace', to: '/student/dashboard' },
        { label: 'My Skills' },
      ]}
      action={
        <Link
          to="/student/recommendations"
          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
        >
          View Matches ({matchingCount})
        </Link>
      }
    >
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Skills & Proficiency</h1>
          <p className="text-sm text-slate-600 mt-1">
            SkillBridge uses your verified skill list to calculate project compatibility scores in
            real time.
          </p>
        </div>

        {/* Add Skill Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Add a New Skill</h2>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skill Name
              </label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., React, Node.js, JavaScript"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={skillCategory}
                onChange={(e) =>
                  setSkillCategory(e.target.value as 'technical' | 'creative')
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proficiency
              </label>
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as SkillProficiency)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </form>

          {/* Quick-Add Suggestions */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">Quick-add common skills:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((item) => {
                const added = sp.skills.some(
                  (s) => s.name.toLowerCase() === item.name.toLowerCase()
                );
                return (
                  <button
                    key={item.name}
                    type="button"
                    disabled={added}
                    onClick={() => handleQuickAdd(item)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      added
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {added ? `✓ ${item.name}` : `+ ${item.name}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Skills Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Your Listed Skills ({sp.skills.length})
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              Matches {matchingCount} published projects
            </span>
          </div>

          {sp.skills.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No skills added yet. Use the form above or click any quick-add skill.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sp.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{skill.name}</div>
                    <div className="text-xs text-slate-500 capitalize">
                      {skill.category} skill
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      aria-label={`Proficiency for ${skill.name}`}
                      value={skill.proficiency}
                      onChange={(e) =>
                        handleUpdateProficiency(
                          skill.id,
                          e.target.value as SkillProficiency
                        )
                      }
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white text-slate-800"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      aria-label={`Remove ${skill.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
