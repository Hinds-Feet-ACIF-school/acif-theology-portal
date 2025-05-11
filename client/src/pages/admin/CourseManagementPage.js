import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { BookOpen, PlusCircle, Edit, Trash2, ArrowLeft, FileText, Video, Loader2, AlertCircle, HelpCircle, X, GripVertical, Eye as EyeIcon // Consolidated EyeIcon import
 } from 'lucide-react';
import * as apiService from "../../services/api.js";
import CreateEditCourseModal from "../../components/modals/CreateEditCourseModal.js";
import CreateEditWeekModal from "../../components/modals/CreateEditWeekModal.js";
import CreateEditMaterialModal from "../../components/modals/CreateEditMaterialModal.js";
import CreateEditQuizModal from "../../components/modals/CreateEditQuizModal.js";
import CreateEditSectionModal from "../../components/modals/CreateEditSectionModal.js";
import CreateEditContentModal from "../../components/modals/CreateEditContentModal.js";
import SectionPreviewModal from "../../components/modals/SectionPreviewModal.js"; // For section preview
import ConfirmationModal from "../../components/modals/ConfirmationModal.js";
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
const tabsTriggerClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out ${midBrown} hover:bg-gray-200/60 dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C5A467] dark:focus-visible:ring-offset-gray-950 data-[state=active]:${goldBg} data-[state=active]:text-[#2A0F0F] data-[state=active]:font-semibold data-[state=active]:shadow-md data-[state=active]:hover:${goldBgHover} disabled:opacity-50 disabled:pointer-events-none`;
// Removed the text-red-600 dark:text-red-400 from tabsTriggerClasses as it seemed unintentional for all triggers
export default function AdminCourseManagementPage() {
    const [activeTab, setActiveTab] = useState("courses");
    const [courses, setCourses] = useState([]);
    const [selectedCourseForContent, setSelectedCourseForContent] = useState(null);
    const [courseWeeks, setCourseWeeks] = useState([]);
    const [contentDetails, setContentDetails] = useState({});
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
    const [error, setError] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [showWeekModal, setShowWeekModal] = useState(false);
    const [editingWeek, setEditingWeek] = useState(null);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [currentWeekIdForModal, setCurrentWeekIdForModal] = useState(undefined);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [editingContent, setEditingContent] = useState(null); // Uses imported ContentItem
    const [currentSectionIdForModal, setCurrentSectionIdForModal] = useState(undefined);
    const [showContentModal, setShowContentModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    // const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null); // Not used yet
    // State for Section Preview Modal
    const [showSectionPreviewModal, setShowSectionPreviewModal] = useState(false);
    const [sectionToPreview, setSectionToPreview] = useState(null);
    const openSectionPreview = (section) => {
        setSectionToPreview(section);
        setShowSectionPreviewModal(true);
    };
    // sectionTemplates definition... (Ensure types used within match api.js if they become actual ContentItems)
    // For now, assuming they are just template structures.
    const sectionTemplates = {
        'basic': {
            title: 'Basic Learning Section',
            description: 'A simple section with notes and required reading',
            metadata: { estimatedTime: '30 minutes', difficulty: 'Beginner', tags: ['reading', 'notes'] },
            content: [
                { type: 'text', title: 'Introduction', textContent: '<p>Welcome to this section...</p>', order: 1, isRequired: true }, // Example using textContent for simple text
                { type: 'text', title: 'Key Concepts', textContent: '<p>The main concepts covered...</p>', order: 2, isRequired: true }
            ]
        },
        // ... other templates
    };
    const existingMonthOrders = courses
        .filter(c => editingCourse ? c.id !== editingCourse.id : true)
        .map(c => c.monthOrder);
    useEffect(() => { fetchCourses(); }, []);
    const fetchCourses = async () => {
        setIsLoadingCourses(true);
        setError(null);
        try {
            const fetchedCourses = await apiService.getCoursesForAdmin();
            setCourses(fetchedCourses.sort((a, b) => a.monthOrder - b.monthOrder));
        }
        catch (err) {
            setError(err.message || "Failed to fetch courses");
        }
        finally {
            setIsLoadingCourses(false);
        }
    };
    const fetchWeekDetails = useCallback(async (weekId, forceRefresh = false) => {
        if (!weekId)
            return;
        if (!forceRefresh && contentDetails[weekId] && !contentDetails[weekId].error && !contentDetails[weekId].loading)
            return;
        setContentDetails(prev => ({ ...prev, [weekId]: { sections: prev[weekId]?.sections || [], loading: true, error: null } }));
        try {
            const sectionsFromApi = await apiService.getSectionsByWeek(weekId);
            const sortedSections = sectionsFromApi.sort((a, b) => (a.order || 0) - (b.order || 0));
            const sectionsWithSortedContent = sortedSections.map(section => ({
                ...section,
                content: (section.content || []).sort((a, b) => (a.order || 0) - (b.order || 0))
            }));
            setContentDetails(prev => ({ ...prev, [weekId]: { sections: sectionsWithSortedContent, loading: false, error: null } }));
        }
        catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            if (errorMessage.includes("index is currently building")) {
                setContentDetails(prev => ({ ...prev, [weekId]: { sections: prev[weekId]?.sections || [], loading: false, error: "The database is currently being updated. Please try again in a few moments." } }));
                setTimeout(() => fetchWeekDetails(weekId, true), 5000);
            }
            else {
                setContentDetails(prev => ({ ...prev, [weekId]: { sections: prev[weekId]?.sections || [], loading: false, error: errorMessage || 'Failed to load details' } }));
            }
        }
    }, [contentDetails]);
    const fetchWeeksAndDetailsForCourse = useCallback(async (courseId) => {
        setIsLoadingWeeks(true);
        setCourseWeeks([]);
        setContentDetails({});
        setError(null);
        try {
            const weeks = await apiService.getWeeksByCourse(courseId);
            const sortedWeeks = weeks.sort((a, b) => a.weekNumber - b.weekNumber);
            setCourseWeeks(sortedWeeks);
            if (sortedWeeks.length > 0) {
                sortedWeeks.forEach((week) => fetchWeekDetails(week.id, false));
            }
        }
        catch (err) {
            setError(err.message || `Failed to fetch weeks`);
        }
        finally {
            setIsLoadingWeeks(false);
        }
    }, [fetchWeekDetails]);
    const handleSelectCourseForContent = (course) => {
        if (!course || !course.id || course.id === selectedCourseForContent?.id)
            return;
        setSelectedCourseForContent(course);
        setActiveTab("content");
        fetchWeeksAndDetailsForCourse(course.id);
    };
    const handleSaveCourse = async (courseData) => {
        setError(null);
        try {
            if ('id' in courseData) {
                await apiService.updateCourse(courseData.id, courseData);
            }
            else {
                await apiService.createCourse(courseData);
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            await fetchCourses();
        }
        catch (err) {
            console.error("Error saving course:", err);
            throw err;
        }
    };
    const handleSaveWeek = async (weekData) => {
        setError(null);
        try {
            if ('id' in weekData) {
                await apiService.updateWeek(weekData.id, weekData);
            }
            else {
                if (!selectedCourseForContent?.id)
                    throw new Error("No selected course.");
                await apiService.createWeek({ ...weekData, courseId: selectedCourseForContent.id });
            }
            setShowWeekModal(false);
            setEditingWeek(null);
            if (selectedCourseForContent?.id)
                await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
        }
        catch (err) {
            console.error("Error saving week:", err);
            throw err;
        }
    };
    const handleSaveMaterial = async (materialData) => {
        setError(null);
        const isFormData = materialData instanceof FormData;
        const idToUpdate = !isFormData && 'id' in materialData ? materialData.id : undefined;
        const weekIdForRefresh = isFormData ? materialData.get('weekId') : materialData.weekId;
        try {
            if (idToUpdate) {
                await apiService.updateMaterial(idToUpdate, materialData);
            }
            else {
                await apiService.createMaterial(materialData);
            }
            setShowMaterialModal(false);
            setEditingMaterial(null);
            if (weekIdForRefresh) {
                await fetchWeekDetails(weekIdForRefresh, true);
                setCurrentWeekIdForModal(undefined);
            }
        }
        catch (err) {
            console.error("Error saving material:", err);
            throw err;
        }
    };
    const handleSaveQuiz = async (quizData) => {
        setError(null);
        const weekIdForRefresh = 'id' in quizData ? quizData.weekId : currentWeekIdForModal;
        try {
            if ('id' in quizData) {
                await apiService.updateQuiz(quizData.id, quizData);
            }
            else {
                if (!weekIdForRefresh)
                    throw new Error("Missing weekId for new quiz");
                await apiService.createQuiz({ ...quizData, weekId: weekIdForRefresh });
            }
            setShowQuizModal(false);
            setEditingQuiz(null);
            if (weekIdForRefresh)
                await fetchWeekDetails(weekIdForRefresh, true);
            setCurrentWeekIdForModal(undefined);
        }
        catch (err) {
            console.error("Error saving quiz:", err);
            throw err;
        }
    };
    const handleSaveSection = async (sectionData) => {
        setError(null);
        const weekIdForRefresh = 'id' in sectionData ? sectionData.weekId : currentWeekIdForModal;
        try {
            if ('id' in sectionData) {
                await apiService.updateSection(sectionData.id, sectionData);
            }
            else {
                if (!weekIdForRefresh)
                    throw new Error("Missing weekId for new section");
                await apiService.createSection({ ...sectionData, weekId: weekIdForRefresh }); // Use SectionData for create
            }
            setShowSectionModal(false);
            setEditingSection(null);
            if (weekIdForRefresh)
                await fetchWeekDetails(weekIdForRefresh, true);
            setCurrentWeekIdForModal(undefined);
        }
        catch (err) {
            console.error("Error saving section:", err);
            throw err;
        }
    };
    // handleSaveContent uses ContentItem from api.js
    const handleSaveContent = async (contentData) => {
        setError(null);
        try {
            if (!currentSectionIdForModal)
                throw new Error("Section ID is required.");
            const payload = { ...contentData, order: contentData.order || (editingContent?.order || 1) }; // Ensure order
            if (editingContent?.id) {
                await apiService.updateContent(currentSectionIdForModal, editingContent.id, payload);
            }
            else {
                await apiService.addContentToSection(currentSectionIdForModal, payload);
            }
            const weekId = courseWeeks.find(w => contentDetails[w.id]?.sections.some(s => s.id === currentSectionIdForModal))?.id;
            if (weekId)
                await fetchWeekDetails(weekId, true);
            setShowContentModal(false);
            setEditingContent(null);
            setCurrentSectionIdForModal(undefined);
        }
        catch (err) {
            console.error("Error saving content:", err);
            throw err;
        }
    };
    const requestDeleteConfirmation = (id, title, type, weekId, sectionId) => {
        setItemToDelete({ id, title, type, weekId, sectionId });
        setShowDeleteConfirmModal(true);
    };
    const executeDelete = async () => {
        if (!itemToDelete)
            return;
        setIsDeleting(true);
        setError(null);
        try {
            const { type, id, weekId, sectionId } = itemToDelete;
            switch (type) {
                case 'course':
                    await apiService.deleteCourse(id);
                    await fetchCourses();
                    if (selectedCourseForContent?.id === id) {
                        setSelectedCourseForContent(null);
                        setCourseWeeks([]);
                        setContentDetails({});
                        setActiveTab('courses');
                    }
                    break;
                case 'week':
                    await apiService.deleteWeek(id);
                    if (selectedCourseForContent?.id)
                        await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
                    break;
                case 'material':
                    await apiService.deleteMaterial(id);
                    if (weekId)
                        await fetchWeekDetails(weekId, true);
                    break;
                case 'quiz':
                    await apiService.deleteQuiz(id);
                    if (weekId)
                        await fetchWeekDetails(weekId, true);
                    break;
                case 'section':
                    if (!weekId)
                        throw new Error("Week ID required");
                    await apiService.deleteSection(id);
                    await fetchWeekDetails(weekId, true);
                    break;
                case 'content':
                    if (!sectionId || !weekId)
                        throw new Error("Section/Week ID required");
                    await apiService.deleteContent(sectionId, id);
                    await fetchWeekDetails(weekId, true);
                    break;
            }
            setShowDeleteConfirmModal(false);
            setItemToDelete(null);
        }
        catch (err) {
            setError(err.message || `Failed to delete ${itemToDelete.type}`);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDeleteCourse = (courseId, courseTitle) => requestDeleteConfirmation(courseId, courseTitle, 'course');
    const handleDeleteWeek = (weekId, weekTitle) => requestDeleteConfirmation(weekId, weekTitle, 'week');
    const handleDeleteMaterial = (materialId, weekId, materialTitle) => requestDeleteConfirmation(materialId, materialTitle, 'material', weekId);
    const handleDeleteQuiz = (quizId, weekId, quizTitle) => requestDeleteConfirmation(quizId, quizTitle, 'quiz', weekId);
    const handleDeleteSection = (sectionId, weekId, sectionTitle) => requestDeleteConfirmation(sectionId, sectionTitle, 'section', weekId);
    const handleDeleteContent = (contentId, contentTitle, sectionId) => {
        const weekId = courseWeeks.find(w => contentDetails[w.id]?.sections.some(s => s.id === sectionId))?.id;
        if (!weekId) {
            console.error("Could not find week ID for section:", sectionId);
            return;
        }
        requestDeleteConfirmation(contentId, contentTitle, 'content', weekId, sectionId);
    };
    const openMaterialModal = (material, weekId) => { setEditingMaterial(material); setCurrentWeekIdForModal(weekId); setShowMaterialModal(true); };
    const openQuizModal = (quiz, weekId) => { setEditingQuiz(quiz); setCurrentWeekIdForModal(weekId); setShowQuizModal(true); };
    const openSectionModal = (section, weekId) => { setEditingSection(section); setCurrentWeekIdForModal(weekId); setShowSectionModal(true); };
    const openContentModal = (contentItem, sectionId) => { setEditingContent(contentItem); setCurrentSectionIdForModal(sectionId); setShowContentModal(true); };
    const renderAddSectionButtons = (weekId) => (_jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => openSectionModal(null, weekId), children: [_jsx(PlusCircle, { className: "mr-1.5 h-4 w-4" }), " Add Section"] }) }));
    const renderTemplateModal = () => {
        if (!showTemplateModal)
            return null;
        return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: `${lightCardBg} ${darkCardBg} p-6 rounded-lg shadow-xl w-full max-w-md`, children: [_jsx("h3", { className: `text-lg font-semibold mb-4 ${deepBrown}`, children: "Select Section Template" }), _jsx("p", { className: midBrown, children: "Template modal placeholder." }), _jsxs("div", { className: "mt-6 flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowTemplateModal(false), className: outlineButtonClasses, children: "Cancel" }), _jsx(Button, { className: primaryButtonClasses, onClick: () => setShowTemplateModal(false), children: "Apply" })] })] }) }));
    };
    const getIconForContentType = (type) => {
        switch (type) {
            case 'text': return _jsx(FileText, { className: "h-3.5 w-3.5 mr-1.5" });
            case 'video': return _jsx(Video, { className: "h-3.5 w-3.5 mr-1.5" });
            case 'quiz_link': return _jsx(HelpCircle, { className: "h-3.5 w-3.5 mr-1.5" });
            default:
                const exhaustiveCheck = type; // Ensures all cases are handled if type is a strict union
                return _jsx(FileText, { className: "h-3.5 w-3.5 mr-1.5" });
        }
    };
    // Helper for truncating HTML content for preview
    const truncateHTML = (htmlString, maxLength = 100) => {
        const doc = new DOMParser().parseFromString(htmlString, 'text/html');
        const textContent = doc.body.textContent || "";
        return textContent.length > maxLength ? textContent.substring(0, maxLength) + "..." : textContent;
    };
    return (_jsxs("div", { className: `p-4 md:p-6 lg:p-8 ${lightBg} ${darkBg} min-h-screen`, children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4", children: [_jsxs("div", { children: [_jsxs(Link, { to: "/admin", className: `flex items-center ${linkClasses} text-sm mb-2`, children: [_jsx(ArrowLeft, { className: "mr-1.5 h-4 w-4" }), " Back to Admin Dashboard"] }), _jsx("h1", { className: `text-3xl font-bold tracking-tight ${deepBrown}`, children: "Course Management" }), _jsx("p", { className: `${midBrown} mt-1`, children: "Manage program courses and content." })] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => { setEditingCourse(null); setShowCourseModal(true); }, children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add Course"] })] }), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center justify-between gap-2 text-sm dark:bg-red-900/30 dark:text-red-300 dark:border-red-700", children: [_jsxs("div", { className: "flex items-center gap-2", children: [" ", _jsx(AlertCircle, { className: "h-5 w-5" }), " ", _jsx("span", { children: error }), " "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50", onClick: () => setError(null), children: [" ", _jsx(X, { className: "h-4 w-4" }), " "] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-8", children: [_jsxs(TabsList, { className: `rounded-lg p-1 ${tabsListBg} inline-flex`, children: [_jsxs(TabsTrigger, { value: "courses", className: tabsTriggerClasses, children: ["Program Structure (", courses.length, ")"] }), _jsx(TabsTrigger, { value: "content", disabled: !selectedCourseForContent, className: tabsTriggerClasses, children: "Weekly Content" })] }), _jsx(TabsContent, { value: "courses", className: "space-y-6", children: _jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsxs(CardHeader, { children: [" ", _jsx(CardTitle, { className: deepBrown, children: "Program Overview" }), " "] }), _jsx(CardContent, { className: "p-0", children: isLoadingCourses ? _jsx("div", { className: "p-6 text-center", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin inline-block ${goldAccent}` }) })
                                        : !courses.length ? _jsx("div", { className: "p-6 text-center text-gray-500", children: "No courses created." })
                                            : (_jsx("div", { className: "relative w-full overflow-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsxs("thead", { className: tableHeaderBg, children: [" ", _jsxs("tr", { className: tableRowBorder, children: [_jsx("th", { className: tableHeaderClasses, children: "Month" }), " ", _jsx("th", { className: tableHeaderClasses, children: "Course Title" }), _jsx("th", { className: tableHeaderClasses, children: "Instructor" }), " ", _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] })] }), _jsx("tbody", { children: courses.map(course => (_jsxs("tr", { className: `${tableRowBorder} hover:bg-gray-50/50 dark:hover:bg-gray-800/30`, children: [_jsxs("td", { className: `p-4 align-middle font-semibold ${deepBrown}`, children: ["M", course.monthOrder] }), _jsx("td", { className: tableCellClasses, children: course.title }), _jsx("td", { className: tableCellClasses, children: course.instructorName || course.instructor || 'N/A' }), _jsxs("td", { className: "p-4 align-middle text-right", children: [" ", _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsxs(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => handleSelectCourseForContent(course), children: [" ", _jsx(BookOpen, { className: "mr-1 h-4 w-4" }), " Manage "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => { setEditingCourse(course); setShowCourseModal(true); }, children: [" ", _jsx(Edit, { className: "h-4 w-4" }), " "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-8 w-8`, onClick: () => handleDeleteCourse(course.id, course.title), children: [" ", _jsx(Trash2, { className: "h-4 w-4" }), " "] })] })] })] }, course.id))) })] }) })) })] }) }), _jsx(TabsContent, { value: "content", className: "space-y-6", children: !selectedCourseForContent ? (_jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [" ", _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(BookOpen, { className: `mx-auto h-12 w-12 ${mutedText} mb-4` }), _jsx("p", { className: `${midBrown} font-semibold`, children: "Select a Course" }), " ", _jsx("p", { className: mutedText, children: "Choose a course to manage its content." })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6 ${inputBorder}", children: [_jsxs("div", { children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => { setSelectedCourseForContent(null); setActiveTab('courses'); }, className: `${ghostButtonClasses} mb-2 -ml-2`, children: [" ", _jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Courses "] }), _jsx("h2", { className: `text-2xl font-semibold tracking-tight ${deepBrown}`, children: selectedCourseForContent.title }), _jsx("p", { className: mutedText, children: "Organize weekly learning materials." })] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => { setEditingWeek(null); setShowWeekModal(true); }, children: [" ", _jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add Week "] })] }), isLoadingWeeks ? _jsx("div", { className: "p-6 text-center", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin inline-block ${goldAccent}` }) })
                                    : !courseWeeks.length ? (_jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [" ", _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(HelpCircle, { className: `mx-auto h-12 w-12 ${mutedText} mb-4` }), _jsx("p", { className: `${midBrown} font-semibold`, children: "No Weeks Yet" }), " ", _jsx("p", { className: mutedText, children: "Add a week to start organizing content." })] })] }))
                                        : (_jsxs("div", { className: "space-y-6", children: [" ", courseWeeks.map(week => {
                                                    const details = contentDetails[week.id];
                                                    return (_jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder} overflow-hidden`, children: [_jsxs(CardHeader, { className: `p-4 border-b ${inputBorder} flex flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30`, children: [_jsxs("div", { children: [" ", _jsxs(CardTitle, { className: `text-lg ${deepBrown}`, children: ["W", week.weekNumber, ": ", week.title] }), " ", week.description && _jsx(CardDescription, { className: `mt-1 text-xs ${mutedText}`, children: week.description }), " "] }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => { setEditingWeek(week); setShowWeekModal(true); }, children: [" ", _jsx(Edit, { className: "h-4 w-4" }), " "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-8 w-8`, onClick: () => handleDeleteWeek(week.id, week.title), children: [" ", _jsx(Trash2, { className: "h-4 w-4" }), " "] })] })] }), _jsx(CardContent, { className: "p-4 md:p-6", children: !details ? _jsx(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => fetchWeekDetails(week.id, false), children: " Load Details " })
                                                                    : details.loading ? _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [" ", _jsx(Loader2, { className: `h-4 w-4 animate-spin ${goldAccent}` }), " Loading... "] })
                                                                        : details.error ? _jsxs("div", { className: "text-red-600 dark:text-red-400 text-sm flex items-center gap-2", children: [" ", _jsx(AlertCircle, { className: "h-4 w-4" }), " Error: ", details.error, " ", _jsx(Button, { variant: "link", size: "sm", className: `p-0 h-auto ${linkClasses}`, onClick: () => fetchWeekDetails(week.id, true), children: " Retry " }), " "] })
                                                                            : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [" ", _jsx("h4", { className: `text-sm font-semibold ${deepBrown}`, children: "Learning Sections" }), " ", renderAddSectionButtons(week.id), " "] }), !details.sections.length ? _jsx("p", { className: `text-xs ${mutedText}`, children: "No sections added." })
                                                                                        : (_jsxs("div", { className: "space-y-4", children: [" ", details.sections.map(section => (_jsxs("div", { className: `border ${inputBorder} rounded-lg p-3 group`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("h5", { className: `font-medium ${deepBrown} flex items-center`, children: [" ", _jsx(GripVertical, { className: "h-4 w-4 mr-2 text-gray-400 cursor-grab opacity-50 group-hover:opacity-100" }), " S", section.order, ": ", section.title, " "] }), _jsxs("div", { className: "flex items-center gap-0.5", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-7 w-7`, onClick: () => openSectionPreview(section), title: "Preview Section", children: [" ", _jsx(EyeIcon, { className: "h-3.5 w-3.5" }), " "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-7 w-7`, onClick: () => openSectionModal(section, week.id), children: [" ", _jsx(Edit, { className: "h-3.5 w-3.5" }), " "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-7 w-7`, onClick: () => handleDeleteSection(section.id, week.id, section.title), children: [" ", _jsx(Trash2, { className: "h-3.5 w-3.5" }), " "] })] })] }), section.description && _jsx("p", { className: `text-xs ${mutedText} mt-1 mb-3 pl-6`, children: section.description }), _jsxs("div", { className: "space-y-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700 ml-2.5", children: [!section.content?.length ? _jsx("p", { className: `text-xs ${mutedText} py-1`, children: "No content items." })
                                                                                                                    : section.content.map(item => (_jsxs("div", { className: `group/content-item flex items-center justify-between p-1.5 -ml-1.5 rounded hover:bg-gray-50/80 dark:hover:bg-gray-800/50`, children: [_jsxs("div", { className: "flex items-center text-sm", children: [getIconForContentType(item.type), _jsx("span", { className: midBrown, children: item.title || `Item ${item.order}` }), item.isRequired && _jsx("span", { className: "ml-1.5 text-xs text-red-500", children: "(R)" }), _jsx("span", { className: "text-xs text-gray-400 dark:text-gray-500 ml-2 truncate max-w-[200px] group-hover/content-item:hidden", children: item.type === 'text' && item.content ? truncateHTML(item.content, 50) : item.url ? item.url.substring(0, 50) + '...' : '' })] }), _jsxs("div", { className: "flex items-center gap-0.5 opacity-0 group-hover/content-item:opacity-100 transition-opacity", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-6 w-6`, disabled: !item.id, onClick: () => { if (item.id)
                                                                                                                                            openContentModal(item, section.id); }, children: [" ", _jsx(Edit, { className: "h-3 w-3" }), " "] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 dark:hover:text-red-500 h-6 w-6`, disabled: !item.id, onClick: () => { if (item.id)
                                                                                                                                            handleDeleteContent(item.id, item.title || '', section.id); }, children: [" ", _jsx(Trash2, { className: "h-3 w-3" }), " "] })] })] }, item.id))), _jsxs(Button, { variant: "outline", size: "sm", className: `${outlineButtonClasses} text-xs h-7 mt-2`, onClick: () => openContentModal(null, section.id), children: [" ", _jsx(PlusCircle, { className: "mr-1 h-3 w-3" }), " Add Content Item "] })] })] }, section.id)))] }))] })) })] }, week.id));
                                                }), " "] }))] })) })] }), _jsx(CreateEditCourseModal, { isOpen: showCourseModal, onClose: () => { setShowCourseModal(false); setEditingCourse(null); }, course: editingCourse, onSave: handleSaveCourse, existingMonthOrders: existingMonthOrders }), _jsx(CreateEditWeekModal, { isOpen: showWeekModal, onClose: () => { setShowWeekModal(false); setEditingWeek(null); }, week: editingWeek, courseId: selectedCourseForContent?.id, onSave: handleSaveWeek, existingWeekNumbers: courseWeeks.filter(w => w.id !== editingWeek?.id).map(w => w.weekNumber) }), _jsx(CreateEditMaterialModal, { isOpen: showMaterialModal, onClose: () => { setShowMaterialModal(false); setEditingMaterial(null); setCurrentWeekIdForModal(undefined); }, material: editingMaterial, weekId: currentWeekIdForModal, onSave: handleSaveMaterial }), _jsx(CreateEditQuizModal, { isOpen: showQuizModal, onClose: () => { setShowQuizModal(false); setEditingQuiz(null); setCurrentWeekIdForModal(undefined); }, quiz: editingQuiz, weekId: currentWeekIdForModal, onSave: handleSaveQuiz }), _jsx(CreateEditSectionModal, { isOpen: showSectionModal && !!currentWeekIdForModal, onClose: () => { setShowSectionModal(false); setEditingSection(null); setCurrentWeekIdForModal(undefined); }, section: editingSection, weekId: currentWeekIdForModal || '', onSave: handleSaveSection, existingSectionOrders: currentWeekIdForModal ? contentDetails[currentWeekIdForModal]?.sections?.map(s => s.order || 0) || [] : [] })
            // ... other modals ...
            , "// ... other modals ...", _jsx(CreateEditContentModal, { isOpen: showContentModal, onClose: () => {
                    setShowContentModal(false);
                    setEditingContent(null);
                    setCurrentSectionIdForModal(undefined);
                }, content: editingContent, sectionId: currentSectionIdForModal || '', onSave: handleSaveContent }), showSectionPreviewModal && sectionToPreview && (_jsx(SectionPreviewModal // This component itself would be the one that includes ErrorBoundary logic internally if exported that way
            , { isOpen: showSectionPreviewModal, onClose: () => {
                    setShowSectionPreviewModal(false);
                    setSectionToPreview(null);
                }, section: sectionToPreview })), _jsx(ConfirmationModal, { isOpen: showDeleteConfirmModal, onClose: () => { setShowDeleteConfirmModal(false); setItemToDelete(null); setIsDeleting(false); }, onConfirm: executeDelete, title: `Confirm ${itemToDelete?.type || ''} Deletion`, message: `Are you sure you want to delete this ${itemToDelete?.type || 'item'}? This action cannot be undone.`, confirmText: `Delete ${itemToDelete?.type || 'Item'}`, confirmVariant: "destructive", isConfirming: isDeleting }), renderTemplateModal()] }));
}
;
