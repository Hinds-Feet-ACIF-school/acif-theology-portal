// src/pages/CourseDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { BookOpen, PlayCircle, ArrowLeft, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js";
import type { Course, Week } from "../services/api.js";

// --- Styling Constants ---
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
// ---

interface CourseWithWeeksData extends Course {
  weeks: Week[];
}

export default function CourseDetailPage() {
  const { id: routeCourseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState<CourseWithWeeksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  useEffect(() => {
    console.log("CourseDetailPage: Mounting. routeCourseId from useParams:", routeCourseId);

    const fetchCourseAndWeeks = async () => {
      if (!routeCourseId) {
        setError("Course ID not found in URL path.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      console.log("CourseDetailPage: Fetching data for courseId:", routeCourseId);
      try {
        // FIX 1: Allow courseDetails to be Course | null (or undefined based on API)
        const courseDetails: Course | null = await apiService.getCourseById(routeCourseId);
        console.log("CourseDetailPage: Fetched courseDetails:", courseDetails);

        if (!courseDetails) { // Handle the case where courseDetails is null
          setError(`Course with ID ${routeCourseId} not found.`);
          setCourseData(null);
          // No need to set isLoading(false) here, finally block will do it
          return; // Exit early
        }

        const weeksForCourse: Week[] = await apiService.getWeeksByCourse(routeCourseId);
        console.log("CourseDetailPage: Fetched weeksForCourse:", weeksForCourse);

        const sortedWeeks = weeksForCourse.sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0));
        // Now courseDetails is guaranteed to be a Course object
        setCourseData({ ...courseDetails, weeks: sortedWeeks });
        console.log("CourseDetailPage: Successfully set courseData with weeks.");

      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load course details.");
        console.error("CourseDetailPage: Data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndWeeks();
  }, [routeCourseId]);

  const fetchDiscussions = async () => { /* ... */ };
  const fetchResources = async () => { /* ... */ };
  const fetchGrades = async () => { /* ... */ };

  const handleTabChange = (value: string) => {
    if (value === 'discussions') fetchDiscussions();
    else if (value === 'resources') fetchResources();
    else if (value === 'grades') fetchGrades();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-100px)]"><Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} /></div>;
  }

  if (error) {
    return (
      <div className="container px-4 py-8 md:px-6 lg:py-12 text-center">
        <AlertCircle className={`inline-block mr-2 h-8 w-8 text-red-500 dark:text-red-400`} />
        <p className={`text-red-600 dark:text-red-400 align-middle text-lg`}>{error}</p>
        <div className="mt-6">
           <Button variant="outline" onClick={() => navigate('/dashboard')} className={outlineButtonClasses}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

   if (!courseData) {
     return (
        <div className={`container px-4 py-8 md:px-6 lg:py-12 text-center`}>
            <HelpCircle className={`mx-auto h-12 w-12 ${mutedTextLight} ${mutedTextDark} mb-4`} />
            <p className={`${mutedTextLight} ${mutedTextDark}`}>Course data could not be loaded.</p>
            <div className="mt-6">
                <Button variant="outline" onClick={() => navigate('/dashboard')} className={outlineButtonClasses}>Back to Dashboard</Button>
            </div>
        </div>
     );
   }

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <div className="container px-4 py-6 md:px-6 lg:py-10">
        <div className="mb-6 lg:mb-8">
          <Button 
            variant="link" 
            onClick={() => navigate(-1)} 
            className={`flex items-center ${goldAccent} hover:text-[${accentHoverColor}] p-0 h-auto mb-4 text-sm font-medium transition-colors`}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              {courseData.monthOrder !== undefined && <p className={`text-sm font-medium ${mutedTextLight} ${mutedTextDark} mb-1`}>Month {courseData.monthOrder}</p>}
              <h1 className={`text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{courseData.title}</h1>
              {courseData.instructorName && <p className={`${secondaryTextLight} ${secondaryTextDark} mt-1.5 text-base`}>Instructor: {courseData.instructorName}</p>}
            </div>
          </div>
           {courseData.description && <p className={`mt-4 text-base leading-relaxed ${secondaryTextLight} ${secondaryTextDark}`}>{courseData.description}</p>}
        </div>

        <Tabs defaultValue="content" className="w-full" onValueChange={handleTabChange}>
           <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1.5 ${tabsListBgLight} ${tabsListBgDark} shadow-sm`}>
             <TabsTrigger value="content" className={`py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`}>Course Content</TabsTrigger>
             <TabsTrigger value="discussions" className={`py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`}>Discussions</TabsTrigger>
             <TabsTrigger value="resources" className={`py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`}>Resources</TabsTrigger>
             <TabsTrigger value="grades" className={`py-2.5 text-sm font-medium ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-md rounded-md transition-all duration-200`}>Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* FIX 2: Corrected console.log in JSX */}
            {(() => {
                console.log("CourseDetailPage: Rendering weeks. courseData.weeks:", courseData?.weeks);
                return null; 
            })()}
            
            {courseData && courseData.weeks && courseData.weeks.length === 0 && (
                <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder}`}>
                    <CardContent className={`p-8 text-center ${mutedTextLight} ${mutedTextDark}`}>
                        <BookOpen className="mx-auto h-12 w-12 mb-3" />
                        No weeks have been added to this course yet.
                    </CardContent>
                </Card>
            )}
            {courseData && courseData.weeks && courseData.weeks.map((week) => (
              <Card key={week.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md hover:shadow-lg transition-shadow duration-200`}>
                <CardHeader className={`p-5 ${headerBgLight} ${headerBgDark} border-b ${itemBorderLight} ${itemBorderDark}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <CardTitle className={`flex items-center gap-2.5 text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>
                        <PlayCircle className={`h-6 w-6 text-[${accentColor}]`} />
                        Week {week.weekNumber}: {week.title}
                      </CardTitle>
                      {week.description && <CardDescription className={`mt-1.5 text-sm ${secondaryTextLight} ${secondaryTextDark}`}>{week.description}</CardDescription>}
                    </div>
                    <Button
                      onClick={() => {
                        if (routeCourseId && week.id) {
                           console.log(`CourseDetailPage: Navigating to week ${week.id} for course ${routeCourseId}`);
                           navigate(`/courses/${routeCourseId}/week/${week.id}`);
                        } else {
                           console.error("CourseDetailPage: Missing routeCourseId or week.id for navigation", { routeCourseId, weekId: week.id });
                        }
                      }}
                      className={`${primaryButtonClasses} text-sm px-5 py-2.5 h-auto self-start sm:self-center mt-3 sm:mt-0 shrink-0`}
                    >
                      Open Week Content
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6"> /* ... */ </TabsContent>
          <TabsContent value="resources" className="space-y-6"> /* ... */ </TabsContent>
          <TabsContent value="grades" className="space-y-6"> /* ... */ </TabsContent>

        </Tabs>
      </div>
    </div>
 
);
}