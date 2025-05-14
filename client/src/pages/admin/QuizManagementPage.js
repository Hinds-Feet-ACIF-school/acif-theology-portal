import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { PlusCircle, Edit, Eye, Trash2, ArrowLeft, Save, ChevronLeft, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import * as apiService from "../../services/api";
const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const tableHeaderBg = 'bg-gray-50 dark:bg-gray-800/50';
const tableRowBorder = 'border-b border-gray-200 dark:border-gray-700';
const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedText}`;
const tableCellClasses = `p-4 align-middle ${midBrown}`;
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const ghostButtonClasses = `${midBrown} hover:bg-gray-100 dark:hover:bg-gray-700/50`;
const linkClasses = `${goldAccent} hover:underline`;
const tabsListBg = 'bg-gray-100/50 dark:bg-gray-800/50';
const tabsTriggerClasses = `${midBrown} data-[state=active]:${deepBrown} data-[state=active]:${lightCardBg} dark:data-[state=active]:${darkCardBg} data-[state=active]:shadow-sm`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full md:w-[180px] ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const warningColor = "text-yellow-700 dark:text-yellow-400";
const warningBg = "bg-yellow-100 dark:bg-yellow-900/30";
export default function AdminQuizManagementPage() {
    const [activeTab, setActiveTab] = useState("quizzes");
    const [quizzes, setQuizzes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [error, setError] = useState(null);
    const [filterCourseId, setFilterCourseId] = useState('all');
    const [filterWeekId, setFilterWeekId] = useState('all');
    useEffect(() => {
        fetchAllQuizzes();
        fetchSubmissionsToGrade();
    }, []);
    const fetchAllQuizzes = async () => {
        setIsLoadingQuizzes(true);
        setError(null);
        try {
            console.warn("Fetching all quizzes - Needs backend endpoint or better filtering");
            await new Promise(resolve => setTimeout(resolve, 300));
            const mockQuizzes = [
                { id: 'quiz1', weekId: 'wk_crs1-3', title: 'Week 3 Checkpoint Quiz', quizUrl: 'https://forms.google.com/...', points: 20, dueDateOffsetDays: 7, courseTitle: 'Foundations...', weekNumber: 3 },
                { id: 'quiz2', weekId: 'wk_crs1-4', title: 'Final Course Quiz', quizUrl: 'https://forms.google.com/...', points: 100, dueDateOffsetDays: 10, courseTitle: 'Foundations...', weekNumber: 4 },
            ];
            setQuizzes(mockQuizzes);
        }
        catch (err) {
            setError(err.message || "Failed to fetch quizzes");
            console.error(err);
        }
        finally {
            setIsLoadingQuizzes(false);
        }
    };
    const fetchSubmissionsToGrade = async () => {
        setIsLoadingSubmissions(true);
        setError(null);
        try {
            console.warn("Fetching submissions to grade - Needs backend endpoint");
            await new Promise(resolve => setTimeout(resolve, 400));
            const mockSubmissions = [
                { id: 'sub1', quizId: 'quiz1', userId: 'user123', userName: 'John Doe', submittedAt: new Date(), status: 'submitted', quizTitle: 'Week 3 Checkpoint Quiz' },
                { id: 'sub2', quizId: 'quiz1', userId: 'user456', userName: 'Jane Smith', submittedAt: new Date(), status: 'submitted', quizTitle: 'Week 3 Checkpoint Quiz' },
            ];
            setSubmissions(mockSubmissions);
        }
        catch (err) {
            setError(err.message || "Failed to fetch submissions");
            console.error(err);
        }
        finally {
            setIsLoadingSubmissions(false);
        }
    };
    const handleEditQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setIsEditing(true);
        console.log("TODO: Open Edit Quiz Modal for", quiz.id);
    };
    const handleViewQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setIsEditing(false);
        console.log("TODO: Open View Quiz Modal for", quiz.id);
    };
    const handleDeleteQuiz = async (quizId, quizTitle) => {
        if (window.confirm(`Are you sure you want to delete quiz "${quizTitle}"?`)) {
            setError(null);
            try {
                await apiService.deleteQuiz(quizId);
                fetchAllQuizzes();
                if (selectedQuiz?.id === quizId) {
                    setSelectedQuiz(null);
                }
            }
            catch (err) {
                setError(err.message || "Failed to delete quiz");
                console.error(err);
            }
        }
    };
    const handleGradeSubmission = (submission) => {
        console.log("TODO: Open Grade Submission Modal for", submission.id);
    };
    const renderQuizDetails = () => {
        if (!selectedQuiz)
            return null;
        const quiz = selectedQuiz;
        return (_jsxs(Card, { className: `mt-6 ${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsxs(CardHeader, { className: "flex flex-row items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: deepBrown, children: isEditing ? "Edit Quiz" : "Quiz Details" }), _jsx(CardDescription, { className: midBrown, children: isEditing ? "Modify quiz information" : `Details for: ${quiz.title}` })] }), _jsx(Button, { variant: "ghost", size: "icon", className: ghostButtonClasses, onClick: () => { setSelectedQuiz(null); setIsEditing(false); }, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) })] }), _jsx(CardContent, { children: isEditing ? (_jsx("div", { className: `text-center py-6 ${mutedText}`, children: "Edit form not implemented yet." })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "Title:" }), " ", _jsx("span", { className: midBrown, children: quiz.title })] }), _jsxs("p", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "Week ID:" }), " ", _jsx("span", { className: midBrown, children: quiz.weekId })] }), _jsxs("p", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "Points:" }), " ", _jsx("span", { className: midBrown, children: quiz.points ?? 'N/A' })] }), _jsxs("p", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "Due Date Offset:" }), " ", _jsx("span", { className: midBrown, children: quiz.dueDateOffsetDays !== null ? `+${quiz.dueDateOffsetDays} days` : 'No offset' })] }), _jsxs("p", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "URL:" }), " ", quiz.quizUrl ? _jsxs("a", { href: quiz.quizUrl, target: "_blank", rel: "noopener noreferrer", className: linkClasses, children: [quiz.quizUrl, " ", _jsx(ExternalLink, { className: "inline h-3 w-3 ml-1" })] }) : _jsx("span", { className: midBrown, children: "N/A" })] }), _jsxs("div", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "Description:" }), " ", _jsx("p", { className: `text-sm mt-1 ${midBrown}`, children: quiz.description || 'N/A' })] }), _jsxs("div", { children: [_jsx("strong", { className: `font-medium ${deepBrown}`, children: "Instructions:" }), " ", _jsx("p", { className: `text-sm mt-1 whitespace-pre-line ${midBrown}`, children: quiz.instructions || 'N/A' })] })] })) }), _jsx(CardFooter, { className: "flex justify-end gap-2", children: isEditing ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", className: outlineButtonClasses, onClick: () => setIsEditing(false), children: "Cancel" }), _jsxs(Button, { className: primaryButtonClasses, children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), " Save Changes"] })] })) : (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", className: outlineButtonClasses, children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), " View Submissions"] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => setIsEditing(true), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), " Edit Quiz"] })] })) })] }));
    };
    return (_jsx("div", { className: `flex flex-col min-h-screen ${lightBg} ${darkBg}`, children: _jsxs("div", { className: "container px-4 py-8 md:px-6", children: [_jsx("div", { className: "flex items-center gap-2 mb-6", children: _jsxs(Link, { to: "/admin", className: `flex items-center ${linkClasses}`, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), " Back to Admin Dashboard"] }) }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: `text-3xl font-bold tracking-tight ${deepBrown}`, children: "Quiz Management" }), _jsx("p", { className: midBrown, children: "Manage quizzes and review submissions." })] }), _jsxs(Button, { className: primaryButtonClasses, children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Create New Quiz"] })] }), error && _jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), " ", error] }), _jsxs(Tabs, { defaultValue: "quizzes", className: "space-y-8", onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: `rounded-md p-1 ${tabsListBg}`, children: [_jsx(TabsTrigger, { value: "quizzes", className: tabsTriggerClasses, children: "All Quizzes" }), _jsx(TabsTrigger, { value: "grading", className: tabsTriggerClasses, children: "Grading" })] }), _jsxs(TabsContent, { value: "quizzes", className: "space-y-6", children: [_jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: deepBrown, children: "Quiz List" }), _jsx(CardDescription, { className: midBrown, children: "View and manage all created quizzes." })] }), _jsx(CardContent, { className: "p-0", children: isLoadingQuizzes ? (_jsx("div", { className: `flex justify-center items-center p-10 ${midBrown}`, children: _jsx(Loader2, { className: `h-8 w-8 animate-spin ${goldAccent}` }) })) : !quizzes || quizzes.length === 0 ? (_jsx("div", { className: `p-6 text-center ${mutedText}`, children: "No quizzes found." })) : (_jsx("div", { className: "relative w-full overflow-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: tableHeaderBg, children: _jsxs("tr", { className: tableRowBorder, children: [_jsx("th", { className: tableHeaderClasses, children: "Title" }), _jsx("th", { className: tableHeaderClasses, children: "Course / Week" }), _jsx("th", { className: tableHeaderClasses, children: "Type/Link" }), _jsx("th", { className: tableHeaderClasses, children: "Due Offset" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsx("tbody", { className: `divide-y ${tableRowBorder}`, children: quizzes.map((quiz) => (_jsxs("tr", { children: [_jsx("td", { className: `p-4 align-middle font-medium ${deepBrown}`, children: quiz.title }), _jsx("td", { className: `${tableCellClasses} text-xs`, children: quiz.courseTitle ? `${quiz.courseTitle} / Wk ${quiz.weekNumber}` : quiz.weekId }), _jsx("td", { className: tableCellClasses, children: quiz.quizUrl ? _jsxs("a", { href: quiz.quizUrl, target: "_blank", rel: "noopener noreferrer", className: linkClasses, children: ["External Link ", _jsx(ExternalLink, { className: "inline h-3 w-3 ml-1" })] }) : 'Internal' }), _jsx("td", { className: tableCellClasses, children: quiz.dueDateOffsetDays !== null ? `+${quiz.dueDateOffsetDays}d` : '-' }), _jsx("td", { className: `${tableCellClasses} text-right`, children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => handleViewQuiz(quiz), "aria-label": `View ${quiz.title}`, children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => handleEditQuiz(quiz), "aria-label": `Edit ${quiz.title}`, children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-8 w-8`, onClick: () => handleDeleteQuiz(quiz.id, quiz.title), "aria-label": `Delete ${quiz.title}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, quiz.id))) })] }) })) })] }), selectedQuiz && renderQuizDetails()] }), _jsx(TabsContent, { value: "grading", className: "space-y-6", children: _jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: deepBrown, children: "Submissions to Grade" }), _jsx(CardDescription, { className: midBrown, children: "Review and grade student quiz submissions." })] }), _jsx(CardContent, { className: "p-0", children: isLoadingSubmissions ? (_jsx("div", { className: `flex justify-center items-center p-10 ${midBrown}`, children: _jsx(Loader2, { className: `h-8 w-8 animate-spin ${goldAccent}` }) })) : !submissions || submissions.length === 0 ? (_jsx("div", { className: `p-6 text-center ${mutedText}`, children: "No submissions currently awaiting grading." })) : (_jsx("div", { className: "relative w-full overflow-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: tableHeaderBg, children: _jsxs("tr", { className: tableRowBorder, children: [_jsx("th", { className: tableHeaderClasses, children: "Student" }), _jsx("th", { className: tableHeaderClasses, children: "Quiz" }), _jsx("th", { className: tableHeaderClasses, children: "Submitted Date" }), _jsx("th", { className: tableHeaderClasses, children: "Status" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsx("tbody", { className: `divide-y ${tableRowBorder}`, children: submissions.map((sub) => (_jsxs("tr", { children: [_jsx("td", { className: `p-4 align-middle ${deepBrown}`, children: sub.userName || sub.userId }), _jsx("td", { className: tableCellClasses, children: sub.quizTitle || sub.quizId }), _jsx("td", { className: tableCellClasses, children: sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleString() : 'N/A' }), _jsx("td", { className: tableCellClasses, children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'graded' ? positiveBg + ' ' + positiveColor : warningBg + ' ' + warningColor}`, children: sub.status.charAt(0).toUpperCase() + sub.status.slice(1) }) }), _jsx("td", { className: `${tableCellClasses} text-right`, children: _jsx(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => handleGradeSubmission(sub), "aria-label": `Grade submission by ${sub.userName || sub.userId}`, children: sub.status === 'graded' ? _jsxs(_Fragment, { children: [_jsx(Eye, { className: "mr-1 h-4 w-4" }), " View/Edit Grade"] }) : _jsxs(_Fragment, { children: [_jsx(Edit, { className: "mr-1 h-4 w-4" }), " Grade"] }) }) })] }, sub.id))) })] }) })) })] }) })] })] }) }));
}
