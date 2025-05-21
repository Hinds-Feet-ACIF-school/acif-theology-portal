import { BookOpen, Users, FileText, CheckCircle2, HelpCircle } from "lucide-react";
import * as AdminStyles from '../styles/adminStyles'; // We'll create this next

export const IconMap = {
  Users,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle, // Fallback
};

export const getStatusBadgeClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return `${AdminStyles.positiveBg} ${AdminStyles.positiveColor}`;
    case 'at risk': return `${AdminStyles.warningBg} ${AdminStyles.warningColor}`;
    case 'upcoming': return `${AdminStyles.upcomingBg} ${AdminStyles.upcomingColor}`;
    case 'completed': return `${AdminStyles.inactiveBg} ${AdminStyles.inactiveColor}`;
    case 'inactive': return `${AdminStyles.inactiveBg} ${AdminStyles.inactiveColor}`;
    case 'archived': return `${AdminStyles.inactiveBg} ${AdminStyles.inactiveColor}`;
    default: return `${AdminStyles.inactiveBg} ${AdminStyles.inactiveColor}`;
  }
};