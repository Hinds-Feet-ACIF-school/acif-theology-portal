import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js"; // Assuming .ts or .tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js"; // Assuming .ts or .tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js"; // Assuming .ts or .tsx
import { BookOpen, PlusCircle, Edit, Trash2, ArrowLeft, FileText, Video, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import * as apiService from "../../services/api.js"; // Assuming .ts
import CreateEditCourseModal from "../../components/modals/CreateEditCourseModal.js"; // Assuming .tsx
import CreateEditWeekModal from "../../components/modals/CreateEditWeekModal.js";       // Assuming .tsx
import CreateEditMaterialModal from "../../components/modals/CreateEditMaterialModal.js"; // Assuming .tsx
import CreateEditQuizModal from "../../components/modals/CreateEditQuizModal.js";         // Assuming .tsx

// --- Interfaces (Unchanged) ---
export interface Course {
  id: string;
  title: string;
  description?: string;
  monthOrder: number;
  instructor?: string;
  instructorName?: string;
  ects?: number;
}

export interface Week {
  id: string;
  courseId: string;
  weekNumber: number;
  title: string;
  description?: string;
  materials?: Material[];
  quizzes?: Quiz[];
}

export interface Material {
  id: string;
  weekId: string;
  title: string;
  type: 'video' | 'reading' | 'resource'; // Removed 'quiz' type from here
  contentUrl?: string;
  details?: string;
}

export interface Quiz {
  id: string;
  weekId: string;
  title: string;
  description?: string;
  instructions?: string;
  quizUrl?: string;
  points?: number;
  dueDateOffsetDays?: number | null;
}
// --- End Interfaces ---

// --- Style Constants (Unchanged) ---
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
const tabsTriggerClasses = `px-3 py-1.5 text-sm font-medium rounded-md ${midBrown} data-[state=active]:${deepBrown} data-[state=active]:${lightCardBg} dark:data-[state=active]:${darkCardBg} data-[state=active]:shadow-sm`;
// --- End Style Constants ---


// --- Component ---
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

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const fetchWeekDetails = useCallback(async (weekId: string) => {
    if (!weekId || (contentDetails[weekId] && !contentDetails[weekId].error && !contentDetails[weekId].loading && contentDetails[weekId].materials?.length > 0)) {
        return;
    }
    console.log(`Fetching details for week ${weekId}`);
    setContentDetails(prev => ({
        ...prev,
        [weekId]: { materials: prev[weekId]?.materials || [], quizzes: prev[weekId]?.quizzes || [], loading: true, error: null }
    }));
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

  const fetchWeeksAndDetailsForCourse = async (courseId: string) => {
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
            // *** FIX: Add type annotation for 'week' parameter ***
            const results = await Promise.allSettled(sortedWeeks.map((week: Week) => fetchWeekDetails(week.id)));
            console.log("Finished fetching week details batch.");
             results.forEach((result, index) => {
                 if (result.status === 'rejected') {
                     console.error(`Failed to fetch details for week ${sortedWeeks[index].id}:`, result.reason);
                 }
             });
          }
      } catch (err: any) {
          console.error(`Error fetching weeks for course ${courseId}:`, err);
          setError(err.message || `Failed to fetch weeks for course`);
          setIsLoadingWeeks(false);
          setContentDetails({});
      }
  };

  const handleSelectCourseForContent = (course: Course) => {
    if (!course || !course.id) return;
    console.log("Selecting course for content management:", course.title);
    setActiveTab("content");
    setSelectedCourseForContent(course);
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

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
     if (window.confirm(`DELETE COURSE: "${courseTitle}"?\n\nThis will delete the course AND all its associated weeks, materials, and quizzes.\nThis action cannot be undone.`)) {
        console.log("Deleting course:", courseId, courseTitle);
        setError(null);
        try {
            await apiService.deleteCourse(courseId);
            console.log("Course deleted successfully");
            await fetchCourses();
            if (selectedCourseForContent?.id === courseId) {
                setSelectedCourseForContent(null);
                setCourseWeeks([]);
                setContentDetails({});
                setActiveTab('courses');
            }
        } catch (err: any) {
             console.error("Error deleting course:", err);
             setError(err.message || "Failed to delete course");
        }
     }
  };

  const handleSaveWeek = async (weekData: Week | Omit<Week, 'id'>) => {
    const isEditing = 'id' in weekData;
    console.log(isEditing ? "Saving updated week:" : "Creating new week:", weekData);
    setError(null);
    try {
        let savedWeek;
        if (isEditing) {
            savedWeek = await apiService.updateWeek(weekData.id, weekData);
        } else {
             if (!selectedCourseForContent?.id) throw new Error("Cannot create week without a selected course.");
             const dataToCreate = { ...weekData, courseId: selectedCourseForContent.id };
             savedWeek = await apiService.createWeek(dataToCreate);
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
     const isEditing = !(materialData instanceof FormData) && 'id' in materialData;
     const idToUpdate = isEditing ? (materialData as Material).id : undefined;
     console.log(isEditing ? "Saving updated material:" : "Creating new material:", materialData);
     try {
         if (isEditing && idToUpdate) {
             await apiService.updateMaterial(idToUpdate, materialData as Material);
         } else {
             await apiService.createMaterial(materialData as FormData);
         }
         setShowMaterialModal(false);
         setEditingMaterial(null);
         if (currentWeekIdForModal) {
            await fetchWeekDetails(currentWeekIdForModal);
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
    console.log(isEditing ? "Saving updated quiz:" : "Creating new quiz:", quizData);
    try {
        if (isEditing) {
            await apiService.updateQuiz(quizData.id, quizData);
        } else {
            if (!currentWeekIdForModal) throw new Error("Missing weekId for new quiz");
            const dataToCreate = { ...quizData, weekId: currentWeekIdForModal };
            await apiService.createQuiz(dataToCreate);
        }
        setShowQuizModal(false);
        setEditingQuiz(null);
        if (currentWeekIdForModal) {
            await fetchWeekDetails(currentWeekIdForModal);
        }
        setCurrentWeekIdForModal(undefined);
    } catch (err: any) {
        console.error("Error saving quiz:", err);
        throw err;
    }
   };

    const handleDeleteWeek = async (weekId: string, weekTitle: string) => {
       if (window.confirm(`DELETE WEEK: "${weekTitle}"?\n\nThis will delete the week AND all its materials and quizzes.\nThis action cannot be undone.`)) {
          console.log('Deleting Week', weekId);
          setError(null);
          try {
              await apiService.deleteWeek(weekId);
              console.log("Week deleted successfully");
               if (selectedCourseForContent?.id) {
                   await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
               }
          } catch (err:any) {
              console.error("Error deleting week:", err);
              setError(err.message || "Failed to delete week");
          }
       }
    };

    const handleDeleteMaterial = async (materialId: string, weekId: string, materialTitle: string) => {
         if (window.confirm(`Delete Material: "${materialTitle}"?`)) {
            console.log('Deleting Material', materialId, 'from week', weekId);
             setError(null);
             try {
                await apiService.deleteMaterial(materialId);
                console.log("Material deleted successfully");
                await fetchWeekDetails(weekId);
             } catch (err: any) {
                 console.error("Error deleting material:", err);
                 setError(err.message || "Failed to delete material");
             }
         }
    };

    const handleDeleteQuiz = async (quizId: string, weekId: string, quizTitle: string) => {
        if (window.confirm(`Delete Quiz: "${quizTitle}"?`)) {
            console.log('Deleting Quiz', quizId, 'from week', weekId);
            setError(null);
            try {
                await apiService.deleteQuiz(quizId);
                 console.log("Quiz deleted successfully");
                await fetchWeekDetails(weekId);
            } catch (err: any) {
                 console.error("Error deleting quiz:", err);
                 setError(err.message || "Failed to delete quiz");
            }
        }
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

  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      <div className="container px-4 py-8 md:px-6 lg:py-12">

        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin" className={`flex items-center ${linkClasses} text-sm`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Course Management</h1>
            <p className={`${midBrown} mt-1`}>Manage the 6-month program structure and content.</p>
          </div>
          <Button className={primaryButtonClasses} onClick={() => { setEditingCourse(null); setShowCourseModal(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2 text-sm"><AlertCircle className="h-5 w-5"/> {error}</div>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className={`rounded-lg p-1 ${tabsListBg}`}>
            <TabsTrigger value="courses" className={tabsTriggerClasses}>Program Structure (6 Courses)</TabsTrigger>
            <TabsTrigger value="content" disabled={!selectedCourseForContent} className={tabsTriggerClasses}>Weekly Content</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
             <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={deepBrown}>6-Month Program Overview</CardTitle>
                <CardDescription className={midBrown}>Define the 6 core courses for the program, ordered by month.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingCourses ? (
                  <div className="flex justify-center items-center p-10"><Loader2 className={`h-8 w-8 animate-spin ${goldAccent}`} /></div>
                ) : !courses || courses.length === 0 ? (
                  <div className={`p-6 text-center ${mutedText}`}>No courses defined yet. Use 'Add New Course'.</div>
                ) : (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className={tableHeaderBg}>
                        <tr className={tableRowBorder}>
                          <th className={tableHeaderClasses}>Month</th>
                          <th className={tableHeaderClasses}>Course Title</th>
                          <th className={tableHeaderClasses}>Instructor</th>
                          <th className={tableHeaderClasses}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* *** FIX: Add type annotation here *** */}
                        {courses.map((course: Course) => (
                          <tr key={course.id} className={tableRowBorder}>
                            <td className={`p-4 align-middle font-semibold ${deepBrown}`}>Month {course.monthOrder}</td>
                            <td className={tableCellClasses}>{course.title}</td>
                            <td className={tableCellClasses}>{course.instructorName || course.instructor || 'N/A'}</td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => handleSelectCourseForContent(course)}>
                                  <BookOpen className="mr-1 h-4 w-4" /> Manage Content
                                </Button>
                                <Button variant="ghost" size="icon" className={ghostButtonClasses} onClick={() => { setEditingCourse(course); setShowCourseModal(true); }} aria-label={`Edit ${course.title}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600`} onClick={() => handleDeleteCourse(course.id, course.title)} aria-label={`Delete ${course.title}`}>
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
                <CardContent className={`p-10 text-center ${mutedText}`}>
                  Please select a course from the "Program Structure" tab to manage its weekly content.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className={`text-2xl font-semibold ${deepBrown}`}>Manage Content for: <span className={goldAccent}>{selectedCourseForContent.title}</span></h2>
                    <p className={midBrown}>Add/edit weeks, learning materials, and quizzes.</p>
                  </div>
                  <Button className={primaryButtonClasses} onClick={() => { setEditingWeek(null); setShowWeekModal(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Week
                  </Button>
                </div>

                 {isLoadingWeeks ? (
                   <div className="flex justify-center items-center p-10"><Loader2 className={`h-8 w-8 animate-spin ${goldAccent}`}/></div>
                 ) : courseWeeks.length === 0 ? (
                      <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}><CardContent className={`p-6 text-center ${mutedText}`}>No weekly modules defined for this course yet. Use 'Add New Week'.</CardContent></Card>
                 ) : (
                    <div className="space-y-6">
                    {/* *** FIX: Add type annotation here *** */}
                    {courseWeeks.map((week: Week) => {
                        const details = contentDetails[week.id];
                        return (
                        <Card key={week.id} className={`${lightCardBg} ${darkCardBg} border ${inputBorder} overflow-hidden`}>
                           <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start gap-2">
                                <div>
                                    <CardTitle className={`flex items-center gap-2 ${deepBrown} text-lg`}>
                                    Week {week.weekNumber}: {week.title || `Week ${week.weekNumber} Title Needed`}
                                    </CardTitle>
                                    <CardDescription className={`${midBrown} text-sm mt-1`}>{week.description || 'No description provided.'}</CardDescription>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => { setEditingWeek(week); setShowWeekModal(true); }} aria-label={`Edit Week ${week.weekNumber}`}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                     <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-8 w-8`} onClick={() => handleDeleteWeek(week.id, week.title || `Week ${week.weekNumber}`)} aria-label={`Delete Week ${week.weekNumber}`}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                </div>
                            </CardHeader>
                             <CardContent className="p-4 md:p-6">
                                {details?.loading && <div className={`flex justify-center items-center p-4 ${midBrown} text-sm`}><Loader2 className={`h-5 w-5 animate-spin ${goldAccent} mr-2`}/> Loading details...</div>}
                                {details?.error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {details.error}</div>}

                                {details && !details.loading && !details.error && (
                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4`}>
                                        {/* Learning Materials Column */}
                                        <div>
                                            <h3 className={`font-semibold mb-3 text-base ${deepBrown}`}>Learning Materials</h3>
                                            <div className="space-y-2">
                                                {details.materials.length === 0 ? (
                                                    <p className={`text-sm italic ${mutedText}`}>No materials added.</p>
                                                ) : (
                                                    details.materials.map(material => (
                                                        <div key={material.id} className={`flex items-center justify-between p-2 rounded-md border ${inputBorder} bg-gray-50/50 dark:bg-gray-800/30 text-sm`}>
                                                            <div className={`flex items-center gap-2 overflow-hidden ${midBrown}`}>
                                                                {material.type === 'video' ? <Video className={`h-4 w-4 ${goldAccent} flex-shrink-0`}/> : material.type === 'reading' ? <BookOpen className={`h-4 w-4 ${goldAccent} flex-shrink-0`}/> : <FileText className={`h-4 w-4 ${goldAccent} flex-shrink-0`}/>}
                                                                <span className="truncate" title={material.title}>{material.title}</span>
                                                                {material.details && <span className={`text-xs ${mutedText} flex-shrink-0`}>({material.details})</span>}
                                                            </div>
                                                            <div className="flex items-center gap-0 flex-shrink-0">
                                                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-7 w-7`} aria-label={`Edit ${material.title}`} onClick={() => openMaterialModal(material, week.id)}><Edit className="h-3.5 w-3.5" /></Button>
                                                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-7 w-7`} aria-label={`Delete ${material.title}`} onClick={() => handleDeleteMaterial(material.id, week.id, material.title)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                <Button variant="outline" size="sm" className={`w-full mt-2 ${outlineButtonClasses}`} onClick={() => openMaterialModal(null, week.id)} >
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Material
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Quizzes Column */}
                                        <div>
                                            <h3 className={`font-semibold mb-3 text-base ${deepBrown}`}>Quizzes</h3>
                                            <div className="space-y-2">
                                                 {details.quizzes.length === 0 ? (
                                                    <p className={`text-sm italic ${mutedText}`}>No quizzes added.</p>
                                                ) : (
                                                    details.quizzes.map(quiz => (
                                                        <div key={quiz.id} className={`flex items-center justify-between p-2 rounded-md border ${inputBorder} bg-gray-50/50 dark:bg-gray-800/30 text-sm`}>
                                                            <div className={`flex items-center gap-2 overflow-hidden ${midBrown}`}>
                                                                <HelpCircle className={`h-4 w-4 ${goldAccent} flex-shrink-0`}/>
                                                                <span className="truncate" title={quiz.title}>{quiz.title}</span>
                                                                {quiz.dueDateOffsetDays !== null && typeof quiz.dueDateOffsetDays === 'number' && <span className={`text-xs ${mutedText} flex-shrink-0 whitespace-nowrap`}>(Due +{quiz.dueDateOffsetDays}d)</span>}
                                                            </div>
                                                            <div className="flex items-center gap-0 flex-shrink-0">
                                                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-7 w-7`} aria-label={`Edit ${quiz.title}`} onClick={() => openQuizModal(quiz, week.id)}><Edit className="h-3.5 w-3.5" /></Button>
                                                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-7 w-7`} aria-label={`Delete ${quiz.title}`} onClick={() => handleDeleteQuiz(quiz.id, week.id, quiz.title)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                <Button variant="outline" size="sm" className={`w-full mt-2 ${outlineButtonClasses}`} onClick={() => openQuizModal(null, week.id)}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Quiz
                                                </Button>
                                            </div>
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

      {/* Modals */}
      <CreateEditCourseModal
        isOpen={showCourseModal}
        onClose={() => { setShowCourseModal(false); setEditingCourse(null); }}
        course={editingCourse}
        onSave={handleSaveCourse}
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
    </div>
  );
};

export default AdminCourseManagementPage;