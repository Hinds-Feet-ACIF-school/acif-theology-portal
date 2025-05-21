// src/pages/CourseDetailPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { BookOpen, PlayCircle, ArrowLeft, Loader2, AlertCircle, HelpCircle } from "lucide-react"; // Removed unused Lucide icons
import * as apiService from "../services/api";
import type { Course, Week, WeekGradeSummary, GradedItem, MonthlyProgress } from "../services/api";
import { cn } from "../lib/utils.js";
import { Box, Typography, Divider } from '@mui/material';
import { CheckCircle as MuiCheckCircle, Cancel as MuiCancel, Pending as MuiPending, Warning as MuiWarning } from '@mui/icons-material';
import { TrendingUp, ListChecks } from "lucide-react"; // Re-added used Lucide icons for monthly progress

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
// const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`; // Not used in the provided code

// Define a global default passing score
const DEFAULT_GLOBAL_PASSING_SCORE = 70;

interface CourseWithSettings extends Course {
    defaultCoursePassingScore?: number;
}

interface CourseWithWeeksData extends CourseWithSettings {
  weeks: Week[];
}

export default function CourseDetailPage() {
  const { id: routeCourseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState<CourseWithWeeksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("content");

  const [gradesData, setGradesData] = useState<WeekGradeSummary[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!routeCourseId) return;
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const response = await apiService.getMyCourseGrades(routeCourseId);
      
      // --- THIS IS THE MOST IMPORTANT LOG. WE NEED ITS FULL OUTPUT ---
      console.log("CourseDetailPage (fetchGrades): FULL Raw API Response:", JSON.stringify(response, null, 2));

      if (response && response.weeklyGrades && Array.isArray(response.weeklyGrades) && response.monthlyProgress) {
        console.log("CourseDetailPage (fetchGrades): response.weeklyGrades IS an array. Length:", response.weeklyGrades.length);

        const sanitizedWeeklyGrades = response.weeklyGrades.map((wg: any, index: number) => {
          // Log each original weekGrade object before any sanitization
          console.log(`CourseDetailPage (fetchGrades - PRE-SANITIZATION): Processing weeklyGrade index ${index}:`, JSON.stringify(wg, null, 2));

          if (!wg) { // Handles if an element in weeklyGrades is null/undefined
            console.warn(`CourseDetailPage (fetchGrades - SANITIZING): weeklyGrade at index ${index} is null/undefined. Replacing with default.`);
            // Provide a default structure that matches WeekGradeSummary as much as possible
            return { 
              items: [], 
              weekId: `unknown_week_${Date.now()}_${index}`, 
              weekTitle: "Unknown Week", 
              weekNumber: 0, 
              overallWeekProgress: 0 // Ensure all expected fields are present
            };
          }

          const currentItems = wg.items;
          if (!Array.isArray(currentItems)) {
            // --- THIS IS THE CRITICAL WARNING. IF THIS APPEARS, WE'VE FOUND THE PROBLEM DATA ---
            console.warn(`CourseDetailPage (fetchGrades - SANITIZING): weeklyGrade.items for weekId '${wg.weekId}' (index ${index}) was NOT an array. Type: ${typeof currentItems}. Value:`, JSON.stringify(currentItems, null, 2), ". Replacing with empty array.");
            return {
              ...wg,
              items: [] // Replace non-array 'items' with an empty array
            };
          }
          
          console.log(`CourseDetailPage (fetchGrades - SANITIZING): weeklyGrade.items for weekId '${wg.weekId}' (index ${index}) IS an array. Length: ${currentItems.length}`);
          return wg; // If items is already an array, return as is
        });

        console.log("CourseDetailPage (fetchGrades - POST-SANITIZATION): Sanitized weeklyGrades:", JSON.stringify(sanitizedWeeklyGrades, null, 2));
        setGradesData(sanitizedWeeklyGrades);
        setMonthlyProgress(response.monthlyProgress);
      } else {
        let errorMsg = "Failed to fetch grades: Invalid data format from server.";
        if (!response) {
            errorMsg = "Failed to fetch grades: No response from server.";
        } else if (!response.weeklyGrades || !Array.isArray(response.weeklyGrades)) {
            errorMsg = "Failed to fetch grades: Invalid weekly grades data structure.";
            console.error("CourseDetailPage (fetchGrades): weeklyGrades is missing or not an array. Full response:", response);
        } else if (!response.monthlyProgress) {
            errorMsg = "Failed to fetch grades: Invalid monthly progress data structure.";
            console.error("CourseDetailPage (fetchGrades): monthlyProgress is missing. Full response:", response);
        }
        console.error("CourseDetailPage (fetchGrades): Problem with API response structure. Full response:", JSON.stringify(response, null, 2));
        setGradesError(errorMsg);
        setGradesData([]); 
        setMonthlyProgress(null);
      }
    } catch (err: any) {
      console.error("CourseDetailPage (fetchGrades): Exception during fetch or processing:", err);
      setGradesError(err.response?.data?.message || err.message || "Failed to load grades.");
      setGradesData([]);
      setMonthlyProgress(null);
    } finally {
      setIsLoadingGrades(false);
    }
  }, [routeCourseId]);

  useEffect(() => {
    const fetchCourseAndWeeks = async () => {
      if (!routeCourseId) {
        setError("Course ID not found in URL path.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const courseDetails: CourseWithSettings | null = await apiService.getCourseById(routeCourseId) as CourseWithSettings;
        if (!courseDetails) {
          setError(`Course with ID ${routeCourseId} not found.`);
          setCourseData(null);
          setIsLoading(false);
          return;
        }
        const weeksForCourse: Week[] = await apiService.getWeeksByCourse(routeCourseId);
        const sortedWeeks = weeksForCourse.sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0));
        setCourseData({ ...courseDetails, weeks: sortedWeeks });
        
        fetchGrades(); 

      } catch (err: any) {
        console.error("CourseDetailPage: Failed to load course details:", err);
        setError(err.response?.data?.message || err.message || "Failed to load course details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndWeeks();
  }, [routeCourseId, fetchGrades]); 

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "grades") {
        fetchGrades(); 
    }
  };

  const renderGradedItem = (item: GradedItem) => {
    let statusIcon = <MuiPending color="action" sx={{ fontSize: '1.25rem' }} />; // Adjusted icon size slightly
    let statusText = 'Not Started';
    let scoreDisplay = '-';
    let statusTextColorClass = `${mutedTextLight} ${mutedTextDark}`;
    let statusBgClass = 'bg-gray-100 dark:bg-gray-700/60'; // Slightly adjusted dark mode bg

    const effectivePassingScore = 
        courseData?.defaultCoursePassingScore ?? 
        item.passingScore ?? 
        DEFAULT_GLOBAL_PASSING_SCORE;

    if (item.score !== null && item.score !== undefined) { 
      if (item.score >= effectivePassingScore) {
        statusIcon = <MuiCheckCircle color="success" sx={{ fontSize: '1.25rem' }} />;
        statusText = 'Passed';
        statusTextColorClass = 'text-green-600 dark:text-green-400';
        statusBgClass = 'bg-green-50 dark:bg-green-900/30'; // Adjusted dark mode bg
      } else {
        statusIcon = <MuiCancel color="error" sx={{ fontSize: '1.25rem' }} />;
        statusText = 'Failed';
        statusTextColorClass = 'text-red-600 dark:text-red-400';
        statusBgClass = 'bg-red-50 dark:bg-red-900/30'; // Adjusted dark mode bg
      }
      scoreDisplay = `${item.score}%`;
    } else {
      switch (item.status) {
        case 'completed':
          statusIcon = <MuiCheckCircle color="success" sx={{ fontSize: '1.25rem' }} />;
          statusText = 'Completed';
          statusTextColorClass = 'text-green-600 dark:text-green-400';
          statusBgClass = 'bg-green-50 dark:bg-green-900/30';
          break;
        case 'pending_grade':
          statusIcon = <MuiPending color="warning" sx={{ fontSize: '1.25rem' }} />;
          statusText = 'Pending Grade';
          statusTextColorClass = 'text-yellow-600 dark:text-yellow-400';
          statusBgClass = 'bg-yellow-50 dark:bg-yellow-900/30';
          break;
        case 'pending_manual_grading':
          statusIcon = <MuiPending color="warning" sx={{ fontSize: '1.25rem' }} />;
          statusText = 'Pending Manual Grading';
          statusTextColorClass = 'text-yellow-600 dark:text-yellow-400';
          statusBgClass = 'bg-yellow-50 dark:bg-yellow-900/30';
          break;
        case 'pending_review':
          statusIcon = <MuiWarning color="warning" sx={{ fontSize: '1.25rem' }} />;
          statusText = 'Pending Review';
          statusTextColorClass = 'text-yellow-600 dark:text-yellow-400';
          statusBgClass = 'bg-yellow-50 dark:bg-yellow-900/30';
          break;
        case 'not_started':
          // Defaults are already set for Not Started
          break;
        default:
          if (item.status) {
            statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_/g, ' ');
          }
          break;
      }
    }

    return (
      <div 
        key={item.id} 
        className={`p-3 sm:p-4 border-b last:border-b-0 ${itemBorderLight} ${itemBorderDark} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${statusBgClass} flex items-center justify-center`}>
              {statusIcon}
            </div>
            <Typography variant="body1" className={`${primaryTextLight} ${primaryTextDark} font-medium truncate flex-grow`}>
              {item.title}
            </Typography>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 pl-8 sm:pl-0">
            <div className={`px-2.5 py-1 sm:px-3 rounded-full ${statusBgClass}`}>
              <Typography variant="caption" className={`${statusTextColorClass} font-medium`}>
                {statusText}
              </Typography>
            </div>
            <Typography variant="body1" className={`${primaryTextLight} ${primaryTextDark} font-semibold w-12 text-right`}>
              {scoreDisplay}
            </Typography>
          </div>
        </div>
      </div>
    );
  };
  
  const renderMonthlyProgress = () => {
    if (!monthlyProgress) return null;

    const getDateFromTimestamp = (timestamp: any): Date | null => {
        if (!timestamp) return null;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') { // For Firebase v9 Timestamps
            return timestamp.toDate();
        }
        if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) { // For older Firebase Timestamps or serialized objects
            return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
        }
        const date = new Date(timestamp); // Attempt to parse if it's a Date string or number
        return isNaN(date.getTime()) ? null : date;
    };

    return (
      <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${goldAccent}`} />
            <Typography variant="h6" className={`${primaryTextLight} ${primaryTextDark} font-semibold`}>
              Monthly Progress
            </Typography>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Typography variant="subtitle1" className={`${secondaryTextLight} ${secondaryTextDark} font-medium`}>
                  Overall Progress
                </Typography>
                <Typography variant="h6" className={`${primaryTextLight} ${primaryTextDark} font-bold`}>
                  {monthlyProgress.overallProgress}%
                </Typography>
              </div>
              <Progress 
                value={monthlyProgress.overallProgress} 
                className={`h-2.5 sm:h-3 [&>div]:bg-[${accentColor}] rounded-full`} 
              />
              <Typography variant="body2" className={`mt-1.5 sm:mt-2 ${mutedTextLight} ${mutedTextDark}`}>
                Completed {monthlyProgress.completedItems} of {monthlyProgress.totalItems} items
              </Typography>
            </div>

            <Divider className="my-4 sm:my-6" light={!document.documentElement.classList.contains('dark')} />

            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <ListChecks className={`h-4 w-4 sm:h-5 sm:w-5 ${goldAccent}`} />
                <Typography variant="subtitle1" className={`${primaryTextLight} ${primaryTextDark} font-semibold`}>
                  Quiz Results
                </Typography>
              </div>
              
              {monthlyProgress.quizScores.length > 0 ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {monthlyProgress.quizScores.map((quiz) => {
                    const submittedDate = getDateFromTimestamp(quiz.submittedAt);
                    return (
                        <div 
                          key={quiz.quizId} 
                          className={`p-3 sm:p-4 rounded-lg border ${itemBorderLight} ${itemBorderDark} bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors duration-200`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
                              <Typography variant="body1" className={`${secondaryTextLight} ${secondaryTextDark} font-medium truncate flex-grow`}>
                                {quiz.title}
                              </Typography>
                              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-1 sm:mt-0">
                                <Typography
                                    variant="body1"
                                    className={`font-semibold w-12 text-right ${quiz.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                >
                                    {quiz.score}%
                                </Typography>
                                {quiz.passed ? (
                                    <MuiCheckCircle className="text-green-600 dark:text-green-400" sx={{ fontSize: '1.25rem' }}/>
                                ) : (
                                    <MuiCancel className="text-red-600 dark:text-red-400" sx={{ fontSize: '1.25rem' }} />
                                )}
                              </div>
                          </div>
                          {submittedDate && (
                              <Typography variant="caption" className={`mt-1 ${mutedTextLight} ${mutedTextDark}`}>
                                Submitted on {submittedDate.toLocaleDateString()}
                              </Typography>
                          )}
                        </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`p-3 sm:p-4 rounded-lg border ${itemBorderLight} ${itemBorderDark} bg-gray-50 dark:bg-gray-800/50`}>
                  <Typography variant="body2" className={`${mutedTextLight} ${mutedTextDark} text-center`}>
                    No quiz results available yet.
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
        <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4`}>
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#C5A467]" />
            <p className={`mt-4 text-sm sm:text-base ${primaryTextLight} ${primaryTextDark}`}>Loading course details...</p>
        </div>
    );
  }
  if (error) {
    return (
        <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4 text-center`}>
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-4" />
            <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${primaryTextLight} ${primaryTextDark}`}>Error Loading Course</h2>
            <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark} mb-6 max-w-md`}>{error}</p>
            <Button onClick={() => navigate('/dashboard')} className={`${primaryButtonClasses} text-sm sm:text-base`}>Back to Dashboard</Button>
        </div>
    );
  }
  if (!courseData && !isLoading) {
    return (
        <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4 text-center`}>
            <HelpCircle className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${goldAccent} mb-4`} />
            <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${primaryTextLight} ${primaryTextDark}`}>Course Not Found</h2>
            <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark} mb-6 max-w-md`}>The course you are looking for could not be found or is not available.</p>
            <Button onClick={() => navigate('/dashboard')} className={`${primaryButtonClasses} text-sm sm:text-base`}>Back to Dashboard</Button>
        </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="w-full py-6 md:py-8 lg:py-10 xl:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Button
            variant="link"
            onClick={() => navigate('/dashboard')}
            className={`flex items-center ${goldAccent} hover:text-[${accentHoverColor}] p-0 h-auto mb-4 text-xs sm:text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:ring-[${accentColor}]`}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
            <div className="flex-grow min-w-0">
              {courseData?.monthOrder !== undefined && (
                <p className={`text-xs sm:text-sm font-medium ${mutedTextLight} ${mutedTextDark} mb-0.5 sm:mb-1`}>
                  Month {courseData.monthOrder}
                </p>
              )}
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>
                {courseData?.title}
              </h1>
            </div>
          </div>
          
          {courseData?.description && (
            <p className={`mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base leading-relaxed ${secondaryTextLight} ${secondaryTextDark} max-w-4xl`}>
              {courseData.description}
            </p>
          )}
        </div>

        <Tabs 
          defaultValue="content" 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <TabsList className={`grid w-full grid-cols-2 mb-6 sm:mb-8 rounded-lg p-1 sm:p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`}>
            <TabsTrigger 
              value="content" 
              className={cn(
                `px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] focus-visible:ring-offset-[#FFF8F0] dark:focus-visible:ring-offset-gray-950`,
                tabsTriggerTextLight, tabsTriggerTextDark, 
                tabsTriggerHoverBgLight, tabsTriggerHoverBgDark, 
                tabsTriggerHoverTextLight, tabsTriggerHoverTextDark,
                `data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark}`,
                `data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark}`,
                `data-[state=active]:shadow-md`
              )}
            >
              Course Content
            </TabsTrigger>
            <TabsTrigger 
              value="grades" 
              className={cn(
                `px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] focus-visible:ring-offset-[#FFF8F0] dark:focus-visible:ring-offset-gray-950`,
                tabsTriggerTextLight, tabsTriggerTextDark, 
                tabsTriggerHoverBgLight, tabsTriggerHoverBgDark, 
                tabsTriggerHoverTextLight, tabsTriggerHoverTextDark,
                `data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark}`,
                `data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark}`,
                `data-[state=active]:shadow-md`
              )}
            >
              Grades & Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 sm:space-y-6 focus-visible:ring-0 outline-none">
            {courseData && courseData.weeks && courseData.weeks.length === 0 && (
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                <CardContent className={`p-6 sm:p-8 text-center ${mutedTextLight} ${mutedTextDark}`}>
                  <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3" />
                  No weeks have been added to this course yet.
                </CardContent>
              </Card>
            )}
            
            {courseData && courseData.weeks && courseData.weeks.map((week) => {
              const weekProgressData = gradesData.find(g => g.weekId === week.id);
              const currentWeekProgress = weekProgressData?.overallWeekProgress;

              return (
                <Card 
                  key={week.id} 
                  className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <CardHeader className={`p-4 sm:p-5 ${headerBgLight} ${headerBgDark} border-b ${itemBorderLight} ${itemBorderDark}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                      <div className="flex-grow min-w-0">
                        <CardTitle className={`flex items-center gap-2 sm:gap-2.5 text-lg sm:text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>
                          <PlayCircle className={`h-5 w-5 sm:h-6 sm:w-6 text-[${accentColor}] flex-shrink-0`} />
                          <span className="truncate">Week {week.weekNumber}: {week.title}</span>
                        </CardTitle>
                        {week.description && (
                          <CardDescription className={`mt-1 sm:mt-1.5 text-xs sm:text-sm ${secondaryTextLight} ${secondaryTextDark} line-clamp-2`}>
                            {week.description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          if (routeCourseId && week.id) {
                            navigate(`/courses/${routeCourseId}/week/${week.id}`);
                          }
                        }}
                        className={`${primaryButtonClasses} text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 h-auto self-start sm:self-center mt-2 sm:mt-0 shrink-0`}
                      >
                        Open Week
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {(isLoadingGrades && currentWeekProgress === undefined) ? (
                    <CardContent className="p-2 sm:p-2.5 pt-1.5 sm:pt-2">
                      <div className="flex items-center justify-center text-xs h-6"> {/* Added h-6 for consistent height */}
                        <Loader2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2 ${goldAccent}`} />
                        <span className={`${mutedTextLight} ${mutedTextDark}`}>Loading progress...</span>
                      </div>
                    </CardContent>
                  ) : currentWeekProgress !== undefined ? (
                    <CardContent className="p-2 sm:p-2.5 pt-1.5 sm:pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${mutedTextLight} ${mutedTextDark}`}>Week Progress</span>
                        <span className={`${primaryTextLight} ${primaryTextDark} font-medium`}>{currentWeekProgress}%</span>
                      </div>
                      <Progress 
                        value={currentWeekProgress || 0} 
                        className={`h-1 sm:h-1.5 mt-1 [&>div]:bg-[${accentColor}]`} 
                        aria-label={`Week ${week.weekNumber} progress: ${currentWeekProgress}%`}
                      />
                    </CardContent>
                  ) : (
                    !isLoadingGrades && !gradesError && (
                      <CardContent className="p-2 sm:p-2.5 pt-1.5 sm:pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${mutedTextLight} ${mutedTextDark}`}>Week Progress</span>
                          <span className={`${mutedTextLight} ${mutedTextDark}`}>N/A</span>
                        </div>
                        <Progress 
                          value={0} 
                          title="Progress not available" 
                          className={`h-1 sm:h-1.5 mt-1 bg-gray-200 dark:bg-gray-700 [&>div]:bg-gray-400 dark:[&>div]:bg-gray-600`} 
                          aria-label={`Week ${week.weekNumber} progress: Not available`}
                        />
                      </CardContent>
                    )
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="grades" className="space-y-4 sm:space-y-6 focus-visible:ring-0 outline-none">
            {isLoadingGrades ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#C5A467]" />
                <span className={`ml-2 ${secondaryTextLight} ${secondaryTextDark}`}>Loading grades & progress...</span>
              </div>
            ) : gradesError ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <p className={`${secondaryTextLight} ${secondaryTextDark} max-w-md`}>{gradesError}</p>
              </div>
            ) : (
              <>
                {renderMonthlyProgress()}
                {gradesData.length > 0 ? gradesData.map((weekGrade) => {
                    // --- START FIX ---
                    // Ensure weekGrade.items is an array. Default to empty array if not.
                    const itemsToFilter = Array.isArray(weekGrade.items) ? weekGrade.items : [];
                    if (!Array.isArray(weekGrade.items) && weekGrade.items != null) { // Log if it's not an array but also not null/undefined
                        console.warn(`CourseDetailPage: weekGrade.items for weekId ${weekGrade.weekId} was not an array. Received:`, weekGrade.items);
                    }
                    const gradedItemsToDisplay = itemsToFilter.filter(item => item.isGraded === true);
                    // --- END FIX ---
                    
                    const overallWeekProgressForDisplay = weekGrade.overallWeekProgress;

                    return (
                        <Card
                            key={weekGrade.weekId} // Make sure weekGrade.weekId is unique and present
                            className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-lg hover:shadow-xl transition-shadow duration-300`}
                        >
                            <CardHeader className="p-4 sm:p-5">
                                <CardTitle className={`text-base sm:text-lg md:text-xl ${primaryTextLight} ${primaryTextDark}`}>
                                    Week {weekGrade.weekNumber}: {weekGrade.weekTitle}
                                </CardTitle>
                                {overallWeekProgressForDisplay !== undefined && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`${mutedTextLight} ${mutedTextDark}`}>Week Progress</span>
                                            <span className={`${primaryTextLight} ${primaryTextDark} font-medium`}>
                                                {overallWeekProgressForDisplay}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={overallWeekProgressForDisplay}
                                            className={`h-1 sm:h-1.5 mt-1 [&>div]:bg-[${accentColor}]`}
                                            aria-label={`Week ${weekGrade.weekNumber} progress: ${overallWeekProgressForDisplay}%`}
                                        />
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {gradedItemsToDisplay.length > 0 ? (
                                    <div className={`divide-y ${itemBorderLight} ${itemBorderDark}`}>
                                        {gradedItemsToDisplay.map(item => renderGradedItem(item))}
                                    </div>
                                ) : (
                                    <p className={`${mutedTextLight} ${mutedTextDark} text-xs sm:text-sm py-4 px-4 sm:px-5`}>
                                        No graded items for this week.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                }) : (
                  !monthlyProgress && ( 
                    <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-lg`}>
                        <CardContent className={`p-6 sm:p-8 text-center ${mutedTextLight} ${mutedTextDark}`}>
                            <ListChecks className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3" />
                            No grades or progress data available for this course yet.
                        </CardContent>
                    </Card>
                  )
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}