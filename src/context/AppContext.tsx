import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Application,
  ApplicationStatus,
  Category,
  Notification,
  PlatformSettings,
  PortfolioItem,
  Project,
  ProjectStatus,
  Review,
  User,
  UserRole,
  UserStatus,
} from '../types';
import { applicationService } from '../services/applicationService';
import { calculateSkillMatch } from '../services/matchingService';
import { notificationService } from '../services/notificationService';
import { portfolioService } from '../services/portfolioService';
import { projectService } from '../services/projectService';
import { reviewService } from '../services/reviewService';
import {
  generateId,
  getItem,
  initializeData,
  resetDemoData,
  setItem,
  STORAGE_KEYS,
} from '../services/storageService';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
}

interface AppContextValue {
  users: User[];
  projects: Project[];
  applications: Application[];
  portfolios: PortfolioItem[];
  reviews: Review[];
  notifications: Notification[];
  categories: Category[];
  settings: PlatformSettings;
  toasts: ToastItem[];
  showToast: (title: string, variant?: ToastItem['variant'], description?: string) => void;
  dismissToast: (id: string) => void;

  // User Actions
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setUserStatus: (userId: string, status: UserStatus) => void;
  deleteUser: (userId: string) => void;

  // Project Actions
  createProject: (
    data: Omit<Project, 'id' | 'applicantsCount' | 'createdAt' | 'updatedAt'>
  ) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  changeProjectStatus: (projectId: string, status: ProjectStatus) => void;
  deleteProject: (projectId: string) => void;

  // Application Actions
  submitApplication: (
    data: Omit<Application, 'id' | 'status' | 'timeline' | 'createdAt' | 'updatedAt'>
  ) => { application?: Application; error?: string };
  updateApplicationStatus: (
    applicationId: string,
    newStatus: ApplicationStatus,
    actorRole: UserRole,
    note?: string
  ) => void;

  // Portfolio Actions
  addPortfolioItem: (data: Omit<PortfolioItem, 'id' | 'createdAt'>) => PortfolioItem;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;

  // Review Actions
  submitReview: (
    data: Omit<Review, 'id' | 'createdAt'>
  ) => { review?: Review; error?: string };

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;

  // Category Actions
  addCategory: (name: string, description: string) => { error?: string };
  updateCategory: (id: string, name: string, description: string) => { error?: string };
  deleteCategory: (id: string) => { error?: string };

