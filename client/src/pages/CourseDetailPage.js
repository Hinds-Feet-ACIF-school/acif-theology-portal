import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { BookOpen, FileText, Video, CheckCircle2, PlayCircle, Download, ArrowLeft, ExternalLink, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";
const accentColor = "#C5A467";
const darkCardBg = 'dark:bg-gray-900';
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const headerBgLight = "bg-[#F4EDE4]";
const headerBgDark = "dark:bg-gray-800";
const tabsListBgLight = "bg-[#F4EDE4]";
const tabsListBgDark = "dark:bg-gray-800";
const tabsTriggerTextLight = "text-[#4A1F1F]";
const tabsTriggerTextDark = "dark:text-[#E0D6C3]/80";
const tabsTriggerActiveTextLight = "text-[#2A0F0F]";
const tabsTriggerActiveTextDark = "dark:text-white";
const tabsTriggerActiveBgLight = "bg-white";
const tabsTriggerActiveBgDark = "dark:bg-gray-950";
const tabsTriggerHoverBgLight = "hover:bg-white/60";
const tabsTriggerHoverBgDark = "dark:hover:bg-white/10";
const tabsTriggerHoverTextLight = "hover:text-[#2A0F0F]";
const tabsTriggerHoverTextDark = "dark:hover:text-white";
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const pendingColor = "text-yellow-700 dark:text-yellow-400";
const pendingBg = "bg-yellow-100 dark:bg-yellow-900/30";
const itemBgLight = "bg-white";
const itemBgDark = "dark:bg-gray-800/60";
const itemBorderLight = "border-gray-200";
const itemBorderDark = "dark:border-gray-700";
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBg = 'bg-[#C5A467]';
const goldBorder = 'border-[#C5A467]';
const goldAccent = 'text-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
export default function CourseDetailPage() {
    const { id: courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [discussions, setDiscussions] = useState([]);
    const [resources, setResources] = useState([]);
    const [grades, setGrades] = useState([]);
    const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isLoadingGrades, setIsLoadingGrades] = useState(false);
    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) {
                setError("Course ID not found in URL.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const allAccessibleData = await apiService.getAccessibleContent();
                const specificCourse = allAccessibleData.find(c => c.id === courseId);
                if (!specificCourse) {
                    setError("Course not found or not accessible at this time.");
                    setCourseData(null);
                }
                else {
                    setCourseData(specificCourse);
                }
            }
            catch (err) {
                setError(err.message || "Failed to load course details.");
                console.error("Course Detail fetch error:", err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchCourseDetails();
    }, [courseId]);
    const fetchDiscussions = async () => {
        if (!courseId || discussions.length > 0)
            return;
        setIsLoadingDiscussions(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDiscussions([
                { id: 1, title: "Discussion Topic 1", replies: 5, lastActivity: "1 day ago" },
                { id: 2, title: "Week 2 Questions", replies: 8, lastActivity: "3 days ago" },
            ]);
        }
        catch (err) {
            console.error("Failed to fetch discussions", err);
        }
        finally {
            setIsLoadingDiscussions(false);
        }
    };
    const fetchResources = async () => {
        if (!courseId || resources.length > 0)
            return;
        setIsLoadingResources(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setResources([
                { id: 1, type: 'pdf', title: 'Course Syllabus', pages: 5, downloadLink: '#' },
                { id: 2, type: 'link', title: 'Recommended Reading Site', link: '#' },
            ]);
        }
        catch (err) {
            console.error("Failed to fetch resources", err);
        }
        finally {
            setIsLoadingResources(false);
        }
    };
    const fetchGrades = async () => {
        if (!courseId || grades.length > 0)
            return;
        setIsLoadingGrades(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setGrades([
                { id: 1, assessment: "Week 1 Quiz", type: 'Quiz', weight: '10%', grade: '85%', status: 'graded' },
                { id: 2, assessment: "Week 2 Quiz", type: 'Quiz', weight: '15%', grade: 'Pending', status: 'submitted' },
            ]);
        }
        catch (err) {
            console.error("Failed to fetch grades", err);
        }
        finally {
            setIsLoadingGrades(false);
        }
    };
    const handleTabChange = (value) => {
        if (value === 'discussions')
            fetchDiscussions();
        else if (value === 'resources')
            fetchResources();
        else if (value === 'grades')
            fetchGrades();
    };
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-[60vh]", children: _jsx(Loader2, { className: `h-12 w-12 animate-spin ${goldAccent}` }) });
    }
    if (error) {
        return (_jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12 text-center", children: [_jsx(AlertCircle, { className: "inline-block mr-2 h-6 w-6 text-red-500" }), _jsxs("span", { className: "text-red-600 align-middle", children: ["Error: ", error] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { variant: "outline", onClick: () => navigate('/dashboard'), className: outlineButtonClasses, children: "Back to Dashboard" }) })] }));
    }
    if (!courseData) {
        return _jsx("div", { className: `container px-4 py-8 md:px-6 lg:py-12 text-center ${mutedTextLight} ${mutedTextDark}`, children: "Course data not available." });
    }
    return (_jsx("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: _jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12", children: [_jsxs("div", { className: "mb-6 lg:mb-8", children: [_jsxs(Button, { variant: "link", onClick: () => navigate(-1), className: `flex items-center text-[${accentColor}] hover:text-[${accentHoverColor}] p-0 h-auto mb-4 text-sm font-medium transition-colors`, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Back"] }), _jsx("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: _jsxs("div", { children: [_jsxs("p", { className: `text-sm font-medium ${mutedTextLight} ${mutedTextDark} mb-1`, children: ["Month ", courseData.monthOrder] }), _jsx("h1", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: courseData.title }), courseData.instructorName && _jsxs("p", { className: `${secondaryTextLight} ${secondaryTextDark} mt-1`, children: ["Instructor: ", courseData.instructorName] })] }) }), courseData.description && _jsx("p", { className: `mt-3 text-base ${secondaryTextLight} ${secondaryTextDark}`, children: courseData.description })] }), _jsxs(Tabs, { defaultValue: "content", className: "w-full", onValueChange: handleTabChange, children: [_jsxs(TabsList, { className: `grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`, children: [_jsx(TabsTrigger, { value: "content", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Course Content" }), _jsx(TabsTrigger, { value: "discussions", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Discussions" }), _jsx(TabsTrigger, { value: "resources", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Resources" }), _jsx(TabsTrigger, { value: "grades", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Grades" })] }), _jsxs(TabsContent, { value: "content", className: "space-y-6", children: [courseData.weeks.length === 0 && (_jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder}`, children: _jsx(CardContent, { className: `p-6 text-center ${mutedTextLight} ${mutedTextDark}`, children: "No content currently accessible for this course." }) })), courseData.weeks.map((week) => {
                                    const isWeekCompleted = week.isCompleted || false;
                                    return (_jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm overflow-hidden`, children: [_jsx(CardHeader, { className: `p-4 sm:p-6 ${headerBgLight} ${headerBgDark} border-b ${itemBorderLight} ${itemBorderDark}`, children: _jsx("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2", children: _jsxs("div", { children: [_jsxs(CardTitle, { className: `flex items-center gap-2 text-lg sm:text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`, children: [isWeekCompleted ? (_jsx(CheckCircle2, { className: `h-5 w-5 ${positiveColor}` })) : (_jsx(PlayCircle, { className: `h-5 w-5 text-[${accentColor}]` })), "Week ", week.weekNumber, ": ", week.title] }), week.description && _jsx(CardDescription, { className: `mt-1 text-sm ${secondaryTextLight} ${secondaryTextDark}`, children: week.description })] }) }) }), _jsxs(CardContent, { className: "p-4 sm:p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: `font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`, children: "Learning Materials" }), _jsxs("div", { className: "space-y-2", children: [week.materials.length === 0 && _jsx("p", { className: `text-sm ${mutedTextLight} ${mutedTextDark}`, children: "No materials for this week." }), week.materials.map((item) => {
                                                                        const isMaterialCompleted = item.isCompleted || false;
                                                                        return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark}`, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 overflow-hidden", children: [item.type === "video" ? _jsx(Video, { className: `h-5 w-5 text-[${accentColor}] flex-shrink-0` }) :
                                                                                            item.type === "reading" ? _jsx(BookOpen, { className: `h-5 w-5 text-[${accentColor}] flex-shrink-0` }) :
                                                                                                _jsx(FileText, { className: `h-5 w-5 text-[${accentColor}] flex-shrink-0` }), _jsxs("div", { className: "flex-1 overflow-hidden", children: [_jsx("div", { className: `${primaryTextLight} ${primaryTextDark} truncate`, title: item.title, children: item.title }), item.details && _jsx("div", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: item.details })] })] }), _jsx(Button, { variant: isMaterialCompleted ? "outline" : "default", size: "sm", className: isMaterialCompleted ?
                                                                                        `${outlineButtonClasses} text-xs px-2 py-1 h-auto`
                                                                                        : `${primaryButtonClasses} text-xs px-2 py-1 h-auto`, children: isMaterialCompleted ? "Review" : "View" })] }, item.id));
                                                                    })] })] }), week.quizzes && week.quizzes.length > 0 && (_jsxs("div", { className: `border-t pt-4 ${itemBorderLight} ${itemBorderDark}`, children: [_jsx("h3", { className: `font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`, children: "Quizzes" }), _jsx("div", { className: "space-y-2", children: week.quizzes.map((quiz) => {
                                                                    const submissionStatus = quiz.submissionStatus ?? 'pending';
                                                                    return (_jsxs("div", { className: `flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark} gap-2`, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 overflow-hidden", children: [_jsx(HelpCircle, { className: `h-5 w-5 text-[${accentColor}] flex-shrink-0` }), _jsxs("div", { className: "flex-1 overflow-hidden", children: [_jsx("div", { className: `${primaryTextLight} ${primaryTextDark} truncate`, title: quiz.title, children: quiz.title }), quiz.calculatedDueDate && _jsxs("div", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: ["Due: ", new Date(quiz.calculatedDueDate).toLocaleDateString()] })] })] }), _jsx(Button, { size: "sm", variant: submissionStatus === 'pending' ? 'default' : 'outline', className: submissionStatus === 'pending' ?
                                                                                    `${primaryButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`
                                                                                    : `${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`, children: submissionStatus === 'graded'
                                                                                    ? 'View Grade'
                                                                                    : submissionStatus === 'submitted'
                                                                                        ? 'View Submission'
                                                                                        : 'Take Quiz' })] }, quiz.id));
                                                                }) })] }))] })] }, week.id));
                                })] }), _jsx(TabsContent, { value: "discussions", className: "space-y-6", children: _jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark}`, children: "Discussions" }) }), _jsxs(CardContent, { children: [isLoadingDiscussions && _jsx("div", { className: "flex justify-center p-4", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin ${goldAccent}` }) }), !isLoadingDiscussions && discussions.length === 0 && _jsx("p", { className: `text-center ${mutedTextLight} ${mutedTextDark} py-4`, children: "No discussion topics available for this course yet." }), !isLoadingDiscussions && discussions.length > 0 && (_jsx("div", { className: "space-y-3", children: discussions.map((discussion) => (_jsxs("div", { className: `flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark} gap-2`, children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: `font-medium ${primaryTextLight} ${primaryTextDark}`, children: discussion.title }), _jsxs("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: [discussion.replies, " replies \u00B7 Last activity: ", discussion.lastActivity] })] }), _jsx(Button, { variant: "outline", size: "sm", className: `${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`, children: "View Discussion" })] }, discussion.id))) }))] })] }) }), _jsx(TabsContent, { value: "resources", className: "space-y-6", children: _jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark}`, children: "Resources" }) }), _jsxs(CardContent, { children: [isLoadingResources && _jsx("div", { className: "flex justify-center p-4", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin ${goldAccent}` }) }), !isLoadingResources && resources.length === 0 && _jsx("p", { className: `text-center ${mutedTextLight} ${mutedTextDark} py-4`, children: "No additional resources found for this course." }), !isLoadingResources && resources.length > 0 && (_jsx("div", { className: "space-y-4", children: resources.map((resource) => (_jsxs("div", { className: `flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark} gap-2`, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [resource.type === 'pdf' ? _jsx(FileText, { className: `h-5 w-5 text-[${accentColor}]` }) : _jsx(ExternalLink, { className: `h-5 w-5 text-[${accentColor}]` }), _jsxs("div", { children: [_jsx("p", { className: `${primaryTextLight} ${primaryTextDark}`, children: resource.title }), resource.pages && _jsxs("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: [resource.pages, " pages"] })] })] }), _jsxs(Button, { variant: "outline", size: "sm", className: `${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`, children: [resource.type === 'pdf' ? _jsx(Download, { className: "mr-1 h-3 w-3" }) : null, resource.type === 'pdf' ? 'Download' : 'Open Link'] })] }, resource.id))) }))] })] }) }), _jsx(TabsContent, { value: "grades", className: "space-y-6", children: _jsxs(Card, { className: `${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`, children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark}`, children: "Grades" }) }), _jsxs(CardContent, { children: [isLoadingGrades && _jsx("div", { className: "flex justify-center p-4", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin ${goldAccent}` }) }), !isLoadingGrades && grades.length === 0 && _jsx("p", { className: `text-center ${mutedTextLight} ${mutedTextDark} py-4`, children: "Grades are not yet available for this course." }), !isLoadingGrades && grades.length > 0 && (_jsx("div", { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: `text-left ${mutedTextLight} ${mutedTextDark} text-xs uppercase`, children: [_jsx("th", { className: "py-2 px-3 font-medium", children: "Assessment" }), _jsx("th", { className: "py-2 px-3 font-medium", children: "Type" }), _jsx("th", { className: "py-2 px-3 font-medium", children: "Weight" }), _jsx("th", { className: "py-2 px-3 font-medium text-right", children: "Grade/Status" })] }) }), _jsx("tbody", { className: `${primaryTextLight} ${primaryTextDark} divide-y ${itemBorderLight} ${itemBorderDark}`, children: grades.map((gradeItem) => (_jsxs("tr", { className: `${itemBgLight} ${itemBgDark}`, children: [_jsx("td", { className: `py-3 px-3 ${secondaryTextLight} ${secondaryTextDark}`, children: gradeItem.assessment }), _jsx("td", { className: `py-3 px-3 ${secondaryTextLight} ${secondaryTextDark}`, children: gradeItem.type }), _jsx("td", { className: `py-3 px-3 ${secondaryTextLight} ${secondaryTextDark}`, children: gradeItem.weight }), _jsx("td", { className: `py-3 px-3 text-right font-medium ${gradeItem.status === 'graded' ? `${primaryTextLight} ${primaryTextDark}` : `${mutedTextLight} ${mutedTextDark}`}`, children: gradeItem.grade })] }, gradeItem.id))) })] }) }) }))] })] }) })] })] }) }));
}
