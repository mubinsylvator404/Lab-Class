import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ProjectExplorer } from '../../components/projects/ProjectExplorer';

export const StudentBrowseProjectsPage: React.FC = () => {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Student Workspace', to: '/student/dashboard' },
        { label: 'Browse Projects' },
      ]}
    >
      <ProjectExplorer
        title="Browse Available Projects"
        subtitle="Filter marketplace projects by category, required skills, budget, and deadline."
      />
    </DashboardLayout>
  );
};
