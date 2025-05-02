import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Card, CardContent } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { Input } from "../../components/ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.js";
import { Search, Eye, Trash2, ArrowLeft, UserPlus, Download, Loader2, AlertCircle } from 'lucide-react';
import * as apiService from "../../services/api.js";
import ConfirmationModal from "../../components/modals/ConfirmationModal.js";
import StudentDetailsModal from "../../components/modals/StudentDetailsModal.js"; // Import the new modal
// --- End Interfaces ---
// --- Theme Constants (keep as is) ---
const accentColor = "#C5A467"; /* ... */
const accentHoverColor = "#B08F55"; /* ... */
const lightBg = 'bg-[#FFF8F0]'; /* ... */
const darkBg = 'dark:bg-gray-950'; /* ... */
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]'; /* ... */
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]'; /* ... */
const goldAccent = 'text-[#C5A467]'; /* ... */
const goldBg = 'bg-[#C5A467]'; /* ... */
const goldBgHover = 'hover:bg-[#B08F55]'; /* ... */
const goldBorder = 'border-[#C5A467]'; /* ... */
const lightCardBg = 'bg-white'; /* ... */
const darkCardBg = 'dark:bg-gray-900'; /* ... */
const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15'; /* ... */
const mutedText = 'text-gray-600 dark:text-gray-400'; /* ... */
const inputBorder = 'border-gray-300 dark:border-gray-700'; /* ... */
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]'; /* ... */
const tableHeaderBg = 'bg-gray-50 dark:bg-gray-800/50'; /* ... */
const tableRowBorder = 'border-b border-gray-200 dark:border-gray-700'; /* ... */
const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedText}`; /* ... */
const tableCellClasses = `p-4 align-middle ${midBrown}`; /* ... */
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`; /* ... */
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`; /* ... */
const ghostButtonClasses = `${midBrown} hover:bg-gray-100 dark:hover:bg-gray-700/50`; /* ... */
const linkClasses = `${goldAccent} hover:underline`; /* ... */
const tabsListBg = 'bg-gray-100/50 dark:bg-gray-800/50'; /* ... */
const tabsTriggerBaseClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] dark:focus-visible:ring-offset-gray-950`; /* ... */
const tabsTriggerInactiveClasses = `text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white`; /* ... */
const tabsTriggerActiveClasses = `shadow-sm ${goldBg} dark:${goldBg} text-[#2A0F0F] dark:text-[#2A0F0F] font-semibold`; /* ... */
const tabsTriggerDisabledClasses = `opacity-50 cursor-not-allowed`; /* ... */
const positiveColor = "text-green-600 dark:text-green-400"; /* ... */
const positiveBg = "bg-green-100 dark:bg-green-900/30"; /* ... */
const warningColor = "text-yellow-700 dark:text-yellow-400"; /* ... */
const warningBg = "bg-yellow-100 dark:bg-yellow-900/30"; /* ... */
const inactiveColor = mutedText; /* ... */
const inactiveBg = "bg-gray-100 dark:bg-gray-700/30"; /* ... */
// --- End Theme Constants ---
export default function AdminStudentManagementPage() {
    const [activeTab, setActiveTab] = useState("students");
    const [studentsData, setStudentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null); // Student for details modal
    const [showDetailsModal, setShowDetailsModal] = useState(false); // State to control details modal
    const [studentSearch, setStudentSearch] = useState("");
    const [studentRoleFilter, setStudentRoleFilter] = useState("student");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // --- Fetch Students Data ---
    const fetchStudents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const users = await apiService.getAllUsersForAdmin();
            const studentUsers = users.filter((user) => user.role === 'student');
            setStudentsData(studentUsers);
        }
        catch (err) {
            console.error("Failed to fetch students:", err);
            setError(err.message || "Could not load student data.");
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchStudents();
    }, []);
    // --- End Fetch Students Data ---
    // Mock data for other tabs
    const studentGrades = [
        { id: 1, assignment: "Quiz: God's Attributes", type: "Quiz", grade: 90, maxGrade: 100, date: "Jan 22, 2025" },
        { id: 3, assignment: "Quiz: The Person of Christ", type: "Quiz", grade: 88, maxGrade: 100, date: "Jan 29, 2025" },
    ];
    // --- Filtering Logic ---
    const filteredStudents = studentsData.filter(s => (s.displayName?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())));
    // --- End Filtering Logic ---
    // --- Status Badge Logic (Simplified) ---
    const getStudentStatus = (student) => {
        if (student.disabled) {
            return { text: 'Disabled', classes: `${inactiveBg} ${inactiveColor}` };
        }
        if (student.enrollment) {
            return { text: 'Active', classes: `${positiveBg} ${positiveColor}` };
        }
        return { text: 'No Cohort', classes: `${inactiveBg} ${inactiveColor}` };
    };
    // ---
    // --- Handlers ---
    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setShowDetailsModal(true); // Open the modal
    };
    const handleDeleteRequest = (student) => {
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };
    const handleDeleteConfirm = async () => {
        if (!studentToDelete)
            return;
        setIsDeleting(true);
        try {
            await apiService.deleteUserAdmin(studentToDelete.uid);
            setShowDeleteModal(false);
            setStudentToDelete(null);
            // If the deleted student was the one being viewed, close the details modal too
            if (selectedStudent?.uid === studentToDelete.uid) {
                setSelectedStudent(null);
                setShowDetailsModal(false);
            }
            await fetchStudents();
        }
        catch (err) {
            console.error("Failed to delete student:", err);
            setError(err.message || "Could not delete student.");
        }
        finally {
            setIsDeleting(false);
        }
    };
    // ---
    const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
    const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full md:w-[180px] ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
    const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${lightBg} ${darkBg}`, children: [_jsxs("div", { className: "container px-4 py-8 md:px-6", children: [_jsx("div", { className: "flex items-center gap-2 mb-6", children: _jsxs(Link, { to: "/admin", className: `flex items-center ${linkClasses}`, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Back to Admin Dashboard"] }) }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: `text-3xl font-bold tracking-tight ${deepBrown}`, children: "Student Management" }), _jsx("p", { className: midBrown, children: "Manage students, track progress, and view performance" })] }), _jsxs(Button, { className: primaryButtonClasses, disabled: true, children: [_jsx(UserPlus, { className: "mr-2 h-4 w-4" }), "Add New Student (WIP)"] })] }), isLoading && _jsx("div", { className: "flex justify-center items-center p-10", children: _jsx(Loader2, { className: `h-8 w-8 animate-spin ${goldAccent}` }) }), error && !isLoading && _jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2 text-sm", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), " ", error] }), _jsxs(Tabs, { defaultValue: "students", className: "space-y-8", value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: `rounded-md p-1 ${tabsListBg} inline-flex`, children: [_jsx(TabsTrigger, { value: "students", className: `${tabsTriggerBaseClasses} ${activeTab === 'students' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`, children: "All Students" }), _jsx(TabsTrigger, { value: "progress", className: `${tabsTriggerBaseClasses} ${activeTab === 'progress' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`, children: "Progress Tracking" }), _jsx(TabsTrigger, { value: "grades", className: `${tabsTriggerBaseClasses} ${activeTab === 'grades' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`, children: "Grades & Assessment" }), _jsx(TabsTrigger, { value: "reports", className: `${tabsTriggerBaseClasses} ${activeTab === 'reports' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`, children: "Reports" })] }), _jsxs(TabsContent, { value: "students", className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between gap-4", children: [_jsxs("div", { className: "flex gap-2 w-full md:w-auto", children: [_jsxs("div", { className: "relative w-full md:w-64", children: [_jsx(Search, { className: `absolute left-2.5 top-2.5 h-4 w-4 ${mutedText}` }), _jsx(Input, { placeholder: "Search by name or email...", className: `pl-8 ${inputClasses}`, value: studentSearch, onChange: e => setStudentSearch(e.target.value) })] }), _jsxs(Select, { value: studentRoleFilter, onValueChange: setStudentRoleFilter, disabled: true, children: [_jsx(SelectTrigger, { className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Filter by role" }) }), _jsx(SelectContent, { className: selectContentClasses, children: _jsx(SelectItem, { value: "student", children: "Students Only" }) })] })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", className: outlineButtonClasses, children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), " Export"] }) })] }), _jsx(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: _jsx(CardContent, { className: "p-0", children: !isLoading && (_jsx("div", { className: "relative w-full overflow-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: tableHeaderBg, children: _jsxs("tr", { className: tableRowBorder, children: [_jsx("th", { className: tableHeaderClasses, children: "Name" }), _jsx("th", { className: tableHeaderClasses, children: "Email" }), _jsx("th", { className: tableHeaderClasses, children: "Country" }), _jsx("th", { className: tableHeaderClasses, children: "Enrollment Date" }), _jsx("th", { className: tableHeaderClasses, children: "Status" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsxs("tbody", { className: `divide-y ${tableRowBorder}`, children: [filteredStudents.map((student) => {
                                                                    const statusInfo = getStudentStatus(student);
                                                                    const enrollmentDateStr = student.enrollment?.enrollmentDate
                                                                        ? new Date(student.enrollment.enrollmentDate).toLocaleDateString()
                                                                        : 'N/A';
                                                                    return (_jsxs("tr", { className: `hover:${lightCardBg} dark:hover:${darkCardBg}`, children: [_jsx("td", { className: `p-4 align-middle font-medium ${deepBrown}`, children: student.displayName || `${student.firstName} ${student.lastName}` || 'N/A' }), _jsx("td", { className: tableCellClasses, children: student.email || 'N/A' }), _jsx("td", { className: tableCellClasses, children: student.country || 'N/A' }), _jsx("td", { className: tableCellClasses, children: enrollmentDateStr }), _jsx("td", { className: tableCellClasses, children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classes}`, children: statusInfo.text }) }), _jsx("td", { className: `${tableCellClasses} text-right`, children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => handleViewDetails(student), children: [_jsx("span", { className: "sr-only", children: "View Student" }), _jsx(Eye, { className: "h-4 w-4" })] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-8 w-8`, onClick: () => handleDeleteRequest(student), children: [_jsx("span", { className: "sr-only", children: "Delete Student" }), _jsx(Trash2, { className: "h-4 w-4" })] })] }) })] }, student.uid));
                                                                }), filteredStudents.length === 0 && !isLoading && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: `p-6 text-center ${mutedText}`, children: "No students found matching your criteria." }) }))] })] }) })) }) })] }), _jsx(TabsContent, { value: "progress", className: "space-y-6", children: _jsx("p", { className: mutedText, children: "Progress tracking data (using mock data for now)." }) }), _jsx(TabsContent, { value: "grades", className: "space-y-6", children: _jsx("p", { className: mutedText, children: "Grades data (using mock data for now)." }) }), _jsx(TabsContent, { value: "reports", className: "space-y-6", children: _jsx("p", { className: mutedText, children: "Reports data (using mock data for now)." }) })] })] }), _jsx(StudentDetailsModal, { isOpen: showDetailsModal, onClose: () => { setShowDetailsModal(false); setSelectedStudent(null); }, student: selectedStudent }), _jsx(ConfirmationModal, { isOpen: showDeleteModal, onClose: () => setShowDeleteModal(false), onConfirm: handleDeleteConfirm, title: "Confirm Student Deletion", message: _jsxs(_Fragment, { children: ["Are you sure you want to delete the student: ", _jsxs("strong", { className: deepBrown, children: ["\"", studentToDelete?.displayName, "\""] }), " (", studentToDelete?.email, ")?", _jsx("br", {}), _jsx("br", {}), _jsx("span", { className: "font-semibold text-red-600 dark:text-red-400", children: "This action cannot be undone. The user's authentication record and profile data will be removed." })] }), confirmText: "Delete Student", confirmVariant: "destructive", isConfirming: isDeleting })] }));
}
