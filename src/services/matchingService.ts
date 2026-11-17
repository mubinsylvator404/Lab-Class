import { Project, Review, SkillMatchResult, User } from '../types';

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function deduplicateSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of skills) {
    const cleaned = raw.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cleaned);
    }
  }
  return result;
}

/**
 * Formula: Match Percentage = (Matching Required Skills / Total Required Skills) × 100
 * Handles different letter cases, duplicate skills, empty skills, missing profiles,
 * and projects without skill requirements.
 */
export function calculateSkillMatch(
  studentSkillNames: string[],
  requiredProjectSkills: string[]
): SkillMatchResult {
  const uniqueRequired = deduplicateSkills(requiredProjectSkills || []);
  const uniqueStudent = deduplicateSkills(studentSkillNames || []);

  if (uniqueRequired.length === 0) {
    return {
      matchPercentage: 0,
      matchingSkills: [],
      missingSkills: [],
      totalRequired: 0,
    };
  }

  if (uniqueStudent.length === 0) {
    return {
      matchPercentage: 0,
      matchingSkills: [],
      missingSkills: uniqueRequired,
      totalRequired: uniqueRequired.length,
    };
  }

  const studentSet = new Set(uniqueStudent.map(normalizeSkill));
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of uniqueRequired) {
    if (studentSet.has(normalizeSkill(req))) {
      matchingSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const matchPercentage = Math.round((matchingSkills.length / uniqueRequired.length) * 100);

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    totalRequired: uniqueRequired.length,
  };
}

export interface ProjectRecommendation {
  project: Project;
  match: SkillMatchResult;
}

export function getRecommendedProjectsForStudent(
  student: User | null | undefined,
  projects: Project[]
): ProjectRecommendation[] {
  if (!student || student.role !== 'student') return [];
  const studentSkillNames = (student.studentProfile?.skills || []).map((s) => s.name);

  const publishedProjects = projects.filter((p) => p.status === 'Published');

  return publishedProjects
    .map((project) => ({
      project,
      match: calculateSkillMatch(studentSkillNames, project.requiredSkills),
    }))
    .sort((a, b) => {
      if (b.match.matchPercentage !== a.match.matchPercentage) {
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      return new Date(b.project.createdAt).getTime() - new Date(a.project.createdAt).getTime();
    });
}

export interface StudentRecommendation {
  student: User;
  match: SkillMatchResult;
  averageRating: number;
  reviewCount: number;
}

export function getRecommendedStudentsForProject(
  project: Project | null | undefined,
  users: User[],
  reviews: Review[]
): StudentRecommendation[] {
  if (!project) return [];

  const activeStudents = users.filter(
    (u) => u.role === 'student' && u.status === 'active'
  );

  return activeStudents
    .map((student) => {
      const studentSkillNames = (student.studentProfile?.skills || []).map((s) => s.name);
      const match = calculateSkillMatch(studentSkillNames, project.requiredSkills);

      const studentReviews = reviews.filter((r) => r.recipientId === student.id);
      const reviewCount = studentReviews.length;
      const averageRating =
        reviewCount > 0
          ? Number(
              (
                studentReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
              ).toFixed(1)
            )
          : 0;

      return {
        student,
        match,
        averageRating,
        reviewCount,
      };
    })
    .sort((a, b) => {
      if (b.match.matchPercentage !== a.match.matchPercentage) {
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return (
        (b.student.studentProfile?.skills.length || 0) -
        (a.student.studentProfile?.skills.length || 0)
      );
    });
}