  // Platform Settings & Reset
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Ensure LocalStorage is initialized before reading initial state
initializeData();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getItem<User[]>(STORAGE_KEYS.USERS, []));
  const [projects, setProjects] = useState<Project[]>(() => projectService.getAll());
  const [applications, setApplications] = useState<Application[]>(() =>
    applicationService.getAll()
  );
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(() =>
    portfolioService.getAll()
  );
  const [reviews, setReviews] = useState<Review[]>(() => reviewService.getAll());
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    notificationService.getAll()
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    getItem<Category[]>(STORAGE_KEYS.CATEGORIES, [])
  );
  const [settings, setSettings] = useState<PlatformSettings>(() =>
    getItem<PlatformSettings>(STORAGE_KEYS.SETTINGS, {
      platformName: 'SkillBridge',
      tagline: 'Your Skills. Your Opportunities.',
      supportEmail: 'support@skillbridge.demo',
      maintenanceNotice: '',
      maxPortfolioImageKb: 350,
      demoInitializedAt: new Date().toISOString(),
    })
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, variant: ToastItem['variant'] = 'info', description?: string) => {
      const id = generateId('toast');
      setToasts((prev) => [...prev, { id, title, variant, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  // User Actions
  const addUser = useCallback((user: User) => {
    setUsers((prev) => {
      const next = [user, ...prev];
      setItem(STORAGE_KEYS.USERS, next);
      return next;
    });
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, ...updates } : u));
      setItem(STORAGE_KEYS.USERS, next);
      return next;
    });
  }, []);

  const setUserStatus = useCallback(
    (userId: string, status: UserStatus) => {
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === userId ? { ...u, status } : u));
        setItem(STORAGE_KEYS.USERS, next);
        return next;
      });
      showToast(
        status === 'suspended' ? 'Account Suspended' : 'Account Reactivated',
        status === 'suspended' ? 'info' : 'success'
      );
    },
    [showToast]
  );

  const deleteUser = useCallback(
    (userId: string) => {
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== userId);
        setItem(STORAGE_KEYS.USERS, next);
        return next;
      });
      // Clean up related student portfolios
      setPortfolios((prev) => {
        const next = prev.filter((p) => p.studentId !== userId);
        portfolioService.saveAll(next);
        return next;
      });
      showToast('Demonstration account removed', 'info');
    },
    [showToast]
  );

  // Project Actions
  const createProject = useCallback(
    (data: Omit<Project, 'id' | 'applicantsCount' | 'createdAt' | 'updatedAt'>) => {
      const res = projectService.create(projects, data);
      const created = res.project;
      setProjects(res.updatedProjects);

      // Notify matching students when published
      if (data.status === 'Published' && data.requiredSkills.length > 0) {
        const matchingStudents = users.filter((u) => {
          if (u.role !== 'student' || u.status !== 'active') return false;
          const skillNames = (u.studentProfile?.skills || []).map((s) => s.name);
          const match = calculateSkillMatch(skillNames, data.requiredSkills);
          return match.matchPercentage >= 50;
        });

        if (matchingStudents.length > 0) {
          setNotifications((prevNotifs) => {
            let nextNotifs = [...prevNotifs];
            for (const stu of matchingStudents) {
              const skillNames = (stu.studentProfile?.skills || []).map((s) => s.name);
              const match = calculateSkillMatch(skillNames, data.requiredSkills);
              nextNotifs = notificationService.push(nextNotifs, {
                userId: stu.id,
                title: `New Skill Match (${match.matchPercentage}%)`,
                message: `"${data.title}" matches ${match.matchingSkills.length} of ${match.totalRequired} required skills.`,
                type: 'project_match',
                link: `/projects/${created.id}`,
              });
            }
            return nextNotifs;
          });
        }
      }

      showToast(
        data.status === 'Published' ? 'Project Published' : 'Draft Saved',
        'success',
        data.title
      );
      return created;
    },
    [projects, users, showToast]
  );

  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      setProjects((prev) => projectService.update(prev, projectId, updates));
      showToast('Project updated', 'success');
    },
    [showToast]
  );

  const changeProjectStatus = useCallback(
    (projectId: string, status: ProjectStatus) => {
      const targetProject = projects.find((p) => p.id === projectId);
      setProjects((prev) => projectService.changeStatus(prev, projectId, status));

      if (status === 'Completed' && targetProject) {
        const acceptedApps = applications.filter(
          (a) => a.projectId === projectId && a.status === 'Accepted'
        );
        if (acceptedApps.length > 0) {
          setNotifications((prevNotifs) => {
            let next = [...prevNotifs];
            for (const app of acceptedApps) {
              next = notificationService.push(next, {
                userId: app.studentId,
                title: 'Project Marked Completed',
                message: `"${targetProject.title}" has been marked completed. You can now leave a review for the client.`,
                type: 'project_completed',
                link: '/student/applications',
              });
            }
            return next;
          });
        }
      }

      showToast(`Project status changed to ${status}`, 'success');
    },
    [projects, applications, showToast]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      setProjects((prev) => projectService.remove(prev, projectId));
      setApplications((prev) => {
        const next = prev.filter((a) => a.projectId !== projectId);
        applicationService.saveAll(next);
        return next;
      });
      showToast('Project deleted', 'info');
    },
    [showToast]
  );

  // Application Actions
  const submitApplication = useCallback(
    (
      data: Omit<Application, 'id' | 'status' | 'timeline' | 'createdAt' | 'updatedAt'>
    ): { application?: Application; error?: string } => {
      const project = projects.find((p) => p.id === data.projectId);
      const student = users.find((u) => u.id === data.studentId);

      if (!project) {
        return { error: 'Project not found.' };
      }
      if (project.status !== 'Published') {
        return { error: 'Applications are only accepted for active published projects.' };
      }
      if (project.clientId === data.studentId) {
        return { error: 'You cannot apply to your own project.' };
      }
      if (!student?.studentProfile?.profileCompleted) {
        return {
          error:
            'Please complete your student skill profile (university, department, bio, and at least one skill) before applying.',
        };
      }
      const existing = applications.find(
        (a) =>
          a.projectId === data.projectId &&
          a.studentId === data.studentId &&
          a.status !== 'Withdrawn'
      );
      if (existing) {
        return { error: 'You have already submitted an active application for this project.' };
      }

      const res = applicationService.create(applications, data);
      const createdApp = res.application;
      setApplications(res.updatedApplications);

      setProjects((prev) =>
        projectService.update(prev, project.id, {
          applicantsCount: project.applicantsCount + 1,
        })
      );

      setNotifications((prevNotifs) => {
        let next = notificationService.push(prevNotifs, {
          userId: data.studentId,
          title: 'Application Submitted',
          message: `Your application for "${project.title}" has been sent to the client.`,
          type: 'application_submitted',
          link: '/student/applications',
        });
        next = notificationService.push(next, {
          userId: project.clientId,
          title: 'New Project Application',
          message: `${student.name} applied for "${project.title}" ($${data.proposedPrice}).`,
          type: 'new_application',
          link: '/client/applications',
        });
        return next;
      });

      showToast('Application submitted successfully', 'success', project.title);
      return { application: createdApp };
    },
    [projects, users, applications, showToast]
  );

  const updateApplicationStatus = useCallback(
    (
      applicationId: string,
      newStatus: ApplicationStatus,
      actorRole: UserRole,
      note?: string
    ) => {
      const target = applications.find((a) => a.id === applicationId);
      if (!target) return;
      const project = projects.find((p) => p.id === target.projectId);
      const student = users.find((u) => u.id === target.studentId);

      setApplications((prev) =>
        applicationService.updateStatus(prev, applicationId, newStatus, actorRole, note)
      );

      if (newStatus === 'Accepted' && project && project.status === 'Published') {
        setProjects((prev) => projectService.changeStatus(prev, project.id, 'In Progress'));
      }

      setNotifications((prevNotifs) => {
        if (actorRole === 'client' && project) {
          return notificationService.push(prevNotifs, {
            userId: target.studentId,
            title: `Application ${newStatus}`,
            message: `Your application for "${project.title}" is now marked "${newStatus}".`,
            type: 'status_update',
            link: '/student/applications',
          });
        }
        if (newStatus === 'Withdrawn' && project && student) {
          return notificationService.push(prevNotifs, {
            userId: target.clientId,
            title: 'Application Withdrawn',
            message: `${student.name} withdrew their application from "${project.title}".`,
            type: 'status_update',
            link: '/client/applications',
          });
        }
        return prevNotifs;
      });

      showToast(`Application updated to ${newStatus}`, 'success');
    },
    [applications, projects, users, showToast]
  );

  // Portfolio Actions
  const addPortfolioItem = useCallback(
    (data: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
      const res = portfolioService.create(portfolios, data);
      setPortfolios(res.updatedItems);
      showToast('Portfolio project added', 'success', data.title);
      return res.item;
    },
    [portfolios, showToast]
  );

  const updatePortfolioItem = useCallback(
    (id: string, updates: Partial<PortfolioItem>) => {
      setPortfolios((prev) => portfolioService.update(prev, id, updates));
      showToast('Portfolio project updated', 'success');
    },
    [showToast]
  );

  const deletePortfolioItem = useCallback(
    (id: string) => {
      setPortfolios((prev) => portfolioService.remove(prev, id));
      showToast('Portfolio project deleted', 'info');
    },
    [showToast]
  );

  // Review Actions
  const submitReview = useCallback(
    (data: Omit<Review, 'id' | 'createdAt'>): { review?: Review; error?: string } => {
      const res = reviewService.create(reviews, data);
      if (res.error) {
        return { error: res.error };
      }
      setReviews(res.updatedReviews);
      const reviewer = users.find((u) => u.id === data.reviewerId);
      const project = projects.find((p) => p.id === data.projectId);
      setNotifications((prev) =>
        notificationService.push(prev, {
          userId: data.recipientId,
          title: `New ${data.rating}-Star Review Received`,
          message: `${reviewer?.name || 'A collaborator'} reviewed your work on "${
            project?.title || 'Project'
          }".`,
          type: 'new_review',
          link:
            users.find((u) => u.id === data.recipientId)?.role === 'student'
              ? `/students/${data.recipientId}`
              : `/clients/${data.recipientId}`,
        })
      );
      showToast('Review submitted', 'success');
      return { review: res.review };
    },
    [reviews, users, projects, showToast]
  );

  // Notification Actions
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => notificationService.markAsRead(prev, id));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setNotifications((prev) => notificationService.markAllAsReadForUser(prev, userId));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => notificationService.remove(prev, id));
  }, []);

  // Category Actions
  const addCategory = useCallback(
    (name: string, description: string): { error?: string } => {
      const trimmed = name.trim();
      if (!trimmed) return { error: 'Category name is required.' };
      const exists = categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return { error: 'A category with this name already exists.' };

      const newCat: Category = {
        id: generateId('cat'),
        name: trimmed,
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => {
        const next = [...prev, newCat];
        setItem(STORAGE_KEYS.CATEGORIES, next);
        return next;
      });
      showToast('Category created', 'success', trimmed);
      return {};
    },
    [categories, showToast]
  );

  const updateCategory = useCallback(
    (id: string, name: string, description: string): { error?: string } => {
      const trimmed = name.trim();
      if (!trimmed) return { error: 'Category name is required.' };
      const existing = categories.find((c) => c.id === id);
      if (!existing) return { error: 'Category not found.' };

      const duplicate = categories.some(
        (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) return { error: 'Another category already uses this name.' };

      setCategories((prev) => {
        const next = prev.map((c) =>
          c.id === id ? { ...c, name: trimmed, description: description.trim() } : c
        );
        setItem(STORAGE_KEYS.CATEGORIES, next);
        return next;
      });

      // Keep project category names synced if renamed
      if (existing.name !== trimmed) {
        setProjects((prev) => {
          const next = prev.map((p) =>
            p.category === existing.name ? { ...p, category: trimmed } : p
          );
          projectService.saveAll(next);
          return next;
        });
      }

      showToast('Category updated', 'success');
      return {};
    },
    [categories, showToast]
  );

  const deleteCategory = useCallback(
    (id: string): { error?: string } => {
      const target = categories.find((c) => c.id === id);
      if (!target) return { error: 'Category not found.' };
      const inUse = projects.some((p) => p.category === target.name);
      if (inUse) {
        return {
          error: `Cannot delete "${target.name}" because active or archived projects use this category.`,
        };
      }
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== id);
        setItem(STORAGE_KEYS.CATEGORIES, next);
        return next;
      });
      showToast('Category deleted', 'info');
      return {};
    },
    [categories, projects, showToast]
  );

  const updateSettings = useCallback(
    (updates: Partial<PlatformSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updates };
        setItem(STORAGE_KEYS.SETTINGS, next);
        return next;
      });
      showToast('Platform settings saved', 'success');
    },
    [showToast]
  );

  const resetAllDemoData = useCallback(() => {
    resetDemoData();
    setUsers(getItem<User[]>(STORAGE_KEYS.USERS, []));
    setProjects(projectService.getAll());
    setApplications(applicationService.getAll());
    setPortfolios(portfolioService.getAll());
    setReviews(reviewService.getAll());
    setNotifications(notificationService.getAll());
    setCategories(getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []));
    setSettings(getItem<PlatformSettings>(STORAGE_KEYS.SETTINGS, settings));
    showToast('Demonstration dataset restored to factory state', 'success');
  }, [settings, showToast]);

  return (
    <AppContext.Provider
      value={{
        users,
        projects,
        applications,
        portfolios,
        reviews,
        notifications,
        categories,
        settings,
        toasts,
        showToast,
        dismissToast,
        addUser,
        updateUser,
        setUserStatus,
        deleteUser,
        createProject,
        updateProject,
        changeProjectStatus,
        deleteProject,
        submitApplication,
        updateApplicationStatus,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        submitReview,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        resetAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
