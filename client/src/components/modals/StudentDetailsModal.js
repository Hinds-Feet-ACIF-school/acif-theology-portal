import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.js";
import { X } from 'lucide-react';
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
// Helper function to get status text and classes (copied from AdminStudentManagementPage)
const getStudentStatus = (student) => {
    if (!student)
        return { text: 'N/A', classes: `${inactiveBg} ${inactiveColor}` };
    if (student.disabled) {
        return { text: 'Disabled', classes: `${inactiveBg} ${inactiveColor}` };
    }
    if (student.enrollment) {
        return { text: 'Active', classes: `${positiveBg} ${positiveColor}` };
    }
    return { text: 'No Cohort', classes: `${inactiveBg} ${inactiveColor}` };
};
const StudentDetailsModal = ({ isOpen, onClose, student, }) => {
    if (!isOpen || !student) {
        return null;
    }
    const statusInfo = getStudentStatus(student);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn", children: _jsxs(Card, { className: `w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl animate-scaleIn`, children: [_jsxs(CardHeader, { className: "flex flex-row items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: deepBrown, children: "Student Details" }), _jsxs(CardDescription, { className: midBrown, children: ["Information for ", student.displayName || 'N/A'] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { className: `h-5 w-5 ${midBrown}` }) })] }), _jsxs(CardContent, { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-2", children: [_jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "UID:" }), " ", _jsx("span", { className: `${midBrown} text-xs break-all`, children: student.uid })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Name:" }), " ", _jsx("span", { className: midBrown, children: student.displayName || `${student.firstName} ${student.lastName}`.trim() || 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Email:" }), " ", _jsx("span", { className: midBrown, children: student.email || 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Role:" }), " ", _jsx("span", { className: midBrown, children: student.role || 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Country:" }), " ", _jsx("span", { className: midBrown, children: student.country || 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Church:" }), " ", _jsx("span", { className: midBrown, children: student.church || 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Enrolled Cohort ID:" }), " ", _jsx("span", { className: midBrown, children: student.enrollment?.cohortId || 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Enrollment Date:" }), " ", _jsx("span", { className: midBrown, children: student.enrollment?.enrollmentDate ? new Date(student.enrollment.enrollmentDate).toLocaleDateString() : 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: deepBrown, children: "Account Created:" }), " ", _jsx("span", { className: midBrown, children: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A' })] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx("strong", { className: deepBrown, children: "Status:" }), _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classes}`, children: statusInfo.text })] })] })] }) }));
};
export default StudentDetailsModal;
