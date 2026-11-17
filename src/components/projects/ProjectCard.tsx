import React from 'react';
import { ArrowUpRight, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project, SkillMatchResult, User } from '../../types';
import { formatCurrency, formatDate, getProjectStatusStyle } from '../../utils/formatters';

interface ProjectCardProps {
  project: Project;
  client?: User;
  match?: SkillMatchResult;
  viewMode?: 'grid' | 'list';
  onApply?: (project: Project) => void;
  hasApplied?: boolean;
  showApplyButton?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  client,
  match,
  viewMode = 'grid',
  onApply,
  hasApplied = false,
  showApplyButton = true,
}) => {
  const statusStyle = getProjectStatusStyle(project.status);
  const clientLabel =
    client?.clientProfile?.companyName || client?.name || 'Partner Business';

  if (viewMode === 'list') {
    return (
      <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.experienceLevel}</span>
            <span aria-hidden="true">·</span>
            <span>{project.projectType}</span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${statusStyle.text}`}>{project.status}</span>
            {match && match.totalRequired > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-blue-700 tabular-nums">
                  {match.matchPercentage}% Skill Match
                </span>
              </>
            )}
          </div>

          <Link
            to={`/projects/${project.id}`}
            className="mt-1.5 block text-lg font-semibold text-slate-900 hover:text-blue-700 transition-colors"
          >
            {project.title}
          </Link>

          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Skills:{' '}
              <span className="text-slate-700 font-medium">
                {project.requiredSkills.join(', ') || 'General'}
              </span>
            </span>
            <span>
              Client:{' '}
              <Link
                to={`/clients/${project.clientId}`}
                className="text-slate-700 hover:text-blue-700 font-medium"
              >
                {clientLabel}
              </Link>
            </span>
          </div>
        </div>

        <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
          <div className="lg:text-right">
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(project.budget, project.projectType)}
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Due {formatDate(project.deadline)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {project.applicantsCount} applicants
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${project.id}`}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
            {showApplyButton && project.status === 'Published' && onApply && (
              <button
                type="button"
                disabled={hasApplied}
                onClick={() => onApply(project)}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap"
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between h-full">
      <div>
        {/* Quiet 1-line unboxed metadata kicker */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-slate-700 truncate">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">{project.experienceLevel}</span>
          </div>
          <span className={`font-medium shrink-0 ${statusStyle.text}`}>{project.status}</span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="mt-2 block text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors leading-snug"
        >
          {project.title}
        </Link>

        <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {match && match.totalRequired > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Skill compatibility</span>
            <span className="font-mono font-semibold text-blue-700 tabular-nums">
              {match.matchPercentage}% ({match.matchingSkills.length}/{match.totalRequired})
            </span>
          </div>
        )}

        <div className="mt-3.5 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Skills:</span>{' '}
          <span className="text-slate-600">
            {project.requiredSkills.length > 0
              ? project.requiredSkills.join(' · ')
              : 'No specific skills listed'}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            to={`/clients/${project.clientId}`}
            className="font-medium text-slate-700 hover:text-blue-700 truncate max-w-[160px]"
          >
            {clientLabel}
          </Link>
          <span className="tabular-nums shrink-0">
            {project.applicantsCount}{' '}
            {project.applicantsCount === 1 ? 'applicant' : 'applicants'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(project.budget, project.projectType)}
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums">
              {project.projectType} · Due {formatDate(project.deadline)}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showApplyButton && project.status === 'Published' && onApply ? (
              <button
                type="button"
                disabled={hasApplied}
                onClick={() => onApply(project)}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap"
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </button>
            ) : (
              <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Details
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
