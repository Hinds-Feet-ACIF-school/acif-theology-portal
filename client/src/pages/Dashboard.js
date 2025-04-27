import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { CheckCircle2, AlertCircle, PlayCircle, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";
const accentColor = "#C5A467";
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
const headerBgLight = "bg-[#2A0F0F]";
const headerTextLight = "text-[#FFF8F0]";
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const headerBgDark = "dark:bg-gray-800";
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const headerTextDark = "dark:text-[#FFF8F0]";
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
const lockedColor = `text-gray-400 dark:text-gray-500`;
const lockedBg = `bg-gray-100 dark:bg-gray-800`;
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBg = 'bg-[#C5A467]';
const goldBorder = 'border-[#C5A467]';
const goldAccent = 'text-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const goldAccentBgLight = `bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20`;
const inactiveColor = `${mutedTextLight} ${mutedTextDark}`;
export default function DashboardPage() {
    const { user } = useAuth();
    const [accessibleContent, setAccessibleContent] = useState([]);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [currentWeekNum, setCurrentWeekNum] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const announcements = [
        { id: 1, title: "Live Q&A Session", date: "May 10, 2025", content: "Join us..." },
        { id: 2, title: "Course Materials Update", date: "May 7, 2025", content: "Additional resources..." },
    ];
    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await apiService.getAccessibleContent();
                setAccessibleContent(data);
                if (data && data.length > 0) {
                    const activeCourse = data.find(course => course.weeks.some(week => !week.isCompleted)) || data[data.length - 1];
                    setCurrentCourse(activeCourse || null);
                    let latestWeekNum = 0;
                    data.forEach(c => {
                        c.weeks.forEach(w => {
                            if (w.absoluteWeekNumber > latestWeekNum)
                                latestWeekNum = w.absoluteWeekNumber;
                        });
                    });
                    setCurrentWeekNum(latestWeekNum || 1);
                }
                else {
                    setCurrentCourse(null);
                    setCurrentWeekNum(null);
                }
            }
            catch (err) {
                setError(err.message || "Failed to load dashboard content.");
                console.error("Dashboard fetch error:", err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, []);
    const allAccessibleQuizzes = accessibleContent.flatMap(course => course.weeks.flatMap(week => (week.quizzes || []).map(q => ({
        ...q,
        courseTitle: course.title
    }))));
    const totalAccessibleWeeks = accessibleContent.reduce((acc, course) => acc + course.weeks.length, 0);
    const completedWeeks = accessibleContent.reduce((acc, course) => acc + course.weeks.filter(week => week.isCompleted).length, 0);
    const overallProgressPercent = totalAccessibleWeeks > 0 ? Math.round((completedWeeks / totalAccessibleWeeks) * 100) : 0;
    const totalProgramCourses = 6;
    const completedCoursesCount = accessibleContent.filter(course => course.weeks.length === 4 && course.weeks.every(week => week.isCompleted)).length;
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-[60vh]", children: _jsx(Loader2, { className: `h-12 w-12 animate-spin ${goldAccent}` }) });
    }
    if (error) {
        return _jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12 text-center text-red-600", children: [_jsx(AlertCircle, { className: "inline-block mr-2" }), " Error loading dashboard: ", error] });
    }
    return (_jsx("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: _jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12", children: [_jsx("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4", children: _jsxs("div", { children: [_jsx("h1", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Student Dashboard" }), _jsxs("p", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: ["Welcome back, ", user?.displayName || user?.firstName || 'Student'] })] }) }), _jsxs(Tabs, { defaultValue: "courses", className: "w-full", children: [_jsxs(TabsList, { className: `grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`, children: [_jsx(TabsTrigger, { value: "courses", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "My Courses" }), _jsx(TabsTrigger, { value: "quizzes", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Quizzes" }), _jsx(TabsTrigger, { value: "announcements", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Announcements" }), _jsx(TabsTrigger, { value: "progress", className: ` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `, children: "Progress" })] }), _jsxs(TabsContent, { value: "courses", className: "space-y-8", children: [currentCourse ? (_jsxs("div", { children: [_jsx("h2", { className: `text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`, children: "Current Focus" }), _jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md overflow-hidden`, children: [_jsx(CardHeader, { className: `${headerBgLight} ${headerBgDark} ${headerTextLight} ${headerTextDark} p-6`, children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl font-semibold font-serif", children: currentCourse.title }), _jsx(CardDescription, { className: "text-[#E0D6C3]/90 mt-1", children: currentWeekNum ? `Focus on Week ${currentWeekNum % 4 || 4} (Program Week ${currentWeekNum})` : `Month ${currentCourse.monthOrder}` })] }), _jsx("div", { className: `bg-[${accentColor}]/20 text-[${accentColor}] px-3 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0`, children: "In Progress" })] }) }), _jsxs(CardContent, { className: "pt-6", children: [currentCourse.progress !== undefined && (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: `flex justify-between mb-2 ${secondaryTextLight} ${secondaryTextDark}`, children: [_jsx("span", { className: "text-sm font-medium", children: "Course Progress" }), _jsxs("span", { className: "text-sm font-medium", children: [currentCourse.progress, "%"] })] }), _jsx(Progress, { value: currentCourse.progress, className: `h-2 [&>div]:bg-[${accentColor}]` })] })), _jsx("div", { className: `flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2 mb-6 ${mutedTextLight} ${mutedTextDark}`, children: _jsx(Link, { to: `/courses/${currentCourse.id}`, className: `text-[${accentColor}] hover:text-[${accentHoverColor}] underline font-medium transition-colors`, children: "Go to Course Content" }) }), _jsxs("div", { className: `border-t pt-4 ${cardBorder}`, children: [_jsx("h3", { className: `font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`, children: "Accessible Weeks" }), _jsx("div", { className: "space-y-2", children: currentCourse.weeks.map((week) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border transition-colors ${lightCardBg} ${darkCardBg} ${primaryTextLight} ${primaryTextDark} ${cardBorder}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [week.isCompleted ?
                                                                                        _jsx(CheckCircle2, { className: `h-5 w-5 ${positiveColor}` })
                                                                                        :
                                                                                            _jsx(PlayCircle, { className: `h-5 w-5 text-[${accentColor}]` }), _jsx("span", { className: `${primaryTextLight} ${primaryTextDark}`, children: `Week ${week.weekNumber}: ${week.title}` })] }), _jsx(Button, { variant: week.isCompleted ? "outline" : "default", size: "sm", className: week.isCompleted ?
                                                                                    `${outlineButtonClasses} text-xs px-2 py-1 h-auto`
                                                                                    : `${primaryButtonClasses} text-xs px-2 py-1 h-auto`, children: week.isCompleted ? "Review" : "Start" })] }, week.id))) })] })] })] })] })) : (_jsx("p", { className: `${mutedTextLight} ${mutedTextDark}`, children: "No courses currently accessible or you have completed the program." })), _jsxs("div", { children: [_jsx("h2", { className: `text-xl font-semibold mb-4 mt-8 ${primaryTextLight} ${primaryTextDark}`, children: "Next Up" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [accessibleContent
                                                    .filter(course => course.id !== currentCourse?.id)
                                                    .slice(0, 2)
                                                    .map((course) => (_jsxs(Card, { className: `${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm opacity-80`, children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: `text-lg font-semibold ${primaryTextLight} ${primaryTextDark}`, children: course.title }), _jsxs(CardDescription, { className: `${mutedTextLight} ${mutedTextDark}`, children: ["Month ", course.monthOrder, " - Coming Soon"] })] }), _jsx(CardFooter, { children: _jsx(Button, { disabled: true, variant: "outline", size: "sm", className: `w-full ${outlineButtonClasses} cursor-not-allowed`, children: "Locked" }) })] }, course.id))), accessibleContent.filter(course => course.id !== currentCourse?.id).length === 0 && !isLoading && (_jsx("p", { className: `${mutedTextLight} ${mutedTextDark} md:col-span-2`, children: "No upcoming courses in the accessible program content." }))] })] })] }), _jsxs(TabsContent, { value: "quizzes", className: "space-y-4", children: [_jsx("h2", { className: `text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`, children: "Quizzes" }), allAccessibleQuizzes.length === 0 && _jsx("p", { className: `${mutedTextLight} ${mutedTextDark}`, children: "No quizzes available yet in your accessible weeks." }), allAccessibleQuizzes.map((quiz) => (_jsx(Card, { className: `${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: `font-medium ${primaryTextLight} ${primaryTextDark}`, children: quiz.title }), _jsxs("p", { className: `text-sm ${mutedTextLight} ${mutedTextDark}`, children: ["Course: ", quiz.courseTitle] }), _jsxs("p", { className: `text-sm mt-1 ${mutedTextLight} ${mutedTextDark}`, children: ["Due: ", quiz.calculatedDueDate ? new Date(quiz.calculatedDueDate).toLocaleDateString() : 'N/A'] })] }), _jsxs("div", { className: "flex items-center gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end", children: [_jsx("div", { children: quiz.submissionStatus === "graded" ? (_jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${positiveBg} ${positiveColor}`, children: ["Graded (", quiz.grade, "%)"] })) : quiz.submissionStatus === "submitted" ? (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700`, children: "Submitted" })) : (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pendingBg} ${pendingColor}`, children: "Pending" })) }), _jsx(Button, { variant: quiz.submissionStatus === "pending" ? "default" : "outline", size: "sm", className: quiz.submissionStatus === 'pending' ?
                                                                `${primaryButtonClasses} text-xs px-2 py-1 h-auto`
                                                                : `${outlineButtonClasses} text-xs px-2 py-1 h-auto`, children: quiz.submissionStatus === "pending" ? "Take Quiz" : "View Result" })] })] }) }) }, quiz.id)))] }), _jsxs(TabsContent, { value: "announcements", className: "space-y-4", children: [_jsx("h2", { className: `text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`, children: "Announcements" }), announcements.map((announcement) => (_jsxs(Card, { className: `${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`, children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1", children: [_jsx(CardTitle, { className: `text-lg font-semibold ${primaryTextLight} ${primaryTextDark}`, children: announcement.title }), _jsx("span", { className: `text-xs pt-1 sm:pt-0 ${mutedTextLight} ${mutedTextDark}`, children: announcement.date })] }) }), _jsx(CardContent, { children: _jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: announcement.content }) })] }, announcement.id))), announcements.length === 0 && _jsx("p", { className: `${mutedTextLight} ${mutedTextDark}`, children: "No recent announcements." })] }), _jsxs(TabsContent, { value: "progress", className: "space-y-8", children: [_jsx("h2", { className: `text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`, children: "Program Progress" }), _jsxs(Card, { className: `${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Certificate Progress" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Your progress through the 6-month program" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: `flex justify-between mb-2 ${secondaryTextLight} ${secondaryTextDark}`, children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Progress" }), _jsxs("span", { className: "text-sm font-medium", children: [overallProgressPercent, "% (", completedCoursesCount, "/", totalProgramCourses, " courses)"] })] }), _jsx(Progress, { value: overallProgressPercent, className: `h-2 [&>div]:bg-[${accentColor}]` })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: `font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`, children: "Course Status" }), accessibleContent.map((course) => {
                                                            const isActive = course.id === currentCourse?.id;
                                                            const isCourseComplete = course.weeks.length === 4 && course.weeks.every(week => week.isCompleted);
                                                            return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${isActive ? `${goldAccentBgLight} ${cardBorder}` : `${lockedBg} ${inactiveColor} opacity-70`}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [isCourseComplete ? _jsx(CheckCircle2, { className: `h-5 w-5 ${positiveColor}` }) : isActive ? _jsx(PlayCircle, { className: `h-5 w-5 text-[${accentColor}]` }) : _jsx(Lock, { className: "h-5 w-5" }), _jsxs("span", { className: `${isActive ? `${deepBrown}` : ''}`, children: ["Month ", course.monthOrder, ": ", course.title] })] }), _jsx("span", { className: `${isActive ? `${midBrown}` : ''}`, children: isCourseComplete ? 'Completed' : isActive ? `${course.progress || 0}% Complete` : 'Locked' })] }, course.id));
                                                        }), Array.from({ length: totalProgramCourses - accessibleContent.length }).map((_, index) => {
                                                            const monthNum = accessibleContent.length + index + 1;
                                                            if (monthNum > 6)
                                                                return null;
                                                            return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border text-sm ${lockedBg} ${inactiveColor} opacity-70`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Lock, { className: "h-5 w-5" }), _jsxs("span", { children: ["Month ", monthNum, ": Course Title"] })] }), _jsx("span", { children: "Locked" })] }, `locked-${monthNum}`));
                                                        })] })] })] })] })] })] }) }));
}
