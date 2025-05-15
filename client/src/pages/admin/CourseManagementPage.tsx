  import React, { useState, useEffect, useCallback } from "react";
  import { Link } from "react-router-dom";
  import { Button } from "../../components/ui/button.js";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
  import {
      BookOpen, PlusCircle, Edit, Trash2, ArrowLeft, FileText, Video, Loader2, AlertCircle, HelpCircle,
      X, GripVertical, Eye as EyeIcon
  } from 'lucide-react';
  import * as apiService from "../../services/api";

  import CreateEditCourseModal from "../../components/modals/CreateEditCourseModal.js";
  import CreateEditWeekModal from "../../components/modals/CreateEditWeekModal.js";


  import CreateEditSectionModal from "../../components/modals/CreateEditSectionModal.js";
  import CreateEditContentModal from "../../components/modals/CreateEditContentModal";
  import SectionPreviewModal from "../../components/modals/SectionPreviewModal";
  import ConfirmationModal from "../../components/modals/ConfirmationModal.js";


  import {
    ContentItem,
    Section,
    Course,
    Week,
    Material,
    Quiz,
    type SectionData as ApiSectionData,
    type ContentData as ApiContentData,

  } from "../../services/api";


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
  const tabsTriggerClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out ${midBrown} hover:bg-gray-200/60 dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C5A467] dark:focus-visible:ring-offset-gray-950 data-[state=active]:${goldBg} data-[state=active]:text-red-600 dark:text-red-400data-[state=active]:font-semibold data-[state=active]:shadow-md data-[state=active]:hover:${goldBgHover} disabled:opacity-50 disabled:pointer-events-none`;

  export default function AdminCourseManagementPage() {
    const [activeTab, setActiveTab] = useState("courses");
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseForContent, setSelectedCourseForContent] = useState<Course | null>(null);
    const [courseWeeks, setCourseWeeks] = useState<Week[]>([]);
    const [contentDetails, setContentDetails] = useState<{ [weekId: string]: { sections: Section[], loading: boolean, error: string | null } }>({});
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
    const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string; type: 'course' | 'week' | 'material' | 'quiz' | 'section' | 'content'; weekId?: string; sectionId?: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);


    const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
    const [currentSectionIdForModal, setCurrentSectionIdForModal] = useState<string | undefined>(undefined);
    const [showContentModal, setShowContentModal] = useState(false);



    const [showSectionPreviewModal, setShowSectionPreviewModal] = useState(false);
    const [sectionToPreview, setSectionToPreview] = useState<Section | null>(null);

    const openSectionPreview = (section: Section) => {
        setSectionToPreview(section);
        setShowSectionPreviewModal(true);
    };

    const existingMonthOrders = courses
      .filter(c => editingCourse ? c.id !== editingCourse.id : true)
      .map(c => c.monthOrder);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
      setIsLoadingCourses(true); setError(null);
      try {
        const fetchedCourses = await apiService.getCoursesForAdmin();
        setCourses(fetchedCourses.sort((a, b) => a.monthOrder - b.monthOrder));
      } catch (err: any) { setError(err.message || "Failed to fetch courses"); }
      finally { setIsLoadingCourses(false); }
    };

    const fetchWeekDetails = useCallback(async (weekId: string, forceRefresh = false) => {
      if (!weekId) return;
      if (!forceRefresh && contentDetails[weekId] && !contentDetails[weekId].error && !contentDetails[weekId].loading) return;

      setContentDetails(prev => ({ ...prev, [weekId]: { sections: prev[weekId]?.sections || [], loading: true, error: null } }));
      try {
          const sectionsFromApi = await apiService.getSectionsByWeek(weekId);
          const sortedSections = sectionsFromApi.sort((a,b) => (a.order || 0) - (b.order || 0));

          const sectionsWithSortedContent = sortedSections.map(section => ({
              ...section,
              content: (section.content || []).sort((a,b) => (a.order || 0) - (b.order || 0)) as ContentItem[]
          }));
          setContentDetails(prev => ({ ...prev, [weekId]: { sections: sectionsWithSortedContent, loading: false, error: null } }));
      } catch (err: any) {
          const errorMessage = (err as any).response?.data?.message || (err as Error).message;
          if (errorMessage.includes("index is currently building")) {
              setContentDetails(prev => ({ ...prev, [weekId]: { sections: prev[weekId]?.sections || [], loading: false, error: "The database is currently being updated. Please try again in a few moments." } }));
              setTimeout(() => fetchWeekDetails(weekId, true), 5000);
          } else {
              setContentDetails(prev => ({ ...prev, [weekId]: { sections: prev[weekId]?.sections || [], loading: false, error: errorMessage || 'Failed to load details' } }));
          }
      }
    }, [contentDetails]);

    const fetchWeeksAndDetailsForCourse = useCallback(async (courseId: string) => {
        setIsLoadingWeeks(true); setCourseWeeks([]); setContentDetails({}); setError(null);
        try {
            const weeks = await apiService.getWeeksByCourse(courseId);
            const sortedWeeks = weeks.sort((a, b) => a.weekNumber - b.weekNumber);
            setCourseWeeks(sortedWeeks);

            if (sortedWeeks.length > 0) {
              for (const week of sortedWeeks) {
                  await fetchWeekDetails(week.id, false);
              }
            }
        } catch (err: any) { setError((err as Error).message || `Failed to fetch weeks`); }
        finally { setIsLoadingWeeks(false); }
    }, [fetchWeekDetails]);

    const handleSelectCourseForContent = (course: Course) => {
      if (!course || !course.id || course.id === selectedCourseForContent?.id) return;
      setSelectedCourseForContent(course);
      setActiveTab("content");
      fetchWeeksAndDetailsForCourse(course.id);
    };

    const handleSaveCourse = async (courseData: Omit<Course, 'id'> | Course) => {
      setError(null);
      try {
        if ('id' in courseData && courseData.id) {
          await apiService.updateCourse(courseData.id, courseData);
        } else {
          await apiService.createCourse(courseData as Omit<Course, 'id'>);
        }
        setShowCourseModal(false); setEditingCourse(null); await fetchCourses();
      } catch (err: any) { console.error("Error saving course:", err); throw err; }
    };

    const handleSaveWeek = async (weekData: Omit<Week, 'id'> | Week) => {
      setError(null);
      try {
          if ('id' in weekData && weekData.id) {
              await apiService.updateWeek(weekData.id, weekData);
          } else {
              if (!selectedCourseForContent?.id) throw new Error("No selected course to add week to.");
              await apiService.createWeek({ ...weekData, courseId: selectedCourseForContent.id } as Omit<Week, 'id'>);
          }
          setShowWeekModal(false); setEditingWeek(null);
          if (selectedCourseForContent?.id) await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
      } catch (err: any) { console.error("Error saving week:", err); throw err; }
    };


    const handleSaveMaterial = async (materialData: FormData | Omit<Material, 'id'> | Material) => {
      setError(null);
      const isFormData = materialData instanceof FormData;
      const idToUpdate = !isFormData && 'id' in materialData && materialData.id ? materialData.id : undefined;
      const weekIdForRefresh = isFormData ? materialData.get('weekId') as string : (materialData as Material).weekId;
      try {
          if (idToUpdate) {
              await apiService.updateMaterial(idToUpdate, materialData as Material);
          } else {
              await apiService.createMaterial(materialData as FormData | Omit<Material, 'id'>);
          }
          setShowMaterialModal(false); setEditingMaterial(null);
          if (weekIdForRefresh) { await fetchWeekDetails(weekIdForRefresh, true); setCurrentWeekIdForModal(undefined); }
      } catch (err: any) { console.error("Error saving material:", err); throw err; }
    };

    const handleSaveQuiz = async (quizData: Omit<Quiz, 'id'> | Quiz) => {
      setError(null);
      const weekIdForRefresh = ('id' in quizData && quizData.id) ? quizData.weekId : currentWeekIdForModal;
      try {
          if ('id' in quizData && quizData.id) {
              await apiService.updateQuiz(quizData.id, quizData);
          } else {
              if (!weekIdForRefresh) throw new Error("Missing weekId for new quiz");
              await apiService.createQuiz({ ...quizData, weekId: weekIdForRefresh } as Omit<Quiz, 'id'>);
          }
          setShowQuizModal(false); setEditingQuiz(null);
          if (weekIdForRefresh) await fetchWeekDetails(weekIdForRefresh, true);
          setCurrentWeekIdForModal(undefined);
      } catch (err: any) { console.error("Error saving quiz:", err); throw err; }
    };

    const handleSaveSection = async (sectionData: Omit<Section, 'id' | 'content'> | Section) => {
      setError(null);
      const weekIdForRefresh = ('id' in sectionData && sectionData.id) ? sectionData.weekId : currentWeekIdForModal;
      try {
          if ('id' in sectionData && sectionData.id) {
              await apiService.updateSection(sectionData.id, sectionData as Section);
          } else {
              if (!weekIdForRefresh) throw new Error("Missing weekId for new section");

              await apiService.createSection({ ...sectionData, weekId: weekIdForRefresh } as ApiSectionData);
          }
          setShowSectionModal(false); setEditingSection(null);
          if (weekIdForRefresh) await fetchWeekDetails(weekIdForRefresh, true);
          setCurrentWeekIdForModal(undefined);
      } catch (err: any) { console.error("Error saving section:", err); throw err; }
    };


    const handleSaveContent = async (contentData: ContentItem) => {
      setError(null);
      try {
        if (!currentSectionIdForModal) throw new Error("Section ID is required to save content.");


        const payloadForApi = { ...contentData, order: contentData.order || (editingContent?.order || 1) };

        if (editingContent?.id && contentData.id) {
          await apiService.updateContent(currentSectionIdForModal, contentData.id, payloadForApi as Partial<ApiContentData>);
        } else {

          await apiService.addContentToSection(currentSectionIdForModal, payloadForApi as ApiContentData);
        }


        const weekId = courseWeeks.find(w => contentDetails[w.id]?.sections.some(s => s.id === currentSectionIdForModal))?.id;
        if (weekId) await fetchWeekDetails(weekId, true);

        setShowContentModal(false);
        setEditingContent(null);
        setCurrentSectionIdForModal(undefined);
      } catch (err: any) {
        console.error("Error saving content:", err);
        throw err;
      }
    };

    const requestDeleteConfirmation = (id: string, title: string, type: 'course' | 'week' | 'material' | 'quiz' | 'section' | 'content', weekId?: string, sectionId?: string) => {
        setItemToDelete({ id, title, type, weekId, sectionId });
        setShowDeleteConfirmModal(true);
    };

    const executeDelete = async () => {
      if (!itemToDelete) return;
      setIsDeleting(true); setError(null);
      try {
          const { type, id, weekId, sectionId } = itemToDelete;
          switch (type) {
              case 'course':
                  await apiService.deleteCourse(id); await fetchCourses();
                  if (selectedCourseForContent?.id === id) { setSelectedCourseForContent(null); setCourseWeeks([]); setContentDetails({}); setActiveTab('courses'); }
                  break;
              case 'week':
                  await apiService.deleteWeek(id);
                  if (selectedCourseForContent?.id) await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
                  break;

              case 'material': if (!weekId) throw new Error("Week ID missing for material deletion"); await apiService.deleteMaterial(id); await fetchWeekDetails(weekId, true); break;
              case 'quiz': if (!weekId) throw new Error("Week ID missing for quiz deletion"); await apiService.deleteQuiz(id); await fetchWeekDetails(weekId, true); break;
              case 'section': if (!weekId) throw new Error("Week ID required for section deletion"); await apiService.deleteSection(id); await fetchWeekDetails(weekId, true); break;
              case 'content': if (!sectionId || !weekId) throw new Error("Section/Week ID required for content deletion"); await apiService.deleteContent(sectionId, id); await fetchWeekDetails(weekId, true); break;
          }
          setShowDeleteConfirmModal(false); setItemToDelete(null);
      } catch (err: any) { setError((err as Error).message || `Failed to delete ${itemToDelete.type}`); }
      finally { setIsDeleting(false); }
    };

    const handleDeleteCourse = (courseId: string, courseTitle: string) => requestDeleteConfirmation(courseId, courseTitle, 'course');
    const handleDeleteWeek = (weekId: string, weekTitle: string) => requestDeleteConfirmation(weekId, weekTitle, 'week');

    const handleDeleteMaterial = (materialId: string, weekId: string, materialTitle: string) => requestDeleteConfirmation(materialId, materialTitle, 'material', weekId);
    const handleDeleteQuiz = (quizId: string, weekId: string, quizTitle: string) => requestDeleteConfirmation(quizId, quizTitle, 'quiz', weekId);

    const handleDeleteSection = (sectionId: string, weekId: string, sectionTitle: string) => requestDeleteConfirmation(sectionId, sectionTitle, 'section', weekId);
    const handleDeleteContent = (contentId: string, contentTitle: string, sectionId: string) => {
      const weekId = courseWeeks.find(w => contentDetails[w.id]?.sections.some(s => s.id === sectionId))?.id;
      if (!weekId) { console.error("Could not find week ID for section:", sectionId); setError("Failed to delete content: parent week not found."); return; }
      requestDeleteConfirmation(contentId, contentTitle, 'content', weekId, sectionId);
    };


    const openMaterialModal = (material: Material | null, weekId: string) => { setEditingMaterial(material); setCurrentWeekIdForModal(weekId); setShowMaterialModal(true); };
    const openQuizModal = (quiz: Quiz | null, weekId: string) => { setEditingQuiz(quiz); setCurrentWeekIdForModal(weekId); setShowQuizModal(true); };

    const openSectionModal = (section: Section | null, weekId: string) => { setEditingSection(section); setCurrentWeekIdForModal(weekId); setShowSectionModal(true); };

    const openContentModal = (contentItem: ContentItem | null, sectionId: string) => { setEditingContent(contentItem); setCurrentSectionIdForModal(sectionId); setShowContentModal(true); };

    const renderAddSectionButtons = (weekId: string) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => openSectionModal(null, weekId)}>
          <PlusCircle className="mr-1.5 h-4 w-4" /> Add Section
        </Button>

      </div>
    );



    const getIconForContentType = (type: ContentItem['type'] | undefined) => {
      if (!type) return <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />;
      switch (type) {
          case 'text': return <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" />;
          case 'video': return <Video className="h-3.5 w-3.5 mr-1.5 text-purple-500" />;
          case 'quiz_link': return <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />;
          default:


              return <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />;
      }
    };

    const truncateHTML = (htmlString: string | undefined, maxLength: number = 100): string => {
      if (!htmlString) return "";
      const doc = new DOMParser().parseFromString(htmlString, 'text/html');
      const textContent = doc.body.textContent || "";
      return textContent.length > maxLength ? textContent.substring(0, maxLength) + "..." : textContent;
    };


    return (
      <div className={`p-4 md:p-6 lg:p-8 ${lightBg} ${darkBg} min-h-screen`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                  <Link to="/admin" className={`flex items-center ${linkClasses} text-sm mb-2`}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Admin Dashboard
                  </Link>
                  <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Course Management</h1>
                  <p className={`${midBrown} mt-1`}>Manage program courses and content.</p>
              </div>
              <Button className={primaryButtonClasses} onClick={() => { setEditingCourse(null); setShowCourseModal(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Course
              </Button>
          </div>

          {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center justify-between gap-2 text-sm dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                  <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5"/> <span>{error}</span> </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={() => setError(null)}> <X className="h-4 w-4" /> </Button>
              </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className={`rounded-lg p-1 ${tabsListBg} inline-flex`}>
                <TabsTrigger value="courses" className={tabsTriggerClasses}>Program Structure ({courses.length})</TabsTrigger>
                <TabsTrigger value="content" disabled={!selectedCourseForContent} className={tabsTriggerClasses}>Weekly Content</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-6">
                  <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                        <CardHeader> <CardTitle className={deepBrown}>Program Overview</CardTitle> </CardHeader>
                        <CardContent className="p-0">
                          {isLoadingCourses ? <div className="p-6 text-center"><Loader2 className={`h-6 w-6 animate-spin inline-block ${goldAccent}`}/></div>
                          : !courses.length ? <div className="p-6 text-center text-gray-500">No courses created.</div>
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
                                <tbody>{courses.map(course => (
                                    <tr key={course.id} className={`${tableRowBorder} hover:bg-gray-50/50 dark:hover:bg-gray-800/30`}>
                                      <td className={`p-4 align-middle font-semibold ${deepBrown}`}>M{course.monthOrder}</td>
                                      <td className={tableCellClasses}>{course.title}</td>
                                      <td className={tableCellClasses}>{course.instructorName || course.instructor || 'N/A'}</td>
                                      <td className="p-4 align-middle text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => handleSelectCourseForContent(course)}> <BookOpen className="mr-1 h-4 w-4" /> Manage </Button>
                                          <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => { setEditingCourse(course); setShowCourseModal(true); }}> <Edit className="h-4 w-4" /> </Button>
                                          <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-8 w-8`} onClick={() => handleDeleteCourse(course.id, course.title)}> <Trash2 className="h-4 w-4" /> </Button>
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
                    <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}> <CardContent className="p-6 text-center">
                        <BookOpen className={`mx-auto h-12 w-12 ${mutedText} mb-4`} />
                        <p className={`${midBrown} font-semibold`}>Select a Course</p> <p className={mutedText}>Choose a course to manage its content.</p>
                    </CardContent></Card>
                ) : (
                  <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6 ${inputBorder}">
                      <div>
                          <Button variant="ghost" size="sm" onClick={() => {setSelectedCourseForContent(null); setActiveTab('courses')}} className={`${ghostButtonClasses} mb-2 -ml-2`}> <ArrowLeft className="mr-1 h-4 w-4" /> Courses </Button>
                          <h2 className={`text-2xl font-semibold tracking-tight ${deepBrown}`}>{selectedCourseForContent.title}</h2>
                          <p className={mutedText}>Organize weekly learning materials.</p>
                      </div>
                      <Button className={primaryButtonClasses} onClick={() => { setEditingWeek(null); setShowWeekModal(true); }}> <PlusCircle className="mr-2 h-4 w-4" /> Add Week </Button>
                  </div>
                  {isLoadingWeeks ? <div className="p-6 text-center"><Loader2 className={`h-6 w-6 animate-spin inline-block ${goldAccent}`}/></div>
                    : !courseWeeks.length ? (
                      <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}> <CardContent className="p-6 text-center">
                          <HelpCircle className={`mx-auto h-12 w-12 ${mutedText} mb-4`} />
                          <p className={`${midBrown} font-semibold`}>No Weeks Yet</p> <p className={mutedText}>Add a week to start organizing content.</p>
                      </CardContent></Card>
                      )
                    : ( <div className="space-y-6"> {courseWeeks.map(week => {
                          const details = contentDetails[week.id];
                          return (
                          <Card key={week.id} className={`${lightCardBg} ${darkCardBg} border ${inputBorder} overflow-hidden`}>
                              <CardHeader className={`p-4 border-b ${inputBorder} flex flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30`}>
                                  <div> <CardTitle className={`text-lg ${deepBrown}`}>W{week.weekNumber}: {week.title}</CardTitle> {week.description && <CardDescription className={`mt-1 text-xs ${mutedText}`}>{week.description}</CardDescription>} </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                      <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => { setEditingWeek(week); setShowWeekModal(true); }}> <Edit className="h-4 w-4" /> </Button>
                                      <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-8 w-8`} onClick={() => handleDeleteWeek(week.id, week.title)}> <Trash2 className="h-4 w-4" /> </Button>
                                  </div>
                              </CardHeader>
                              <CardContent className="p-4 md:p-6">
                                  {!details ? <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => fetchWeekDetails(week.id, false)}> Load Details </Button>
                                  : details.loading ? <div className="flex items-center gap-2 text-sm text-gray-500"> <Loader2 className={`h-4 w-4 animate-spin ${goldAccent}`} /> Loading... </div>
                                  : details.error ? <div className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2"> <AlertCircle className="h-4 w-4"/> Error: {details.error} <Button variant="link" size="sm" className={`p-0 h-auto ${linkClasses}`} onClick={() => fetchWeekDetails(week.id, true)}> Retry </Button> </div>
                                  : ( <div className="space-y-4">
                                          <div className="flex justify-between items-center mb-4"> <h4 className={`text-sm font-semibold ${deepBrown}`}>Learning Sections</h4> {renderAddSectionButtons(week.id)} </div>
                                          {!details.sections.length ? <p className={`text-xs ${mutedText}`}>No sections added.</p>
                                          : ( <div className="space-y-4"> {details.sections.map(section => (
                                              <div key={section.id} className={`border ${inputBorder} rounded-lg p-3 group`}>
                                                  <div className="flex items-center justify-between mb-2">
                                                      <h5 className={`font-medium ${deepBrown} flex items-center`}> <GripVertical className="h-4 w-4 mr-2 text-gray-400 cursor-grab opacity-50 group-hover:opacity-100" /> S{section.order}: {section.title} </h5>
                                                      <div className="flex items-center gap-0.5">
                                                          <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-7 w-7`} onClick={() => openSectionPreview(section)} title="Preview Section"> <EyeIcon className="h-3.5 w-3.5" /> </Button>
                                                          <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-7 w-7`} onClick={() => openSectionModal(section, week.id)}> <Edit className="h-3.5 w-3.5" /> </Button>
                                                          <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-7 w-7`} onClick={() => handleDeleteSection(section.id, week.id, section.title)}> <Trash2 className="h-3.5 w-3.5" /> </Button>
                                                      </div>
                                                  </div>
                                                  {section.description && <p className={`text-xs ${mutedText} mt-1 mb-3 pl-6`}>{section.description}</p>}
                                                  <div className="space-y-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700 ml-2.5">
                                                      {!section.content?.length ? <p className={`text-xs ${mutedText} py-1`}>No content items.</p>
                                                      : section.content.map(item => (
                                                          <div key={item.id} className={`group/content-item flex items-center justify-between p-1.5 -ml-1.5 rounded hover:bg-gray-50/80 dark:hover:bg-gray-800/50`}>
                                                              <div className="flex items-center text-sm min-w-0">
                                                                  {getIconForContentType(item.type)}
                                                                  <span className={`${midBrown} truncate`}>{item.title || `Item ${item.order}`}</span>
                                                                  {item.isRequired && <span className="ml-1.5 text-xs text-red-500 shrink-0">(R)</span>}
                                                                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 truncate max-w-[150px] sm:max-w-[200px] group-hover/content-item:hidden block">
                                                                      {item.type === 'text' && item.richContent.find(rc => rc.type === 'text')?.content ? truncateHTML(item.richContent.find(rc => rc.type === 'text')?.content, 50) : item.url ? item.url.substring(0,50)+'...' : ''}
                                                                  </span>
                                                              </div>
                                                              <div className="flex items-center gap-0.5 opacity-0 group-hover/content-item:opacity-100 transition-opacity shrink-0">
                                                                  <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-6 w-6`} disabled={!item.id} onClick={() => { if (item.id) openContentModal(item, section.id); }}> <Edit className="h-3 w-3" /> </Button>
                                                                  <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-6 w-6`} disabled={!item.id} onClick={() => { if (item.id) handleDeleteContent(item.id, item.title || `Item ${item.order}`, section.id); }}> <Trash2 className="h-3 w-3" /> </Button>
                                                              </div>
                                                          </div>
                                                      ))}
                                                      <Button variant="outline" size="sm" className={`${outlineButtonClasses} text-xs h-7 mt-2`} onClick={() => openContentModal(null, section.id)}> <PlusCircle className="mr-1 h-3 w-3" /> Add Content Item </Button>
                                                  </div>
                                              </div>
                                          ))}</div>
                                          )}
                                      </div>
                                  )}
                              </CardContent>
                          </Card>
                          )
                      })} </div>
                  )}
                  </>
              )}
            </TabsContent>
          </Tabs>


        <CreateEditCourseModal isOpen={showCourseModal} onClose={() => { setShowCourseModal(false); setEditingCourse(null); }} course={editingCourse} onSave={handleSaveCourse} existingMonthOrders={existingMonthOrders} />
        <CreateEditWeekModal isOpen={showWeekModal} onClose={() => { setShowWeekModal(false); setEditingWeek(null); }} week={editingWeek} courseId={selectedCourseForContent?.id} onSave={handleSaveWeek} existingWeekNumbers={courseWeeks.filter(w => editingWeek ? w.id !== editingWeek.id : true).map(w => w.weekNumber)} />





        <CreateEditSectionModal isOpen={showSectionModal && !!currentWeekIdForModal} onClose={() => { setShowSectionModal(false); setEditingSection(null); setCurrentWeekIdForModal(undefined); }} section={editingSection} weekId={currentWeekIdForModal || ''} onSave={handleSaveSection} existingSectionOrders={currentWeekIdForModal ? contentDetails[currentWeekIdForModal]?.sections?.map(s => s.order || 0).filter(o => editingSection ? o !== editingSection.order : true) || [] : []} />



        <CreateEditContentModal
            isOpen={showContentModal}
            onClose={() => {
                setShowContentModal(false);
                setEditingContent(null);
                setCurrentSectionIdForModal(undefined);
            }}
            content={editingContent}
            sectionId={currentSectionIdForModal || ''}
            onSave={handleSaveContent}
        />

        {showSectionPreviewModal && sectionToPreview && (
            <SectionPreviewModal
                isOpen={showSectionPreviewModal}
                onClose={() => {
                    setShowSectionPreviewModal(false);
                    setSectionToPreview(null);
                }}
                section={sectionToPreview}
            />
        )}

        <ConfirmationModal isOpen={showDeleteConfirmModal} onClose={() => { setShowDeleteConfirmModal(false); setItemToDelete(null); setIsDeleting(false); }} onConfirm={executeDelete} title={`Confirm ${itemToDelete?.type || ''} Deletion`} message={`Are you sure you want to delete this ${itemToDelete?.type || 'item'} "${itemToDelete?.title || ''}"? This action cannot be undone.`} confirmText={`Delete ${itemToDelete?.type || 'Item'}`} confirmVariant="destructive" isConfirming={isDeleting} />

      </div>
    );
  };