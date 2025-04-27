import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Clock, Lock, PlayCircle, CheckCircle2, LayoutDashboard, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";


interface PublicCourseInfo {
    id: string;
    title: string;
    description?: string;
    monthOrder: number;

}

interface AccessibleWeekInfo {
    absoluteWeekNumber: number;
    isCompleted?: boolean;

}
interface AccessibleCourseData {
    id: string;
    title: string;
    monthOrder: number;
    weeks?: AccessibleWeekInfo[];

}

interface CourseOverview extends PublicCourseInfo {
    status: 'locked' | 'active' | 'completed';
}


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
    const [coursesOverview, setCoursesOverview] = useState<CourseOverview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            setIsLoading(true);
            return;
        }

        const fetchCourseData = async () => {
            setIsLoading(true);
            setError(null);
            let publicCourses: PublicCourseInfo[] = [];
            let accessibleData: AccessibleCourseData[] | null = null;
            let latestAccessibleWeekNum: number = 0;

            try {

                publicCourses = await apiService.getPublicCourseOverview();


                if (user) {
                    try {
                        accessibleData = await apiService.getAccessibleContent();


                        if (accessibleData && Array.isArray(accessibleData)) {

                           latestAccessibleWeekNum = accessibleData.reduce((maxWeek, course) => {
                               const courseMaxWeek = course.weeks?.reduce((maxW, week) => Math.max(maxW, week.absoluteWeekNumber), 0) || 0;
                               return Math.max(maxWeek, courseMaxWeek);
                           }, 0);
                        }
                        console.log("Latest accessible week:", latestAccessibleWeekNum);
                    } catch (accessibleError: any) {

                        console.warn("Could not fetch accessible content (user might not be enrolled or other issue):", accessibleError.message);
                        accessibleData = null;
                    }
                }


                const overview = publicCourses.map((course): CourseOverview => {
                    let status: 'locked' | 'active' | 'completed' = 'locked';


                    if (user && accessibleData) {
                        const accessibleCourse = accessibleData.find((ac) => ac.id === course.id);

                        if (accessibleCourse) {

                            const totalWeeksInCourse = 4;
                            const accessibleWeeksCount = accessibleCourse.weeks?.length || 0;
                            const completedWeeksCount = accessibleCourse.weeks?.filter(w => w.isCompleted).length || 0;

                            const isCourseComplete = (accessibleWeeksCount === totalWeeksInCourse) && (completedWeeksCount === totalWeeksInCourse);

                            status = isCourseComplete ? 'completed' : 'active';

                        } else {

                            const courseEndWeek = course.monthOrder * 4;
                            if (latestAccessibleWeekNum > 0 && courseEndWeek < latestAccessibleWeekNum) {
                                status = 'locked';
                            } else {
                                status = 'locked';
                            }
                        }
                    } else if (user && !accessibleData) {
                         status = 'locked';
                    }

                    return {
                        ...course,
                        status: status,
                    };
                });

                setCoursesOverview(overview);

            } catch (err: any) {
                setError(err.message || "Failed to load course information.");
                console.error("Courses page fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseData();

    }, [user, authLoading]);

    if (isLoading) {
       return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
    }

    if (error) {
       return <div className="container px-4 py-8 md:px-6 lg:py-12 text-center text-red-600"><AlertCircle className="inline-block mr-2"/> Error loading courses: {error}</div>;
    }


    return (

        <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>

         <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
             <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" />
             <div className="container relative px-4 md:px-6 z-10">
               <div className="flex flex-col items-center space-y-4 text-center">
                 <div className="space-y-3">
                   <h1 className="text-4xl text-[#FFF8F0] font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none">
                     Certificate Curriculum
                   </h1>
                   <p className="mx-auto max-w-[750px] text-[#E0D6C3] md:text-xl lg:text-lg">
                     Explore our 6-month program designed to build your theological foundation.
                   </p>
                 </div>
               </div>
             </div>
           </section>


           {user && (
             <section className={`w-full py-12 md:py-16 lg:py-20 bg-[#4A1F1F] dark:bg-gray-800 text-[#FFF8F0]`}>
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-serif">Your Learning Hub</h2>
                            <p className="text-[#E0D6C3] max-w-2xl">Access your current course materials, assignments, and track your progress.</p>
                        </div>
                         <Link to="/dashboard">
                            <Button
                                size="lg"
                                className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors group shrink-0`}
                            >
                                Go to My Dashboard
                                <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                         </Link>
                    </div>
                </div>
             </section>
            )}



          <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
            <div className="container px-4 md:px-6">
              <div className="space-y-12">
                {coursesOverview.map((course) => {
                   const isDisabled = course.status === 'locked';
                   return (
                      <Link
                        key={course.id}
                        to={isDisabled ? '#' : `/courses/${course.id}`}
                        className={`block ${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg overflow-hidden shadow-lg
                                   transition-all duration-300 ease-in-out group relative
                                   ${isDisabled ? 'opacity-70 cursor-not-allowed' : `hover:shadow-xl hover:-translate-y-1 hover:border-[${accentColor}]/40 dark:hover:border-[${accentColor}]/50`}
                                   focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:ring-offset-2 dark:focus:ring-offset-gray-950`}
                        aria-disabled={isDisabled}
                        onClick={(e) => { if (isDisabled) e.preventDefault(); }}
                        tabIndex={isDisabled ? -1 : 0}
                      >

                        <div className={`${headerBgLight} ${headerBgDark} ${headerTextLight} ${headerTextDark} p-6`}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h2 className="text-xl sm:text-2xl font-semibold font-serif flex-1">Month {course.monthOrder}: {course.title}</h2>
                             <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full shrink-0 ${
                                course.status === 'completed' ? completedBg + ' ' + completedColor :
                                course.status === 'active' ? activeBg + ' ' + activeColor :
                                lockedBg + ' ' + lockedColor
                             }`}>
                                {course.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : course.status === 'active' ? <PlayCircle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                <span>{course.status === 'completed' ? 'Completed' : course.status === 'active' ? 'Active' : 'Locked'}</span>
                             </div>
                          </div>
                        </div>

                        <div className="p-6">

                          <p className={`${secondaryTextLight} ${secondaryTextDark} mb-6 text-sm sm:text-base line-clamp-3 min-h-[3rem]`}>{course.description}</p>
                          <div className="text-right mt-4">
                                <span className={`inline-flex items-center text-xs font-medium ${isDisabled ? lockedColor : activeColor} group-hover:underline`}>
                                    {isDisabled ? 'Content Locked' : 'View Course Details'}
                                    {!isDisabled && <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                                </span>
                           </div>
                        </div>
                        {isDisabled && user && <div className="absolute inset-0 bg-gray-400/10 dark:bg-gray-800/20 flex items-center justify-center"><Lock className="h-8 w-8 text-gray-400 dark:text-gray-600"/></div>}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </section>
        </div>
      );
}