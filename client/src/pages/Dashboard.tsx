import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { Calendar, Clock, FileText, BookOpen, Video, CheckCircle2, AlertCircle, PlayCircle, BarChart, Lock, Loader2, HelpCircle, ExternalLink, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";

// --- Interfaces ---
interface PublicCourseInfo {
    id: string;
    title: string;
    description?: string;
    monthOrder: number;
}

export interface AccessibleMaterial {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'resource';
  contentUrl?: string;
  details?: string;
  isCompleted?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  calculatedDueDate?: string | null;
  submissionStatus?: 'pending' | 'submitted' | 'graded';
  grade?: number | null;
  quizUrl?: string;
  courseTitle?: string;
}

export interface AccessibleWeek {
  id: string;
  weekNumber: number;
  absoluteWeekNumber: number;
  title: string;
  description?: string;
  materials: AccessibleMaterial[];
  quizzes: Quiz[];
  isCompleted?: boolean;
}

export interface AccessibleCourse {
  id: string;
  title: string;
  monthOrder: number;
  weeks: AccessibleWeek[];
  progress?: number;
}

interface DashboardCourseOverview extends PublicCourseInfo {
    status: 'locked' | 'active' | 'completed';
    progress?: number;
}

// --- Helper Function ---
function calculateMonthsDifference(date1: Date, date2: Date): number {
  let months = (date1.getFullYear() - date2.getFullYear()) * 12;
  months -= date2.getMonth();
  months += date1.getMonth();
  return months < 0 ? 0 : months;
}
// ---

// --- Style Constants ---
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
const inputBorder = 'border-gray-200 dark:border-gray-700';

// --- Tab Trigger Styling Constants ---
const tabsTriggerBaseClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] dark:focus-visible:ring-offset-gray-950`;
const tabsTriggerInactiveClasses = `text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white`;
const tabsTriggerActiveClasses = `shadow-sm bg-white dark:bg-gray-900 text-[${accentColor}] font-semibold border-b-2 ${goldBorder}`; // Example: White/Dark BG, Gold Text, Gold Bottom Border
const tabsTriggerDisabledClasses = `opacity-50 cursor-not-allowed`;
// --- End Style Constants ---


export default function DashboardPage() {
  const { user } = useAuth();
  const [accessibleContent, setAccessibleContent] = useState<AccessibleCourse[]>([]);
  const [dashboardCoursesOverview, setDashboardCoursesOverview] = useState<DashboardCourseOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedCourseId = queryParams.get('courseId');

  const announcements = [
    { id: 1, title: "Live Q&A Session", date: "May 10, 2025", content: "Join us..." },
    { id: 2, title: "Course Materials Update", date: "May 7, 2025", content: "Additional resources..." },
  ];

  // --- useEffect for fetching data (logic remains the same as your last correct version) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      setDashboardCoursesOverview([]);
      setAccessibleContent([]);

      let cohortStartDate: Date | null = null;
      let currentCohortMonth: number = 0;
      let enrollmentMessage: string | null = null;

      try {
        if (!user) {
            throw new Error("User not authenticated.");
        }

        let enrollmentDate = user.enrollment?.enrollmentDate;
        if (!enrollmentDate && user.createdAt) {
            enrollmentDate = user.createdAt;
        }

        if (enrollmentDate) {
            cohortStartDate = new Date(enrollmentDate);
            if (isNaN(cohortStartDate.getTime())) {
                enrollmentMessage = "Could not determine your enrollment date. Please contact support.";
                cohortStartDate = null;
            } else {
                const currentDate = new Date();
                const monthsElapsed = calculateMonthsDifference(currentDate, cohortStartDate);
                currentCohortMonth = monthsElapsed + 1;
            }
        } else {
            enrollmentMessage = "Could not determine your enrollment date. Please contact support.";
            cohortStartDate = null;
            currentCohortMonth = 0;
        }

        const publicCourses: PublicCourseInfo[] = await apiService.getPublicCourseOverview();
        publicCourses.sort((a, b) => a.monthOrder - b.monthOrder);

        let fetchedAccessibleData: AccessibleCourse[] = [];
        if (user && cohortStartDate) {
            try {
                fetchedAccessibleData = await apiService.getAccessibleContent();
                fetchedAccessibleData = fetchedAccessibleData.map(course => ({
                     ...course,
                     weeks: course.weeks?.sort((a, b) => a.weekNumber - b.weekNumber) || []
                 })).sort((a,b) => a.monthOrder - b.monthOrder);
                setAccessibleContent(fetchedAccessibleData);
            } catch (accessibleError: any) {
                console.warn("Could not fetch accessible content:", accessibleError.message);
                setAccessibleContent([]);
            }
        } else {
             setAccessibleContent([]);
        }

        const combinedOverview = publicCourses.map((publicCourse): DashboardCourseOverview => {
            let status: 'locked' | 'active' | 'completed' = 'locked';
            const accessibleCourseData = fetchedAccessibleData.find(ac => ac.id === publicCourse.id);

            if (cohortStartDate && currentCohortMonth > 0) {
                 const enrollmentMonthForCalc = cohortStartDate.getMonth() + 1; // Use parsed date's month
                 // Corrected accessibility logic based on previous working version in CoursesPage
                 const isAccessibleBasedOnTime =
                      (enrollmentMonthForCalc <= 6 && publicCourse.monthOrder >= enrollmentMonthForCalc && publicCourse.monthOrder <= (enrollmentMonthForCalc + currentCohortMonth -1) ) || // Jan cohort logic
                      (enrollmentMonthForCalc > 6 && publicCourse.monthOrder >= (enrollmentMonthForCalc - 6) && publicCourse.monthOrder <= (enrollmentMonthForCalc - 6 + currentCohortMonth -1) ); // July cohort logic (Adjusted)

                if (isAccessibleBasedOnTime) {
                    status = 'active';
                    if (accessibleCourseData) {
                        const hasCompletedAllWeeks = accessibleCourseData.weeks?.length === 4 && accessibleCourseData.weeks.every(w => w.isCompleted);
                        if (hasCompletedAllWeeks) {
                            status = 'completed';
                        }
                    }
                } else {
                    status = 'locked';
                }
            }

            return {
                ...publicCourse,
                status: status,
                progress: accessibleCourseData?.progress,
            };
        });

        setDashboardCoursesOverview(combinedOverview);

        if (requestedCourseId && combinedOverview.some(c => c.id === requestedCourseId && c.status !== 'locked')) {
            setActiveTab('course-content');
        } else {
             setActiveTab('overview');
        }

      } catch (err: any) {
        setError(err.message || "Failed to load dashboard content.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if(user) {
        fetchDashboardData();
    } else {
        setIsLoading(false);
    }

  }, [user, requestedCourseId]); // Removed authLoading dependency temporarily if it causes issues

  // --- useMemo hooks (logic remains the same) ---
  const displayedCourseForContent = useMemo(() => {
    if (!accessibleContent || accessibleContent.length === 0) return null;
    
    // If a specific course is requested via URL, show that course
    if (requestedCourseId) {
      const foundCourse = accessibleContent.find(course => course.id === requestedCourseId);
      if (foundCourse) {
        console.log("Displaying course:", foundCourse.title, "Month:", foundCourse.monthOrder);
        return foundCourse;
      }
    }

    return null; // Return null if no specific course is selected
  }, [accessibleContent, requestedCourseId]);

  const displayedCourseWeeks = displayedCourseForContent?.weeks || [];

   const allAccessibleQuizzes = useMemo(() => accessibleContent.flatMap(course =>
        course.weeks.flatMap(week =>
            (week.quizzes || []).map(q => ({
                ...q,
                courseTitle: course.title
            }))
        )
    ), [accessibleContent]);

    const totalProgramCourses = 6;
    const { completedCoursesCount, overallProgressPercent } = useMemo(() => {
        let completedWeeks = 0;
        let totalWeeksPossibleInAccessible = 0;
        let completedCourses = 0;

        dashboardCoursesOverview.forEach(course => {
            if(course.status === 'completed') {
                completedCourses++;
                completedWeeks += 4;
                totalWeeksPossibleInAccessible += 4;
            } else if (course.status === 'active') {
                 totalWeeksPossibleInAccessible += 4;
                 const detailedCourse = accessibleContent.find(ac => ac.id === course.id);
                 if (detailedCourse) {
                     completedWeeks += detailedCourse.weeks.filter(w => w.isCompleted).length;
                 }
            }
        });

        const progress = totalWeeksPossibleInAccessible > 0 ? Math.round((completedWeeks / totalWeeksPossibleInAccessible) * 100) : 0;
        return { completedCoursesCount: completedCourses, overallProgressPercent: progress };
    }, [dashboardCoursesOverview, accessibleContent]);
  // --- End useMemo hooks ---

  const getMaterialIcon = (type: AccessibleMaterial['type']) => {
      switch (type) {
          case 'video': return <Video className={`h-4 w-4 text-[${accentColor}] flex-shrink-0`} />;
          case 'reading': return <BookOpen className={`h-4 w-4 text-[${accentColor}] flex-shrink-0`} />;
          case 'resource': return <FileText className={`h-4 w-4 text-[${accentColor}] flex-shrink-0`} />;
          default: return <FileText className={`h-4 w-4 text-[${accentColor}] flex-shrink-0`} />;
      }
  };

 // --- Render states (loading, error, no user, no courses) remain the same ---
  if (isLoading ) { // Removed authLoading check here as useEffect handles it
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} /></div>;
  }
  if (error) {
     return <div className="container px-4 py-8 md:px-6 lg:py-12 text-center text-red-600"><AlertCircle className="inline-block mr-2"/> Error loading dashboard: {error}</div>;
  }
   if (!user) {
        return <div className="container px-4 py-8 md:px-6 lg:py-12 text-center"><AlertCircle className="inline-block mr-2"/> Please <Link to="/login" className="underline hover:text-blue-700">log in</Link> to view your dashboard.</div>;
   }
  if (dashboardCoursesOverview.length === 0 && !isLoading) {
       return <div className="container px-4 py-8 md:px-6 lg:py-12 text-center"><AlertCircle className="inline-block mr-2"/> No course overview data available. Please check your enrollment or contact support.</div>;
   }
 // ---

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
          <div>
            <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Student Dashboard</h1>
            <p className={`${secondaryTextLight} ${secondaryTextDark}`}>Welcome back, {user?.displayName || user?.firstName || 'Student'}</p>
          </div>
           <Link to="/courses">
                <Button variant="outline" className={outlineButtonClasses}>
                   <ChevronLeft className="mr-2 h-4 w-4"/> View Full Curriculum
                </Button>
           </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 md:grid-cols-3 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`}>
             <TabsTrigger
                value="overview"
                className={`${tabsTriggerBaseClasses} ${activeTab === 'overview' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}
             >Overview</TabsTrigger>
              <TabsTrigger
                value="course-content"
                disabled={!displayedCourseForContent}
                className={`${tabsTriggerBaseClasses} ${activeTab === 'course-content' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses} ${!displayedCourseForContent ? tabsTriggerDisabledClasses : ''}`}
             >Course Content</TabsTrigger>
             <TabsTrigger
                value="announcements"
                className={`${tabsTriggerBaseClasses} ${activeTab === 'announcements' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}
             >Announcements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
             <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Program Overview & Progress</h2>
              <Card className={`${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`}>
               <CardHeader>
                 <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Certificate Progress</CardTitle>
                 <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Your progress through the 6-month program</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="mb-6">
                     <div className={`flex justify-between mb-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                       <span className="text-sm font-medium">Overall Progress</span>
                       <span className="text-sm font-medium">{overallProgressPercent}% ({completedCoursesCount}/{totalProgramCourses} courses)</span>
                     </div>
                     <Progress value={overallProgressPercent} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                   </div>
                 <div className="space-y-2">
                   <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Course Status</h3>
                    {dashboardCoursesOverview.map((course) => {
                         const isLocked = course.status === 'locked';
                         const isActive = course.status === 'active';
                         const isCompleted = course.status === 'completed';

                         let statusText = 'Locked';
                         let statusColor = inactiveColor;
                         let statusIcon = <Lock className="h-5 w-5" />;
                         let rowBg = lockedBg;
                         let textColor = inactiveColor;

                         if (isCompleted) {
                             statusText = 'Completed';
                             statusColor = positiveColor;
                             statusIcon = <CheckCircle2 className={`h-5 w-5 ${positiveColor}`} />;
                             rowBg = `${lightCardBg} ${darkCardBg}`;
                             textColor = midBrown;
                         } else if (isActive) {
                             statusText = 'In Progress';
                             statusColor = `text-[${accentColor}]`;
                             statusIcon = <PlayCircle className={`h-5 w-5 ${statusColor}`} />;
                             rowBg = `${goldAccentBgLight} ${cardBorder}`;
                             textColor = deepBrown;
                         }

                         return (
                            <div key={course.id} className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${rowBg} ${isLocked ? 'opacity-70' : ''}`}>
                                <div className="flex items-center gap-3">
                                    {statusIcon}
                                    {isLocked ? (
                                        <span className={textColor}>Month {course.monthOrder}: {course.title}</span>
                                    ) : (
                                        <Link
                                            to={`/dashboard?courseId=${course.id}`}
                                            onClick={() => setActiveTab('course-content')}
                                            className={`hover:underline ${textColor}`}
                                        >
                                            Month {course.monthOrder}: {course.title}
                                        </Link>
                                    )}
                                </div>
                                <span className={`${statusColor}`}>
                                    {statusText}
                                </span>
                            </div>
                        );
                    })}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

            {/* Course Content Tab */}
          <TabsContent value="course-content" className="space-y-6">
            {!displayedCourseForContent ? (
                <p className={`${mutedTextLight} ${mutedTextDark}`}>Select an accessible course from the Overview tab to view its content.</p>
            ) : (
               <>
                <h2 className={`text-2xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>{displayedCourseForContent.title} <span className={`${mutedTextLight} ${mutedTextDark} text-lg`}>(Month {displayedCourseForContent.monthOrder})</span></h2>
                {displayedCourseWeeks.length === 0 ? (
                    <p className={`${mutedTextLight} ${mutedTextDark}`}>No weeks are currently accessible for this course.</p>
                ) : (
                    displayedCourseWeeks.map(week => (
                        <Card key={week.id} className={`${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`}>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <CardTitle className={`${primaryTextLight} ${primaryTextDark} text-lg`}>Week {week.weekNumber}: {week.title}</CardTitle>
                                        {week.description && <CardDescription className={`${secondaryTextLight} ${secondaryTextDark} mt-1 text-sm`}>{week.description}</CardDescription>}
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${week.isCompleted ? `${positiveBg} ${positiveColor}` : `${goldAccentBgLight} text-[${accentColor}]`}`}>
                                        {week.isCompleted ? <CheckCircle2 className="h-3 w-3"/> : <PlayCircle className="h-3 w-3"/>}
                                        <span>{week.isCompleted ? 'Completed' : 'In Progress'}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-4 space-y-3">
                                {week.materials && week.materials.length > 0 && (
                                    <div>
                                        <h4 className={`text-sm font-medium mb-2 ${primaryTextLight} ${primaryTextDark}`}>Materials</h4>
                                        <ul className="space-y-2">
                                            {week.materials.map(material => (
                                                <li key={material.id} className={`flex items-center justify-between p-2 rounded-md border text-sm ${inputBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
                                                     <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                        {getMaterialIcon(material.type)}
                                                        <span className={`${midBrown} truncate`} title={material.title}>{material.title}</span>
                                                     </div>
                                                     <a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className={`text-[${accentColor}] hover:text-[${accentHoverColor}] underline text-xs inline-flex items-center flex-shrink-0`}>
                                                        View <ExternalLink className="ml-1 h-3 w-3"/>
                                                     </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {week.quizzes && week.quizzes.length > 0 && (
                                    <div>
                                        <h4 className={`text-sm font-medium mb-2 mt-3 ${primaryTextLight} ${primaryTextDark}`}>Quizzes</h4>
                                         <ul className="space-y-2">
                                            {week.quizzes.map(quiz => (
                                               <li key={quiz.id} className={`flex items-center justify-between p-2 rounded-md border text-sm ${inputBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
                                                   <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                        <HelpCircle className={`h-4 w-4 text-[${accentColor}] flex-shrink-0`} />
                                                        <span className={`${midBrown} truncate`} title={quiz.title}>{quiz.title}</span>
                                                   </div>
                                                      <Button
                                                        variant={quiz.submissionStatus === "pending" ? "default" : "outline"}
                                                        size="sm"
                                                        className={ quiz.submissionStatus === 'pending' ?
                                                            `${primaryButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`
                                                            : `${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`
                                                        }
                                                    >
                                                        {quiz.submissionStatus === "pending" ? "Take Quiz" : "View Result"}
                                                    </Button>
                                               </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                 {(week.materials?.length === 0 && week.quizzes?.length === 0) && (
                                     <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>No materials or quizzes listed for this week.</p>
                                 )}
                            </CardContent>
                        </Card>
                    ))
                )}
               </>
            )}
          </TabsContent>

           {/* Announcements Tab Content */}
           <TabsContent value="announcements" className="space-y-4">
                <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Announcements</h2>
                 {announcements.map((announcement) => (
                    <Card key={announcement.id} className={`${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`}>
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