// src/pages/CourseDetailPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { BookOpen, PlayCircle, ArrowLeft, Loader2, AlertCircle, HelpCircle, CheckCircle, XCircle, MinusCircle, TrendingUp, ListChecks, FileText as FileTextIcon } from "lucide-react";
import * as apiService from "../services/api";
// Ensure GradedItem includes 'passingScore?: number' and 'status?: string' from your API types
import type { Course, Week, WeekGradeSummary, GradedItem } from "../services/api";
import { cn } from "../lib/utils.js";

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


interface CourseWithWeeksData extends Course {
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
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);


  const fetchGrades = useCallback(async () => {
    if (!routeCourseId) return;
    console.log("CourseDetailPage: Fetching grades from apiService.getMyCourseGrades...");
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const fetchedGrades = await apiService.getMyCourseGrades(routeCourseId);
      console.log("CourseDetailPage: RAW Grades data received from backend:", JSON.parse(JSON.stringify(fetchedGrades)));
      setGradesData(fetchedGrades);
    } catch (err: any) {
      console.error("CourseDetailPage: Failed to load grades:", err);
      setGradesError(err.response?.data?.message || err.message || "Failed to load grades.");
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
        console.log("CourseDetailPage: Fetching course and weeks data...");
        const courseDetails: Course | null = await apiService.getCourseById(routeCourseId);
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
        console.log("CourseDetailPage: Switched to Grades tab. Re-fetching grades.");
        fetchGrades(); 
    }
  };

  const renderGradedItem = (item: GradedItem) => {
    let statusIcon = <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />;
    let statusText = "Not Started";
    let scoreDisplay: React.ReactNode = "-";
    let statusTextColorClass = `${mutedTextLight} ${mutedTextDark}`;

    if (item.type === 'section_completion') {
      if (item.status === 'completed') {
        statusIcon = <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />;
        statusText = "Completed";
        scoreDisplay = `${item.progressPercent || 100}%`;
        statusTextColorClass = `text-green-600 dark:text-green-400`;
      } else if (item.status === 'incomplete' || item.status === 'in_progress') {
        statusIcon = <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />;
        statusText = "In Progress";
        scoreDisplay = `${item.progressPercent || 0}%`;
        statusTextColorClass = `text-blue-600 dark:text-blue-400`;
      } else { 
        statusText = "Not Started";
        scoreDisplay = "0%";
      }
    } else if (item.type === 'quiz_score') {
      const itemSpecificPassingScore = item.passingScore; 
      const courseDefaultPassingScore = courseData?.settings?.defaultPassingScore;
      const passingScoreToUse = itemSpecificPassingScore ?? courseDefaultPassingScore ?? 70; 

      if (item.score !== null && item.score !== undefined) { 
        statusText = "Your Previous Result"; 
        if (item.score >= passingScoreToUse) {
            statusIcon = <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />;
            statusTextColorClass = `text-green-600 dark:text-green-400`;
        } else {
            statusIcon = <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />;
            statusTextColorClass = `text-red-600 dark:text-red-400`;
        }
        scoreDisplay = `${item.score}%`; 
      } else { 
        if (item.status === 'pending_grade') {
            statusText = "Pending Grade"; 
            scoreDisplay = "-";
            statusTextColorClass = `text-yellow-600 dark:text-yellow-400`;
            statusIcon = <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />;
        } else if (item.status === 'not_started') {
            statusText = "Not Taken"; 
            scoreDisplay = "-";
            statusTextColorClass = `${mutedTextLight} ${mutedTextDark}`;
            statusIcon = <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />;
        } else if (item.status === 'pending_manual_grading' || item.status === 'pending_review') {
            statusText = "Pending Review";
            scoreDisplay = "-";
            statusTextColorClass = `text-yellow-600 dark:text-yellow-400`;
            statusIcon = <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />;
        } else if (item.isGraded && (item.status !== 'passed' && item.status !== 'failed')) { 
            statusText = "Pending";
            scoreDisplay = "-";
            statusTextColorClass = `text-yellow-600 dark:text-yellow-400`;
            statusIcon = <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />;
        } else if (item.status === 'passed') { 
            statusText = "Passed (No Score Detail)"; 
            scoreDisplay = "-";
            statusTextColorClass = `text-green-600 dark:text-green-400`;
            statusIcon = <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />;
        } else if (item.status === 'failed') { 
            statusText = "Failed (No Score Detail)"; 
            scoreDisplay = "-";
            statusTextColorClass = `text-red-600 dark:text-red-400`;
            statusIcon = <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />;
        }
        else {
            console.warn(`CourseDetailPage: Quiz item "${item.title}" (ID: ${item.id}) has null score and unhandled status "${item.status}" from backend.`);
            statusText = "Info Unavailable"; 
            scoreDisplay = "-";
            statusTextColorClass = `${mutedTextLight} ${mutedTextDark}`;
            statusIcon = <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />;
        }
      }
    }

    return (
      <div key={item.id} className={`flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 border-b ${itemBorderLight} ${itemBorderDark} last:border-b-0`}>
        <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
            {item.type === 'quiz_score' ? <ListChecks className={`h-5 w-5 ${primaryTextLight} ${primaryTextDark} flex-shrink-0`} /> : <FileTextIcon className={`h-5 w-5 ${primaryTextLight} ${primaryTextDark} flex-shrink-0`} />}
            <span className={`${secondaryTextLight} ${secondaryTextDark} truncate`}>{item.title}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs sm:text-sm w-full sm:w-auto flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {statusIcon}
            <span className={cn("min-w-[5rem] w-auto sm:w-auto text-left sm:text-right font-medium", statusTextColorClass)}>{statusText}</span>
          </div>
          <span className={`font-medium min-w-[3rem] sm:w-16 text-right ${ (item.score !== null && item.score !== undefined) || (item.type === 'section_completion' && (item.status === 'completed' || item.status === 'in_progress' || item.status === 'incomplete')) ? `${primaryTextLight} ${primaryTextDark}` : `${mutedTextLight} ${mutedTextDark}` }`}>
            {scoreDisplay} 
          </span>
        </div>
      </div>
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
            <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark} mb-4`}>{error}</p>
            <Button onClick={() => navigate('/dashboard')} className={`${primaryButtonClasses} text-sm sm:text-base`}>Back to Dashboard</Button>
        </div>
    );
  }
  if (!courseData && !isLoading) {
    return (
        <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark} justify-center items-center p-4 text-center`}>
            <HelpCircle className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${goldAccent} mb-4`} />
            <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${primaryTextLight} ${primaryTextDark}`}>Course Not Found</h2>
            <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark} mb-4`}>The course you are looking for could not be found.</p>
            <Button onClick={() => navigate('/dashboard')} className={`${primaryButtonClasses} text-sm sm:text-base`}>Back to Dashboard</Button>
        </div>
    );
  }


  const totalWeeksInCourse = courseData?.weeks?.length || 0;
  const completedWeeksCount = gradesData.filter(w => w.overallWeekProgress === 100).length;
  const overallCourseProgress = totalWeeksInCourse > 0 ? Math.round((completedWeeksCount / totalWeeksInCourse) * 100) : 0;

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container mx-auto px-4 py-6 sm:px-6 md:py-8 lg:py-10 xl:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
         <Button
            variant="link"
            onClick={() => navigate('/dashboard')}
            className={`flex items-center ${goldAccent} hover:text-[${accentHoverColor}] p-0 h-auto mb-4 text-xs sm:text-sm font-medium transition-colors`}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              {courseData?.monthOrder !== undefined && <p className={`text-xs sm:text-sm font-medium ${mutedTextLight} ${mutedTextDark} mb-1`}>Month {courseData.monthOrder}</p>}
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{courseData?.title}</h1>
            </div>
          </div>
           {courseData?.description && <p className={`mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed ${secondaryTextLight} ${secondaryTextDark}`}>{courseData.description}</p>}
        </div>

        <Tabs defaultValue="content" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-6 sm:mb-8 rounded-lg p-1 sm:p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`}>
             <TabsTrigger value="content" className={`px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`}>Course Content</TabsTrigger>
             <TabsTrigger value="grades" className={`px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`}>Grades & Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 sm:space-y-6">
            {courseData && courseData.weeks && courseData.weeks.length === 0 && (
                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
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
                <Card key={week.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md hover:shadow-lg transition-shadow duration-200`}>
                  <CardHeader className={`p-4 sm:p-5 ${headerBgLight} ${headerBgDark} border-b ${itemBorderLight} ${itemBorderDark}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-grow min-w-0">
                        <CardTitle className={`flex items-center gap-2 sm:gap-2.5 text-lg sm:text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>
                          <PlayCircle className={`h-5 w-5 sm:h-6 sm:w-6 text-[${accentColor}] flex-shrink-0`} />
                          <span className="truncate">Week {week.weekNumber}: {week.title}</span>
                        </CardTitle>
                        {week.description && <CardDescription className={`mt-1.5 text-xs sm:text-sm ${secondaryTextLight} ${secondaryTextDark}`}>{week.description}</CardDescription>}
                      </div>
                      <Button
                        onClick={() => {
                          if (routeCourseId && week.id) {
                             navigate(`/courses/${routeCourseId}/week/${week.id}`);
                          }
                        }}
                        className={`${primaryButtonClasses} text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 h-auto self-start sm:self-center mt-2 sm:mt-0 shrink-0`}
                      >
                        Open Week
                      </Button>
                    </div>
                  </CardHeader>
                  {(isLoadingGrades && currentWeekProgress === undefined) ? (
                    <CardContent className="p-2.5 sm:p-3 pt-1.5 sm:pt-2">
                        <div className="flex items-center justify-center text-xs">
                            <Loader2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-2 ${goldAccent}`} />
                            <span className={`${mutedTextLight} ${mutedTextDark}`}>Loading progress...</span>
                        </div>
                    </CardContent>
                  ) : currentWeekProgress !== undefined ? (
                      <CardContent className="p-2.5 sm:p-3 pt-1.5 sm:pt-2">
                          <div className="flex items-center justify-between text-xs">
                              <span className={`${mutedTextLight} ${mutedTextDark}`}>Week Progress</span>
                              <span className={`${primaryTextLight} ${primaryTextDark} font-medium`}>{currentWeekProgress}%</span>
                          </div>
                          <Progress value={currentWeekProgress || 0} className={`h-1 sm:h-1.5 mt-1 [&>div]:bg-[${accentColor}]`} />
                      </CardContent>
                  ) : (
                    !isLoadingGrades && !gradesError && (
                        <CardContent className="p-2.5 sm:p-3 pt-1.5 sm:pt-2">
                             <div className="flex items-center justify-between text-xs">
                                <span className={`${mutedTextLight} ${mutedTextDark}`}>Week Progress</span>
                                <span className={`${mutedTextLight} ${mutedTextDark}`}>N/A</span>
                            </div>
                            <Progress value={0} title="Progress not available" className={`h-1 sm:h-1.5 mt-1 bg-gray-200 dark:bg-gray-700 [&>div]:bg-gray-400 dark:[&>div]:bg-gray-600`} />
                        </CardContent>
                    )
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="grades" className="space-y-4 sm:space-y-6">
            {isLoadingGrades && <div className="flex justify-center items-center p-8 sm:p-10"><Loader2 className={`h-8 w-8 sm:h-10 sm:w-10 animate-spin ${goldAccent}`} /></div>}
            {gradesError && (
                 <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
                    <CardContent className={`p-5 sm:p-6 text-center`}>
                        <AlertCircle className={`mx-auto h-8 w-8 sm:h-10 sm:w-10 text-red-500 dark:text-red-400 mb-3`} />
                        <p className={`text-red-600 dark:text-red-400 text-sm sm:text-base`}>{gradesError}</p>
                         <Button variant="outline" onClick={fetchGrades} className={`mt-4 ${outlineButtonClasses} text-xs sm:text-sm`}>Retry</Button>
                    </CardContent>
                 </Card>
            )}
            {!isLoadingGrades && !gradesError && gradesData.length === 0 && (
                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
                    <CardContent className={`p-6 sm:p-8 text-center ${mutedTextLight} ${mutedTextDark}`}>
                        <ListChecks className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3" />
                        No grades or progress information available yet for this course.
                    </CardContent>
                </Card>
            )}

            {!isLoadingGrades && !gradesError && gradesData.length > 0 && (
                <>
                 <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                    <CardHeader className="p-4 sm:p-5">
                        <CardTitle className={`text-lg sm:text-xl ${primaryTextLight} ${primaryTextDark}`}>Overall Course Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                            <span className={`${secondaryTextLight} ${secondaryTextDark}`}>Completion</span>
                            <span className={`${primaryTextLight} ${primaryTextDark} font-semibold`}>{overallCourseProgress}%</span>
                        </div>
                        <Progress value={overallCourseProgress} className={`h-1.5 sm:h-2 [&>div]:bg-[${accentColor}]`} />
                         <p className={`${mutedTextLight} ${mutedTextDark} text-xs mt-1.5`}>
                            Based on {completedWeeksCount} of {totalWeeksInCourse} weeks fully completed.
                        </p>
                    </CardContent>
                </Card>

                {gradesData.map((weekGrade) => (
                    <Card key={weekGrade.weekId} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                        <CardHeader className="p-4 sm:p-5">
                            <CardTitle className={`text-base sm:text-lg md:text-xl ${primaryTextLight} ${primaryTextDark}`}>Week {weekGrade.weekNumber}: {weekGrade.weekTitle}</CardTitle>
                            {weekGrade.overallWeekProgress !== undefined && (
                                 <div className="mt-2">
                                     <div className="flex items-center justify-between text-xs">
                                         <span className={`${mutedTextLight} ${mutedTextDark}`}>Week Progress</span>
                                         <span className={`${primaryTextLight} ${primaryTextDark} font-medium`}>{weekGrade.overallWeekProgress}%</span>
                                     </div>
                                     <Progress value={weekGrade.overallWeekProgress} className={`h-1 sm:h-1.5 mt-1 [&>div]:bg-[${accentColor}]`} />
                                 </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {weekGrade.items.length > 0 ? (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {weekGrade.items.map(item => renderGradedItem(item))}
                                </div>
                            ) : (
                                <p className={`${mutedTextLight} ${mutedTextDark} text-xs sm:text-sm py-4 px-4 sm:px-5`}>No graded items or activities for this week.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}