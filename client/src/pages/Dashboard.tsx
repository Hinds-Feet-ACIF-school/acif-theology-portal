import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { CheckCircle2, PlayCircle, Lock, Loader2, AlertCircle, Film, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as apiService from "../services/api";
import type { GradedItem, ProcessedCourseOverviewItem } from "../services/api"; // Ensure ProcessedCourseOverviewItem is exported or defined
import GuidanceVideoModal from "../components/modals/GuidanceVideoModal";
import { DashboardPageContentData } from '../types/dashboardPageContentTypes'; // Adjust path if needed

// Interfaces specific to this page for clarity or if they diverge from apiService types
export interface AccessibleContentWeekItemDetails {
  type: string; 
  status?: "completed" | "in_progress" | "not_started"; 
  progressPercent?: number; 
  score?: number | null; 
}

export interface AccessibleContentWeek {
  id: string; // e.g., "week-1-intro"
  weekNumber: number; // Display number within the course (1, 2, 3, 4)
  absoluteWeekNumber?: number; // Overall week number in the program (1-24)
  title: string;
  description?: string;
  isCompleted?: boolean; // Calculated or from backend if week itself has a completion status
  progress?: number; // Calculated based on items or directly from backend
  items?: AccessibleContentWeekItemDetails[]; // Detailed items within the week
}

export interface AccessibleContentCourse {
  id: string; // e.g., "foundations-of-faith"
  title: string;
  monthOrder: number; // For sorting and display (1-6)
  weeks: AccessibleContentWeek[];
  progress?: number; // Overall course progress
  description?: string;
  instructorName?: string;
}

// Extends the type from apiService to include detailed week data fetched on the dashboard
interface DashboardProcessedCourse extends ProcessedCourseOverviewItem {
    detailedWeeks?: AccessibleContentWeek[]; // Populated by getAccessibleContent
}

const API_BASE_URL_CONTENT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
 
// Fetches dynamic text content for the dashboard page (e.g., guidance video section)
const fetchPublicDashboardPageTextContent = async (): Promise<DashboardPageContentData> => {
  const response = await fetch(`${API_BASE_URL_CONTENT}/content/user-dashboard`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch dashboard text content" }));
    throw new Error(errorData.message || "Failed to fetch dashboard text content");
  }
  return response.json();
};

// Calculates progress for a week based on its relevant items (sections and quizzes)
const calculateWeekProgressFromItems = (weekItems: AccessibleContentWeekItemDetails[] | undefined): number => {
  if (!weekItems || weekItems.length === 0) {
    return 0; 
  }
  // Only consider items that directly contribute to completion status for progress calculation
  const relevantItems = weekItems.filter(
    item => item.type === "section_completion" || item.type === "quiz_score"
  );
  if (relevantItems.length === 0) {
    // If no relevant items, consider the week 0% complete for this calculation method.
    // Or, if other item types (video, reading) should imply progress without explicit completion items, adjust logic.
    return 0;
  }
  let completedRelevantItemsCount = 0;
  relevantItems.forEach(item => {
    let isItemCompleted = false;
    if (item.type === "section_completion") {
      // A section is complete if its status is 'completed' or progress is 100%
      if (item.status === "completed" || item.progressPercent === 100) {
        isItemCompleted = true;
      }
    } else if (item.type === "quiz_score") {
      // A quiz is considered "completed" for progress if a score exists (pass/fail handled by LMS)
      if (item.score !== null && item.score !== undefined) {
        isItemCompleted = true;
      }
    }
    if (isItemCompleted) {
      completedRelevantItemsCount++;
    }
  });
  return Math.round((completedRelevantItemsCount / relevantItems.length) * 100);
};

// Style constants
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
const activeColor = `text-[${accentColor}]`;

const tabsTriggerBaseClasses = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] dark:focus-visible:ring-offset-gray-950`;
const tabsTriggerInactiveClasses = `text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white`;
const tabsTriggerActiveClasses = `shadow-md bg-white dark:bg-gray-900 text-[${accentColor}] font-semibold border-b-2 ${goldBorder}`;


export default function DashboardPage() {
  const { currentUser: user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [dashboardCourses, setDashboardCourses] = useState<DashboardProcessedCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null); // For course/access data errors
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [textContent, setTextContent] = useState<DashboardPageContentData | null>(null);
  const [isLoadingTextContent, setIsLoadingTextContent] = useState(true);
  const [textContentError, setTextContentError] = useState<string | null>(null); // For CMS text errors
  
  const [showGuidanceVideoModal, setShowGuidanceVideoModal] = useState(false);

  // Announcements are currently static; can be fetched if made dynamic
  const announcements = [
    { id: 1, title: "Live Q&A Session", date: "May 10, 2025", content: "Join us for a live Q&A with instructors this Friday." },
    { id: 2, title: "Course Materials Update", date: "May 7, 2025", content: "Additional resources for Month 3 have been uploaded." },
  ];

  useEffect(() => {
    const fetchTextContent = async () => {
        setIsLoadingTextContent(true);
        setTextContentError(null);
        try {
            const fetchedData = await fetchPublicDashboardPageTextContent();
            setTextContent(fetchedData);
        } catch (err) {
            setTextContentError(err instanceof Error ? err.message : "Failed to load dashboard texts.");
            console.error("DashboardPage: Error fetching text content:", err);
        } finally {
            setIsLoadingTextContent(false);
        }
    };
    fetchTextContent();
  }, []);
  
  useEffect(() => {
    if (authLoading) return; // Wait for authentication status to resolve

    const fetchDashboardData = async () => {
      setIsLoadingCourses(true);
      setError(null); // Clear previous main errors
      setDashboardCourses([]);
      setEnrollmentMessage(null);

      try {
        // First, get the basic course access state (which courses are available, locked, etc.)
        const accessState = await apiService.getCourseAccessState();
        setEnrollmentMessage(accessState.enrollmentMessage);

        let coursesFromAccessState = accessState.courses.sort((a, b) => a.monthOrder - b.monthOrder);
        
        // Initialize courses with progress from accessState or default to 0
        let processedCourses: DashboardProcessedCourse[] = coursesFromAccessState.map(c => ({ 
            ...c, 
            progress: typeof c.progress === 'number' ? c.progress : 0 
        }));

        // If user is logged in, fetch detailed progress for accessible courses
        if (user) {
          try {
            const detailedContentCourses: AccessibleContentCourse[] = await apiService.getAccessibleContent();
            
            processedCourses = processedCourses.map(course => {
              const detailedMatch = detailedContentCourses.find(dp => dp.id === course.id);
              let finalStatus = course.status; // Start with status from accessState
              let calculatedCourseProgress = typeof course.progress === 'number' ? course.progress : 0; 

              if (detailedMatch && detailedMatch.weeks && detailedMatch.weeks.length > 0) {
                // Calculate progress for each week based on its items
                const weeksWithCalculatedProgress = detailedMatch.weeks.map(week => ({
                    ...week,
                    progress: (typeof week.progress === 'number' && week.progress >=0 && week.progress <=100) // Prefer backend progress if valid
                                ? week.progress 
                                : calculateWeekProgressFromItems(week.items) 
                }));

                // Calculate overall course progress from its weeks' progress
                const sumOfWeeksProgress = weeksWithCalculatedProgress.reduce((sum, week) => sum + (week.progress || 0), 0);
                calculatedCourseProgress = weeksWithCalculatedProgress.length > 0 
                                           ? Math.round(sumOfWeeksProgress / weeksWithCalculatedProgress.length)
                                           : 0; // Default to 0 if no weeks (should not happen if weeks exist)

                // Determine if the course is completed based on all weeks being 100%
                const allWeeksAreEffectively100Percent = weeksWithCalculatedProgress.length > 0 &&
                                             weeksWithCalculatedProgress.every(w => (w.progress || 0) === 100);
                
                if (allWeeksAreEffectively100Percent) {
                  if (finalStatus !== 'locked') { // Don't override 'locked' status
                     finalStatus = 'completed';
                  }
                  calculatedCourseProgress = 100; 
                } else if (calculatedCourseProgress === 100 && finalStatus === 'active') {
                  // If calculated progress is 100 but not all weeks marked so,
                  // this might be a discrepancy or a course completed by other means.
                  // For now, if calculated is 100, and it's active, mark as completed.
                  finalStatus = 'completed';
                }
              } else if (detailedMatch && (!detailedMatch.weeks || detailedMatch.weeks.length === 0)) {
                // If detailed course data exists but has no weeks, progress is 0 for calculation purposes here.
                // Backend might have its own completion logic.
                calculatedCourseProgress = (finalStatus === 'completed') ? 100 : 0;
              }
              // If no detailedMatch, we stick with progress from accessState
              
              return { 
                ...course, 
                status: finalStatus, // Use the potentially updated status
                progress: calculatedCourseProgress, // Use the calculated progress
                detailedWeeks: detailedMatch?.weeks // Attach detailed weeks for potential future use
              };
            });
          } catch (progressError: any) {
            // This is a non-critical error; the dashboard can still function with basic progress.
            console.warn("DashboardPage: Could not fetch detailed user progress from getAccessibleContent:", progressError.message);
          }
        }
        setDashboardCourses(processedCourses);
      } catch (err: any) {
        setError((err as Error).message || "Failed to load dashboard courses and access state.");
        console.error("DashboardPage: Main fetch error (getCourseAccessState):", err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (!authLoading && user) { // Fetch data only if auth is resolved and user exists
      fetchDashboardData();
    } else if (!authLoading && !user) { // If auth resolved and no user, stop loading courses
        setIsLoadingCourses(false);
    }
  }, [user, authLoading]); // Rerun when user or authLoading state changes

  // Memoized calculation for overall program progress
  const { completedCoursesCount, overallProgramProgressPercent } = useMemo(() => {
    if (dashboardCourses.length === 0) return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };
    
    // Filter out courses that are 'locked' as they don't count towards active progress
    const trackableCourses = dashboardCourses.filter(c => c.status !== 'locked');
    if (trackableCourses.length === 0) return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };

    let totalProgressSum = 0;
    const actualCompletedCount = trackableCourses.filter(c => c.status === 'completed' || c.progress === 100).length;
    
    trackableCourses.forEach(course => {
        totalProgressSum += (typeof course.progress === 'number' ? course.progress : 0);
    });
    
    const avgProgress = trackableCourses.length > 0 ? Math.round(totalProgressSum / trackableCourses.length) : 0;
    
    return { 
        completedCoursesCount: actualCompletedCount, 
        overallProgramProgressPercent: avgProgress 
    };
  }, [dashboardCourses]);

  // Consolidated loading state for the main page loader
  const pageIsLoading = authLoading || (isLoadingCourses && dashboardCourses.length === 0 && !error) || (isLoadingTextContent && !textContent && !textContentError) ;

  if (pageIsLoading) {
    return (
      <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4`}>
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#C5A467]" />
        <p className={`mt-4 text-sm sm:text-base ${primaryTextLight} ${primaryTextDark}`}>Loading dashboard...</p>
      </div>
    );
  }

  // If there's a main error (e.g., fetching course access state failed)
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

  // If user is not authenticated after loading checks
  if (!user && !authLoading) { // Removed isLoadingCourses check as it might be false if auth fails early
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
  
  // Fallback texts if dynamic content hasn't loaded or errored, but main dashboard can still show
  const guidanceTitle = textContent?.guidanceSection?.title || "Get Started Smoothly!";
  const guidanceDescription = textContent?.guidanceSection?.description || "New to the platform or need a quick tour? Our guide video will walk you through everything.";
  const guidanceButtonText = textContent?.guidanceSection?.buttonText || "Watch Platform Guide";
  const effectiveGuidanceVideoUrl = textContent?.guidanceSection?.videoUrl || ""; // Use a different name to avoid conflict with the old const

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16"> {/* Added container */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Student Dashboard</h1>
            <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>Welcome back, {user?.displayName || user?.firstName || user?.email || 'Student'}</p>
          </div>
        </div>
        
        {textContentError && !isLoadingTextContent && ( // Show text content error if it occurred
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-700/30 border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 text-xs rounded-md text-center">
                Notice: Some page information might be using defaults due to a loading issue for texts: {textContentError}
            </div>
        )}

        {/* Guidance Video CTA - Renders if user is logged in and video URL is available */}
        {user && effectiveGuidanceVideoUrl && (
             <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg shadow-md ${goldAccentBgLight} border ${cardBorder}`}>
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
                    <Sparkles className={`h-8 w-8 sm:h-10 sm:w-10 ${activeColor} flex-shrink-0`} />
                    <div className="flex-grow">
                        <h3 className={`text-base sm:text-lg font-semibold mb-1 ${primaryTextLight} ${primaryTextDark}`}>{guidanceTitle}</h3>
                        <p className={`${secondaryTextLight} ${secondaryTextDark} text-xs sm:text-sm max-w-2xl`}>
                            {guidanceDescription}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowGuidanceVideoModal(true)}
                        className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm group text-xs sm:text-sm mt-2 sm:mt-0 shrink-0 px-3 py-1.5 h-auto sm:px-4 sm:py-2`}
                        disabled={!effectiveGuidanceVideoUrl} // Disable if URL is empty (shouldn't happen if this block renders)
                    >
                        <Film className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {guidanceButtonText}
                    </Button>
                </div>
            </div>
        )}

        {/* Enrollment Message */}
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

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-6 sm:mb-8 rounded-lg p-1 sm:p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`}>
             <TabsTrigger value="overview" className={`${tabsTriggerBaseClasses} ${activeTab === 'overview' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>Overview</TabsTrigger>
             <TabsTrigger value="announcements" className={`${tabsTriggerBaseClasses} ${activeTab === 'announcements' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>Announcements</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
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
                    {isLoadingCourses && dashboardCourses.length === 0 && ( // Show course loading only if no courses yet
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[#C5A467]" />
                            <p className={`ml-2 sm:ml-3 text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>Loading courses...</p>
                        </div>
                    )}
                    {!isLoadingCourses && dashboardCourses.length === 0 && !enrollmentMessage && ( // No courses and no enrollment message
                        <p className={`${mutedTextLight} ${mutedTextDark} text-center py-4 text-sm sm:text-base`}>No courses are currently available or assigned to you.</p>
                    )}
                    {dashboardCourses.map((course) => {
                         const isLockedByApi = course.status === 'locked';
                         // Consider a course completed if API says so OR if progress is 100% and it's not locked
                         const isEffectivelyCompleted = !isLockedByApi && (course.status === 'completed' || (typeof course.progress === 'number' && course.progress >= 100));
                         const displayStatus = isLockedByApi ? 'locked' : (isEffectivelyCompleted ? 'completed' : (course.status || 'active')); // Fallback to 'active' if status is undefined but not locked/completed

                         let statusText = 'View Course';
                         let statusColor = `text-[${accentColor}]`;
                         let statusIconElement = <PlayCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-[${accentColor}] flex-shrink-0`} />;
                         let rowBg = `${goldAccentBgLight} ${cardBorder} hover:shadow-md`;
                         let textColor = `${primaryTextLight} ${primaryTextDark}`;
                         let cursorClass = 'cursor-pointer';

                         if (displayStatus === 'completed') {
                             statusText = 'Completed - Review';
                             statusColor = positiveColor;
                             statusIconElement = <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 ${positiveColor} flex-shrink-0`} />;
                             rowBg = `${cardBgLight} ${cardBgDark} hover:shadow-md dark:hover:bg-gray-800/50 ${cardBorder}`;
                             textColor = `${secondaryTextLight} ${secondaryTextDark}`;
                         } else if (displayStatus === 'locked') {
                             statusText = 'Locked';
                             statusColor = lockedColor;
                             statusIconElement = <Lock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />;
                             rowBg = `${lockedBg} ${cardBorder}`;
                             textColor = lockedColor;
                             cursorClass = 'cursor-not-allowed';
                         }

                         return (
                            <div 
                                key={course.id} 
                                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm transition-all duration-150 ${rowBg} ${displayStatus === 'locked' ? 'opacity-70' : ''} ${cursorClass}`}
                                onClick={(e: MouseEvent<HTMLDivElement>) => { 
                                    if (displayStatus !== 'locked') { 
                                        e.preventDefault(); // Good practice for clickable divs
                                        navigate(`/courses/${course.id}`); 
                                    }
                                }}
                                role={displayStatus === 'locked' ? undefined : "button"}
                                tabIndex={displayStatus === 'locked' ? -1 : 0}
                                onKeyDown={(e) => { 
                                    if (displayStatus !== 'locked' && (e.key === 'Enter' || e.key === ' ')) { 
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
                                    {typeof course.progress === 'number' && displayStatus === 'active' && course.progress > 0 && course.progress < 100 && (
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
          
           {/* Announcements Tab Content */}
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
      {/* Guidance Video Modal - Renders if video URL is available */}
      {effectiveGuidanceVideoUrl && (
        <GuidanceVideoModal 
            isOpen={showGuidanceVideoModal} 
            onClose={() => setShowGuidanceVideoModal(false)} 
            videoUrl={effectiveGuidanceVideoUrl} 
        />
      )}
    </div>
  );
}