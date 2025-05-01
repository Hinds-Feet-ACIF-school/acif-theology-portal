import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Lock, PlayCircle, CheckCircle2, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import logo from "../assets/logo.jpg";
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
const headerBgDark = "dark:bg-gray-800";
const headerTextDark = "dark:text-[#FFF8F0]";
const lockedColor = `text-gray-400 dark:text-gray-500`;
const lockedBg = `bg-gray-100 dark:bg-gray-800`;
const activeColor = `text-[${accentColor}]`;
const activeBg = `bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20`;
const completedColor = `text-green-600 dark:text-green-400`;
const completedBg = `bg-green-100 dark:bg-green-900/30`;
export default function CoursesPage() {
    const { user, loading: authLoading } = useAuth();
    const [coursesOverview, setCoursesOverview] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollmentMessage, setEnrollmentMessage] = useState(null);
    useEffect(() => {
        if (authLoading) {
            setIsLoading(true);
            return;
        }
        const fetchCourseData = async () => {
            setIsLoading(true);
            setError(null);
            setEnrollmentMessage(null);
            let publicCourses = [];
            let accessibleData = null;
            let enrollmentMonth = null; // 1-12
            const currentCalendarMonth = new Date().getMonth() + 1; // 1-12
            try {
                publicCourses = await apiService.getPublicCourseOverview();
                publicCourses.sort((a, b) => a.monthOrder - b.monthOrder);
                if (user) {
                    // Use Firebase createdAt timestamp to determine enrollment month
                    if (user.createdAt) {
                        const createdAtDate = new Date(user.createdAt);
                        if (isNaN(createdAtDate.getTime())) {
                            console.error("Invalid createdAt date received:", user.createdAt);
                            setEnrollmentMessage("Could not determine your enrollment date. Please contact support.");
                        }
                        else {
                            // Get the calendar month (1-12) of enrollment
                            const rawEnrollmentMonth = createdAtDate.getMonth() + 1;
                            // Determine if user is in January or July cohort
                            // If enrolled in months 1-6, they're in January cohort
                            // If enrolled in months 7-12, they're in July cohort
                            enrollmentMonth = rawEnrollmentMonth <= 6 ? rawEnrollmentMonth : rawEnrollmentMonth - 6;
                            console.log(`User enrolled in month: ${rawEnrollmentMonth} (adjusted to: ${enrollmentMonth}), Current calendar month: ${currentCalendarMonth}`);
                        }
                    }
                    else {
                        console.warn("User is logged in but has no createdAt timestamp.");
                        setEnrollmentMessage("Could not determine your enrollment date. Please contact support.");
                    }
                    // Fetch completion data only if enrolled and date is valid
                    if (enrollmentMonth !== null) {
                        try {
                            accessibleData = await apiService.getAccessibleContent();
                        }
                        catch (accessibleError) {
                            console.warn("Could not fetch accessible content (may affect completion status):", accessibleError.message);
                            accessibleData = null; // Continue without completion data if it fails
                        }
                    }
                }
                const overview = publicCourses.map((course) => {
                    let status = 'locked';
                    // Only determine status if user is logged in and enrollment month is known
                    if (user && enrollmentMonth !== null) {
                        // *** NEW LOGIC START ***
                        // Calculate the number of months since enrollment
                        const monthsSinceEnrollment = currentCalendarMonth - enrollmentMonth + 1;
                        // A course is accessible if:
                        // 1. It's the enrollment month (first month)
                        // 2. It's within the number of months since enrollment
                        const isAccessibleBasedOnDate = course.monthOrder >= enrollmentMonth &&
                            course.monthOrder <= (enrollmentMonth + monthsSinceEnrollment - 1);
                        // *** NEW LOGIC END ***
                        if (isAccessibleBasedOnDate) {
                            // Default to 'active' if accessible by date
                            status = 'active';
                            // Check completion status if accessible data exists
                            const accessibleCourse = accessibleData?.find((ac) => ac.id === course.id);
                            if (accessibleCourse) {
                                // Assuming 4 weeks per course month for completion check
                                const totalWeeksInCourse = 4;
                                const completedWeeksCount = accessibleCourse.weeks?.filter(w => w.isCompleted).length || 0;
                                const hasCompletedAllWeeks = completedWeeksCount >= totalWeeksInCourse;
                                if (hasCompletedAllWeeks) {
                                    status = 'completed';
                                }
                            }
                        }
                        else {
                            status = 'locked';
                        }
                    }
                    else {
                        // If user is not logged in or enrollment is invalid, all are locked
                        status = 'locked';
                    }
                    return {
                        ...course,
                        status: status,
                    };
                });
                setCoursesOverview(overview);
            }
            catch (err) {
                setError(err.message || "Failed to load course information.");
                console.error("Courses page fetch error:", err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchCourseData();
    }, [user, authLoading]);
    if (isLoading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-[60vh]", children: _jsx(Loader2, { className: "h-12 w-12 animate-spin text-blue-600" }) });
    }
    if (error) {
        return _jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12 text-center text-red-600", children: [_jsx(AlertCircle, { className: "inline-block mr-2" }), " Error loading courses: ", error] });
    }
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: [_jsxs("section", { className: "w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden", children: [_jsx("img", { src: logo, alt: "Apostolic & Evangelical Theology Logo", className: "h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" }), _jsx("div", { className: "container relative px-4 md:px-6 z-10", children: _jsx("div", { className: "flex flex-col items-center space-y-4 text-center", children: _jsxs("div", { className: "space-y-3", children: [_jsx("h1", { className: "text-4xl text-[#FFF8F0] font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none", children: "Certificate Curriculum" }), _jsx("p", { className: "mx-auto max-w-[750px] text-[#E0D6C3] md:text-xl lg:text-lg", children: "Explore our 6-month program designed to build your theological foundation." })] }) }) })] }), user && !enrollmentMessage && (_jsx("section", { className: `w-full py-12 md:py-16 lg:py-20 bg-[#4A1F1F] dark:bg-gray-800 text-[#FFF8F0]`, children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight sm:text-3xl font-serif", children: "Your Learning Hub" }), _jsx("p", { className: "text-[#E0D6C3] max-w-2xl", children: "Access your current course materials, assignments, and track your progress." })] }), _jsx(Link, { to: "/dashboard", children: _jsxs(Button, { size: "lg", className: `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors group shrink-0`, children: ["Go to My Dashboard", _jsx(ChevronRight, { className: "ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" })] }) })] }) }) })), enrollmentMessage && (_jsx("section", { className: `w-full py-12 md:py-16 lg:py-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200`, children: _jsxs("div", { className: "container px-4 md:px-6 text-center", children: [_jsx(AlertCircle, { className: "inline-block h-6 w-6 mr-2" }), _jsx("p", { className: "inline align-middle", children: enrollmentMessage })] }) })), _jsx("section", { className: `w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`, children: _jsx("div", { className: "container px-4 md:px-6", children: _jsx("div", { className: "space-y-12", children: coursesOverview.map((course) => {
                            const isDisabled = course.status === 'locked';
                            let linkHref = '#';
                            if (user && !isDisabled) {
                                linkHref = `/dashboard?courseId=${course.id}`;
                            }
                            else if (!user) {
                                linkHref = '/program-overview';
                            }
                            return (_jsxs(Link, { to: linkHref, className: `block ${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg overflow-hidden shadow-lg
                                   transition-all duration-300 ease-in-out group relative
                                   ${isDisabled ? 'opacity-70 cursor-not-allowed' : `hover:shadow-xl hover:-translate-y-1 hover:border-[${accentColor}]/40 dark:hover:border-[${accentColor}]/50`}
                                   focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:ring-offset-2 dark:focus:ring-offset-gray-950`, "aria-disabled": isDisabled, onClick: (e) => { if (isDisabled && user)
                                    e.preventDefault(); }, tabIndex: isDisabled ? -1 : 0, children: [_jsx("div", { className: `${headerBgLight} ${headerBgDark} ${headerTextLight} ${headerTextDark} p-6`, children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2", children: [_jsxs("h2", { className: "text-xl sm:text-2xl font-semibold font-serif flex-1", children: ["Month ", course.monthOrder, ": ", course.title] }), _jsxs("div", { className: `flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full shrink-0 ${course.status === 'completed' ? completedBg + ' ' + completedColor :
                                                        course.status === 'active' ? activeBg + ' ' + activeColor :
                                                            lockedBg + ' ' + lockedColor}`, children: [course.status === 'completed' ? _jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) : course.status === 'active' ? _jsx(PlayCircle, { className: "h-3.5 w-3.5" }) : _jsx(Lock, { className: "h-3.5 w-3.5" }), _jsx("span", { children: course.status === 'completed' ? 'Completed' : course.status === 'active' ? 'Active' : 'Locked' })] })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark} mb-6 text-sm sm:text-base line-clamp-3 min-h-[3rem]`, children: course.description }), _jsx("div", { className: "text-right mt-4", children: _jsxs("span", { className: `inline-flex items-center text-xs font-medium ${isDisabled ? lockedColor : activeColor} group-hover:underline`, children: [isDisabled ? (user ? 'Content Locked' : 'View Program Info') : 'View Course Content', !isDisabled && _jsx(ChevronRight, { className: "ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" }), isDisabled && !user && _jsx(ChevronRight, { className: "ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" })] }) })] }), isDisabled && user && _jsx("div", { className: "absolute inset-0 bg-gray-400/10 dark:bg-gray-800/20 flex items-center justify-center", children: _jsx(Lock, { className: "h-8 w-8 text-gray-400 dark:text-gray-600" }) })] }, course.id));
                        }) }) }) })] }));
}
