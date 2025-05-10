import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/CourseDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { BookOpen, PlayCircle, ArrowLeft, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import * as apiService from "../services/api.js";
// --- Styling Constants ---
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
const itemBorderLight = "border-gray-200";
const itemBorderDark = "dark:border-gray-700";
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBg = 'bg-[#C5A467]';
const goldBorder = 'border-[#C5A467]';
const goldAccent = 'text-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
export default function CourseDetailPage() {
    const { id: routeCourseId } = useParams();
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
        console.log("CourseDetailPage: Mounting. routeCourseId from useParams:", routeCourseId);
        const fetchCourseAndWeeks = async () => {
            if (!routeCourseId) {
                setError("Course ID not found in URL path.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            console.log("CourseDetailPage: Fetching data for courseId:", routeCourseId);
            try {
                // FIX 1: Allow courseDetails to be Course | null (or undefined based on API)
                const courseDetails = await apiService.getCourseById(routeCourseId);
                console.log("CourseDetailPage: Fetched courseDetails:", courseDetails);
                if (!courseDetails) { // Handle the case where courseDetails is null
                    setError(`Course with ID ${routeCourseId} not found.`);
                    setCourseData(null);
                    // No need to set isLoading(false) here, finally block will do it
                    return; // Exit early
                }
                const weeksForCourse = await apiService.getWeeksByCourse(routeCourseId);
                console.log("CourseDetailPage: Fetched weeksForCourse:", weeksForCourse);
                const sortedWeeks = weeksForCourse.sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0));
                // Now courseDetails is guaranteed to be a Course object
                setCourseData({ ...courseDetails, weeks: sortedWeeks });
                console.log("CourseDetailPage: Successfully set courseData with weeks.");
            }
            catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to load course details.");
                console.error("CourseDetailPage: Data fetch error:", err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchCourseAndWeeks();
    }, [routeCourseId]);
    const fetchDiscussions = async () => { };
    const fetchResources = async () => { };
    const fetchGrades = async () => { };
    const handleTabChange = (value) => {
        if (value === 'discussions')
            fetchDiscussions();
        else if (value === 'resources')
            fetchResources();
        else if (value === 'grades')
            fetchGrades();
    };
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-[calc(100vh-100px)]", children: _jsx(Loader2, { className: `h-12 w-12 animate-spin ${goldAccent}` }) });
    }
    if (error) {
        return (_jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12 text-center", children: [_jsx(AlertCircle, { className: `inline-block mr-2 h-8 w-8 text-red-500 dark:text-red-400` }), _jsx("p", { className: `text-red-600 dark:text-red-400 align-middle text-lg`, children: error }), _jsx("div", { className: "mt-6", children: _jsx(Button, { variant: "outline", onClick: () => navigate('/dashboard'), className: outlineButtonClasses, children: "Back to Dashboard" }) })] }));
    }
    if (!courseData) {
        return (_jsxs("div", { className: `container px-4 py-8 md:px-6 lg:py-12 text-center`, children: [_jsx(HelpCircle, { className: `mx-auto h-12 w-12 ${mutedTextLight} ${mutedTextDark} mb-4` }), _jsx("p", { className: `${mutedTextLight} ${mutedTextDark}`, children: "Course data could not be loaded." }), _jsx("div", { className: "mt-6", children: _jsx(Button, { variant: "outline", onClick: () => navigate('/dashboard'), className: outlineButtonClasses, children: "Back to Dashboard" }) })] }));
    }
    return (_jsx("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: _jsxs("div", { className: "container px-4 py-6 md:px-6 lg:py-10", children: [_jsxs("div", { className: "mb-6 lg:mb-8", children: [_jsxs(Button, { variant: "link", onClick: () => navigate(-1), className: `flex items-center ${goldAccent} hover:text-[${accentHoverColor}] p-0 h-auto mb-4 text-sm font-medium transition-colors`, children: [_jsx(ArrowLeft, { className: "mr-1.5 h-4 w-4" }), "Back"] }), _jsx("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: _jsxs("div", { children: [courseData.monthOrder !== undefined && _jsxs("p", { className: `text-sm font-medium ${mutedTextLight} ${mutedTextDark} mb-1`, children: ["Month ", courseData.monthOrder] }), _jsx("h1", { className: `text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: courseData.title }), courseData.instructorName && _jsxs("p", { className: `${secondaryTextLight} ${secondaryTextDark} mt-1.5 text-base`, children: ["Instructor: ", courseData.instructorName] })] }) }), courseData.description && _jsx("p", { className: `mt-4 text-base leading-relaxed ${secondaryTextLight} ${secondaryTextDark}`, children: courseData.description })] }), _jsxs(Tabs, { defaultValue: "content", className: "w-full", onValueChange: handleTabChange, children: [_jsxs(TabsList, { className: `grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`, children: [_jsx(TabsTrigger, { value: "content", className: `py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`, children: "Course Content" }), _jsx(TabsTrigger, { value: "discussions", className: `py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`, children: "Discussions" }), _jsx(TabsTrigger, { value: "resources", className: `py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`, children: "Resources" }), _jsx(TabsTrigger, { value: "grades", className: `py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`, children: "Grades" })] }), _jsxs(TabsContent, { value: "content", className: "space-y-6", children: [(() => {
                                    console.log("CourseDetailPage: Rendering weeks. courseData.weeks:", courseData?.weeks);
                                    return null;
                                })(), courseData && courseData.weeks && courseData.weeks.length === 0 && (_jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder}`, children: _jsxs(CardContent, { className: `p-8 text-center ${mutedTextLight} ${mutedTextDark}`, children: [_jsx(BookOpen, { className: "mx-auto h-12 w-12 mb-3" }), "No weeks have been added to this course yet."] }) })), courseData && courseData.weeks && courseData.weeks.map((week) => (_jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md hover:shadow-lg transition-shadow duration-200`, children: _jsx(CardHeader, { className: `p-5 ${headerBgLight} ${headerBgDark} border-b ${itemBorderLight} ${itemBorderDark}`, children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: `flex items-center gap-2.5 text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`, children: [_jsx(PlayCircle, { className: `h-6 w-6 text-[${accentColor}]` }), "Week ", week.weekNumber, ": ", week.title] }), week.description && _jsx(CardDescription, { className: `mt-1.5 text-sm ${secondaryTextLight} ${secondaryTextDark}`, children: week.description })] }), _jsx(Button, { onClick: () => {
                                                        if (routeCourseId && week.id) {
                                                            console.log(`CourseDetailPage: Navigating to week ${week.id} for course ${routeCourseId}`);
                                                            navigate(`/courses/${routeCourseId}/week/${week.id}`);
                                                        }
                                                        else {
                                                            console.error("CourseDetailPage: Missing routeCourseId or week.id for navigation", { routeCourseId, weekId: week.id });
                                                        }
                                                    }, className: `${primaryButtonClasses} text-sm px-5 py-2.5 h-auto self-start sm:self-center mt-3 sm:mt-0 shrink-0`, children: "Open Week Content" })] }) }) }, week.id)))] }), _jsx(TabsContent, { value: "discussions", className: "space-y-6", children: " /* ... */ " }), _jsx(TabsContent, { value: "resources", className: "space-y-6", children: " /* ... */ " }), _jsx(TabsContent, { value: "grades", className: "space-y-6", children: " /* ... */ " })] })] }) }));
}
