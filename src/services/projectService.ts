import { Project, ProjectStatus } from '../types';
import { generateId, getItem, setItem, STORAGE_KEYS } from './storageService';

export const projectService = {
  getAll(): Project[] {
    return getItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
  },

  saveAll(projects: Project[]): void {
    setItem(STORAGE_KEYS.PROJECTS, projects);
  },

  create(
    projects: Project[],
    data: Omit<Project, 'id' | 'applicantsCount' | 'createdAt' | 'updatedAt'>
  ): { project: Project; updatedProjects: Project[] } {
    const now = new Date().toISOString();
    const project: Project = {
      ...data,
      id: generateId('prj'),
      applicantsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const updatedProjects = [project, ...projects];
    this.saveAll(updatedProjects);
    return { project, updatedProjects };
  },

  update(
    projects: Project[],
    projectId: string,
    updates: Partial<Project>
  ): Project[] {
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    this.saveAll(updatedProjects);
    return updatedProjects;
  },

  changeStatus(projects: Project[], projectId: string, status: ProjectStatus): Project[] {
    return this.update(projects, projectId, { status });
  },

  remove(projects: Project[], projectId: string): Project[] {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    this.saveAll(updatedProjects);
    return updatedProjects;
  },
};
