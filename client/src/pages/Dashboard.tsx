// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { CheckCircle2, PlayCircle, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api";

export interface AccessibleContentWeek {
  id: string;
  weekNumber: number;
  absoluteWeekNumber?: number;
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

interface DashboardProcessedCourse extends apiService.ProcessedCourseOverviewItem {
    detailedWeeks?: AccessibleContentWeek[];
}

const accentColor = "#C5A467";
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
const tabsListBgLight = "bg-[#F4EDE4]";
const tabsListBgDark = "dark:bg-gray-800";
const positiveColor = "text-green-600 dark:text-green-400";
const lockedColor = `text-gray-400 dark:text-gray-500`;
const lockedBg = `bg-gray-100 dark:bg-gray-800`;
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBg = 'bg-[#C5A467]';
const goldBorder = 'border-[#C5A467]';
const goldAccentBgLight = `bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20`;

const tabsTriggerBaseClasses = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] dark:focus-visible:ring-offset-gray-950`;
const tabsTriggerInactiveClasses = `text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white`;
const tabsTriggerActiveClasses = `shadow-md bg-white dark:bg-gray-900 text-[${accentColor}] font-semibold border-b-2 ${goldBorder}`;


export default function DashboardPage() {
  const { currentUser: user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [dashboardCourses, setDashboardCourses] = useState<DashboardProcessedCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const announcements = [
    { id: 1, title: "Live Q&A Session", date: "May 10, 2025", content: "Join us for a live Q&A with instructors this Friday." },
    { id: 2, title: "Course Materials Update", date: "May 7, 2025", content: "Additional resources for Month 3 have been uploaded." },
  ];

  useEffect(() => {
    if (authLoading) return;

    const fetchDashboardData = async () => {
      setIsLoadingCourses(true);
      setError(null);
      setDashboardCourses([]);
      setEnrollmentMessage(null);

      try {
        const accessState = await apiService.getCourseAccessState();
        setEnrollmentMessage(accessState.enrollmentMessage);

        let coursesWithStatus = accessState.courses.sort((a, b) => a.monthOrder - b.monthOrder);

        if (user) {
          try {
            const detailedProgressCourses: AccessibleContentCourse[] = await apiService.getAccessibleContent();
            
            coursesWithStatus = coursesWithStatus.map(course => {
              const detailedMatch = detailedProgressCourses.find(dp => dp.id === course.id);
              let finalStatus = course.status;
              let finalProgress = course.progress;

              if (detailedMatch) {
                finalProgress = detailedMatch.progress;
                if (finalStatus === 'active') {
                  const allWeeks = detailedMatch.weeks || [];
                  if (allWeeks.length > 0 && allWeeks.every(w => w.isCompleted)) {
                    finalStatus = 'completed';
                  }
                }
              }
              return { ...course, status: finalStatus, progress: finalProgress, detailedWeeks: detailedMatch?.weeks };
            });

          } catch (progressError: any) {
            console.warn("DashboardPage: Could not fetch detailed user progress:", progressError.message);
          }
        }
        
        setDashboardCourses(coursesWithStatus as DashboardProcessedCourse[]);

      } catch (err: any) {
        setError((err as Error).message || "Failed to load dashboard content.");
        console.error("DashboardPage: Fetch error:", err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  const { completedCoursesCount, overallProgramProgressPercent } = useMemo(() => {
    if (!user || dashboardCourses.length === 0) return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };
    
    const trackableCourses = dashboardCourses.filter(c => c.status !== 'locked');
    if (trackableCourses.length === 0) return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };

    let totalProgressSum = 0;
    const actualCompletedCount = trackableCourses.filter(c => c.status === 'completed').length;

    trackableCourses.forEach(course => {
        totalProgressSum += (course.progress || 0);
    });
    
    const avgProgress = trackableCourses.length > 0 ? Math.round(totalProgressSum / trackableCourses.length) : 0;

    return { 
        completedCoursesCount: actualCompletedCount, 
        overallProgramProgressPercent: avgProgress 
    };
  }, [user, dashboardCourses]);


  if (authLoading || (isLoadingCourses && dashboardCourses.length === 0 && !error)) {
    return (
      <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4`}>
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#C5A467]" />
        <p className={`mt-4 text-sm sm:text-base ${primaryTextLight} ${primaryTextDark}`}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4 text-center`}>
        <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${primaryTextLight} ${primaryTextDark}`}>Error Loading Dashboard</h2>
        <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark} mb-4`}>{error}</p>
        <Button onClick={() => window.location.reload()} className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold text-sm sm:text-base`}>Try Again</Button>
      </div>
    );
  }

  if (!user && !authLoading && !isLoadingCourses) {
    return (
      <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4 text-center`}>
        <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-[#C5A467] mb-4" />
        <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${primaryTextLight} ${primaryTextDark}`}>Access Denied</h2>
        <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark} mb-4`}>Please log in to view your dashboard.</p>
        <Button onClick={() => navigate('/login')} className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold text-sm sm:text-base`}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="w-full px-4 sm:px-6 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Student Dashboard</h1>
            <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>Welcome back, {user?.displayName || user?.firstName || user?.email || 'Student'}</p>
          </div>
        </div>

        {enrollmentMessage && (
          <Card className={`mb-6 sm:mb-8 ${cardBgLight} ${cardBgDark} ${cardBorder} border-l-4 border-[${accentColor}]`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <AlertCircle className={`h-5 w-5 mr-2 sm:mr-3 text-[${accentColor}] flex-shrink-0`} />
                <p className={`${primaryTextLight} ${primaryTextDark} text-xs sm:text-sm`}>{enrollmentMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-6 sm:mb-8 rounded-lg p-1 sm:p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`}>
             <TabsTrigger value="overview" className={`${tabsTriggerBaseClasses} ${activeTab === 'overview' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>Overview</TabsTrigger>
             <TabsTrigger value="announcements" className={`${tabsTriggerBaseClasses} ${activeTab === 'announcements' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
             <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 ${primaryTextLight} ${primaryTextDark} text-center md:text-left`}>Program Overview & Progress</h2>
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
               <CardHeader className="p-4 sm:p-6">
                 <CardTitle className={`font-serif text-lg sm:text-xl ${primaryTextLight} ${primaryTextDark}`}>Certificate Progress</CardTitle>
                 <CardDescription className={`text-xs sm:text-sm ${secondaryTextLight} ${secondaryTextDark}`}>Your progress through the program</CardDescription>
               </CardHeader>
               <CardContent className="p-4 sm:p-6">
                  <div className="mb-6">
                     <div className={`flex justify-between mb-1 sm:mb-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                       <span className="text-xs sm:text-sm font-medium">Overall Program Progress</span>
                       <span className="text-xs sm:text-sm font-medium">{overallProgramProgressPercent}% ({completedCoursesCount}/{dashboardCourses.filter(c => c.status !== 'locked').length} Courses Tracked)</span>
                     </div>
                     <Progress value={overallProgramProgressPercent} className={`h-1.5 sm:h-2 [&>div]:bg-[${accentColor}]`} />
                   </div>
                 <div className="space-y-2 sm:space-y-3">
                   <h3 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${primaryTextLight} ${primaryTextDark}`}>Course Status</h3>
                    {isLoadingCourses && dashboardCourses.length === 0 && (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[#C5A467]" />
                            <p className={`ml-2 sm:ml-3 text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>Loading courses...</p>
                        </div>
                    )}
                    {!isLoadingCourses && dashboardCourses.length === 0 && !enrollmentMessage && (
                        <p className={`${mutedTextLight} ${mutedTextDark} text-center py-4 text-sm sm:text-base`}>No courses are currently available or assigned to you.</p>
                    )}
                    {dashboardCourses.map((course) => {
                         const isLocked = course.status === 'locked';
                         const isCompleted = course.status === 'completed';

                         let statusText = 'View Course';
                         let statusColor = `text-[${accentColor}]`;
                         let statusIconElement;
                         let rowBg = `${goldAccentBgLight} ${cardBorder} hover:shadow-md`;
                         let textColor = `${primaryTextLight} ${primaryTextDark}`;
                         let cursorClass = 'cursor-pointer';

                         if (isCompleted) {
                             statusText = 'Completed - Review';
                             statusColor = positiveColor;
                             statusIconElement = <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 ${positiveColor} flex-shrink-0`} />;
                             rowBg = `${cardBgLight} ${cardBgDark} hover:shadow-md dark:hover:bg-gray-800/50`;
                             textColor = `${secondaryTextLight} ${secondaryTextDark}`;
                         } else if (isLocked) {
                             statusText = 'Locked';
                             statusColor = lockedColor;
                             statusIconElement = <Lock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />;
                             rowBg = lockedBg;
                             textColor = lockedColor;
                             cursorClass = 'cursor-not-allowed';
                         } else {
                            statusIconElement = <PlayCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-[${accentColor}] flex-shrink-0`} />;
                         }

                         return (
                            <div 
                                key={course.id} 
                                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm transition-all duration-150 ${rowBg} ${isLocked ? 'opacity-70' : ''} ${cursorClass}`}
                                onClick={() => {
                                    if (!isLocked) { 
                                        navigate(`/courses/${course.id}`);
                                    }
                                }}
                                role={isLocked ? undefined : "button"}
                                tabIndex={isLocked ? -1 : 0}
                                onKeyDown={(e) => {
                                    if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        navigate(`/courses/${course.id}`);
                                    }
                                }}
                                aria-label={`Month ${course.monthOrder}: ${course.title} - ${statusText}`}
                            >
                                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-0 flex-grow min-w-0">
                                    {statusIconElement}
                                    <span className={`${textColor} font-medium truncate`}>Month {course.monthOrder}: {course.title}</span>
                                </div>
                                <div className="flex items-center justify-end sm:justify-normal gap-1.5 sm:gap-2 sm:ml-auto flex-shrink-0 w-full sm:w-auto pl-6 sm:pl-0">
                                    {course.status === 'active' && typeof course.progress === 'number' && (
                                        <div className="flex items-center text-xs w-16 sm:w-20">
                                            <Progress value={course.progress} className={`h-1 sm:h-1.5 w-full [&>div]:bg-[${accentColor}]`} />
                                            <span className={`ml-1 sm:ml-1.5 ${textColor}`}>{course.progress}%</span>
                                        </div>
                                    )}
                                    <span className={`${statusColor} font-medium whitespace-nowrap`}>
                                        {statusText}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>
          
           <TabsContent value="announcements" className="space-y-4">
                <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 ${primaryTextLight} ${primaryTextDark} text-center md:text-left`}>Announcements</h2>
                 {announcements.map((announcement) => (
                    <Card key={announcement.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                        <CardHeader className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                            <CardTitle className={`text-base sm:text-lg md:text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>{announcement.title}</CardTitle>
                            <span className={`text-xs pt-1 sm:pt-0 ${mutedTextLight} ${mutedTextDark}`}>{announcement.date}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                          <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>{announcement.content}</p>
                        </CardContent>
                    </Card>
                 ))}
                 {announcements.length === 0 && <p className={`${mutedTextLight} ${mutedTextDark} text-sm sm:text-base text-center py-4`}>No recent announcements.</p>}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}