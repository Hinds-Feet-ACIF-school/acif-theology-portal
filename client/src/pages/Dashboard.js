import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/DashboardPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { CheckCircle2, PlayCircle, Lock } from "lucide-react"; // Removed unused icons
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";
// ---
// --- Style Constants ---
const accentColor = "#C5A467";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900"; // Use this consistently
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const tabsListBgLight = "bg-[#F4EDE4]";
const tabsListBgDark = "dark:bg-gray-800";
const positiveColor = "text-green-600 dark:text-green-400";
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
const tabsTriggerBaseClasses = `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] dark:focus-visible:ring-offset-gray-950`;
const tabsTriggerInactiveClasses = `text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white`;
const tabsTriggerActiveClasses = `shadow-md bg-white dark:bg-gray-900 text-[${accentColor}] font-semibold border-b-2 ${goldBorder}`;
// --- End Style Constants ---
export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // This state will store the data structure returned by apiService.getAccessibleContent()
    const [userAccessibleCourses, setUserAccessibleCourses] = useState([]);
    const [dashboardCoursesOverview, setDashboardCoursesOverview] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const announcements = [
        { id: 1, title: "Live Q&A Session", date: "May 10, 2025", content: "Join us..." },
        { id: 2, title: "Course Materials Update", date: "May 7, 2025", content: "Additional resources..." },
    ];
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            setDashboardCoursesOverview([]);
            try {
                const publicCourses = await apiService.getPublicCourseOverview();
                publicCourses.sort((a, b) => a.monthOrder - b.monthOrder);
                let fetchedUserAccessibleCourses = [];
                if (user) {
                    try {
                        // **FIX 1: Use apiService.getAccessibleContent()**
                        // Ensure this function exists and returns AccessibleContentCourse[]
                        fetchedUserAccessibleCourses = await apiService.getAccessibleContent();
                        fetchedUserAccessibleCourses = fetchedUserAccessibleCourses.map(course => ({
                            ...course,
                            weeks: (course.weeks || []).sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0))
                        })).sort((a, b) => (a.monthOrder || 0) - (b.monthOrder || 0));
                        setUserAccessibleCourses(fetchedUserAccessibleCourses);
                    }
                    catch (progressError) {
                        console.warn("DashboardPage: Could not fetch user's accessible content:", progressError.message);
                    }
                }
                const combinedOverview = publicCourses.map((publicCourse) => {
                    const accessibleCourseMatch = fetchedUserAccessibleCourses.find(ac => ac.id === publicCourse.id);
                    let status = 'active';
                    let progressPercent = accessibleCourseMatch?.progress;
                    if (!user) {
                        status = 'locked';
                    }
                    else {
                        if (accessibleCourseMatch) {
                            const allWeeks = accessibleCourseMatch.weeks || [];
                            if (allWeeks.length > 0 && allWeeks.every(w => w.isCompleted)) {
                                status = 'completed';
                            }
                            else {
                                status = 'active';
                            }
                        }
                        else {
                            // User is logged in, but this public course is not in their specific progress list.
                            // All public courses are accessible if user is logged in.
                            status = 'active';
                        }
                    }
                    // Optional: Add your future-month locking logic here
                    // const userEnrollmentStart = user?.enrollmentStartDate; // Assuming you have this
                    // if (user && userEnrollmentStart) {
                    //    const currentProgramMonth = /* calculate based on enrollmentStart and today */;
                    //    if (publicCourse.monthOrder > currentProgramMonth && status !== 'completed') {
                    //       status = 'locked';
                    //    }
                    // }
                    return { ...publicCourse, status, progress: progressPercent };
                });
                setDashboardCoursesOverview(combinedOverview);
            }
            catch (err) {
                setError(err.message || "Failed to load dashboard content.");
                console.error("DashboardPage: Fetch error:", err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);
    const { completedCoursesCount, overallProgramProgressPercent } = useMemo(() => {
        if (!user || userAccessibleCourses.length === 0)
            return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };
        let totalUserWeeks = 0;
        let completedUserWeeks = 0;
        let userCompletedCourses = 0;
        userAccessibleCourses.forEach(course => {
            const weeksInCourse = course.weeks || [];
            if (weeksInCourse.length > 0) {
                totalUserWeeks += weeksInCourse.length;
                const completedInThisCourse = weeksInCourse.filter(w => w.isCompleted).length;
                completedUserWeeks += completedInThisCourse;
                if (completedInThisCourse === weeksInCourse.length) {
                    userCompletedCourses++;
                }
            }
        });
        const progress = totalUserWeeks > 0 ? Math.round((completedUserWeeks / totalUserWeeks) * 100) : 0;
        const overviewCompletedCourses = dashboardCoursesOverview.filter(c => c.status === 'completed').length;
        return { completedCoursesCount: overviewCompletedCourses, overallProgramProgressPercent: progress };
    }, [user, userAccessibleCourses, dashboardCoursesOverview]);
    if (isLoading) { /* ... */ }
    if (error) { /* ... */ }
    if (!user && !isLoading) { /* ... */ }
    if (dashboardCoursesOverview.length === 0 && !isLoading && user) { /* ... */ }
    return (_jsx("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: _jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12", children: [_jsx("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4", children: _jsxs("div", { children: [_jsx("h1", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Student Dashboard" }), _jsxs("p", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: ["Welcome back, ", user?.displayName || user?.firstName || user?.email || 'Student'] })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: `grid w-full grid-cols-2 mb-8 rounded-lg p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`, children: [_jsx(TabsTrigger, { value: "overview", className: `${tabsTriggerBaseClasses} ${activeTab === 'overview' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`, children: "Overview" }), _jsx(TabsTrigger, { value: "announcements", className: `${tabsTriggerBaseClasses} ${activeTab === 'announcements' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`, children: "Announcements" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsx("h2", { className: `text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`, children: "Program Overview & Progress" }), _jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Certificate Progress" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Your progress through the program" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: `flex justify-between mb-2 ${secondaryTextLight} ${secondaryTextDark}`, children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Program Progress" }), _jsxs("span", { className: "text-sm font-medium", children: [overallProgramProgressPercent, "% (", completedCoursesCount, "/", dashboardCoursesOverview.filter(c => user ? c.status !== 'locked' : true).length, " Courses Tracked)"] })] }), _jsx(Progress, { value: overallProgramProgressPercent, className: `h-2 [&>div]:bg-[${accentColor}]` })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: `font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`, children: "Course Status" }), dashboardCoursesOverview.map((course) => {
                                                            const isLocked = course.status === 'locked';
                                                            const isCompleted = course.status === 'completed';
                                                            let statusText = 'View Course';
                                                            let statusColor = `text-[${accentColor}]`;
                                                            let statusIcon = _jsx(PlayCircle, { className: `h-5 w-5 text-[${accentColor}]` });
                                                            let rowBg = `${goldAccentBgLight} ${cardBorder} hover:shadow-md`;
                                                            let textColor = deepBrown;
                                                            let cursorClass = 'cursor-pointer';
                                                            if (isCompleted) {
                                                                statusText = 'Completed - Review';
                                                                statusColor = positiveColor;
                                                                statusIcon = _jsx(CheckCircle2, { className: `h-5 w-5 ${positiveColor}` });
                                                                rowBg = `${cardBgLight} ${cardBgDark} hover:shadow-md dark:hover:bg-gray-800`;
                                                                textColor = midBrown;
                                                            }
                                                            else if (isLocked) {
                                                                statusText = 'Locked';
                                                                statusColor = lockedColor;
                                                                statusIcon = _jsx(Lock, { className: "h-5 w-5" });
                                                                rowBg = lockedBg;
                                                                textColor = lockedColor;
                                                                cursorClass = 'cursor-not-allowed';
                                                            }
                                                            return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-150 ${rowBg} ${isLocked ? 'opacity-70' : ''} ${cursorClass}`, onClick: () => {
                                                                    if (course.status !== 'locked') {
                                                                        console.log(`DashboardPage: Navigating to course /courses/${course.id}`);
                                                                        navigate(`/courses/${course.id}`);
                                                                    }
                                                                    else {
                                                                        console.log(`DashboardPage: Course ${course.id} is locked.`);
                                                                    }
                                                                }, role: course.status === 'locked' ? undefined : "button", tabIndex: course.status === 'locked' ? -1 : 0, onKeyDown: (e) => {
                                                                    if (course.status !== 'locked' && (e.key === 'Enter' || e.key === ' ')) {
                                                                        e.preventDefault();
                                                                        navigate(`/courses/${course.id}`);
                                                                    }
                                                                }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [statusIcon, _jsxs("span", { className: textColor, children: ["Month ", course.monthOrder, ": ", course.title] })] }), _jsx("span", { className: `${statusColor} font-medium`, children: statusText })] }, course.id));
                                                        })] })] })] })] }), _jsxs(TabsContent, { value: "announcements", className: "space-y-4", children: [_jsx("h2", { className: `text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`, children: "Announcements" }), announcements.map((announcement) => (_jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [" ", _jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1", children: [_jsx(CardTitle, { className: `text-lg font-semibold ${primaryTextLight} ${primaryTextDark}`, children: announcement.title }), _jsx("span", { className: `text-xs pt-1 sm:pt-0 ${mutedTextLight} ${mutedTextDark}`, children: announcement.date })] }) }), _jsx(CardContent, { children: _jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: announcement.content }) })] }, announcement.id))), announcements.length === 0 && _jsx("p", { className: `${mutedTextLight} ${mutedTextDark}`, children: "No recent announcements." })] })] })] }) }));
}
