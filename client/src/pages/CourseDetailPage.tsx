import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { BookOpen, FileText, Video, MessageSquare, CheckCircle2, PlayCircle, Download, ArrowLeft, Lock, ExternalLink, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as apiService from "../services/api";


interface AccessibleMaterial {
  id: string;
  title: string;
  type: string;
  contentUrl?: string;
  details?: string;
  isCompleted?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  calculatedDueDate?: string | null;
  submissionStatus?: 'pending' | 'submitted' | 'graded';
  grade?: number | null;
  quizUrl?: string;
}

interface AccessibleWeek {
  id: string;
  weekNumber: number;
  absoluteWeekNumber: number;
  title: string;
  description?: string;
  materials: AccessibleMaterial[];
  quizzes: Quiz[];
  isCompleted?: boolean;
}

interface AccessibleCourse {
  id: string;
  title: string;
  monthOrder: number;
  description?: string;
  instructorName?: string;
  weeks: AccessibleWeek[];
}


const accentColor = "#C5A467";
const darkCardBg = 'dark:bg-gray-900';
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
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const pendingColor = "text-yellow-700 dark:text-yellow-400";
const pendingBg = "bg-yellow-100 dark:bg-yellow-900/30";
const itemBgLight = "bg-white";
const itemBgDark = "dark:bg-gray-800/60";
const itemBorderLight = "border-gray-200";
const itemBorderDark = "dark:border-gray-700";
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBg = 'bg-[#C5A467]';
const goldBorder = 'border-[#C5A467]';
const goldAccent = 'text-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;


export default function CourseDetailPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState<AccessibleCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [discussions, setDiscussions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);


  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setError("Course ID not found in URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {

        const allAccessibleData: AccessibleCourse[] = await apiService.getAccessibleContent();
        const specificCourse = allAccessibleData.find(c => c.id === courseId);

        if (!specificCourse) {
          setError("Course not found or not accessible at this time.");
          setCourseData(null);
        } else {
          setCourseData(specificCourse);
        }

      } catch (err: any) {
        setError(err.message || "Failed to load course details.");
        console.error("Course Detail fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);


  const fetchDiscussions = async () => {
     if (!courseId || discussions.length > 0) return;
     setIsLoadingDiscussions(true);
     try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDiscussions([
            { id: 1, title: "Discussion Topic 1", replies: 5, lastActivity: "1 day ago" },
            { id: 2, title: "Week 2 Questions", replies: 8, lastActivity: "3 days ago" },
        ]);
     } catch (err: any) { console.error("Failed to fetch discussions", err); }
     finally { setIsLoadingDiscussions(false); }
  }
  const fetchResources = async () => {
       if (!courseId || resources.length > 0) return;
       setIsLoadingResources(true);
       try {
         await new Promise(resolve => setTimeout(resolve, 500));
        setResources([
             {id: 1, type: 'pdf', title: 'Course Syllabus', pages: 5, downloadLink: '#'},
             {id: 2, type: 'link', title: 'Recommended Reading Site', link: '#'},
        ]);
       } catch (err: any) { console.error("Failed to fetch resources", err); }
       finally { setIsLoadingResources(false); }
  }
  const fetchGrades = async () => {
       if (!courseId || grades.length > 0) return;
       setIsLoadingGrades(true);
       try {
          await new Promise(resolve => setTimeout(resolve, 500));
         setGrades([
            {id: 1, assessment: "Week 1 Quiz", type: 'Quiz', weight: '10%', grade: '85%', status: 'graded'},
            {id: 2, assessment: "Week 2 Quiz", type: 'Quiz', weight: '15%', grade: 'Pending', status: 'submitted'},
         ]);
       } catch (err: any) { console.error("Failed to fetch grades", err); }
       finally { setIsLoadingGrades(false); }
  }

  const handleTabChange = (value: string) => {
      if (value === 'discussions') fetchDiscussions();
      else if (value === 'resources') fetchResources();
      else if (value === 'grades') fetchGrades();
  }


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} /></div>;
  }

  if (error) {
    return (
      <div className="container px-4 py-8 md:px-6 lg:py-12 text-center">
        <AlertCircle className="inline-block mr-2 h-6 w-6 text-red-500"/>
        <span className="text-red-600 align-middle">Error: {error}</span>
        <div className="mt-4">

           <Button variant="outline" onClick={() => navigate('/dashboard')} className={outlineButtonClasses}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

   if (!courseData) {
     return <div className={`container px-4 py-8 md:px-6 lg:py-12 text-center ${mutedTextLight} ${mutedTextDark}`}>Course data not available.</div>;
   }


  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">
        <div className="mb-6 lg:mb-8">
          <Button variant="link" onClick={() => navigate(-1)} className={`flex items-center text-[${accentColor}] hover:text-[${accentHoverColor}] p-0 h-auto mb-4 text-sm font-medium transition-colors`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className={`text-sm font-medium ${mutedTextLight} ${mutedTextDark} mb-1`}>Month {courseData.monthOrder}</p>
              <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{courseData.title}</h1>
              {courseData.instructorName && <p className={`${secondaryTextLight} ${secondaryTextDark} mt-1`}>Instructor: {courseData.instructorName}</p>}
            </div>
          </div>
           {courseData.description && <p className={`mt-3 text-base ${secondaryTextLight} ${secondaryTextDark}`}>{courseData.description}</p>}
        </div>

        <Tabs defaultValue="content" className="w-full" onValueChange={handleTabChange}>
           <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`}>
             <TabsTrigger
                value="content"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Course Content</TabsTrigger>
             <TabsTrigger
                value="discussions"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Discussions</TabsTrigger>
             <TabsTrigger
                value="resources"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Resources</TabsTrigger>
             <TabsTrigger
                value="grades"
                className={` ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200 `}
             >Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {courseData.weeks.length === 0 && (
                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}><CardContent className={`p-6 text-center ${mutedTextLight} ${mutedTextDark}`}>No content currently accessible for this course.</CardContent></Card>
            )}
            {courseData.weeks.map((week) => {
                const isWeekCompleted = week.isCompleted || false;

                return (
                <Card key={week.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm overflow-hidden`}>
                    <CardHeader className={`p-4 sm:p-6 ${headerBgLight} ${headerBgDark} border-b ${itemBorderLight} ${itemBorderDark}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                        <CardTitle className={`flex items-center gap-2 text-lg sm:text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>
                            {isWeekCompleted ? (
                            <CheckCircle2 className={`h-5 w-5 ${positiveColor}`} />
                            ) : (
                            <PlayCircle className={`h-5 w-5 text-[${accentColor}]`} />
                            )}
                            Week {week.weekNumber}: {week.title}
                        </CardTitle>
                        {week.description && <CardDescription className={`mt-1 text-sm ${secondaryTextLight} ${secondaryTextDark}`}>{week.description}</CardDescription>}
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-6">

                    <div>
                        <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Learning Materials</h3>
                        <div className="space-y-2">
                        {week.materials.length === 0 && <p className={`text-sm ${mutedTextLight} ${mutedTextDark}`}>No materials for this week.</p>}
                        {week.materials.map((item) => {
                             const isMaterialCompleted = item.isCompleted || false;
                            return (
                            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark}`}>
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                {item.type === "video" ? <Video className={`h-5 w-5 text-[${accentColor}] flex-shrink-0`} /> :
                                item.type === "reading" ? <BookOpen className={`h-5 w-5 text-[${accentColor}] flex-shrink-0`} /> :
                                <FileText className={`h-5 w-5 text-[${accentColor}] flex-shrink-0`} />}
                                <div className="flex-1 overflow-hidden">
                                    <div className={`${primaryTextLight} ${primaryTextDark} truncate`} title={item.title}>{item.title}</div>
                                    {item.details && <div className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{item.details}</div>}
                                </div>
                                </div>
                                <Button
                                    variant={isMaterialCompleted ? "outline" : "default"}
                                    size="sm"
                                    className={ isMaterialCompleted ?
                                        `${outlineButtonClasses} text-xs px-2 py-1 h-auto`
                                        : `${primaryButtonClasses} text-xs px-2 py-1 h-auto`
                                    }
                                >
                                {isMaterialCompleted ? "Review" : "View"}
                                </Button>
                            </div>
                            );
                        })}
                        </div>
                    </div>


                     {week.quizzes && week.quizzes.length > 0 && (
                       <div className={`border-t pt-4 ${itemBorderLight} ${itemBorderDark}`}>
                         <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Quizzes</h3>
                         <div className="space-y-2">
                           {week.quizzes.map((quiz) => {
                                const submissionStatus = quiz.submissionStatus ?? 'pending';
                                return (
                                <div key={quiz.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark} gap-2`}>
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <HelpCircle className={`h-5 w-5 text-[${accentColor}] flex-shrink-0`} />
                                    <div className="flex-1 overflow-hidden">
                                        <div className={`${primaryTextLight} ${primaryTextDark} truncate`} title={quiz.title}>{quiz.title}</div>
                                        {quiz.calculatedDueDate && <div className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>Due: {new Date(quiz.calculatedDueDate).toLocaleDateString()}</div>}
                                    </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={submissionStatus === 'pending' ? 'default' : 'outline'}
                                        className={ submissionStatus === 'pending' ?
                                            `${primaryButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`
                                            : `${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`
                                        }
                                    >
                                        {submissionStatus === 'graded'
                                            ? 'View Grade'
                                            : submissionStatus === 'submitted'
                                                ? 'View Submission'
                                                : 'Take Quiz'
                                        }
                                    </Button>
                                </div>
                                );
                            })}
                         </div>
                       </div>
                     )}
                  </CardContent>
                </Card>
                );
             })}
          </TabsContent>


          <TabsContent value="discussions" className="space-y-6">
             <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
              <CardHeader><CardTitle className={`${primaryTextLight} ${primaryTextDark}`}>Discussions</CardTitle></CardHeader>
              <CardContent>
                 {isLoadingDiscussions && <div className="flex justify-center p-4"><Loader2 className={`h-6 w-6 animate-spin ${goldAccent}`}/></div>}
                 {!isLoadingDiscussions && discussions.length === 0 && <p className={`text-center ${mutedTextLight} ${mutedTextDark} py-4`}>No discussion topics available for this course yet.</p>}
                 {!isLoadingDiscussions && discussions.length > 0 && (
                    <div className="space-y-3">
                         {discussions.map((discussion) => (
                            <div key={discussion.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark} gap-2`}>
                                <div className="flex-1">
                                    <p className={`font-medium ${primaryTextLight} ${primaryTextDark}`}>{discussion.title}</p>
                                    <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{discussion.replies} replies · Last activity: {discussion.lastActivity}</p>
                                </div>
                                <Button variant="outline" size="sm" className={`${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`}>View Discussion</Button>
                            </div>
                         ))}
                    </div>
                 )}
              </CardContent>
             </Card>
          </TabsContent>


           <TabsContent value="resources" className="space-y-6">
             <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
               <CardHeader><CardTitle className={`${primaryTextLight} ${primaryTextDark}`}>Resources</CardTitle></CardHeader>
               <CardContent>
                 {isLoadingResources && <div className="flex justify-center p-4"><Loader2 className={`h-6 w-6 animate-spin ${goldAccent}`}/></div>}
                 {!isLoadingResources && resources.length === 0 && <p className={`text-center ${mutedTextLight} ${mutedTextDark} py-4`}>No additional resources found for this course.</p>}
                 {!isLoadingResources && resources.length > 0 && (
                    <div className="space-y-4">
                         {resources.map((resource) => (
                            <div key={resource.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded ${itemBgLight} ${itemBgDark} ${itemBorderLight} ${itemBorderDark} gap-2`}>
                                <div className="flex items-center gap-3 flex-1">
                                    {resource.type === 'pdf' ? <FileText className={`h-5 w-5 text-[${accentColor}]`} /> : <ExternalLink className={`h-5 w-5 text-[${accentColor}]`} />}
                                    <div>
                                        <p className={`${primaryTextLight} ${primaryTextDark}`}>{resource.title}</p>
                                        {resource.pages && <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{resource.pages} pages</p>}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className={`${outlineButtonClasses} text-xs px-2 py-1 h-auto flex-shrink-0`}>
                                    {resource.type === 'pdf' ? <Download className="mr-1 h-3 w-3" /> : null}
                                    {resource.type === 'pdf' ? 'Download' : 'Open Link'}
                                </Button>
                            </div>
                         ))}
                    </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>


           <TabsContent value="grades" className="space-y-6">
             <Card className={`${cardBgLight} ${darkCardBg} ${cardBorder} shadow-sm`}>
               <CardHeader><CardTitle className={`${primaryTextLight} ${primaryTextDark}`}>Grades</CardTitle></CardHeader>
               <CardContent>
                 {isLoadingGrades && <div className="flex justify-center p-4"><Loader2 className={`h-6 w-6 animate-spin ${goldAccent}`}/></div>}
                 {!isLoadingGrades && grades.length === 0 && <p className={`text-center ${mutedTextLight} ${mutedTextDark} py-4`}>Grades are not yet available for this course.</p>}
                 {!isLoadingGrades && grades.length > 0 && (
                    <div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`text-left ${mutedTextLight} ${mutedTextDark} text-xs uppercase`}>
                                        <th className="py-2 px-3 font-medium">Assessment</th>
                                        <th className="py-2 px-3 font-medium">Type</th>
                                        <th className="py-2 px-3 font-medium">Weight</th>
                                        <th className="py-2 px-3 font-medium text-right">Grade/Status</th>
                                    </tr>
                                </thead>
                                <tbody className={`${primaryTextLight} ${primaryTextDark} divide-y ${itemBorderLight} ${itemBorderDark}`}>
                                    {grades.map((gradeItem) => (
                                        <tr key={gradeItem.id} className={`${itemBgLight} ${itemBgDark}`}>
                                            <td className={`py-3 px-3 ${secondaryTextLight} ${secondaryTextDark}`}>{gradeItem.assessment}</td>
                                            <td className={`py-3 px-3 ${secondaryTextLight} ${secondaryTextDark}`}>{gradeItem.type}</td>
                                            <td className={`py-3 px-3 ${secondaryTextLight} ${secondaryTextDark}`}>{gradeItem.weight}</td>
                                            <td className={`py-3 px-3 text-right font-medium ${gradeItem.status === 'graded' ? `${primaryTextLight} ${primaryTextDark}` : `${mutedTextLight} ${mutedTextDark}`}`}>
                                                {gradeItem.grade}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}