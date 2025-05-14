// src/components/modals/StudentDetailsModal.tsx
import React from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.js";
import { X } from 'lucide-react';
import { AdminManagedUser } from '../../pages/admin/StudentManagementPage';

// --- Theme Constants (Copy from AdminStudentManagementPage or define globally) ---
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const inactiveColor = 'text-gray-600 dark:text-gray-400';
const inactiveBg = "bg-gray-100 dark:bg-gray-700/30";
// --- End Theme Constants ---

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: AdminManagedUser | null;
}

// Helper function to get status text and classes (copied from AdminStudentManagementPage)
const getStudentStatus = (student: AdminManagedUser | null): { text: string; classes: string } => {
     if (!student) return { text: 'N/A', classes: `${inactiveBg} ${inactiveColor}` };
     if (student.disabled) {
         return { text: 'Disabled', classes: `${inactiveBg} ${inactiveColor}` };
     }
     if (student.enrollment) {
         return { text: 'Active', classes: `${positiveBg} ${positiveColor}` };
     }
     return { text: 'No Cohort', classes: `${inactiveBg} ${inactiveColor}` };
  };


const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen || !student) {
    return null;
  }

  const statusInfo = getStudentStatus(student);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <Card className={`w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl animate-scaleIn`}>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className={deepBrown}>Student Details</CardTitle>
            <CardDescription className={midBrown}>
                Information for {student.displayName || 'N/A'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <p><strong className={deepBrown}>UID:</strong> <span className={`${midBrown} text-xs break-all`}>{student.uid}</span></p>
            <p><strong className={deepBrown}>Name:</strong> <span className={midBrown}>{student.displayName || `${student.firstName} ${student.lastName}`.trim() || 'N/A'}</span></p>
            <p><strong className={deepBrown}>Email:</strong> <span className={midBrown}>{student.email || 'N/A'}</span></p>
            <p><strong className={deepBrown}>Role:</strong> <span className={midBrown}>{student.role || 'N/A'}</span></p>
            <p><strong className={deepBrown}>Country:</strong> <span className={midBrown}>{student.country || 'N/A'}</span></p>
            <p><strong className={deepBrown}>Church:</strong> <span className={midBrown}>{student.church || 'N/A'}</span></p>
            <p><strong className={deepBrown}>Enrolled Cohort ID:</strong> <span className={midBrown}>{student.enrollment?.cohortId || 'N/A'}</span></p>
            <p><strong className={deepBrown}>Enrollment Date:</strong> <span className={midBrown}>{student.enrollment?.enrollmentDate ? new Date(student.enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}</span></p>
            <p><strong className={deepBrown}>Account Created:</strong> <span className={midBrown}>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span></p>
            <p className="flex items-center gap-2">
                <strong className={deepBrown}>Status:</strong>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classes}`}>
                    {statusInfo.text}
                </span>
            </p>
            {/* Add more details here if needed, e.g., progress, last active */}
        </CardContent>
        {/* Optional Footer for actions like Edit */}
        {/* <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" className={outlineButtonClasses} onClick={onClose}>
                 Close
            </Button>
             You could add an Edit button here that opens the Edit modal
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default StudentDetailsModal;