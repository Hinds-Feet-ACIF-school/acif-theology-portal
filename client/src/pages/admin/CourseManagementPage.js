import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { BookOpen, PlusCircle, Edit, Trash2, ArrowLeft, FileText, Video, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import * as apiService from "../../services/api.js";
import CreateEditCourseModal from "../../components/modals/CreateEditCourseModal.js";
import CreateEditWeekModal from "../../components/modals/CreateEditWeekModal.js";
import CreateEditMaterialModal from "../../components/modals/CreateEditMaterialModal.js";
import CreateEditQuizModal from "../../components/modals/CreateEditQuizModal.js";
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
const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const tableHeaderBg = 'bg-gray-50 dark:bg-gray-800/50';
const tableRowBorder = 'border-b border-gray-200 dark:border-gray-700';
const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedText}`;
const tableCellClasses = `p-4 align-middle ${midBrown}`;
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const ghostButtonClasses = `${midBrown} hover:bg-gray-100 dark:hover:bg-gray-700/50`;
const linkClasses = `${goldAccent} hover:underline`;
const tabsListBg = 'bg-gray-100/50 dark:bg-gray-800/50';
const tabsTriggerClasses = `${midBrown} data-[state=active]:${deepBrown} data-[state=active]:${lightCardBg} dark:data-[state=active]:${darkCardBg} data-[state=active]:shadow-sm`;
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
    useEffect(() => {
        fetchCourses();
    }, []);
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
    const fetchWeeksForSelectedCourse = async () => {
        if (!selectedCourseForContent)
            return;
        setIsLoadingWeeks(true);
        setError(null);
        try {
            const weeks = await apiService.getWeeksByCourse(selectedCourseForContent.id);
            setCourseWeeks(weeks.sort((a, b) => a.weekNumber - b.weekNumber));
        }
        catch (err) {
            setError(err.message || `Failed to fetch weeks for course ${selectedCourseForContent.title}`);
        }
        finally {
            setIsLoadingWeeks(false);
        }
    };
    const handleSelectCourseForContent = async (course) => {
        if (!course || !course.id)
            return;
        setActiveTab("content");
        setSelectedCourseForContent(course);
        setCourseWeeks([]);
        setContentDetails({});
        await fetchWeeksForSelectedCourse();
    };
    const fetchWeekDetails = async (weekId) => {
        if (!weekId || contentDetails[weekId]?.materials)
            return;
        setContentDetails(prev => ({
            ...prev,
            [weekId]: { materials: [], quizzes: [], loading: true, error: null }
        }));
        try {
            const [materials, quizzes] = await Promise.all([
                apiService.getMaterialsByWeek(weekId),
                apiService.getQuizzesByWeek(weekId)
            ]);
            setContentDetails(prev => ({
                ...prev,
                [weekId]: { materials, quizzes, loading: false, error: null }
            }));
        }
        catch (err) {
            setContentDetails(prev => ({
                ...prev,
                [weekId]: { ...prev[weekId], loading: false, error: err.message || 'Failed to load details' }
            }));
        }
    };
    const handleSaveCourse = async (courseData) => {
        setError(null);
        const isEditing = 'id' in courseData;
        try {
            if (isEditing) {
                await apiService.updateCourse(courseData.id, courseData);
            }
            else {
                await apiService.createCourse(courseData);
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            fetchCourses();
        }
        catch (err) {
            throw err;
        }
    };
    const handleDeleteCourse = async (courseId, courseTitle) => {
        if (window.confirm(`Are you sure you want to delete "${courseTitle}" and all its content? This cannot be undone.`)) {
            setError(null);
            try {
                await apiService.deleteCourse(courseId);
                fetchCourses();
                if (selectedCourseForContent?.id === courseId) {
                    setSelectedCourseForContent(null);
                    setCourseWeeks([]);
                    setContentDetails({});
                    setActiveTab('courses');
                }
            }
            catch (err) {
                setError(err.message || "Failed to delete course");
            }
        }
    };
    const handleSaveWeek = async (weekData) => {
        setError(null);
        const isEditing = 'id' in weekData;
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
            fetchWeeksForSelectedCourse();
        }
        catch (err) {
            throw err;
        }
    };
    const handleSaveMaterial = async (materialData) => {
        setError(null);
        const isEditing = !(materialData instanceof FormData) && 'id' in materialData;
        const idToUpdate = isEditing ? materialData.id : undefined;
        try {
            if (isEditing && idToUpdate) {
                await apiService.updateMaterial(idToUpdate, materialData);
            }
            else {
                await apiService.createMaterial(materialData);
            }
            setShowMaterialModal(false);
            setEditingMaterial(null);
            if (currentWeekIdForModal) {
                fetchWeekDetails(currentWeekIdForModal);
            }
        }
        catch (err) {
            throw err;
        }
    };
    const handleSaveQuiz = async (quizData) => {
        setError(null);
        const isEditing = 'id' in quizData;
        try {
            if (isEditing) {
                await apiService.updateQuiz(quizData.id, quizData);
            }
            else {
                await apiService.createQuiz(quizData);
            }
            setShowQuizModal(false);
            setEditingQuiz(null);
            if (currentWeekIdForModal) {
                fetchWeekDetails(currentWeekIdForModal);
            }
        }
        catch (err) {
            throw err;
        }
    };
    const handleDeleteWeek = async (weekId) => { console.log('Delete Week', weekId); };
    const handleDeleteMaterial = async (materialId, weekId) => { console.log('Delete Material', materialId, weekId); };
    const handleDeleteQuiz = async (quizId, weekId) => {
        if (window.confirm(`Are you sure you want to delete this quiz?`)) {
            setError(null);
            try {
                await apiService.deleteQuiz(quizId);
                fetchWeekDetails(weekId);
            }
            catch (err) {
                setError(err.message || "Failed to delete quiz");
            }
        }
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
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${lightBg} ${darkBg}`, children: [_jsxs("div", { className: "container px-4 py-8 md:px-6", children: [_jsx("div", { className: "flex items-center gap-2 mb-6", children: _jsxs(Link, { to: "/admin", className: `flex items-center ${linkClasses}`, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Back to Admin Dashboard"] }) }), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: `text-3xl font-bold tracking-tight ${deepBrown}`, children: "Course Management" }), _jsx("p", { className: `${midBrown}`, children: "Manage the 6-month program structure and content." })] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => { setEditingCourse(null); setShowCourseModal(true); }, children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), "Add New Course"] })] }), error && _jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), " ", error] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-8", children: [_jsxs(TabsList, { className: `rounded-md p-1 ${tabsListBg}`, children: [_jsx(TabsTrigger, { value: "courses", className: tabsTriggerClasses, children: "Program Structure (6 Courses)" }), _jsx(TabsTrigger, { value: "content", disabled: !selectedCourseForContent, className: tabsTriggerClasses, children: "Weekly Content" })] }), _jsx(TabsContent, { value: "courses", className: "space-y-6", children: _jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: deepBrown, children: "6-Month Program Overview" }), _jsx(CardDescription, { className: midBrown, children: "Define the 6 core courses for the program, ordered by month." })] }), _jsx(CardContent, { className: "p-0", children: isLoadingCourses ? (_jsx("div", { className: "flex justify-center items-center p-10", children: _jsx(Loader2, { className: `h-8 w-8 animate-spin ${goldAccent}` }) })) : !courses || courses.length === 0 ? (_jsx("div", { className: `p-6 text-center ${mutedText}`, children: "No courses defined yet. Use 'Add New Course'." })) : (_jsx("div", { className: "relative w-full overflow-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: tableHeaderBg, children: _jsxs("tr", { className: tableRowBorder, children: [_jsx("th", { className: tableHeaderClasses, children: "Month" }), _jsx("th", { className: tableHeaderClasses, children: "Course Title" }), _jsx("th", { className: tableHeaderClasses, children: "Instructor" }), _jsx("th", { className: tableHeaderClasses, children: "Actions" })] }) }), _jsx("tbody", { children: courses.map((course) => (_jsxs("tr", { className: tableRowBorder, children: [_jsxs("td", { className: `p-4 align-middle font-semibold ${deepBrown}`, children: ["Month ", course.monthOrder] }), _jsx("td", { className: tableCellClasses, children: course.title }), _jsx("td", { className: tableCellClasses, children: course.instructorName || course.instructor || 'N/A' }), _jsx("td", { className: "p-4 align-middle", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => handleSelectCourseForContent(course), children: [_jsx(BookOpen, { className: "mr-1 h-4 w-4" }), " Manage Content"] }), _jsx(Button, { variant: "ghost", size: "icon", className: ghostButtonClasses, onClick: () => { setEditingCourse(course); setShowCourseModal(true); }, "aria-label": `Edit ${course.title}`, children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600`, onClick: () => handleDeleteCourse(course.id, course.title), "aria-label": `Delete ${course.title}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, course.id))) })] }) })) })] }) }), _jsx(TabsContent, { value: "content", className: "space-y-6", children: !selectedCourseForContent ? (_jsx(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: _jsx(CardContent, { className: `p-10 text-center ${mutedText}`, children: "Please select a course from the \"Program Structure\" tab to manage its weekly content." }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: `text-2xl font-semibold ${deepBrown}`, children: ["Manage Content for: ", _jsx("span", { className: goldAccent, children: selectedCourseForContent.title })] }), _jsx("p", { className: midBrown, children: "Add/edit weeks, learning materials, and quizzes." })] }), _jsxs(Button, { className: primaryButtonClasses, onClick: () => { setEditingWeek(null); setShowWeekModal(true); }, children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), "Add New Week"] })] }), isLoadingWeeks ? (_jsx("div", { className: "flex justify-center items-center p-10", children: _jsx(Loader2, { className: `h-8 w-8 animate-spin ${goldAccent}` }) })) : courseWeeks.length === 0 ? (_jsx(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: _jsx(CardContent, { className: `p-6 text-center ${mutedText}`, children: "No weekly modules defined for this course yet. Use 'Add New Week'." }) })) : (_jsx("div", { className: "space-y-6", children: courseWeeks.map((week) => {
                                                const details = contentDetails[week.id];
                                                return (_jsxs(Card, { className: `${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: `flex items-center gap-2 ${deepBrown}`, children: ["Week ", week.weekNumber, ": ", week.title || `Week ${week.weekNumber} Title Needed`] }), _jsx(CardDescription, { className: midBrown, children: week.description || 'No description provided.' })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", className: ghostButtonClasses, onClick: () => { setEditingWeek(week); setShowWeekModal(true); }, "aria-label": `Edit Week ${week.weekNumber}`, children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600`, onClick: () => handleDeleteWeek(week.id), "aria-label": `Delete Week ${week.weekNumber}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }), _jsxs(CardContent, { children: [!details && (_jsx(Button, { variant: "link", className: `${linkClasses} p-0 h-auto`, onClick: () => fetchWeekDetails(week.id), children: "Load Week Details" })), details?.loading && _jsxs("div", { className: `flex justify-center items-center p-4 ${midBrown}`, children: [_jsx(Loader2, { className: `h-5 w-5 animate-spin ${goldAccent}` }), " Loading details..."] }), details?.error && _jsx("div", { className: "p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm", children: details.error }), details && !details.loading && !details.error && (_jsxs("div", { className: `grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t ${tableRowBorder} mt-4`, children: [_jsxs("div", { children: [_jsx("h3", { className: `font-medium mb-3 text-lg ${deepBrown}`, children: "Learning Materials" }), _jsxs("div", { className: "space-y-2", children: [details.materials.length === 0 ? (_jsx("p", { className: `text-sm italic ${mutedText}`, children: "No materials added." })) : (details.materials.map(material => (_jsxs("div", { className: `flex items-center justify-between p-2 rounded-lg border ${inputBorder} bg-gray-50/50 dark:bg-gray-800/30 text-sm`, children: [_jsxs("div", { className: `flex items-center gap-2 overflow-hidden ${midBrown}`, children: [material.type === 'video' ? _jsx(Video, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }) : material.type === 'reading' ? _jsx(BookOpen, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }) : _jsx(FileText, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }), _jsx("span", { className: "truncate", title: material.title, children: material.title }), material.details && _jsxs("span", { className: `text-xs ${mutedText} flex-shrink-0`, children: ["(", material.details, ")"] })] }), _jsxs("div", { className: "flex items-center gap-0 flex-shrink-0", children: [_jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-7 w-7`, "aria-label": `Edit ${material.title}`, onClick: () => openMaterialModal(material, week.id), children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-7 w-7`, "aria-label": `Delete ${material.title}`, onClick: () => handleDeleteMaterial(material.id, week.id), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }, material.id)))), _jsxs(Button, { variant: "outline", size: "sm", className: `w-full mt-2 ${outlineButtonClasses}`, onClick: () => openMaterialModal(null, week.id), children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add Material"] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: `font-medium mb-3 text-lg ${deepBrown}`, children: "Quizzes" }), _jsxs("div", { className: "space-y-2", children: [details.quizzes.length === 0 ? (_jsx("p", { className: `text-sm italic ${mutedText}`, children: "No quizzes added." })) : (details.quizzes.map(quiz => (_jsxs("div", { className: `flex items-center justify-between p-2 rounded-lg border ${inputBorder} bg-gray-50/50 dark:bg-gray-800/30 text-sm`, children: [_jsxs("div", { className: `flex items-center gap-2 overflow-hidden ${midBrown}`, children: [_jsx(HelpCircle, { className: `h-4 w-4 ${goldAccent} flex-shrink-0` }), _jsx("span", { className: "truncate", title: quiz.title, children: quiz.title }), quiz.dueDateOffsetDays !== null && _jsxs("span", { className: `text-xs ${mutedText} flex-shrink-0`, children: ["(Due +", quiz.dueDateOffsetDays, "d)"] })] }), _jsxs("div", { className: "flex items-center gap-0 flex-shrink-0", children: [_jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-7 w-7`, "aria-label": `Edit ${quiz.title}`, onClick: () => openQuizModal(quiz, week.id), children: _jsx(Edit, { className: "h-3.5 w-3.5" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} hover:text-red-600 h-7 w-7`, "aria-label": `Delete ${quiz.title}`, onClick: () => handleDeleteQuiz(quiz.id, week.id), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] })] }, quiz.id)))), _jsxs(Button, { variant: "outline", size: "sm", className: `w-full mt-2 ${outlineButtonClasses}`, onClick: () => openQuizModal(null, week.id), children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " Add Quiz"] })] })] })] }))] })] }, week.id));
                                            }) }))] })) })] })] }), _jsx(CreateEditCourseModal, { isOpen: showCourseModal, onClose: () => { setShowCourseModal(false); setEditingCourse(null); }, course: editingCourse, onSave: handleSaveCourse }), _jsx(CreateEditWeekModal, { isOpen: showWeekModal, onClose: () => { setShowWeekModal(false); setEditingWeek(null); }, week: editingWeek, courseId: selectedCourseForContent?.id, onSave: handleSaveWeek, existingWeekNumbers: courseWeeks.map(w => w.weekNumber) }), _jsx(CreateEditMaterialModal, { isOpen: showMaterialModal, onClose: () => { setShowMaterialModal(false); setEditingMaterial(null); setCurrentWeekIdForModal(undefined); }, material: editingMaterial, weekId: currentWeekIdForModal, onSave: handleSaveMaterial }), _jsx(CreateEditQuizModal, { isOpen: showQuizModal, onClose: () => { setShowQuizModal(false); setEditingQuiz(null); setCurrentWeekIdForModal(undefined); }, quiz: editingQuiz, weekId: currentWeekIdForModal, onSave: handleSaveQuiz })] }));
}
