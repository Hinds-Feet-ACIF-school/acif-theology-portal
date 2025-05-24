import { IconMap } from '../utils/adminUtils'; // We'll create this next

// --- Data Interfaces ---
export interface DashboardStat {
  id: string | number;
  title: string;
  value: string | number;
  iconName: keyof typeof IconMap;
  change?: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  courseName: string;
  progress: number;
}

export interface CourseSummary {
  id: string;
  title: string;
  studentCount: number;
  status: 'active' | 'upcoming' | 'completed' | 'archived' | string;
  startDate?: string;
  endDate?: string;
  courseId?: string;
}

export interface QuizSummary {
  id: string;
  title: string;
  courseId?: string;
  courseName: string;
  submittedCount: number;
  totalEligible: number;
  monthOrder: number;
  weekNumber: number;
  dueDate?: string;
}

// Full interfaces for tab views
export interface Student extends StudentSummary {
  email: string;
  status: string; // 'active', 'at risk', 'inactive', 'completed'
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  monthOrder: number;
  instructor?: string;
  instructorName?: string;
  studentCount?: number;
  status?: 'active' | 'upcoming' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quiz extends QuizSummary {
  // Add more fields if needed for the table view
  dueDate?: string;
}

export type AdminTabValue = "dashboard" | "students" | "courses" | "quizzes";