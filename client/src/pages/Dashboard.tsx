// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { CheckCircle2, AlertCircle, PlayCircle, Lock, Loader2, HelpCircle } from "lucide-react"; // Removed unused icons
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";

// --- Interfaces for Dashboard Overview ---
interface PublicCourseInfo {
    id: string;
    title: string;
    description?: string;
    monthOrder: number;
}

// This interface is for what apiService.getAccessibleContent() returns.
export interface AccessibleContentWeek {
  id: string;
  weekNumber: number;
  absoluteWeekNumber?: number; // Made optional if not always present
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export interface AccessibleContentCourse {
  id: string;
  title: string;
  monthOrder: number;
  weeks: AccessibleContentWeek[];
  progress?: number;
  description?: string;
  instructorName?: string;
}

interface DashboardCourseOverview extends PublicCourseInfo {
    status: 'locked' | 'active' | 'completed';
    progress?: number;
}
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
  const [userAccessibleCourses, setUserAccessibleCourses] = useState<AccessibleContentCourse[]>([]);
  const [dashboardCoursesOverview, setDashboardCoursesOverview] = useState<DashboardCourseOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const publicCourses: PublicCourseInfo[] = await apiService.getPublicCourseOverview();
        publicCourses.sort((a, b) => a.monthOrder - b.monthOrder);

        let fetchedUserAccessibleCourses: AccessibleContentCourse[] = [];
        if (user) {
            try {
                // **FIX 1: Use apiService.getAccessibleContent()**
                // Ensure this function exists and returns AccessibleContentCourse[]
                fetchedUserAccessibleCourses = await apiService.getAccessibleContent();
                
                fetchedUserAccessibleCourses = fetchedUserAccessibleCourses.map(course => ({
                    ...course,
                    weeks: (course.weeks || []).sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0))
                })).sort((a,b) => (a.monthOrder || 0) - (b.monthOrder || 0));
                setUserAccessibleCourses(fetchedUserAccessibleCourses);
            } catch (progressError: any) {
                console.warn("DashboardPage: Could not fetch user's accessible content:", progressError.message);
            }
        }

        const combinedOverview = publicCourses.map((publicCourse): DashboardCourseOverview => {
            const accessibleCourseMatch = fetchedUserAccessibleCourses.find(ac => ac.id === publicCourse.id);
            
            let status: 'locked' | 'active' | 'completed' = 'active';
            let progressPercent: number | undefined = accessibleCourseMatch?.progress;

            if (!user) {
                status = 'locked';
            } else {
                if (accessibleCourseMatch) {
                    const allWeeks = accessibleCourseMatch.weeks || [];
                    if (allWeeks.length > 0 && allWeeks.every(w => w.isCompleted)) {
                        status = 'completed';
                    } else {
                        status = 'active';
                    }
                } else {
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
      } catch (err: any) {
        setError((err as Error).message || "Failed to load dashboard content.");
        console.error("DashboardPage: Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const { completedCoursesCount, overallProgramProgressPercent } = useMemo(() => {
    if (!user || userAccessibleCourses.length === 0) return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };
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

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
          <div>
            <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Student Dashboard</h1>
            <p className={`${secondaryTextLight} ${secondaryTextDark}`}>Welcome back, {user?.displayName || user?.firstName || user?.email || 'Student'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-8 rounded-lg p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`}>
             <TabsTrigger value="overview" className={`${tabsTriggerBaseClasses} ${activeTab === 'overview' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>Overview</TabsTrigger>
             <TabsTrigger value="announcements" className={`${tabsTriggerBaseClasses} ${activeTab === 'announcements' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
             <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Program Overview & Progress</h2>
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
               <CardHeader>
                 <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Certificate Progress</CardTitle>
                 <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Your progress through the program</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="mb-6">
                     <div className={`flex justify-between mb-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                       <span className="text-sm font-medium">Overall Program Progress</span>
                       <span className="text-sm font-medium">{overallProgramProgressPercent}% ({completedCoursesCount}/{dashboardCoursesOverview.filter(c => user ? c.status !== 'locked' : true).length} Courses Tracked)</span>
                     </div>
                     <Progress value={overallProgramProgressPercent} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                   </div>
                 <div className="space-y-2">
                   <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Course Status</h3>
                    {dashboardCoursesOverview.map((course) => {
                         const isLocked = course.status === 'locked';
                         const isCompleted = course.status === 'completed';

                         let statusText = 'View Course';
                         let statusColor = `text-[${accentColor}]`;
                         let statusIcon = <PlayCircle className={`h-5 w-5 text-[${accentColor}]`} />;
                         let rowBg = `${goldAccentBgLight} ${cardBorder} hover:shadow-md`;
                         let textColor = deepBrown;
                         let cursorClass = 'cursor-pointer';

                         if (isCompleted) {
                             statusText = 'Completed - Review';
                             statusColor = positiveColor;
                             statusIcon = <CheckCircle2 className={`h-5 w-5 ${positiveColor}`} />;
                             rowBg = `${cardBgLight} ${cardBgDark} hover:shadow-md dark:hover:bg-gray-800`;
                             textColor = midBrown;
                         } else if (isLocked) {
                             statusText = 'Locked';
                             statusColor = lockedColor;
                             statusIcon = <Lock className="h-5 w-5" />;
                             rowBg = lockedBg;
                             textColor = lockedColor;
                             cursorClass = 'cursor-not-allowed';
                         }

                         return (
                            <div 
                                key={course.id} 
                                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-150 ${rowBg} ${isLocked ? 'opacity-70' : ''} ${cursorClass}`}
                                onClick={() => {
                                    if (course.status !== 'locked') { 
                                        console.log(`DashboardPage: Navigating to course /courses/${course.id}`);
                                        navigate(`/courses/${course.id}`);
                                    } else {
                                        console.log(`DashboardPage: Course ${course.id} is locked.`);
                                    }
                                }}
                                role={course.status === 'locked' ? undefined : "button"}
                                tabIndex={course.status === 'locked' ? -1 : 0}
                                onKeyDown={(e) => {
                                    if (course.status !== 'locked' && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        navigate(`/courses/${course.id}`);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    {statusIcon}
                                    <span className={textColor}>Month {course.monthOrder}: {course.title}</span>
                                </div>
                                <span className={`${statusColor} font-medium`}>
                                    {statusText}
                                </span>
                            </div>
                        );
                    })}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>
          
           <TabsContent value="announcements" className="space-y-4">
                <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Announcements</h2>
                 {announcements.map((announcement) => (
                    <Card key={announcement.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}> {/* FIX 2: Use cardBgDark */}
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                            <CardTitle className={`text-lg font-semibold ${primaryTextLight} ${primaryTextDark}`}>{announcement.title}</CardTitle>
                            <span className={`text-xs pt-1 sm:pt-0 ${mutedTextLight} ${mutedTextDark}`}>{announcement.date}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={`${secondaryTextLight} ${secondaryTextDark}`}>{announcement.content}</p>
                        </CardContent>
                    </Card>
                 ))}
                 {announcements.length === 0 && <p className={`${mutedTextLight} ${mutedTextDark}`}>No recent announcements.</p>}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}