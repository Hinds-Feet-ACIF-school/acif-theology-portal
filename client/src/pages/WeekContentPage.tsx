// src/pages/WeekContentPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Loader2, AlertCircle, ArrowLeft, CheckSquare, HelpCircle as HelpCircleIcon } from 'lucide-react';
import * as apiService from '../services/api.js';
import type { Week, Section, ContentItem, RichContentItemBlock, VideoBlockContent, QuizBlockContent, QuizQuestion as ApiQuizQuestion } from '../services/api.js';
import { Input } from "../components/ui/input.js";
import { Textarea } from "../components/ui/textarea.js";

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
// ---

interface UserProgress {
    [sectionId: string]: boolean;
}

const WeekContentPage: React.FC = () => {
    const { courseId, weekId } = useParams<{ courseId: string; weekId: string }>();
    const navigate = useNavigate();

    const [weekData, setWeekData] = useState<Week | null>(null);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProgress, setUserProgress] = useState<UserProgress>({});

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
                console.log("WeekContentPage: Fetched Week Data Stringified:", JSON.stringify(fetchedWeek, (key, value) => {
                    if (value instanceof File) { return { name: value.name, type: value.type, size: value.size, lastModified: value.lastModified }; }
                    return value;
                }, 2));

                if (fetchedWeek && Array.isArray(fetchedWeek.sections)) {
                    setWeekData(fetchedWeek);
                    const sortedSections = [...fetchedWeek.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
                    if (sortedSections.length > 0) {
                        setCurrentSection(sortedSections[0]);
                        console.log("WeekContentPage: Initial current section set:", sortedSections[0].title);
                    } else {
                        setCurrentSection(null);
                        console.log("WeekContentPage: No sections found in the fetched week.");
                    }
                } else {
                    setError("Week data not found or sections are improperly structured.");
                    console.error("WeekContentPage: Problem with fetchedWeek structure or sections array.", fetchedWeek);
                    setWeekData(null);
                    setCurrentSection(null);
                }
            } catch (err) {
                console.error("WeekContentPage: Failed to load week content:", err);
                setError((err as Error).message || "An unexpected error occurred while fetching week content.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchWeekDetails();
    }, [courseId, weekId]);

    const handleSectionSelect = (sectionId: string) => {
        const selected = weekData?.sections?.find(s => s.id === sectionId);
        if (selected) {
            console.log("WeekContentPage: Section selected:", selected.title);
            setCurrentSection(selected);
            const mainContentArea = document.getElementById('main-content-area');
            if (mainContentArea) mainContentArea.scrollTop = 0;
        } else {
            console.warn("WeekContentPage: Attempted to select non-existent section ID:", sectionId);
        }
    };

    const handleMarkSectionComplete = async (sectionId: string, isCompleted: boolean) => { /* ... */ };

    const renderRichContentBlock = (block: RichContentItemBlock, blockIndex: number) => {
        // Logging can happen here before returning JSX
        console.log(`WeekContentPage: Preparing to render RichContentBlock ${blockIndex} (ID: ${block.id}, Type: ${block.type}):`, JSON.stringify(block, (k, v) => v instanceof File ? {name:v.name, type:v.type} : v, 2));
        
        return (
            <div key={block.id || `block-${blockIndex}`} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                {block.type === 'text' && block.content && (
                    <div className={`prose prose-sm dark:prose-invert max-w-none ${defaultDarkTextColor}`} dangerouslySetInnerHTML={{ __html: block.content }} />
                )}
                {block.type === 'video' && block.videoContent && (
                    <div className="not-prose my-2">
                        <h4 className={`text-lg font-semibold mb-1.5 ${deepBrown}`}>{block.videoContent.title || 'Video'}</h4>
                        {block.videoContent.description && <p className={`text-sm mb-2 ${midBrown}`}>{block.videoContent.description}</p>}
                        {(() => {
                            let videoSourceUrl: string | undefined = undefined;
                            const vc = block.videoContent;
                            if (vc?.videoUrl) {
                                videoSourceUrl = vc.videoUrl.startsWith('http') 
                                    ? vc.videoUrl 
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${vc.videoUrl.startsWith('/') ? '' : '/'}${vc.videoUrl}`;
                            } else if (vc?.videoFile instanceof File) {
                                try { videoSourceUrl = URL.createObjectURL(vc.videoFile); }
                                catch (e) { console.error("Error creating object URL for videoFile:", e, vc.videoFile); }
                            }

                            let thumbnailSourceUrl: string | undefined = undefined;
                            if (vc?.thumbnailUrl) {
                                thumbnailSourceUrl = vc.thumbnailUrl.startsWith('http')
                                    ? vc.thumbnailUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${vc.thumbnailUrl.startsWith('/') ? '' : '/'}${vc.thumbnailUrl}`;
                            } else if (vc?.thumbnail instanceof File) {
                                try { thumbnailSourceUrl = URL.createObjectURL(vc.thumbnail); }
                                catch (e) { console.error("Error creating object URL for thumbnail:", e, vc.thumbnail); }
                            }

                            if (videoSourceUrl) return <video controls src={videoSourceUrl} poster={thumbnailSourceUrl} className="w-full max-w-2xl mx-auto rounded-md aspect-video bg-black my-2"></video>;
                            return <div className={`p-3 ${editorCardBg} rounded text-center text-xs ${mutedText}`}>Video source not available.</div>;
                        })()}
                        {block.videoContent.isRequired && <span className="text-xs text-red-500">(Required Video)</span>}
                    </div>
                )}
                {block.type === 'quiz' && block.quizContent && (
                     <div className={`not-prose my-3 p-4 border rounded-lg ${editorCardBg} ${themedInputBorder}`}>
                        <h4 className={`text-lg font-semibold mb-1.5 ${deepBrown}`}>{block.quizContent.title || 'Quiz'}</h4>
                        {block.quizContent.description && <p className={`text-sm mb-2 ${midBrown}`}>{block.quizContent.description}</p>}
                        <Button 
                            onClick={() => {
                                const quizTargetId = block.quizContent?.id;
                                if (quizTargetId) {
                                    if (quizTargetId.startsWith('http')) { window.open(quizTargetId, '_blank'); }
                                    else { navigate(`/quiz/${quizTargetId}`); }
                                } else { alert("Quiz link or ID not available."); }
                            }} 
                            className={`${primaryButtonClasses} mt-2`}
                        >
                            Start Quiz
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} /></div>;
    if (error) return <div className="text-center p-8 text-red-600"><AlertCircle className="inline mr-2" />Error: {error} <Button onClick={() => navigate(-1)} className={`${outlineButtonClasses} ml-4`}>Go Back</Button></div>;
    if (!weekData) return <div className="text-center p-8 text-gray-500">Week data not found. <Button onClick={() => navigate(-1)} className={`${outlineButtonClasses} ml-4`}>Go Back</Button></div>;

    const sortedSections = weekData.sections ? [...weekData.sections].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

    return (
        <div className={`flex flex-col md:flex-row min-h-screen ${lightBg}`}>
            <aside className={`w-full md:w-72 lg:w-80 border-r ${themedInputBorder} ${sidebarBg} p-4 md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0`}>
                {/* ... Sidebar content ... */}
                <div className="mb-4">
                    {courseId && (
                        <Button variant="link" onClick={() => navigate(`/courses/${courseId}`)} className={`p-0 mb-3 text-sm ${goldAccent} hover:underline flex items-center`}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Course
                        </Button>
                    )}
                    <h2 className={`text-xl font-semibold ${deepBrown}`}>Week {weekData.weekNumber}: {weekData.title}</h2>
                    {weekData.description && <p className={`text-sm mt-1 ${midBrown}`}>{weekData.description}</p>}
                </div>
                <nav className="space-y-1.5">
                    {sortedSections.length === 0 && <p className={`${mutedText} text-sm`}>No sections in this week.</p>}
                    {sortedSections.map(section => (
                        <Button
                            key={section.id}
                            variant="ghost"
                            onClick={() => handleSectionSelect(section.id)}
                            className={`w-full justify-start text-left h-auto py-2.5 px-3 rounded-md transition-colors duration-150
                                        ${currentSection?.id === section.id
                                            ? `bg-amber-100 dark:bg-amber-700/30 ${goldAccent} font-semibold`
                                            : `${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700/60`
                                        }`}
                        >
                            <span className="truncate">{section.order}. {section.title}</span>
                            {userProgress[section.id] && <CheckSquare className="ml-auto h-4 w-4 text-green-500 shrink-0" />}
                        </Button>
                    ))}
                </nav>
            </aside>

            <main id="main-content-area" className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                {currentSection ? (
                    <article className={`prose prose-base lg:prose-lg dark:prose-invert max-w-none ${defaultDarkTextColor}`}>
                        {/* Log currentSection before rendering its details */}
                        {(() => { 
                            console.log("WeekContentPage: Rendering currentSection details:", JSON.stringify(currentSection, (k,v) => v instanceof File ? {name:v.name} : v, 2));
                            return null; // This IIFE now returns null, which is a valid ReactNode
                        })()}
                        
                        <h1 className={`text-3xl lg:text-4xl font-bold mb-3 ${deepBrown}`}>{currentSection.title}</h1>
                        {currentSection.description && <p className={`text-lg mb-6 ${midBrown}`}>{currentSection.description}</p>}

                        {Array.isArray(currentSection.content) && currentSection.content.length > 0 ? (
                            currentSection.content.sort((a,b)=> (a.order || 0) - (b.order || 0)).map((contentItem, index) => {
                                // Log each contentItem before returning its JSX
                                console.log(`WeekContentPage: Preparing to render ContentItem ${index} (ID: ${contentItem.id}, Type: ${contentItem.type}):`, JSON.stringify(contentItem, (k,v) => v instanceof File ? {name:v.name} : v, 2));
                                return (
                                    <div key={contentItem.id || `ci-${index}`} className={`py-6 my-6 ${index > 0 ? `border-t ${themedInputBorder}` : ''}`}>
                                        <h2 className={`text-2xl lg:text-3xl font-semibold mt-2 mb-3 ${deepBrown}`}>{contentItem.title}</h2>
                                        {contentItem.isRequired && <span className={`text-sm font-medium text-red-600 dark:text-red-400 block mb-3`}>Required</span>}

                                        {Array.isArray(contentItem.richContent) && contentItem.richContent.length > 0 ? (
                                            <div className="mt-3 space-y-4">
                                                {contentItem.richContent.map((block, blockIdx) => {
                                                    if (!block) {
                                                        // Log if a block is unexpectedly null/undefined
                                                        console.warn(`WeekContentPage: RichContentBlock at index ${blockIdx} is null or undefined for ContentItem ID ${contentItem.id}`);
                                                        return <div key={`empty-block-${blockIdx}`} className="text-sm text-red-500">Empty or invalid rich content block found.</div>;
                                                    }
                                                    return renderRichContentBlock(block, blockIdx);
                                                })}
                                            </div>
                                        ) : contentItem.type === 'text' && contentItem.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: contentItem.content }} />
                                        ) : contentItem.type === 'video' && contentItem.url ? (
                                            <div className="not-prose my-4">
                                                <video controls src={contentItem.url} className="w-full max-w-2xl mx-auto rounded-md aspect-video bg-black"></video>
                                            </div>
                                        ) : contentItem.type === 'quiz_link' && contentItem.url ? (
                                            <div className="my-4">
                                                <a href={contentItem.url} target="_blank" rel="noopener noreferrer">
                                                    <Button className={`${primaryButtonClasses}`}> Go to Quiz: {contentItem.title} </Button>
                                                </a>
                                            </div>
                                        ) : (
                                            <p className={mutedText}>Content item type '{contentItem.type}' not fully renderable with available data.</p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className={`${mutedText} py-4`}>This section has no learning content items yet.</p>
                        )}

                        <div className={`mt-10 pt-6 border-t ${themedInputBorder} flex items-center space-x-3`}>
                            <Checkbox
                                id={`complete-${currentSection.id}`}
                                checked={!!userProgress[currentSection.id]}
                                onCheckedChange={(checked) => handleMarkSectionComplete(currentSection.id, !!checked)}
                                className="h-5 w-5 rounded data-[state=checked]:bg-green-500 data-[state=checked]:text-white data-[state=checked]:border-green-600 border-gray-400 dark:border-gray-500"
                            />
                            <label htmlFor={`complete-${currentSection.id}`} className={`text-base font-medium leading-none ${midBrown} cursor-pointer select-none`}>Mark as Completed</label>
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-10">
                        <HelpCircleIcon className={`mx-auto h-16 w-16 ${mutedText}`} />
                        <p className={`mt-5 text-xl font-semibold ${deepBrown}`}>
                            {sortedSections.length > 0 ? "Select a section to begin" : "No sections available in this week."}
                        </p>
                        {sortedSections.length > 0 && <p className={`${mutedText} mt-1`}>Choose a section from the sidebar to view its content.</p>}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WeekContentPage;