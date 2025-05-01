import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import {
    BookOpen, PlusCircle, Edit, Trash2, ArrowLeft, FileText, Video, Loader2, AlertCircle, HelpCircle,
    X
} from 'lucide-react';
import * as apiService from "../../services/api.js";
import CreateEditCourseModal from "../../components/modals/CreateEditCourseModal.js";
import CreateEditWeekModal from "../../components/modals/CreateEditWeekModal.js";
import CreateEditMaterialModal from "../../components/modals/CreateEditMaterialModal.js";
import CreateEditQuizModal from "../../components/modals/CreateEditQuizModal.js";
import ConfirmationModal from "../../components/modals/ConfirmationModal.js";

export interface Course { id: string; title: string; description?: string; monthOrder: number; instructor?: string; instructorName?: string; ects?: number; }
export interface Week { id: string; courseId: string; weekNumber: number; title: string; description?: string; materials?: Material[]; quizzes?: Quiz[]; }
export interface Material { id: string; weekId: string; title: string; type: 'video' | 'reading' | 'resource'; contentUrl?: string; details?: string; }
export interface Quiz { id: string; weekId: string; title: string; description?: string; instructions?: string; quizUrl?: string; points?: number; dueDateOffsetDays?: number | null; }

const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-200 dark:border-gray-700';
const tableHeaderBg = 'bg-gray-50 dark:bg-gray-800/50';
const tableRowBorder = 'border-b border-gray-200 dark:border-gray-700';
const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedText}`;
const tableCellClasses = `p-4 align-middle ${midBrown}`;
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const ghostButtonClasses = `${midBrown} hover:bg-gray-100 dark:hover:bg-gray-800/50`;
const linkClasses = `${goldAccent} hover:underline`;
const tabsListBg = 'bg-gray-100/50 dark:bg-gray-800/50';
const tabsTriggerClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out ${midBrown} hover:bg-gray-200/60 dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C5A467] dark:focus-visible:ring-offset-gray-950 data-[state=active]:${goldBg} data-[state=active]:text-[#bb4343] data-[state=active]:font-semibold data-[state=active]:shadow-md data-[state=active]:hover:${goldBgHover} disabled:opacity-50 disabled:pointer-events-none`;


const AdminCourseManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<Course | null>(null);
  const [courseWeeks, setCourseWeeks] = useState<Week[]>([]);
  const [contentDetails, setContentDetails] = useState<{ [weekId: string]: { materials: Material[], quizzes: Quiz[], loading: boolean, error: string | null } }>({});
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [currentWeekIdForModal, setCurrentWeekIdForModal] = useState<string | undefined>(undefined);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string; type: 'course' | 'week' | 'material' | 'quiz'; weekId?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    console.log("Fetching courses...");
    setIsLoadingCourses(true);
    setError(null);
    try {
      const fetchedCourses = await apiService.getCoursesForAdmin();
      setCourses(fetchedCourses.sort((a: Course, b: Course) => a.monthOrder - b.monthOrder));
      console.log("Courses fetched successfully:", fetchedCourses.length);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.message || "Failed to fetch courses");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchWeekDetails = useCallback(async (weekId: string, forceRefresh = false) => {
    if (!weekId) return;
    if (!forceRefresh && contentDetails[weekId] && !contentDetails[weekId].error && !contentDetails[weekId].loading && (contentDetails[weekId].materials?.length > 0 || contentDetails[weekId].quizzes?.length > 0)) {
        return;
    }
    console.log(`Fetching details for week ${weekId} ${forceRefresh ? '(forcing refresh)' : ''}`);

    if (forceRefresh) {
        setContentDetails(prev => ({
            ...prev,
            [weekId]: { materials: [], quizzes: [], loading: true, error: null }
        }));
    } else {
        setContentDetails(prev => ({
            ...prev,
            [weekId]: { materials: prev[weekId]?.materials || [], quizzes: prev[weekId]?.quizzes || [], loading: true, error: null }
        }));
    }

    try {
        const [materials, quizzes] = await Promise.all([
            apiService.getMaterialsByWeek(weekId),
            apiService.getQuizzesByWeek(weekId)
        ]);
        console.log(`Fetched details for week ${weekId}: ${materials.length} materials, ${quizzes.length} quizzes`);
        setContentDetails(prev => ({
            ...prev,
            [weekId]: { materials, quizzes, loading: false, error: null }
        }));
    } catch (err: any) {
        console.error(`Error fetching details for week ${weekId}:`, err);
         setContentDetails(prev => ({
            ...prev,
            [weekId]: { ...(prev[weekId] || { materials: [], quizzes: [] }), loading: false, error: err.message || 'Failed to load details' }
         }));
    }
  }, [contentDetails]);

  const fetchWeeksAndDetailsForCourse = useCallback(async (courseId: string) => {
      console.log(`Fetching weeks for course ${courseId}`);
      setIsLoadingWeeks(true);
      setCourseWeeks([]);
      setContentDetails({});
      setError(null);
      try {
          const weeks = await apiService.getWeeksByCourse(courseId);
          const sortedWeeks = weeks.sort((a: Week, b: Week) => a.weekNumber - b.weekNumber);
          console.log("Fetched weeks:", sortedWeeks.length);
          setCourseWeeks(sortedWeeks);
          setIsLoadingWeeks(false);
          if (sortedWeeks.length > 0) {
            console.log("Fetching details for all fetched weeks...");
            sortedWeeks.forEach((week: Week) => fetchWeekDetails(week.id, false));
          }
      } catch (err: any) {
          console.error(`Error fetching weeks for course ${courseId}:`, err);
          setError(err.message || `Failed to fetch weeks for course`);
          setIsLoadingWeeks(false);
      }
  }, [fetchWeekDetails]);

  const handleSelectCourseForContent = (course: Course) => {
    if (!course || !course.id || course.id === selectedCourseForContent?.id) return;
    console.log("Selecting course for content management:", course.title);
    setSelectedCourseForContent(course);
    setActiveTab("content");
    fetchWeeksAndDetailsForCourse(course.id);
  };

  const handleSaveCourse = async (courseData: Course | Omit<Course, 'id'>) => {
    const isEditing = 'id' in courseData;
    console.log(isEditing ? "Saving updated course:" : "Creating new course:", courseData);
    setError(null);
    try {
      if (isEditing) {
        await apiService.updateCourse(courseData.id, courseData);
      } else {
        await apiService.createCourse(courseData);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      await fetchCourses();
    } catch (err: any) {
      console.error("Error saving course:", err);
      throw err;
    }
   };

  const handleSaveWeek = async (weekData: Week | Omit<Week, 'id'>) => {
    const isEditing = 'id' in weekData;
    setError(null);
    try {
        if (isEditing) {
            await apiService.updateWeek(weekData.id, weekData);
        } else {
             if (!selectedCourseForContent?.id) throw new Error("Cannot create week without a selected course.");
             const dataToCreate = { ...weekData, courseId: selectedCourseForContent.id };
             await apiService.createWeek(dataToCreate);
        }
        setShowWeekModal(false);
        setEditingWeek(null);
        if (selectedCourseForContent?.id) {
           await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
        }
    } catch (err: any) {
        console.error("Error saving week:", err);
        throw err;
    }
   };

   const handleSaveMaterial = async (materialData: FormData | (Material | Omit<Material, 'id'>)) => {
     setError(null);
     const isFormData = materialData instanceof FormData;
     const isEditing = !isFormData && 'id' in materialData;
     const idToUpdate = isEditing ? (materialData as Material).id : undefined;
     const weekIdForRefresh = isFormData
        ? materialData.get('weekId') as string
        : (materialData as Material | Omit<Material, 'id'>).weekId;
    try {
         if (isEditing && idToUpdate) {
             await apiService.updateMaterial(idToUpdate, materialData);
         } else {
             await apiService.createMaterial(materialData as FormData);
         }
         setShowMaterialModal(false);
         setEditingMaterial(null);
         if (weekIdForRefresh) {
            await fetchWeekDetails(weekIdForRefresh, true);
         }
         setCurrentWeekIdForModal(undefined);
     } catch (err: any) {
         console.error("Error saving material:", err);
         throw err;
     }
   };

   const handleSaveQuiz = async (quizData: Quiz | Omit<Quiz, 'id'>) => {
    setError(null);
    const isEditing = 'id' in quizData;
    const weekIdForRefresh = isEditing ? quizData.weekId : currentWeekIdForModal;
    try {
        if (isEditing) {
            await apiService.updateQuiz(quizData.id, quizData);
        } else {
            if (!weekIdForRefresh) throw new Error("Missing weekId for new quiz");
            const dataToCreate = { ...quizData, weekId: weekIdForRefresh };
            await apiService.createQuiz(dataToCreate);
        }
        setShowQuizModal(false);
        setEditingQuiz(null);
        if (weekIdForRefresh) {
           await fetchWeekDetails(weekIdForRefresh, true);
        }
        setCurrentWeekIdForModal(undefined);
    } catch (err: any) {
        console.error("Error saving quiz:", err);
        throw err;
    }
   };

  const requestDeleteConfirmation = (id: string, title: string, type: 'course' | 'week' | 'material' | 'quiz', weekId?: string) => {
      console.log(`Requesting delete confirmation for ${type}: ${title} (${id})${weekId ? ` in week ${weekId}`: ''}`);
      setItemToDelete({ id, title, type, weekId });
      setShowDeleteConfirmModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setError(null);
    console.log(`Executing delete for ${itemToDelete.type}: ${itemToDelete.title} (${itemToDelete.id})`);

    try {
        const weekIdToRefresh = itemToDelete.weekId;

        switch (itemToDelete.type) {
            case 'course':
                await apiService.deleteCourse(itemToDelete.id);
                await fetchCourses();
                if (selectedCourseForContent?.id === itemToDelete.id) {
                    setSelectedCourseForContent(null);
                    setCourseWeeks([]);
                    setContentDetails({});
                    setActiveTab('courses');
                }
                break;
            case 'week':
                 await apiService.deleteWeek(itemToDelete.id);
                 if (selectedCourseForContent?.id) {
                     await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
                 }
                 break;
            case 'material':
                await apiService.deleteMaterial(itemToDelete.id);
                if (weekIdToRefresh) await fetchWeekDetails(weekIdToRefresh, true);
                else console.warn("Week ID missing for material delete refresh.");
                break;
            case 'quiz':
                 await apiService.deleteQuiz(itemToDelete.id);
                 if (weekIdToRefresh) await fetchWeekDetails(weekIdToRefresh, true);
                 else console.warn("Week ID missing for quiz delete refresh.");
                 break;
        }
        console.log(`${itemToDelete.type} deleted successfully`);
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);

    } catch (err: any) {
        console.error(`Error deleting ${itemToDelete.type}:`, err);
        throw err;
    } finally {
        setIsDeleting(false);
    }
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
      requestDeleteConfirmation(courseId, courseTitle, 'course');
  };

  const handleDeleteWeek = (weekId: string, weekTitle: string) => {
       requestDeleteConfirmation(weekId, weekTitle || `Week (ID: ${weekId})`, 'week');
  };

  const handleDeleteMaterial = (materialId: string, weekId: string, materialTitle: string) => {
      requestDeleteConfirmation(materialId, materialTitle, 'material', weekId);
  };

  const handleDeleteQuiz = (quizId: string, weekId: string, quizTitle: string) => {
       requestDeleteConfirmation(quizId, quizTitle, 'quiz', weekId);
  };

  const openMaterialModal = (material: Material | null, weekId: string) => {
      setEditingMaterial(material);
      setCurrentWeekIdForModal(weekId);
      setShowMaterialModal(true);
   };

   const openQuizModal = (quiz: Quiz | null, weekId: string) => {
        setEditingQuiz(quiz);
        setCurrentWeekIdForModal(weekId);
        setShowQuizModal(true);
   };

  const existingMonthOrders = courses.map(c => c.monthOrder);

  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <Link to="/admin" className={`flex items-center ${linkClasses} text-sm mb-2`}>
                   <ArrowLeft className="mr-1.5 h-4 w-4" />
                   Back to Admin Dashboard
                </Link>
                <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Course Management</h1>
                <p className={`${midBrown} mt-1`}>Manage the 6-month program structure and content.</p>
            </div>
            <Button
                className={primaryButtonClasses}
                onClick={() => { setEditingCourse(null); setShowCourseModal(true); }}
                disabled={courses.length >= 6}
                title={courses.length >= 6 ? "All 6 months have assigned courses" : "Add a new course"}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Course
            </Button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                   <AlertCircle className="h-5 w-5"/>
                   <span>{error}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200" onClick={() => setError(null)}>
                    <span className="sr-only">Close error message</span>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`rounded-lg p-1 ${tabsListBg} inline-flex`}>
              <TabsTrigger value="courses" className={tabsTriggerClasses}>Program Structure (6 Courses)</TabsTrigger>
              <TabsTrigger value="content" disabled={!selectedCourseForContent} className={tabsTriggerClasses}>Weekly Content</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6">
                 <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                      <CardHeader>
                         <CardTitle className={deepBrown}>6-Month Program Overview</CardTitle>
                        
                      </CardHeader>
                      <CardContent className="p-0">
                        {isLoadingCourses ? ( <div className="p-6 text-center"><Loader2 className={`h-6 w-6 animate-spin inline-block ${goldAccent}`}/></div>)
                         : !courses || courses.length === 0 ? ( <div className="p-6 text-center text-gray-500">No courses created yet.</div>)
                         : (
                          <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                              <thead className={tableHeaderBg}>
                                    <tr className={tableRowBorder}>
                                        <th className={tableHeaderClasses}>Month</th>
                                        <th className={tableHeaderClasses}>Course Title</th>
                                        <th className={tableHeaderClasses}>Instructor</th>
                                        <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                                    </tr>
                                </thead>
                              <tbody>
                                {courses.map((course: Course) => (
                                  <tr key={course.id} className={`${tableRowBorder} hover:bg-gray-50/50 dark:hover:bg-gray-800/30`}>
                                     <td className={`p-4 align-middle font-semibold ${deepBrown}`}>Month {course.monthOrder}</td>
                                     <td className={tableCellClasses}>{course.title}</td>
                                     <td className={tableCellClasses}>{course.instructorName || course.instructor || 'N/A'}</td>
                                    <td className="p-4 align-middle text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => handleSelectCourseForContent(course)}>
                                            <BookOpen className="mr-1 h-4 w-4" /> Manage Content
                                        </Button>
                                        <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => { setEditingCourse(course); setShowCourseModal(true); }} aria-label={`Edit ${course.title}`}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`${ghostButtonClasses} hover:text-red-600 h-8 w-8`}
                                            onClick={() => handleDeleteCourse(course.id, course.title)}
                                            aria-label={`Delete ${course.title}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
            </TabsContent>

           <TabsContent value="content" className="space-y-6">
              {!selectedCourseForContent ? (
                  <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                      <CardContent className="p-6 text-center">
                          <BookOpen className={`mx-auto h-12 w-12 ${mutedText} mb-4`} />
                          <p className={`${midBrown} font-semibold`}>Select a Course</p>
                          <p className={mutedText}>Choose a course from the 'Program Structure' tab to manage its weekly content.</p>
                      </CardContent>
                  </Card>
              ) : (
                <>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
                     <div>
                         <Button variant="ghost" size="sm" onClick={() => {setSelectedCourseForContent(null); setActiveTab('courses')}} className={`${ghostButtonClasses} mb-2 -ml-2`}>
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Courses
                        </Button>
                        <h2 className={`text-2xl font-semibold tracking-tight ${deepBrown}`}>Manage Content for: {selectedCourseForContent.title}</h2>
                        <p className={mutedText}>Organize learning materials and quizzes week by week.</p>
                     </div>
                    <Button className={primaryButtonClasses} onClick={() => { setEditingWeek(null); setShowWeekModal(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Week
                    </Button>
                 </div>
                 {isLoadingWeeks ? ( <div className="p-6 text-center"><Loader2 className={`h-6 w-6 animate-spin inline-block ${goldAccent}`}/></div> )
                  : courseWeeks.length === 0 ? (
                     <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                         <CardContent className="p-6 text-center">
                            <HelpCircle className={`mx-auto h-12 w-12 ${mutedText} mb-4`} />
                            <p className={`${midBrown} font-semibold`}>No Weeks Yet</p>
                            <p className={mutedText}>This course doesn't have any weekly content defined. Start by adding a week.</p>
                        </CardContent>
                     </Card>
                    )
                  : (
                    <div className="space-y-6">
                    {courseWeeks.map((week: Week) => {
                        const details = contentDetails[week.id];
                        return (
                        <Card key={week.id} className={`${lightCardBg} ${darkCardBg} border ${inputBorder} overflow-hidden`}>
                            <CardHeader className={`p-4 border-b ${inputBorder} flex flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30`}>
                                <div>
                                    <CardTitle className={`text-lg ${deepBrown}`}>Week {week.weekNumber}: {week.title}</CardTitle>
                                    {week.description && <CardDescription className={`mt-1 text-xs ${mutedText}`}>{week.description}</CardDescription>}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => { setEditingWeek(week); setShowWeekModal(true); }} aria-label={`Edit Week ${week.weekNumber}`}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                     <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-8 w-8`}
                                         onClick={() => handleDeleteWeek(week.id, week.title || `Week ${week.weekNumber}`)}
                                         aria-label={`Delete Week ${week.weekNumber}`}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                             <CardContent className="p-4 md:p-6">
                                {!details ? (
                                    <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => fetchWeekDetails(week.id, false)}>
                                        Load Week Details
                                    </Button>
                                ) : details.loading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className={`h-4 w-4 animate-spin ${goldAccent}`} /> Loading content...</div>
                                ) : details.error ? (
                                     <div className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> Error: {details.error} <Button variant="link" size="sm" className={`p-0 h-auto ${linkClasses}`} onClick={() => fetchWeekDetails(week.id, true)}>Retry</Button></div>
                                ) : (
                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-2`}>
                                        <div>
                                             <h4 className={`text-sm font-semibold mb-3 pb-2 border-b ${inputBorder} ${deepBrown}`}>Learning Materials</h4>
                                             {details.materials.length === 0 && <p className={`text-xs ${mutedText}`}>No materials added yet.</p>}
                                             {details.materials.map((material, index) => (
                                                <div key={`${material.id}-${index}`} className={`flex items-center justify-between py-1.5 group border-b border-transparent hover:border-gray-100 dark:hover:border-gray-800`}>
                                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                        {material.type === 'video' ? <Video className={`h-4 w-4 ${goldAccent} flex-shrink-0`} /> : <FileText className={`h-4 w-4 ${goldAccent} flex-shrink-0`} />}
                                                        <span className={`text-sm ${midBrown} truncate`} title={material.title}>{material.title}</span>
                                                        {material.contentUrl && <a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className={`text-xs ${linkClasses} ml-1 flex-shrink-0`}>(Link)</a>}
                                                    </div>
                                                    <div className="flex items-center gap-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-7 w-7`} aria-label={`Edit ${material.title}`} onClick={() => openMaterialModal(material, week.id)}><Edit className="h-3.5 w-3.5" /></Button>
                                                        <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-7 w-7`} aria-label={`Delete ${material.title}`}
                                                            onClick={() => handleDeleteMaterial(material.id, week.id, material.title)}
                                                            ><Trash2 className="h-3.5 w-3.5" /></Button>
                                                    </div>
                                                </div>
                                             ))}
                                             <Button variant="outline" size="sm" className={`${outlineButtonClasses} mt-3 text-xs h-8`} onClick={() => openMaterialModal(null, week.id)}>
                                                <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Material
                                            </Button>
                                        </div>
                                        <div>
                                             <h4 className={`text-sm font-semibold mb-3 pb-2 border-b ${inputBorder} ${deepBrown}`}>Quizzes & Assignments</h4>
                                             {details.quizzes.length === 0 && <p className={`text-xs ${mutedText}`}>No quizzes added yet.</p>}
                                             {details.quizzes.map((quiz, index) => (
                                                 <div key={`${quiz.id}-${index}`} className={`flex items-center justify-between py-1.5 group border-b border-transparent hover:border-gray-100 dark:hover:border-gray-800`}>
                                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                        <HelpCircle className={`h-4 w-4 ${goldAccent} flex-shrink-0`} />
                                                        <span className={`text-sm ${midBrown} truncate`} title={quiz.title}>{quiz.title}</span>
                                                        {quiz.quizUrl && <a href={quiz.quizUrl} target="_blank" rel="noopener noreferrer" className={`text-xs ${linkClasses} ml-1 flex-shrink-0`}>(Link)</a>}
                                                    </div>
                                                    <div className="flex items-center gap-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-7 w-7`} aria-label={`Edit ${quiz.title}`} onClick={() => openQuizModal(quiz, week.id)}><Edit className="h-3.5 w-3.5" /></Button>
                                                        <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-7 w-7`} aria-label={`Delete ${quiz.title}`}
                                                            onClick={() => handleDeleteQuiz(quiz.id, week.id, quiz.title)}
                                                            ><Trash2 className="h-3.5 w-3.5" /></Button>
                                                    </div>
                                                </div>
                                             ))}
                                             <Button variant="outline" size="sm" className={`${outlineButtonClasses} mt-3 text-xs h-8`} onClick={() => openQuizModal(null, week.id)}>
                                                <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Quiz
                                            </Button>
                                        </div>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                        )
                    })}
                    </div>
                 )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

       <CreateEditCourseModal
        isOpen={showCourseModal}
        onClose={() => { setShowCourseModal(false); setEditingCourse(null); }}
        course={editingCourse}
        onSave={handleSaveCourse}
        existingMonthOrders={existingMonthOrders}
       />
      <CreateEditWeekModal
        isOpen={showWeekModal}
        onClose={() => { setShowWeekModal(false); setEditingWeek(null); }}
        week={editingWeek}
        courseId={selectedCourseForContent?.id}
        onSave={handleSaveWeek}
        existingWeekNumbers={courseWeeks.filter(w => w.id !== editingWeek?.id).map(w => w.weekNumber)}
        />
      <CreateEditMaterialModal
         isOpen={showMaterialModal}
         onClose={() => { setShowMaterialModal(false); setEditingMaterial(null); setCurrentWeekIdForModal(undefined); }}
         material={editingMaterial}
         weekId={currentWeekIdForModal}
         onSave={handleSaveMaterial}
        />
      <CreateEditQuizModal
        isOpen={showQuizModal}
        onClose={() => { setShowQuizModal(false); setEditingQuiz(null); setCurrentWeekIdForModal(undefined); }}
        quiz={editingQuiz}
        weekId={currentWeekIdForModal}
        onSave={handleSaveQuiz}
        />
      <ConfirmationModal
            isOpen={showDeleteConfirmModal}
            onClose={() => { setShowDeleteConfirmModal(false); setItemToDelete(null); setIsDeleting(false); }}
            onConfirm={executeDelete}
            title={`Confirm ${itemToDelete?.type || ''} Deletion`}
            message={
                itemToDelete?.type === 'course' ? (
                 <>
                    Are you sure you want to delete the course: <strong className={deepBrown}>"{itemToDelete?.title}"</strong>?
                    <br /> <br />
                    <span className="font-semibold text-red-600 dark:text-red-400">This action will permanently delete the course AND all its associated weeks, materials, and quizzes. This cannot be undone.</span>
                 </>
                ) : itemToDelete?.type === 'week' ? (
                 <>
                    Are you sure you want to delete the week: <strong className={deepBrown}>"{itemToDelete?.title}"</strong>?
                    <br /> <br />
                     <span className="font-semibold text-red-600 dark:text-red-400">This action will permanently delete the week AND all its associated materials and quizzes. This cannot be undone.</span>
                 </>
                ) : (
                 <>
                    Are you sure you want to delete the {itemToDelete?.type}: <strong className={deepBrown}>"{itemToDelete?.title}"</strong>?
                 </>
                )
            }
            confirmText={`Delete ${itemToDelete?.type || 'Item'}`}
            confirmVariant="destructive"
            isConfirming={isDeleting}
       />

    </div>
  );
};

export default AdminCourseManagementPage;