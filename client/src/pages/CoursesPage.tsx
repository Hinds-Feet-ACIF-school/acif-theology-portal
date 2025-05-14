import React, { useState, useEffect, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Lock, PlayCircle, CheckCircle2, ChevronRight, Loader2, AlertCircle, LayoutDashboard } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth, AppUser } from "../context/AuthContext.js";
import * as apiService from "../services/api";

interface ProcessedCourseData {
    id: string;
    title: string;
    description?: string;
    monthOrder: number;
    status: 'locked' | 'active' | 'completed';
    progress?: number;
}

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
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
    const { currentUser: user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<ProcessedCourseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const fetchCourseAccessData = async () => {
            setIsLoading(true);
            setError(null);
            setCourses([]);
            setEnrollmentMessage(null);

            try {
                const accessState = await apiService.getCourseAccessState();
                let finalCourses = accessState.courses.sort((a, b) => a.monthOrder - b.monthOrder);
                setCourses(finalCourses);
                setEnrollmentMessage(accessState.enrollmentMessage);

            } catch (err: any) {
                setError(err.message || "Failed to load course information.");
                console.error("Courses fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseAccessData();
    }, [user, authLoading]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-[#C5A467]" /></div>;
    }

    if (error) {
        return <div className="container mx-auto px-4 py-8 sm:px-6 md:px-8 lg:py-12 text-center text-red-600 dark:text-red-400 text-base sm:text-lg"><AlertCircle className="inline-block mr-2 h-5 w-5 sm:h-6 sm:w-6"/> Error: {error}</div>;
    }

    return (
        <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
            <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
                <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-24 lg:w-24 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" />
                <div className="container mx-auto relative px-4 md:px-6 z-10">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-3">
                            <h1 className={`text-4xl text-[#FFF8F0] font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl/none ${headerTextLight} ${headerTextDark}`}>
                                Certificate Curriculum
                            </h1>
                            <p className={`mx-auto max-w-[750px] text-[#E0D6C3] text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl ${secondaryTextDark}`}>
                                Explore our 6-month program designed to build your theological foundation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {user && !enrollmentMessage && (
                <section className={`w-full py-12 md:py-16 lg:py-20 bg-[#4A1F1F] dark:bg-gray-800 text-[#FFF8F0]`}>
                    <div className="container mx-auto px-4 sm:px-6 md:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div className="space-y-2">
                                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-serif ${headerTextLight} ${headerTextDark}`}>Your Learning Hub</h2>
                                <p className={`text-[#E0D6C3] max-w-2xl text-sm sm:text-base md:text-lg ${secondaryTextDark}`}>Access your current course materials, assignments, and track your progress.</p>
                            </div>
                            <Link to="/dashboard">
                                <Button
                                    size="lg"
                                    className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors group shrink-0 text-sm sm:text-base md:text-lg`}
                                >
                                    Go to My Dashboard
                                    <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {enrollmentMessage && (
                <section className={`w-full py-12 md:py-16 lg:py-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200`}>
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                        <AlertCircle className="inline-block h-6 w-6 mr-2 align-middle" />
                        <p className="inline align-middle text-sm sm:text-base md:text-lg">{enrollmentMessage}</p>
                    </div>
                </section>
            )}

            <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    {courses.length === 0 && !isLoading && !error && !enrollmentMessage && (
                        <div className="text-center py-10">
                            <LayoutDashboard className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 ${primaryTextLight} ${primaryTextDark} opacity-50 mb-4`} />
                            <h3 className={`text-xl sm:text-2xl font-semibold mb-2 ${primaryTextLight} ${primaryTextDark}`}>No Courses To Display</h3>
                            <p className={`${secondaryTextLight} ${secondaryTextDark} text-sm sm:text-base`}>
                                There are currently no courses available in the curriculum.
                            </p>
                        </div>
                    )}
                    <div className="space-y-12 md:space-y-16">
                        {courses.map((course) => {
                            const isEffectivelyDisabled = course.status === 'locked' && !!user;
                            let linkHref = '#';

                            if (user && course.status !== 'locked') {
                                linkHref = `/courses/${course.id}`;
                            } else if (!user) {
                                linkHref = '/program-overview';
                            }
                            
                            return (
                                <Link
                                    key={course.id}
                                    to={linkHref}
                                    className={`block ${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg overflow-hidden shadow-lg
                                       transition-all duration-300 ease-in-out group relative
                                       ${isEffectivelyDisabled ? 'opacity-70 cursor-not-allowed' :
                                         course.status !== 'locked' ? `hover:shadow-xl hover:-translate-y-1 hover:border-[${accentColor}]/40 dark:hover:border-[${accentColor}]/50` : `hover:shadow-md`}
                                       focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:ring-offset-2 dark:focus:ring-offset-gray-950`}
                                    aria-disabled={isEffectivelyDisabled ? true : undefined}
                                    onClick={(e: MouseEvent<HTMLAnchorElement>) => { if (isEffectivelyDisabled) e.preventDefault(); }}
                                    tabIndex={isEffectivelyDisabled ? -1 : 0}
                                >
                                    <div className={`${headerBgLight} ${headerBgDark} ${headerTextLight} ${headerTextDark} p-4 sm:p-6`}>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                                            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold font-serif flex-1 ${headerTextLight} ${headerTextDark}`}>Month {course.monthOrder}: {course.title}</h2>
                                            <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full shrink-0 mt-2 sm:mt-0 ${
                                                course.status === 'completed' ? `${completedBg} ${completedColor}` :
                                                course.status === 'active' ? `${activeBg} ${activeColor}` :
                                                `${lockedBg} ${lockedColor}`
                                            }`}>
                                                {course.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> :
                                                 course.status === 'active' ? <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> :
                                                 <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                                <span className="whitespace-nowrap">{course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        <p className={`${secondaryTextLight} ${secondaryTextDark} mb-6 text-sm sm:text-base line-clamp-3 min-h-[3rem] sm:min-h-[3.75rem]`}>{course.description || "No description available for this course yet."}</p>
                                        <div className="text-right mt-4">
                                            <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${isEffectivelyDisabled ? lockedColor : activeColor} group-hover:underline`}>
                                                {course.status === 'locked' ? (user ? 'Content Locked' : 'View Program Info') : 'View Course Content'}
                                                {(course.status !== 'locked' || !user) && <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                                            </span>
                                        </div>
                                    </div>
                                    {isEffectivelyDisabled && (
                                        <div className="absolute inset-0 bg-gray-300/20 dark:bg-gray-800/30 backdrop-blur-sm flex items-center justify-center cursor-not-allowed">
                                            <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-600"/>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}