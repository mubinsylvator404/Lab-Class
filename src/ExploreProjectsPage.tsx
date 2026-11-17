import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { ProjectExplorer } from '../../components/projects/ProjectExplorer';

export const ExploreProjectsPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ProjectExplorer
          title="Explore Marketplace Projects"
          subtitle="Search active projects, filter by required skills or budget, and submit your proposal."
        />
      </div>
    </PublicLayout>
  );
};
