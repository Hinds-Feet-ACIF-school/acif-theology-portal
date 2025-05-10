import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/WeekContentPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Loader2, AlertCircle, ArrowLeft, CheckSquare, HelpCircle as HelpCircleIcon, ArrowRight } from 'lucide-react'; // Added ArrowRight
import * as apiService from '../services/api.js';
// --- Styling Constants ---
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const lightBg = 'bg-[#FFF8F0] dark:bg-gray-950';
const sidebarBg = 'bg-gray-100 dark:bg-gray-800';
const themedInputBorder = `border-gray-300 dark:border-gray-600`;
const mutedText = 'text-gray-600 dark:text-gray-400';
const defaultDarkTextColor = 'dark:text-gray-200';
const themedInputBg = `bg-white dark:bg-gray-700`;
const focusRing = 'focus:ring-2 focus:ring-offset-1 focus:ring-[#C5A467]/80 focus:outline-none';
const inputClasses = `h-9 rounded-md px-3 text-sm ${themedInputBg} ${themedInputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400`;
const primaryButtonClasses = `bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const editorCardBg = 'dark:bg-gray-800/50';
const WeekContentPage = () => {
    const { courseId, weekId } = useParams();
    const navigate = useNavigate();
    const [weekData, setWeekData] = useState(null);
    const [currentSection, setCurrentSection] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProgress, setUserProgress] = useState({});
    useEffect(() => {
        console.log("WeekContentPage: Mounting or courseId/weekId changed.", { courseId, weekId });
        const fetchWeekDetails = async () => {
            if (!weekId || !courseId) {
                setError("Course or Week ID is missing from URL.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            console.log(`WeekContentPage: Fetching details for weekId: ${weekId}`);
            try {
                const fetchedWeek = await apiService.getWeekWithDetails(weekId);
                console.log("WeekContentPage: Fetched Week Data RAW:", fetchedWeek);
                // Removed detailed stringify for brevity in this diff, it's good for debugging
                if (fetchedWeek && Array.isArray(fetchedWeek.sections)) {
                    setWeekData(fetchedWeek);
                    const sortedSections = [...fetchedWeek.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
                    if (sortedSections.length > 0) {
                        // Try to restore current section from URL hash or sessionStorage, or default to first
                        const hashSectionId = window.location.hash.substring(1);
                        const restoredSection = sortedSections.find(s => s.id === hashSectionId);
                        setCurrentSection(restoredSection || sortedSections[0]);
                        console.log("WeekContentPage: Initial current section set:", (restoredSection || sortedSections[0]).title);
                    }
                    else {
                        setCurrentSection(null);
                        console.log("WeekContentPage: No sections found in the fetched week.");
                    }
                }
                else {
                    setError("Week data not found or sections are improperly structured.");
                    console.error("WeekContentPage: Problem with fetchedWeek structure or sections array.", fetchedWeek);
                    setWeekData(null);
                    setCurrentSection(null);
                }
            }
            catch (err) {
                console.error("WeekContentPage: Failed to load week content:", err);
                setError(err.message || "An unexpected error occurred while fetching week content.");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchWeekDetails();
    }, [courseId, weekId]);
    useEffect(() => {
        // Update URL hash when currentSection changes
        if (currentSection) {
            navigate(`#${currentSection.id}`, { replace: true });
        }
    }, [currentSection, navigate]);
    const handleSectionSelect = (sectionId) => {
        const selected = weekData?.sections?.find(s => s.id === sectionId);
        if (selected) {
            console.log("WeekContentPage: Section selected:", selected.title);
            setCurrentSection(selected);
            const mainContentArea = document.getElementById('main-content-area');
            if (mainContentArea)
                mainContentArea.scrollTop = 0;
        }
        else {
            console.warn("WeekContentPage: Attempted to select non-existent section ID:", sectionId);
        }
    };
    const handleMarkSectionComplete = async (sectionId, isCompleted) => {
        console.log(`WeekContentPage: Marking section ${sectionId} as ${isCompleted ? 'complete' : 'incomplete'}`);
        // Placeholder for API call to update progress
        setUserProgress(prev => ({ ...prev, [sectionId]: isCompleted }));
        // Example:
        // try {
        //   await apiService.updateSectionProgress(courseId!, weekId!, sectionId, isCompleted);
        // } catch (error) {
        //   console.error("Failed to update section progress:", error);
        //   // Revert UI change on error
        //   setUserProgress(prev => ({ ...prev, [sectionId]: !isCompleted }));
        //   alert("Could not update progress. Please try again.");
        // }
    };
    const renderRichContentBlock = (block, blockIndex) => {
        // Logging can happen here before returning JSX
        // console.log(`WeekContentPage: Preparing to render RichContentBlock ${blockIndex} (ID: ${block.id}, Type: ${block.type}):`, JSON.stringify(block, (k, v) => v instanceof File ? {name:v.name, type:v.type} : v, 2));
        return (_jsxs("div", { className: `mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`, children: [block.type === 'text' && block.content && (_jsx("div", { className: `prose prose-sm dark:prose-invert max-w-none ${defaultDarkTextColor}`, dangerouslySetInnerHTML: { __html: block.content } })), block.type === 'video' && block.videoContent && (_jsxs("div", { className: "not-prose my-2", children: [_jsx("h4", { className: `text-lg font-semibold mb-1.5 ${deepBrown}`, children: block.videoContent.title || 'Video' }), block.videoContent.description && _jsx("p", { className: `text-sm mb-2 ${midBrown}`, children: block.videoContent.description }), (() => {
                            let videoSourceUrl = undefined;
                            const vc = block.videoContent;
                            if (vc?.videoUrl) {
                                videoSourceUrl = vc.videoUrl.startsWith('http')
                                    ? vc.videoUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${vc.videoUrl.startsWith('/') ? '' : '/'}${vc.videoUrl}`;
                            }
                            else if (vc?.videoFile instanceof File) {
                                try {
                                    videoSourceUrl = URL.createObjectURL(vc.videoFile);
                                }
                                catch (e) {
                                    console.error("Error creating object URL for videoFile:", e, vc.videoFile);
                                }
                            }
                            let thumbnailSourceUrl = undefined;
                            if (vc?.thumbnailUrl) {
                                thumbnailSourceUrl = vc.thumbnailUrl.startsWith('http')
                                    ? vc.thumbnailUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${vc.thumbnailUrl.startsWith('/') ? '' : '/'}${vc.thumbnailUrl}`;
                            }
                            else if (vc?.thumbnail instanceof File) {
                                try {
                                    thumbnailSourceUrl = URL.createObjectURL(vc.thumbnail);
                                }
                                catch (e) {
                                    console.error("Error creating object URL for thumbnail:", e, vc.thumbnail);
                                }
                            }
                            if (videoSourceUrl)
                                return _jsx("video", { controls: true, src: videoSourceUrl, poster: thumbnailSourceUrl, className: "w-full max-w-2xl mx-auto rounded-md aspect-video bg-black my-2" });
                            return _jsx("div", { className: `p-3 ${editorCardBg} rounded text-center text-xs ${mutedText}`, children: "Video source not available." });
                        })(), block.videoContent.isRequired && _jsx("span", { className: "text-xs text-red-500", children: "(Required Video)" })] })), block.type === 'quiz' && block.quizContent && (_jsxs("div", { className: `not-prose my-3 p-4 border rounded-lg ${editorCardBg} ${themedInputBorder}`, children: [_jsx("h4", { className: `text-lg font-semibold mb-1.5 ${deepBrown}`, children: block.quizContent.title || 'Quiz' }), block.quizContent.description && _jsx("p", { className: `text-sm mb-2 ${midBrown}`, children: block.quizContent.description }), _jsx(Button, { onClick: () => {
                                const quizTargetId = block.quizContent?.id;
                                if (quizTargetId) {
                                    if (quizTargetId.startsWith('http')) {
                                        window.open(quizTargetId, '_blank');
                                    }
                                    else {
                                        navigate(`/quiz/${quizTargetId}`);
                                    }
                                }
                                else {
                                    alert("Quiz link or ID not available.");
                                }
                            }, className: `${primaryButtonClasses} mt-2`, children: "Start Quiz" })] }))] }, block.id || `block-${blockIndex}`));
    };
    if (isLoading)
        return _jsx("div", { className: "flex justify-center items-center h-screen", children: _jsx(Loader2, { className: `h-12 w-12 animate-spin ${goldAccent}` }) });
    if (error)
        return _jsxs("div", { className: "text-center p-8 text-red-600", children: [_jsx(AlertCircle, { className: "inline mr-2" }), "Error: ", error, " ", _jsx(Button, { onClick: () => navigate(-1), className: `${outlineButtonClasses} ml-4`, children: "Go Back" })] });
    if (!weekData)
        return _jsxs("div", { className: "text-center p-8 text-gray-500", children: ["Week data not found. ", _jsx(Button, { onClick: () => navigate(-1), className: `${outlineButtonClasses} ml-4`, children: "Go Back" })] });
    const sortedSections = weekData.sections ? [...weekData.sections].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
    // --- Logic for Next Section Button ---
    let currentSectionIndex = -1;
    let hasNextSection = false;
    let nextSection = null;
    if (currentSection && sortedSections.length > 0) {
        currentSectionIndex = sortedSections.findIndex(s => s.id === currentSection.id);
        if (currentSectionIndex !== -1 && currentSectionIndex < sortedSections.length - 1) {
            hasNextSection = true;
            nextSection = sortedSections[currentSectionIndex + 1];
        }
    }
    // --- End Logic for Next Section Button ---
    return (_jsxs("div", { className: `flex flex-col md:flex-row min-h-screen ${lightBg}`, children: [_jsxs("aside", { className: `w-full md:w-72 lg:w-80 border-r ${themedInputBorder} ${sidebarBg} p-4 md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0`, children: [_jsxs("div", { className: "mb-4", children: [courseId && (_jsxs(Button, { variant: "link", onClick: () => navigate(`/courses/${courseId}`), className: `p-0 mb-3 text-sm ${goldAccent} hover:underline flex items-center`, children: [_jsx(ArrowLeft, { className: "mr-1.5 h-4 w-4" }), " Back to Course"] })), _jsxs("h2", { className: `text-xl font-semibold ${deepBrown}`, children: ["Week ", weekData.weekNumber, ": ", weekData.title] }), weekData.description && _jsx("p", { className: `text-sm mt-1 ${midBrown}`, children: weekData.description })] }), _jsxs("nav", { className: "space-y-1.5", children: [sortedSections.length === 0 && _jsx("p", { className: `${mutedText} text-sm`, children: "No sections in this week." }), sortedSections.map(section => (_jsxs(Button, { variant: "ghost", onClick: () => handleSectionSelect(section.id), className: `w-full justify-start text-left h-auto py-2.5 px-3 rounded-md transition-colors duration-150
                                        ${currentSection?.id === section.id
                                    ? `bg-amber-100 dark:bg-amber-700/30 ${goldAccent} font-semibold`
                                    : `${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700/60`}`, children: [_jsxs("span", { className: "truncate", children: [section.order, ". ", section.title] }), userProgress[section.id] && _jsx(CheckSquare, { className: "ml-auto h-4 w-4 text-green-500 shrink-0" })] }, section.id)))] })] }), _jsx("main", { id: "main-content-area", className: "flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto", children: currentSection ? (_jsxs("article", { className: `prose prose-base lg:prose-lg dark:prose-invert max-w-none ${defaultDarkTextColor}`, children: [(() => {
                            // console.log("WeekContentPage: Rendering currentSection details:", JSON.stringify(currentSection, (k,v) => v instanceof File ? {name:v.name} : v, 2));
                            return null;
                        })(), _jsx("h1", { className: `text-3xl lg:text-4xl font-bold mb-3 ${deepBrown}`, children: currentSection.title }), currentSection.description && _jsx("p", { className: `text-lg mb-6 ${midBrown}`, children: currentSection.description }), Array.isArray(currentSection.content) && currentSection.content.length > 0 ? (currentSection.content.sort((a, b) => (a.order || 0) - (b.order || 0)).map((contentItem, index) => {
                            // console.log(`WeekContentPage: Preparing to render ContentItem ${index} (ID: ${contentItem.id}, Type: ${contentItem.type}):`, JSON.stringify(contentItem, (k,v) => v instanceof File ? {name:v.name} : v, 2));
                            return (_jsxs("div", { className: `py-6 my-6 ${index > 0 ? `border-t ${themedInputBorder}` : ''}`, children: [_jsx("h2", { className: `text-2xl lg:text-3xl font-semibold mt-2 mb-3 ${deepBrown}`, children: contentItem.title }), contentItem.isRequired && _jsx("span", { className: `text-sm font-medium text-red-600 dark:text-red-400 block mb-3`, children: "Required" }), Array.isArray(contentItem.richContent) && contentItem.richContent.length > 0 ? (_jsx("div", { className: "mt-3 space-y-4", children: contentItem.richContent.map((block, blockIdx) => {
                                            if (!block) {
                                                console.warn(`WeekContentPage: RichContentBlock at index ${blockIdx} is null or undefined for ContentItem ID ${contentItem.id}`);
                                                return _jsx("div", { className: "text-sm text-red-500", children: "Empty or invalid rich content block found." }, `empty-block-${blockIdx}`);
                                            }
                                            return renderRichContentBlock(block, blockIdx);
                                        }) })) : contentItem.type === 'text' && contentItem.content ? (_jsx("div", { dangerouslySetInnerHTML: { __html: contentItem.content } })) : contentItem.type === 'video' && contentItem.url ? (_jsx("div", { className: "not-prose my-4", children: _jsx("video", { controls: true, src: contentItem.url, className: "w-full max-w-2xl mx-auto rounded-md aspect-video bg-black" }) })) : contentItem.type === 'quiz_link' && contentItem.url ? (_jsx("div", { className: "my-4", children: _jsx("a", { href: contentItem.url, target: "_blank", rel: "noopener noreferrer", children: _jsxs(Button, { className: `${primaryButtonClasses}`, children: [" Go to Quiz: ", contentItem.title, " "] }) }) })) : (_jsxs("p", { className: mutedText, children: ["Content item type '", contentItem.type, "' not fully renderable with available data."] }))] }, contentItem.id || `ci-${index}`));
                        })) : (_jsx("p", { className: `${mutedText} py-4`, children: "This section has no learning content items yet." })), _jsxs("div", { className: `mt-10 pt-6 border-t ${themedInputBorder} flex flex-col sm:flex-row items-center sm:justify-between gap-4`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Checkbox, { id: `complete-${currentSection.id}`, checked: !!userProgress[currentSection.id], onCheckedChange: (checked) => handleMarkSectionComplete(currentSection.id, !!checked), className: "h-5 w-5 rounded data-[state=checked]:bg-green-500 data-[state=checked]:text-white data-[state=checked]:border-green-600 border-gray-400 dark:border-gray-500" }), _jsx("label", { htmlFor: `complete-${currentSection.id}`, className: `text-base font-medium leading-none ${midBrown} cursor-pointer select-none`, children: "Mark as Completed" })] }), hasNextSection && nextSection && (_jsxs(Button, { onClick: () => handleSectionSelect(nextSection.id), className: `${primaryButtonClasses} flex items-center group`, children: [_jsxs("span", { children: ["Next: ", nextSection.title.substring(0, 20), nextSection.title.length > 20 ? '...' : ''] }), _jsx(ArrowRight, { className: "ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" })] }))] })] })) : (_jsxs("div", { className: "text-center py-10", children: [_jsx(HelpCircleIcon, { className: `mx-auto h-16 w-16 ${mutedText}` }), _jsx("p", { className: `mt-5 text-xl font-semibold ${deepBrown}`, children: sortedSections.length > 0 ? "Select a section to begin" : "No sections available in this week." }), sortedSections.length > 0 && _jsx("p", { className: `${mutedText} mt-1`, children: "Choose a section from the sidebar to view its content." })] })) })] }));
};
export default WeekContentPage;
