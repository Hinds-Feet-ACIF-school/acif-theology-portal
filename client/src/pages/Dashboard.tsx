import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Progress } from "../components/ui/progress.js";
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle, PlayCircle, BarChart, Lock, Loader2, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";


export interface AccessibleMaterial {
  id: string;
  title: string;
  type: string;
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




export default function DashboardPage() {
  const { user } = useAuth();
  const [accessibleContent, setAccessibleContent] = useState<AccessibleCourse[]>([]);
  const [currentCourse, setCurrentCourse] = useState<AccessibleCourse | null>(null);
  const [currentWeekNum, setCurrentWeekNum] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const announcements = [
    { id: 1, title: "Live Q&A Session", date: "May 10, 2025", content: "Join us..." },
    { id: 2, title: "Course Materials Update", date: "May 7, 2025", content: "Additional resources..." },
  ];

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data: AccessibleCourse[] = await apiService.getAccessibleContent();
        setAccessibleContent(data);

        if (data && data.length > 0) {
           const activeCourse = data.find(course => course.weeks.some(week => !week.isCompleted)) || data[data.length - 1];
           setCurrentCourse(activeCourse || null);

           let latestWeekNum = 0;
           data.forEach(c => {
               c.weeks.forEach(w => {
                   if(w.absoluteWeekNumber > latestWeekNum) latestWeekNum = w.absoluteWeekNumber;
               })
           });
           setCurrentWeekNum(latestWeekNum || 1);
        } else {
            setCurrentCourse(null);
            setCurrentWeekNum(null);
        }

      } catch (err: any) {
        setError(err.message || "Failed to load dashboard content.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

   const allAccessibleQuizzes = accessibleContent.flatMap(course =>
        course.weeks.flatMap(week =>
            (week.quizzes || []).map(q => ({
                ...q,
                courseTitle: course.title
            }))
        )
    );

    const totalAccessibleWeeks = accessibleContent.reduce((acc, course) => acc + course.weeks.length, 0);
    const completedWeeks = accessibleContent.reduce((acc, course) => acc + course.weeks.filter(week => week.isCompleted).length, 0);
    const overallProgressPercent = totalAccessibleWeeks > 0 ? Math.round((completedWeeks / totalAccessibleWeeks) * 100) : 0;
    const totalProgramCourses = 6;
    const completedCoursesCount = accessibleContent.filter(course => course.weeks.length === 4 && course.weeks.every(week => week.isCompleted)).length;


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} /></div>;
  }

