// src/pages/CourseDetailPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { BookOpen, PlayCircle, ArrowLeft, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import * as apiService from "../services/api";
import type { Course, Week, WeekGradeSummary, GradedItem, MonthlyProgress } from "../services/api";
import { cn } from "../lib/utils.js";
import { Box, Typography, Divider } from '@mui/material';
import { CheckCircle as MuiCheckCircle, Cancel as MuiCancel, Pending as MuiPending, Warning as MuiWarning } from '@mui/icons-material';
import { TrendingUp, ListChecks } from "lucide-react";

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
    console.log("CourseDetailPage: fetchGrades called. routeCourseId:", routeCourseId);
    try {
      const response = await apiService.getMyCourseGrades(routeCourseId);
      
      console.log("CourseDetailPage: RAW Grades data received. Type:", typeof response);
      if (typeof response === 'object' && response !== null) {
        console.log("CourseDetailPage: RAW response keys:", Object.keys(response));
        // More robust logging for the response object
        try {
            console.log("CourseDetailPage: RAW response (stringified):", JSON.stringify(response, null, 2));
        } catch (stringifyError) {
            console.error("CourseDetailPage: Could not stringify raw response. Logging as is. Stringify Error:", stringifyError);
            console.log("CourseDetailPage: RAW response (as is):", response);
        }
        console.log("CourseDetailPage: RAW response.weeklyGrades type:", typeof response.weeklyGrades, "isArray:", Array.isArray(response.weeklyGrades));
        console.log("CourseDetailPage: RAW response.monthlyProgress type:", typeof response.monthlyProgress);
      } else {
        console.log("CourseDetailPage: RAW response is not a typical object or is null:", response);
      }

      if (response && typeof response === 'object' && response !== null) {
        const { weeklyGrades, monthlyProgress: rawMonthlyProgress } = response; 
        
        console.log("CourseDetailPage: Destructured weeklyGrades. Type:", typeof weeklyGrades, "isArray:", Array.isArray(weeklyGrades));
        
        if (Array.isArray(weeklyGrades)) {
          console.log("CourseDetailPage: Processing weeklyGrades array. Length:", weeklyGrades.length);
          const sanitizedWeeklyGrades = weeklyGrades.map((weekGrade, index) => {
            console.log(`CourseDetailPage: Processing weekGrade at index ${index}. Type:`, typeof weekGrade);
            if (!weekGrade || typeof weekGrade !== 'object') {
              console.warn(`CourseDetailPage: Invalid weekGrade object at index ${index}:`, weekGrade);
              return {
                weekId: `unknown-week-${index}`,
                weekNumber: 0,
                weekTitle: 'Invalid Week Data',
                items: [],
                overallWeekProgress: 0
              };
            }
            console.log(`CourseDetailPage: weekGrade[${index}].weekId: ${weekGrade.weekId}, .items type:`, typeof weekGrade.items, "isArray:", Array.isArray(weekGrade.items));
            
            const items = Array.isArray(weekGrade.items) ? weekGrade.items : [];
            if (!Array.isArray(weekGrade.items) && weekGrade.items != null) {
                console.warn(`CourseDetailPage: weekGrade.items for weekId ${weekGrade.weekId || `index ${index}`} was not an array in API response. Received:`, weekGrade.items);
            }
            
            const sanitizedItems = items.map((item, itemIndex) => {
              if (!item || typeof item !== 'object') {
                console.warn(`CourseDetailPage: Invalid item object at weekGrade[${index}], itemIndex ${itemIndex}:`, item);
                return {
                  id: `unknown-item-${itemIndex}`,
                  title: 'Invalid Item Data',
                  status: 'not_started',
                  score: null,
                  isGraded: false
                };
              }
              return {
                id: item.id || `generated-id-${itemIndex}`,
                title: item.title || 'Untitled Item',
                status: item.status || 'not_started',
                score: typeof item.score === 'number' ? item.score : null,
                isGraded: Boolean(item.isGraded),
                passingScore: typeof item.passingScore === 'number' ? item.passingScore : undefined
              };
            });

            return {
              weekId: weekGrade.weekId || `generated-week-id-${index}`,
              weekNumber: typeof weekGrade.weekNumber === 'number' ? weekGrade.weekNumber : 0,
              weekTitle: weekGrade.weekTitle || 'Untitled Week',
              items: sanitizedItems,
              overallWeekProgress: typeof weekGrade.overallWeekProgress === 'number' ? weekGrade.overallWeekProgress : 0
            };
          });
          setGradesData(sanitizedWeeklyGrades);
          console.log("CourseDetailPage: Successfully processed and set gradesData state:", sanitizedWeeklyGrades);
        } else {
          console.error("CourseDetailPage: Destructured weeklyGrades is NOT an array:", weeklyGrades);
          setGradesData([]);
        }

        console.log("CourseDetailPage: Destructured rawMonthlyProgress. Type:", typeof rawMonthlyProgress);
        if (rawMonthlyProgress && typeof rawMonthlyProgress === 'object') {
          const sanitizedMonthlyProgress = {
            totalItems: typeof rawMonthlyProgress.totalItems === 'number' ? rawMonthlyProgress.totalItems : 0,
            completedItems: typeof rawMonthlyProgress.completedItems === 'number' ? rawMonthlyProgress.completedItems : 0,
            overallProgress: typeof rawMonthlyProgress.overallProgress === 'number' ? rawMonthlyProgress.overallProgress : 0,
            quizScores: Array.isArray(rawMonthlyProgress.quizScores) ? rawMonthlyProgress.quizScores.map(quiz => ({
              quizId: quiz.quizId || '',
              title: quiz.title || 'Untitled Quiz',
              score: typeof quiz.score === 'number' ? quiz.score : 0,
              passed: Boolean(quiz.passed),
              submittedAt: quiz.submittedAt || null
            })) : []
          };
          setMonthlyProgress(sanitizedMonthlyProgress);
          console.log("CourseDetailPage: Successfully processed and set monthlyProgress state:", sanitizedMonthlyProgress);
        } else {
          console.error("CourseDetailPage: rawMonthlyProgress is invalid or not an object:", rawMonthlyProgress);
          setMonthlyProgress(null);
        }
      } else {
        console.error("CourseDetailPage: API response is not a valid object or is null after initial check.");
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("CourseDetailPage: Error during fetchGrades execution:", err);
      setGradesError(err.response?.data?.message || err.message || "Failed to load grades.");
      setGradesData([]);
      setMonthlyProgress(null);
    } finally {
      setIsLoadingGrades(false);
      console.log("CourseDetailPage: fetchGrades finished.");
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
        console.log("CourseDetailPage: Switched to grades tab, calling fetchGrades.");
        fetchGrades(); 
    }
  };

  const renderGradedItem = (item: GradedItem) => {
    let statusIcon = <MuiPending color="action" sx={{ fontSize: '1.25rem' }} />;
    let statusText = 'Not Started';
    let scoreDisplay = '-';
    let statusTextColorClass = `${mutedTextLight} ${mutedTextDark}`;
    let statusBgClass = 'bg-gray-100 dark:bg-gray-700/60';

    const effectivePassingScore = 
        courseData?.defaultCoursePassingScore ?? 
        item.passingScore ?? 
        DEFAULT_GLOBAL_PASSING_SCORE;

      if (item.score !== null && item.score !== undefined) { 
      if (item.score >= effectivePassingScore) {
        statusIcon = <MuiCheckCircle color="success" sx={{ fontSize: '1.25rem' }} />;
        statusText = 'Passed';
        statusTextColorClass = 'text-green-600 dark:text-green-400';
        statusBgClass = 'bg-green-50 dark:bg-green-900/30';
        } else {
        statusIcon = <MuiCancel color="error" sx={{ fontSize: '1.25rem' }} />;
        statusText = 'Failed';
        statusTextColorClass = 'text-red-600 dark:text-red-400';
        statusBgClass = 'bg-red-50 dark:bg-red-900/30';
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
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
            return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
        }
        const date = new Date(timestamp);
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
                      <div className="flex items-center justify-center text-xs h-6">
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
                    const itemsToFilter = Array.isArray(weekGrade.items) ? weekGrade.items : [];
                    if (!Array.isArray(weekGrade.items) && weekGrade.items != null) { 
                        console.warn(`CourseDetailPage: [Render] weekGrade.items for weekId ${weekGrade.weekId} was not an array. Received:`, weekGrade.items, "Using empty array instead for filtering.");
                    }
                    const gradedItemsToDisplay = itemsToFilter.filter(item => item.isGraded === true);
                    
                    const overallWeekProgressForDisplay = weekGrade.overallWeekProgress;

                    return (
                        <Card
                            key={weekGrade.weekId}
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