import { Application, ApplicationStatus, UserRole } from '../types';
import { generateId, getItem, setItem, STORAGE_KEYS } from './storageService';

export const applicationService = {
  getAll(): Application[] {
    return getItem<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
  },

  saveAll(applications: Application[]): void {
    setItem(STORAGE_KEYS.APPLICATIONS, applications);
  },

  create(
    applications: Application[],
    data: Omit<Application, 'id' | 'status' | 'timeline' | 'createdAt' | 'updatedAt'>
  ): { application: Application; updatedApplications: Application[] } {
    const now = new Date().toISOString();
    const application: Application = {
      ...data,
      id: generateId('app'),
      status: 'Pending',
      timeline: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'Application submitted by student.',
          actorRole: 'student',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    const updatedApplications = [application, ...applications];
    this.saveAll(updatedApplications);
    return { application, updatedApplications };
  },

  updateStatus(
    applications: Application[],
    applicationId: string,
    newStatus: ApplicationStatus,
    actorRole: UserRole,
    note?: string
  ): Application[] {
    const now = new Date().toISOString();
    const updatedApplications = applications.map((app) => {
      if (app.id !== applicationId) return app;
      return {
        ...app,
        status: newStatus,
        updatedAt: now,
        timeline: [
          ...app.timeline,
          {
            status: newStatus,
            timestamp: now,
            note: note || `Status updated to ${newStatus}.`,
            actorRole,
          },
        ],
      };
    });
    this.saveAll(updatedApplications);
    return updatedApplications;
  },
};
