import React, { useMemo, useState } from 'react';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { calculateSkillMatch } from '../../services/matchingService';
import { ExperienceLevel, Project, ProjectStatus, ProjectType } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';
import { ApplyProjectModal } from './ApplyProjectModal';
import { ProjectCard } from './ProjectCard';

type SortOption = 'newest' | 'oldest' | 'lowest_budget' | 'highest_budget';

export const ProjectExplorer: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({ title = 'Explore Projects', subtitle }) => {
  const { projects, users, categories, applications } = useApp();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchInput, 220);

  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('category') || 'All'
  );
  const [skillFilter, setSkillFilter] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'All' | ExperienceLevel>('All');
  const [projectType, setProjectType] = useState<'All' | ProjectType>('All');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Published' | ProjectStatus | 'All'>('Published');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [applyTarget, setApplyTarget] = useState<Project | null>(null);

  const pageSize = 9;

  const userMap = useMemo(() => {
    const map = new Map(users.map((u) => [u.id, u]));
    return map;
  }, [users]);

  const studentSkillNames = useMemo(() => {
    if (currentUser?.role !== 'student') return [];
    return (currentUser.studentProfile?.skills || []).map((s) => s.name);
  }, [currentUser]);

  const appliedProjectIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set(
      applications
        .filter((a) => a.studentId === currentUser.id && a.status !== 'Withdrawn')
        .map((a) => a.projectId)
    );
  }, [applications, currentUser]);

  const clearAllFilters = () => {
    setSearchInput('');
    setSelectedCategory('All');
    setSkillFilter('');
    setMinBudget('');
    setMaxBudget('');
    setExperienceLevel('All');
    setProjectType('All');
    setDeadlineBefore('');
    setStatusFilter('Published');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const filteredProjects = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const skillQuery = skillFilter.trim().toLowerCase();
    const minB = minBudget ? Number(minBudget) : null;
    const maxB = maxBudget ? Number(maxBudget) : null;

    const list = projects.filter((p) => {
      // Never expose unpublished drafts in public marketplace
      if (p.status === 'Draft') return false;

      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (experienceLevel !== 'All' && p.experienceLevel !== experienceLevel) return false;
      if (projectType !== 'All' && p.projectType !== projectType) return false;
      if (minB !== null && !Number.isNaN(minB) && p.budget < minB) return false;
      if (maxB !== null && !Number.isNaN(maxB) && p.budget > maxB) return false;

      if (deadlineBefore && p.deadline && p.deadline > deadlineBefore) {
        return false;
      }

      if (skillQuery) {
        const reqLower = p.requiredSkills.map((s) => s.toLowerCase());
        const terms = skillQuery
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        const matchesSkill = terms.every((term) =>
          reqLower.some((r) => r.includes(term))
        );
        if (!matchesSkill) return false;
      }

      if (query) {
        const client = userMap.get(p.clientId);
        const clientName = `${client?.name || ''} ${
          client?.clientProfile?.companyName || ''
        }`.toLowerCase();
        const haystack = `${p.title} ${p.description} ${p.category} ${p.requiredSkills.join(
          ' '
        )} ${clientName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'lowest_budget') {
        return a.budget - b.budget;
      }
      return b.budget - a.budget;
    });

    return list;
  }, [
    projects,
    debouncedSearch,
    skillFilter,
    minBudget,
    maxBudget,
    statusFilter,
    selectedCategory,
    experienceLevel,
    projectType,
    deadlineBefore,
    sortBy,
    userMap,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const hasActiveFilters =
    searchInput ||
    selectedCategory !== 'All' ||
    skillFilter ||
    minBudget ||
    maxBudget ||
    experienceLevel !== 'All' ||
    projectType !== 'All' ||
    deadlineBefore ||
    statusFilter !== 'Published';

  const FilterControls = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Required Skills
        </label>
        <input
          type="text"
          value={skillFilter}
          onChange={(e) => {
            setSkillFilter(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="e.g., React, Python, Figma"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Separate multiple skills with commas
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Budget Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={minBudget}
            onChange={(e) => {
              setMinBudget(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Min"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="number"
            min={0}
            value={maxBudget}
            onChange={(e) => {
              setMaxBudget(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Max"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Experience Level
        </label>
        <select
          value={experienceLevel}
          onChange={(e) => {
            setExperienceLevel(e.target.value as 'All' | ExperienceLevel);
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">All Levels</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Project Type
        </label>
        <select
          value={projectType}
          onChange={(e) => {
            setProjectType(e.target.value as 'All' | ProjectType);
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">Fixed & Hourly</option>
          <option value="Fixed Price">Fixed Price</option>
          <option value="Hourly">Hourly</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Deadline Before
        </label>
        <input
          type="date"
          value={deadlineBefore}
          onChange={(e) => {
            setDeadlineBefore(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Project Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'Published' | ProjectStatus | 'All');
            setCurrentPage(1);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="Published">Active Published Only</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
          <option value="All">All Marketplace Statuses</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 tabular-nums">
          <span className="font-semibold text-slate-900">{filteredProjects.length}</span>{' '}
          {filteredProjects.length === 1 ? 'project' : 'projects'} available
        </div>
      </div>

      {/* Top Search & Sort Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, description, skill, category, or client..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <select
            aria-label="Sort projects"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="highest_budget">Sort: Highest Budget</option>
            <option value="lowest_budget">Sort: Lowest Budget</option>
          </select>

          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Sidebar Filters (Desktop) + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 sticky top-20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Filter Projects</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <FilterControls />
        </aside>

        <div className="lg:col-span-9 space-y-5">
          {paginatedProjects.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching projects found"
              description="Try widening your budget range, clearing skill filters, or searching with different keywords."
              actionLabel="Clear All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'space-y-4'
                }
              >
                {paginatedProjects.map((project) => {
                  const client = userMap.get(project.clientId);
                  const match =
                    currentUser?.role === 'student'
                      ? calculateSkillMatch(studentSkillNames, project.requiredSkills)
                      : undefined;
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      client={client}
                      match={match}
                      viewMode={viewMode}
                      hasApplied={appliedProjectIds.has(project.id)}
                      showApplyButton={currentUser?.role !== 'client' && currentUser?.role !== 'admin'}
                      onApply={(p) => setApplyTarget(p)}
                    />
                  );
                })}
              </div>

              <Pagination
                currentPage={safePage}
                totalItems={filteredProjects.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[90vw] bg-white h-full p-5 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Filter Projects</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterControls />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Show {filteredProjects.length} Projects
            </button>
          </div>
        </div>
      )}

      <ApplyProjectModal
        project={applyTarget}
        onClose={() => setApplyTarget(null)}
      />
    </div>
  );
};
