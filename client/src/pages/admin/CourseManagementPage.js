import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { BookOpen, PlusCircle, Edit, Trash2, ArrowLeft, FileText, Video, Loader2, AlertCircle, HelpCircle, X } from 'lucide-react';
import * as apiService from "../../services/api.js";
import CreateEditCourseModal from "../../components/modals/CreateEditCourseModal.js";
import CreateEditWeekModal from "../../components/modals/CreateEditWeekModal.js";
import CreateEditMaterialModal from "../../components/modals/CreateEditMaterialModal.js";
import CreateEditQuizModal from "../../components/modals/CreateEditQuizModal.js";
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
const tabsTriggerClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out ${midBrown} hover:bg-gray-200/60 dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C5A467] dark:focus-visible:ring-offset-gray-950 data-[state=active]:${goldBg} data-[state=active]:text-[#bb4343] data-[state=active]:font-semibold data-[state=active]:shadow-md data-[state=active]:hover:${goldBgHover} disabled:opacity-50 disabled:pointer-events-none`;
const AdminCourseManagementPage = () => {
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
    useEffect(() => { fetchCourses(); }, []);
    const fetchCourses = async () => {
        console.log("Fetching courses...");
        setIsLoadingCourses(true);
        setError(null);
        try {
            const fetchedCourses = await apiService.getCoursesForAdmin();
            setCourses(fetchedCourses.sort((a, b) => a.monthOrder - b.monthOrder));
            console.log("Courses fetched successfully:", fetchedCourses.length);
        }
        catch (err) {
            console.error("Error fetching courses:", err);
            setError(err.message || "Failed to fetch courses");
        }
        finally {
            setIsLoadingCourses(false);
        }
    };
    const fetchWeekDetails = useCallback(async (weekId, forceRefresh = false) => {
        if (!weekId)
            return;
        if (!forceRefresh && contentDetails[weekId] && !contentDetails[weekId].error && !contentDetails[weekId].loading && (contentDetails[weekId].materials?.length > 0 || contentDetails[weekId].quizzes?.length > 0)) {
            return;
        }
        console.log(`Fetching details for week ${weekId} ${forceRefresh ? '(forcing refresh)' : ''}`);
        if (forceRefresh) {
            setContentDetails(prev => ({
                ...prev,
                [weekId]: { materials: [], quizzes: [], loading: true, error: null }
            }));
        }
        else {
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
        }
        catch (err) {
            console.error(`Error fetching details for week ${weekId}:`, err);
            setContentDetails(prev => ({
                ...prev,
                [weekId]: { ...(prev[weekId] || { materials: [], quizzes: [] }), loading: false, error: err.message || 'Failed to load details' }
            }));
        }
    }, [contentDetails]);
    const fetchWeeksAndDetailsForCourse = useCallback(async (courseId) => {
        console.log(`Fetching weeks for course ${courseId}`);
        setIsLoadingWeeks(true);
        setCourseWeeks([]);
        setContentDetails({});
        setError(null);
        try {
            const weeks = await apiService.getWeeksByCourse(courseId);
            const sortedWeeks = weeks.sort((a, b) => a.weekNumber - b.weekNumber);
            console.log("Fetched weeks:", sortedWeeks.length);
            setCourseWeeks(sortedWeeks);
            setIsLoadingWeeks(false);
            if (sortedWeeks.length > 0) {
                console.log("Fetching details for all fetched weeks...");
                sortedWeeks.forEach((week) => fetchWeekDetails(week.id, false));
            }
        }
        catch (err) {
            console.error(`Error fetching weeks for course ${courseId}:`, err);
            setError(err.message || `Failed to fetch weeks for course`);
            setIsLoadingWeeks(false);
        }
    }, [fetchWeekDetails]);
    const handleSelectCourseForContent = (course) => {
        if (!course || !course.id || course.id === selectedCourseForContent?.id)
            return;
        console.log("Selecting course for content management:", course.title);
        setSelectedCourseForContent(course);
        setActiveTab("content");
        fetchWeeksAndDetailsForCourse(course.id);
    };
    const handleSaveCourse = async (courseData) => {
        const isEditing = 'id' in courseData;
        console.log(isEditing ? "Saving updated course:" : "Creating new course:", courseData);
        setError(null);
        try {
            if (isEditing) {
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
        const isEditing = 'id' in weekData;
        setError(null);
        try {
            if (isEditing) {
                await apiService.updateWeek(weekData.id, weekData);
            }
            else {
                if (!selectedCourseForContent?.id)
                    throw new Error("Cannot create week without a selected course.");
                const dataToCreate = { ...weekData, courseId: selectedCourseForContent.id };
                await apiService.createWeek(dataToCreate);
            }
            setShowWeekModal(false);
            setEditingWeek(null);
            if (selectedCourseForContent?.id) {
                await fetchWeeksAndDetailsForCourse(selectedCourseForContent.id);
            }
        }
        catch (err) {
            console.error("Error saving week:", err);
            throw err;
        }
    };
    const handleSaveMaterial = async (materialData) => {
        setError(null);
        const isFormData = materialData instanceof FormData;
        const isEditing = !isFormData && 'id' in materialData;
        const idToUpdate = isEditing ? materialData.id : undefined;
        const weekIdForRefresh = isFormData
            ? materialData.get('weekId')
            : materialData.weekId;
        try {
            if (isEditing && idToUpdate) {
                await apiService.updateMaterial(idToUpdate, materialData);
            }
            else {
                await apiService.createMaterial(materialData);
            }
            setShowMaterialModal(false);
            setEditingMaterial(null);
            if (weekIdForRefresh) {
                await fetchWeekDetails(weekIdForRefresh, true);
            }
            setCurrentWeekIdForModal(undefined);
        }
        catch (err) {
            console.error("Error saving material:", err);
            throw err;
        }
    };
    const handleSaveQuiz = async (quizData) => {
        setError(null);
        const isEditing = 'id' in quizData;
        const weekIdForRefresh = isEditing ? quizData.weekId : currentWeekIdForModal;
        try {
            if (isEditing) {
                await apiService.updateQuiz(quizData.id, quizData);
            }
            else {
                if (!weekIdForRefresh)
                    throw new Error("Missing weekId for new quiz");
                const dataToCreate = { ...quizData, weekId: weekIdForRefresh };
                await apiService.createQuiz(dataToCreate);
            }
            setShowQuizModal(false);
            setEditingQuiz(null);
            if (weekIdForRefresh) {
                await fetchWeekDetails(weekIdForRefresh, true);
            }
            setCurrentWeekIdForModal(undefined);
        }
        catch (err) {
            console.error("Error saving quiz:", err);
            throw err;
        }
    };
    const requestDeleteConfirmation = (id, title, type, weekId) => {
        console.log(`Requesting delete confirmation for ${type}: ${title} (${id})${weekId ? ` in week ${weekId}` : ''}`);
        setItemToDelete({ id, title, type, weekId });
        setShowDeleteConfirmModal(true);
    };
    const executeDelete = async () => {
        if (!itemToDelete)
            return;
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
                    if (weekIdToRefresh)
                        await fetchWeekDetails(weekIdToRefresh, true);
                    else
                        console.warn("Week ID missing for material delete refresh.");
                    break;
                case 'quiz':
                    await apiService.deleteQuiz(itemToDelete.id);
                    if (weekIdToRefresh)
                        await fetchWeekDetails(weekIdToRefresh, true);
                    else
                        console.warn("Week ID missing for quiz delete refresh.");
                    break;
            }
            console.log(`${itemToDelete.type} deleted successfully`);
            setShowDeleteConfirmModal(false);
            setItemToDelete(null);
        }
        catch (err) {
            console.error(`Error deleting ${itemToDelete.type}:`, err);
            throw err;
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDeleteCourse = (courseId, courseTitle) => {
        requestDeleteConfirmation(courseId, courseTitle, 'course');
    };
    const handleDeleteWeek = (weekId, weekTitle) => {
        requestDeleteConfirmation(weekId, weekTitle || `Week (ID: ${weekId})`, 'week');
    };
    const handleDeleteMaterial = (materialId, weekId, materialTitle) => {
        requestDeleteConfirmation(materialId, materialTitle, 'material', weekId);
    };
    const handleDeleteQuiz = (quizId, weekId, quizTitle) => {
        requestDeleteConfirmation(quizId, quizTitle, 'quiz', weekId);
    };
    const openMaterialModal = (material, weekId) => {
        setEditingMaterial(material);
        setCurrentWeekIdForModal(weekId);
        setShowMaterialModal(true);
    };
    const openQuizModal = (quiz, weekId) => {
        setEditingQuiz(quiz);
        setCurrentWeekIdForModal(weekId);
        setShowQuizModal(true);
    };
    const existingMonthOrders = courses.map(c => c.monthOrder);
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${lightBg} ${darkBg}`, children: [_jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4", children: [_jsxs("div", { children: [_jsxs(Link, { to: "/admin", className: `flex items-center ${linkClasses} text-sm mb-2`, children: [_jsx(ArrowLeft, { className: "mr-1.5 h-4 w-4" }), "Back to Admin Dashboard"] }), _jsx("h1", { className: `text-3xl font-bold tracking-tight ${deepBrown}`, children: "Course Management" }), _jsx("p", { className: `${midBrown} mt-1`, children: "Manage the 6-month program structure and content." })] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => { setEditingCourse(null); setShowCourseModal(true); }, disabled: courses.length >= 6, title: courses.length >= 6 ? "All 6 months have assigned courses" : "Add a new course", children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), "Add New Course"] })] }), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center justify-between gap-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), _jsx("span", { children: error })] }), _jsxs(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-red-700 hover:bg-red-200", onClick: () => setError(null), children: [_jsx("span", { className: "sr-only", children: "Close error message" }), _jsx(X, { className: "h-4 w-4" })] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-8", children: [_jsxs(TabsList, { className: `rounded-lg p-1 ${tabsListBg} inline-flex`, children: [_jsx(TabsTrigger, { value: "courses", className: tabsTriggerClasses, children: "Program Structure (6 Courses)" }), _jsx(TabsTrigger, { value: "content", disabled: !selectedCourseForContent, className: tabsTriggerClasses, children: "Weekly Content" })] }), _jsx(TabsContent, { value: "courses", className: "space-y-6", children: _jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: deepBrown, children: "6-Month Program Overview" }) }), _jsx(CardContent, { className: "p-0", children: isLoadingCourses ? (_jsx("div", { className: "p-6 text-center", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin inline-block ${goldAccent}` }) }))
                                                : !courses || courses.length === 0 ? (_jsx("div", { className: "p-6 text-center text-gray-500", children: "No courses created yet." }))
                                                    : (_jsx("div", { className: "relative w-full overflow-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: tableHeaderBg, children: _jsxs("tr", { className: tableRowBorder, children: [_jsx("th", { className: tableHeaderClasses, children: "Month" }), _jsx("th", { className: tableHeaderClasses, children: "Course Title" }), _jsx("th", { className: tableHeaderClasses, children: "Instructor" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsx("tbody", { children: courses.map((course) => (_jsxs("tr", { className: `${tableRowBorder} hover:bg-gray-50/50 dark:hover:bg-gray-800/30`, children: [_jsxs("td", { className: `p-4 align-middle font-semibold ${deepBrown}`, children: ["Month ", course.monthOrder] }), _jsx("td", { className: tableCellClasses, children: course.title }), _jsx("td", { className: tableCellClasses, children: course.instructorName || course.instructor || 'N/A' }), _jsx("td", { className: "p-4 align-middle text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsxs(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => handleSelectCourseForContent(course), children: [_jsx(BookOpen, { className: "mr-1 h-4 w-4" }), " Manage Content"] }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => { setEditingCourse(course); setShowCourseModal(true); }, "aria-label": `Edit ${course.title}`, children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-8 w-8`, onClick: () => handleDeleteCourse(course.id, course.title), "aria-label": `Delete ${course.title}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, course.id))) })] }) })) })] }) }), _jsx(TabsContent, { value: "content", className: "space-y-6", children: !selectedCourseForContent ? (_jsx(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(BookOpen, { className: `mx-auto h-12 w-12 ${mutedText} mb-4` }), _jsx("p", { className: `${midBrown} font-semibold`, children: "Select a Course" }), _jsx("p", { className: mutedText, children: "Choose a course from the 'Program Structure' tab to manage its weekly content." })] }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6 border-gray-200 dark:border-gray-700", children: [_jsxs("div", { children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => { setSelectedCourseForContent(null); setActiveTab('courses'); }, className: `${ghostButtonClasses} mb-2 -ml-2`, children: [_jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Back to Courses"] }), _jsxs("h2", { className: `text-2xl font-semibold tracking-tight ${deepBrown}`, children: ["Manage Content for: ", selectedCourseForContent.title] }), _jsx("p", { className: mutedText, children: "Organize learning materials and quizzes week by week." })] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => { setEditingWeek(null); setShowWeekModal(true); }, children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add New Week"] })] }), isLoadingWeeks ? (_jsx("div", { className: "p-6 text-center", children: _jsx(Loader2, { className: `h-6 w-6 animate-spin inline-block ${goldAccent}` }) }))
                                            : courseWeeks.length === 0 ? (_jsx(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(HelpCircle, { className: `mx-auto h-12 w-12 ${mutedText} mb-4` }), _jsx("p", { className: `${midBrown} font-semibold`, children: "No Weeks Yet" }), _jsx("p", { className: mutedText, children: "This course doesn't have any weekly content defined. Start by adding a week." })] }) }))
                                                : (_jsx("div", { className: "space-y-6", children: courseWeeks.map((week) => {
                                                        const details = contentDetails[week.id];
                                                        return (_jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder} overflow-hidden`, children: [_jsxs(CardHeader, { className: `p-4 border-b ${inputBorder} flex flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30`, children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: `text-lg ${deepBrown}`, children: ["Week ", week.weekNumber, ": ", week.title] }), week.description && _jsx(CardDescription, { className: `mt-1 text-xs ${mutedText}`, children: week.description })] }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [_jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => { setEditingWeek(week); setShowWeekModal(true); }, "aria-label": `Edit Week ${week.weekNumber}`, children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-8 w-8`, onClick: () => handleDeleteWeek(week.id, week.title || `Week ${week.weekNumber}`), "aria-label": `Delete Week ${week.weekNumber}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), _jsx(CardContent, { className: "p-4 md:p-6", children: !details ? (_jsx(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => fetchWeekDetails(week.id, false), children: "Load Week Details" })) : details.loading ? (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [_jsx(Loader2, { className: `h-4 w-4 animate-spin ${goldAccent}` }), " Loading content..."] })) : details.error ? (_jsxs("div", { className: "text-red-600 text-sm flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), " Error: ", details.error, " ", _jsx(Button, { variant: "link", size: "sm", className: `p-0 h-auto ${linkClasses}`, onClick: () => fetchWeekDetails(week.id, true), children: "Retry" })] })) : (_jsxs("div", { className: `grid grid-cols-1 md:grid-cols-2 gap-6 pt-2`, children: [_jsxs("div", { children: [_jsx("h4", { className: `text-sm font-semibold mb-3 pb-2 border-b ${inputBorder} ${deepBrown}`, children: "Learning Materials" }), details.materials.length === 0 && _jsx("p", { className: `text-xs ${mutedText}`, children: "No materials added yet." }), details.materials.map((material, index) => (_jsxs("div", { className: `flex items-center justify-between py-1.5 group border-b border-transparent hover:border-gray-100 dark:hover:border-gray-800`, children: [_jsxs("div", { className: "flex items-center gap-2 overflow-hidden mr-2", children: [material.type === 'video' ? _jsx(Video, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }) : _jsx(FileText, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }), _jsx("span", { className: `text-sm ${midBrown} truncate`, title: material.title, children: material.title }), material.contentUrl && _jsx("a", { href: material.contentUrl, target: "_blank", rel: "noopener noreferrer", className: `text-xs ${linkClasses} ml-1 flex-shrink-0`, children: "(Link)" })] }), _jsxs("div", { className: "flex items-center gap-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-7 w-7`, "aria-label": `Edit ${material.title}`, onClick: () => openMaterialModal(material, week.id), children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-7 w-7`, "aria-label": `Delete ${material.title}`, onClick: () => handleDeleteMaterial(material.id, week.id, material.title), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }, `${material.id}-${index}`))), _jsxs(Button, { variant: "outline", size: "sm", className: `${outlineButtonClasses} mt-3 text-xs h-8`, onClick: () => openMaterialModal(null, week.id), children: [_jsx(PlusCircle, { className: "mr-1 h-3.5 w-3.5" }), " Add Material"] })] }), _jsxs("div", { children: [_jsx("h4", { className: `text-sm font-semibold mb-3 pb-2 border-b ${inputBorder} ${deepBrown}`, children: "Quizzes & Assignments" }), details.quizzes.length === 0 && _jsx("p", { className: `text-xs ${mutedText}`, children: "No quizzes added yet." }), details.quizzes.map((quiz, index) => (_jsxs("div", { className: `flex items-center justify-between py-1.5 group border-b border-transparent hover:border-gray-100 dark:hover:border-gray-800`, children: [_jsxs("div", { className: "flex items-center gap-2 overflow-hidden mr-2", children: [_jsx(HelpCircle, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }), _jsx("span", { className: `text-sm ${midBrown} truncate`, title: quiz.title, children: quiz.title }), quiz.quizUrl && _jsx("a", { href: quiz.quizUrl, target: "_blank", rel: "noopener noreferrer", className: `text-xs ${linkClasses} ml-1 flex-shrink-0`, children: "(Link)" })] }), _jsxs("div", { className: "flex items-center gap-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-7 w-7`, "aria-label": `Edit ${quiz.title}`, onClick: () => openQuizModal(quiz, week.id), children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-7 w-7`, "aria-label": `Delete ${quiz.title}`, onClick: () => handleDeleteQuiz(quiz.id, week.id, quiz.title), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }, `${quiz.id}-${index}`))), _jsxs(Button, { variant: "outline", size: "sm", className: `${outlineButtonClasses} mt-3 text-xs h-8`, onClick: () => openQuizModal(null, week.id), children: [_jsx(PlusCircle, { className: "mr-1 h-3.5 w-3.5" }), " Add Quiz"] })] })] })) })] }, week.id));
                                                    }) }))] })) })] })] }), _jsx(CreateEditCourseModal, { isOpen: showCourseModal, onClose: () => { setShowCourseModal(false); setEditingCourse(null); }, course: editingCourse, onSave: handleSaveCourse, existingMonthOrders: existingMonthOrders }), _jsx(CreateEditWeekModal, { isOpen: showWeekModal, onClose: () => { setShowWeekModal(false); setEditingWeek(null); }, week: editingWeek, courseId: selectedCourseForContent?.id, onSave: handleSaveWeek, existingWeekNumbers: courseWeeks.filter(w => w.id !== editingWeek?.id).map(w => w.weekNumber) }), _jsx(CreateEditMaterialModal, { isOpen: showMaterialModal, onClose: () => { setShowMaterialModal(false); setEditingMaterial(null); setCurrentWeekIdForModal(undefined); }, material: editingMaterial, weekId: currentWeekIdForModal, onSave: handleSaveMaterial }), _jsx(CreateEditQuizModal, { isOpen: showQuizModal, onClose: () => { setShowQuizModal(false); setEditingQuiz(null); setCurrentWeekIdForModal(undefined); }, quiz: editingQuiz, weekId: currentWeekIdForModal, onSave: handleSaveQuiz }), _jsx(ConfirmationModal, { isOpen: showDeleteConfirmModal, onClose: () => { setShowDeleteConfirmModal(false); setItemToDelete(null); setIsDeleting(false); }, onConfirm: executeDelete, title: `Confirm ${itemToDelete?.type || ''} Deletion`, message: itemToDelete?.type === 'course' ? (_jsxs(_Fragment, { children: ["Are you sure you want to delete the course: ", _jsxs("strong", { className: deepBrown, children: ["\"", itemToDelete?.title, "\""] }), "?", _jsx("br", {}), " ", _jsx("br", {}), _jsx("span", { className: "font-semibold text-red-600 dark:text-red-400", children: "This action will permanently delete the course AND all its associated weeks, materials, and quizzes. This cannot be undone." })] })) : itemToDelete?.type === 'week' ? (_jsxs(_Fragment, { children: ["Are you sure you want to delete the week: ", _jsxs("strong", { className: deepBrown, children: ["\"", itemToDelete?.title, "\""] }), "?", _jsx("br", {}), " ", _jsx("br", {}), _jsx("span", { className: "font-semibold text-red-600 dark:text-red-400", children: "This action will permanently delete the week AND all its associated materials and quizzes. This cannot be undone." })] })) : (_jsxs(_Fragment, { children: ["Are you sure you want to delete the ", itemToDelete?.type, ": ", _jsxs("strong", { className: deepBrown, children: ["\"", itemToDelete?.title, "\""] }), "?"] })), confirmText: `Delete ${itemToDelete?.type || 'Item'}`, confirmVariant: "destructive", isConfirming: isDeleting })] }));
};
export default AdminCourseManagementPage;