  if (error) {
     return <div className="container px-4 py-8 md:px-6 lg:py-12 text-center text-red-600"><AlertCircle className="inline-block mr-2"/> Error loading dashboard: {error}</div>;
  }

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
          <div>
            <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Student Dashboard</h1>
            <p className={`${secondaryTextLight} ${secondaryTextDark}`}>Welcome back, {user?.displayName || user?.firstName || 'Student'}</p>
          </div>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`}>
             <TabsTrigger
                value="courses"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >My Courses</TabsTrigger>
             <TabsTrigger
                value="quizzes"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Quizzes</TabsTrigger>
             <TabsTrigger
                value="announcements"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Announcements</TabsTrigger>
             <TabsTrigger
                value="progress"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-8">
            {currentCourse ? (
               <div>
                <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Current Focus</h2>
                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md overflow-hidden`}>
                    <CardHeader className={`${headerBgLight} ${headerBgDark} ${headerTextLight} ${headerTextDark} p-6`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                        <CardTitle className="text-xl font-semibold font-serif">{currentCourse.title}</CardTitle>
                        <CardDescription className="text-[#E0D6C3]/90 mt-1">
                            {currentWeekNum ? `Focus on Week ${currentWeekNum % 4 || 4} (Program Week ${currentWeekNum})` : `Month ${currentCourse.monthOrder}`}
                        </CardDescription>
                        </div>
                        <div className={`bg-[${accentColor}]/20 text-[${accentColor}] px-3 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0`}>
                         In Progress
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {currentCourse.progress !== undefined && (
                            <div className="mb-6">
                                <div className={`flex justify-between mb-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                                <span className="text-sm font-medium">Course Progress</span>
                                <span className="text-sm font-medium">{currentCourse.progress}%</span>
                                </div>
                                <Progress value={currentCourse.progress} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                            </div>
                        )}

                        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2 mb-6 ${mutedTextLight} ${mutedTextDark}`}>
                            <Link to={`/courses/${currentCourse.id}`} className={`text-[${accentColor}] hover:text-[${accentHoverColor}] underline font-medium transition-colors`}>
                                Go to Course Content
                            </Link>
                        </div>

                        <div className={`border-t pt-4 ${cardBorder}`}>
                        <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Accessible Weeks</h3>
                        <div className="space-y-2">
                            {currentCourse.weeks.map((week) => (
                            <div
                                key={week.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${lightCardBg} ${darkCardBg} ${primaryTextLight} ${primaryTextDark} ${cardBorder}`}
                            >
                                <div className="flex items-center gap-3">
                                {week.isCompleted ?
                                    <CheckCircle2 className={`h-5 w-5 ${positiveColor}`} />
                                 :
                                    <PlayCircle className={`h-5 w-5 text-[${accentColor}]`} />
                                }
                                <span className={`${primaryTextLight} ${primaryTextDark}`}>{`Week ${week.weekNumber}: ${week.title}`}</span>
                                </div>
                                <Button
                                    variant={week.isCompleted ? "outline" : "default"}
                                    size="sm"
                                    className={ week.isCompleted ?
                                        `${outlineButtonClasses} text-xs px-2 py-1 h-auto`
                                        : `${primaryButtonClasses} text-xs px-2 py-1 h-auto`
                                    }
                                >
                                    {week.isCompleted ? "Review" : "Start"}
                                </Button>
                            </div>
                            ))}
                        </div>
                        </div>
                    </CardContent>
                </Card>
               </div>
            ) : (
                <p className={`${mutedTextLight} ${mutedTextDark}`}>No courses currently accessible or you have completed the program.</p>
            )}

            <div>
              <h2 className={`text-xl font-semibold mb-4 mt-8 ${primaryTextLight} ${primaryTextDark}`}>Next Up</h2>
               <div className="grid md:grid-cols-2 gap-4">
                 {accessibleContent
                    .filter(course => course.id !== currentCourse?.id)
                    .slice(0, 2)
                    .map((course) => (
                     <Card key={course.id} className={`${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm opacity-80`}>
                        <CardHeader className="pb-3">
                        <CardTitle className={`text-lg font-semibold ${primaryTextLight} ${primaryTextDark}`}>{course.title}</CardTitle>
                        <CardDescription className={`${mutedTextLight} ${mutedTextDark}`}>Month {course.monthOrder} - Coming Soon</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button disabled variant="outline" size="sm" className={`w-full ${outlineButtonClasses} cursor-not-allowed`}>Locked</Button>
                        </CardFooter>
                    </Card>
                 ))}
                  {accessibleContent.filter(course => course.id !== currentCourse?.id).length === 0 && !isLoading && (
                      <p className={`${mutedTextLight} ${mutedTextDark} md:col-span-2`}>No upcoming courses in the accessible program content.</p>
                  )}
               </div>
            </div>
          </TabsContent>

           <TabsContent value="quizzes" className="space-y-4">
             <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Quizzes</h2>
             {allAccessibleQuizzes.length === 0 && <p className={`${mutedTextLight} ${mutedTextDark}`}>No quizzes available yet in your accessible weeks.</p>}
             {allAccessibleQuizzes.map((quiz) => (
               <Card key={quiz.id} className={`${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`}>
                 <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                        <h3 className={`font-medium ${primaryTextLight} ${primaryTextDark}`}>{quiz.title}</h3>
                        <p className={`text-sm ${mutedTextLight} ${mutedTextDark}`}>Course: {quiz.courseTitle}</p>
                        <p className={`text-sm mt-1 ${mutedTextLight} ${mutedTextDark}`}>
                            Due: {quiz.calculatedDueDate ? new Date(quiz.calculatedDueDate).toLocaleDateString() : 'N/A'}
                        </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                        <div>
                             {quiz.submissionStatus === "graded" ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${positiveBg} ${positiveColor}`}>Graded ({quiz.grade}%)</span>
                             ) : quiz.submissionStatus === "submitted" ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>Submitted</span>
                             ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pendingBg} ${pendingColor}`}>Pending</span>
                            )}
                        </div>
                        <Button
                            variant={quiz.submissionStatus === "pending" ? "default" : "outline"}
                            size="sm"
                             className={ quiz.submissionStatus === 'pending' ?
                                `${primaryButtonClasses} text-xs px-2 py-1 h-auto`
                                : `${outlineButtonClasses} text-xs px-2 py-1 h-auto`
                            }
                         >
                             {quiz.submissionStatus === "pending" ? "Take Quiz" : "View Result"}
                        </Button>
                        </div>
                    </div>
                 </CardContent>
               </Card>
             ))}
           </TabsContent>

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

           <TabsContent value="progress" className="space-y-8">
             <h2 className={`text-xl font-semibold mb-4 ${primaryTextLight} ${primaryTextDark}`}>Program Progress</h2>
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
                    {accessibleContent.map((course) => {
                         const isActive = course.id === currentCourse?.id;
                         const isCourseComplete = course.weeks.length === 4 && course.weeks.every(week => week.isCompleted);

                         return (
                            <div key={course.id} className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                                isActive ? `${goldAccentBgLight} ${cardBorder}` : `${lockedBg} ${inactiveColor} opacity-70`
                            }`}>
                                <div className="flex items-center gap-3">
                                    {isCourseComplete ? <CheckCircle2 className={`h-5 w-5 ${positiveColor}`} /> : isActive ? <PlayCircle className={`h-5 w-5 text-[${accentColor}]`} /> : <Lock className="h-5 w-5" />}
                                    <span className={`${isActive ? `${deepBrown}` : ''}`}>Month {course.monthOrder}: {course.title}</span>
                                </div>
                                <span className={`${isActive ? `${midBrown}` : ''}`}>
                                    {isCourseComplete ? 'Completed' : isActive ? `${course.progress || 0}% Complete` : 'Locked'}
                                </span>
                            </div>
                        );
                    })}
                    {Array.from({ length: totalProgramCourses - accessibleContent.length }).map((_, index) => {
                         const monthNum = accessibleContent.length + index + 1;
                         if (monthNum > 6) return null;
                         return (
                             <div key={`locked-${monthNum}`} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${lockedBg} ${inactiveColor} opacity-70`}>
                                 <div className="flex items-center gap-3"><Lock className="h-5 w-5" /><span>Month {monthNum}: Course Title</span></div>
                                 <span>Locked</span>
                             </div>
                         );
                    })}
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}