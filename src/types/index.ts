export type UserRole = 'student' | 'client' | 'admin';

export type UserStatus = 'active' | 'suspended';

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type ExperienceLevel = 'Entry Level' | 'Intermediate' | 'Advanced';

export type AvailabilityStatus =
  | 'Available Now'
  | 'Part-Time'
  | 'Weekends Only'
  | 'Unavailable';

export interface StudentSkill {
  id: string;
  name: string;
  category: 'technical' | 'creative';
  proficiency: SkillProficiency;
}

export interface StudentProfile {
  photo?: string;
  university: string;
  department: string;
  studentId: string;
  bio: string;
  skills: StudentSkill[];
  experienceLevel: ExperienceLevel;
  education: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  availability: AvailabilityStatus;
  profileCompleted: boolean;
}

export interface ClientProfile {
  companyName: string;
  companyDescription: string;
  logo?: string;
  website: string;
  contactPhone: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Demonstration-only local credential
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  studentProfile?: StudentProfile;
  clientProfile?: ClientProfile;
}

export type ProjectType = 'Fixed Price' | 'Hourly';

export type ProjectStatus =
  | 'Draft'
  | 'Published'
  | 'In Progress'
  | 'Closed'
  | 'Completed';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budget: number;
  projectType: ProjectType;
  experienceLevel: ExperienceLevel;
  duration: string;
  deadline: string;
  requiredStudents: number;
  status: ProjectStatus;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Shortlisted'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  actorRole: UserRole;
}

export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  clientId: string;
  coverLetter: string;
  relevantExperience: string;
  selectedSkills: string[];
  proposedPrice: number;
  completionTime: string;
  status: ApplicationStatus;
  timeline: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  image: string;
  githubUrl: string;
  liveUrl: string;
  completionDate: string;
  createdAt: string;
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  recipientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type NotificationType =
  | 'application_submitted'
  | 'new_application'
  | 'status_update'
  | 'project_match'
  | 'project_completed'
  | 'new_review'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  supportEmail: string;
  maintenanceNotice: string;
  maxPortfolioImageKb: number;
  demoInitializedAt: string;
}

export interface SkillMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  totalRequired: number;
}
