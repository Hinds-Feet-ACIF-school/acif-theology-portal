import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Loader2, AlertCircle, ArrowLeft, CheckSquare, HelpCircle as HelpCircleIcon, ArrowRight } from 'lucide-react';
import * as apiService from '../services/api';
import type { Week, Section, ContentItem, RichContentItemBlock, QuizBlockContent, UserQuizSubmission } from '../services/api';
import QuizDisplay from '../components/QuizDisplay';
import { useAuth } from '../context/AuthContext.js';

const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const lightBg = 'bg-[#FFF8F0] dark:bg-gray-950';
const sidebarBg = 'bg-gray-100 dark:bg-gray-800';
const themedInputBorder = `border-gray-300 dark:border-gray-600`;
const mutedText = 'text-gray-800 dark:text-gray-400';
const editorCardBg = 'dark:bg-gray-800/50';
const primaryButtonClasses = `bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;

interface UserProgress {
    [sectionId: string]: boolean;
}

interface InitialSubmissionsState {
    [databaseQuizId: string]: UserQuizSubmission | null | undefined;
}
interface LoadingSubmissionsState {
    [databaseQuizId: string]: boolean;
}

const WeekContentPage: React.FC = () => {
    const params = useParams<{ courseId: string; weekId: string }>();
    const courseId = params.courseId;
    const weekId = params.weekId;   
    
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [weekData, setWeekData] = useState<Week | null>(null);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProgress, setUserProgress] = useState<UserProgress>({});
    const [isProgressUpdating, setIsProgressUpdating] = useState<Record<string, boolean>>({});
    
    const [initialSubmissions, setInitialSubmissions] = useState<InitialSubmissionsState>({});
    const [loadingSubmissions, setLoadingSubmissions] = useState<LoadingSubmissionsState>({});

    useEffect(() => {
        console.log("WeekContentPage: useEffect [courseId, weekId] - Params are:", { courseId, weekId });

        if (!courseId || !weekId) {
            console.log("WeekContentPage: courseId or weekId from useParams is still undefined. Waiting.");
            setIsLoading(true); 
            return; 
        }

        const fetchWeekAndProgress = async () => {
            console.log("WeekContentPage: Starting fetchWeekAndProgress with defined:", { weekId, courseId });
            setIsLoading(true); 
            setError(null);
            setUserProgress({});
            setInitialSubmissions({}); 
            setLoadingSubmissions({});

            try {
                const [fetchedWeek, fetchedProgress] = await Promise.all([
                    apiService.getWeekWithDetails(weekId),
                    apiService.getUserWeekProgress(weekId)
                ]);

                console.log("WeekContentPage: Fetched week data:", fetchedWeek ? fetchedWeek.title : 'No week data');

                if (fetchedWeek && Array.isArray(fetchedWeek.sections)) {
                    setWeekData(fetchedWeek);
                    const sortedSectionsForInit = [...fetchedWeek.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
                    if (sortedSectionsForInit.length > 0) {
                        const hashSectionId = window.location.hash.substring(1);
                        const restoredSection = sortedSectionsForInit.find(s => s.id === hashSectionId);
                        const sectionToSet = restoredSection || sortedSectionsForInit[0];
                        setCurrentSection(sectionToSet);
                        console.log("WeekContentPage: Current section set to:", sectionToSet?.title);
                    } else {
                        setCurrentSection(null);
                        console.log("WeekContentPage: No sections in fetched week.");
                    }
                } else {
                    setError("Week data not found or sections are improperly structured.");
                    setWeekData(null);
                    setCurrentSection(null);
                }

                if (fetchedProgress) {
                    setUserProgress(fetchedProgress);
                }

            } catch (err) {
                console.error("WeekContentPage: Failed to load week content or progress:", err);
                setError((err as Error).message || "An unexpected error occurred while fetching week data.");
                setWeekData(null);
                setCurrentSection(null);
                setUserProgress({});
            } finally {
                setIsLoading(false);
                console.log("WeekContentPage: fetchWeekAndProgress finished.");
            }
        };
        
        fetchWeekAndProgress();
    }, [courseId, weekId]); 
    
    const fetchInitialQuizSubmission = useCallback(async (actualQuizDatabaseId: string) => {
        if (!currentUser || !actualQuizDatabaseId) {
            console.warn("WeekContentPage: fetchInitialQuizSubmission - SKIPPING due to missing currentUser or actualQuizDatabaseId:", 
                { hasUser: !!currentUser, id: actualQuizDatabaseId });
            return;
        }
        console.log("WeekContentPage: fetchInitialQuizSubmission - FETCHING for actualQuizDatabaseId:", actualQuizDatabaseId);
        
        setLoadingSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: true }));
        try {
            const submission = await apiService.getMySubmissionForQuiz(actualQuizDatabaseId);
            console.log(`WeekContentPage: fetchInitialQuizSubmission - RECEIVED submission for ${actualQuizDatabaseId}:`, submission ? 'Submission found' : 'No submission');
            setInitialSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: submission }));
        } catch (err) {
            console.error(`WeekContentPage: Failed to fetch initial submission for quiz ${actualQuizDatabaseId}:`, err);
            setInitialSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: null })); // null indicates fetch error
        } finally {
            setLoadingSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: false }));
        }
    }, [currentUser]);


    useEffect(() => {
        if (currentSection?.content && currentUser && courseId && weekId) { 
            console.log("WeekContentPage: useEffect for fetching quiz submissions - TRIGGERED for section:", currentSection.title);
            currentSection.content.forEach(contentItem => {
                if (contentItem.richContent) {
                    contentItem.richContent.forEach(block => {
                        const actualQuizDatabaseId = block.quizContent?.databaseQuizId;
                        if (block.type === 'quiz' && actualQuizDatabaseId) {
                            // Fetch if not already fetched, not loading, and not errored (null)
                            if (initialSubmissions[actualQuizDatabaseId] === undefined && !loadingSubmissions[actualQuizDatabaseId]) {
                                console.log(`WeekContentPage: Queuing fetch for quiz ${actualQuizDatabaseId} in section ${currentSection.title}`);
                                fetchInitialQuizSubmission(actualQuizDatabaseId);
                            } else {
                                console.log(`WeekContentPage: Skipping fetch for quiz ${actualQuizDatabaseId}, status: initial=${initialSubmissions[actualQuizDatabaseId]}, loading=${loadingSubmissions[actualQuizDatabaseId]}`);
                            }
                        }
                    });
                }
            });
        } else {
            console.log("WeekContentPage: useEffect for fetching quiz submissions - SKIPPED (waiting for section, user, or route params).", {
                hasSection: !!currentSection,
                hasUser: !!currentUser,
                hasCourseId: !!courseId,
                hasWeekId: !!weekId
            });
        }
    }, [currentSection, fetchInitialQuizSubmission, initialSubmissions, loadingSubmissions, currentUser, courseId, weekId]);


    useEffect(() => {
        if (currentSection && weekData && currentSection.id) {
             if (window.location.hash !== `#${currentSection.id}`) {
                navigate(`#${currentSection.id}`, { replace: true });
             }
        }
    }, [currentSection, weekData, navigate]);

    const handleSectionSelect = useCallback((sectionId: string) => {
        const selected = weekData?.sections?.find(s => s.id === sectionId);
        if (selected) {
            console.log("WeekContentPage: handleSectionSelect - New section selected:", selected.title);
            setCurrentSection(selected);
        } else {
            console.warn("WeekContentPage: handleSectionSelect - Section ID not found:", sectionId);
        }
    }, [weekData]);

    const handleMarkSectionComplete = async (sectionId: string, isCompleted: boolean) => {
        if (!weekId || !sectionId) {
            alert("An error occurred. Cannot save progress.");
            return;
        }
        setIsProgressUpdating(prev => ({ ...prev, [sectionId]: true }));
        const previousProgress = { ...userProgress };
        setUserProgress(prev => ({ ...prev, [sectionId]: isCompleted }));
        try {
            await apiService.updateSectionProgress(weekId, sectionId, isCompleted);
        } catch (error) {
            console.error("Failed to update section progress:", error);
            setUserProgress(previousProgress);
            alert(`Could not update progress for section "${currentSection?.title || sectionId}". Please check your connection and try again.`);
        } finally {
            setIsProgressUpdating(prev => ({ ...prev, [sectionId]: false }));
        }
    };

    const handleQuizSubmitSuccessForBlock = (dbQuizId: string) => {
        console.log(`WeekContentPage: Quiz ${dbQuizId} submitted successfully. Refetching submission.`);
        fetchInitialQuizSubmission(dbQuizId); // Refetch to update the submission state
    };

    const renderRichContentBlock = (block: RichContentItemBlock, blockIndex: number) => {
        const blockKey = block.id || `block-${blockIndex}`; // Use block.id if available, otherwise index

        if (block.type === 'quiz' && block.quizContent) {
            const actualQuizDatabaseId = block.quizContent.databaseQuizId;
                                                    
            if (!actualQuizDatabaseId) {
                console.error("WeekContentPage: Quiz content block is missing a databaseQuizId.", block.quizContent);
                return <div key={blockKey} className="text-sm text-red-500">Quiz config error: Missing Quiz ID.</div>;
            }

            const currentRouteCourseId = params.courseId;
            const currentRouteWeekId = params.weekId;

            if (!currentRouteCourseId || !currentRouteWeekId) {
                console.warn(`WeekContentPage: renderRichContentBlock for quiz ${actualQuizDatabaseId} - Route params missing. QuizDisplay might not init context.`);
                return (
                    <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                        <div className="p-4 text-orange-600">Initializing quiz context... (Route IDs missing)</div>
                    </div>
                );
            }
            
            // Log the specific quizData being passed
            console.log(`WeekContentPage: Rendering QuizDisplay for quiz ${actualQuizDatabaseId}. Passing quizData.title: ${block.quizContent.title}, questions count: ${block.quizContent.questions?.length || 0}`);
            console.log(`WeekContentPage: Full quizData for ${actualQuizDatabaseId}:`, JSON.parse(JSON.stringify(block.quizContent)));


            return (
                <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                    <QuizDisplay
                        key={actualQuizDatabaseId} // KEY ADDED HERE
                        quizData={block.quizContent}
                        databaseQuizId={actualQuizDatabaseId}
                        initialUserSubmission={initialSubmissions[actualQuizDatabaseId]} // Can be null or undefined
                        isLoadingInitialSubmission={loadingSubmissions[actualQuizDatabaseId] === true || initialSubmissions[actualQuizDatabaseId] === undefined}
                        onQuizSubmitSuccess={() => handleQuizSubmitSuccessForBlock(actualQuizDatabaseId)}
                        weekId={currentRouteWeekId}     
                        courseId={currentRouteCourseId} 
                    />
                </div>
            );
        }

        if (block.type === 'text' && block.content) {
            return (
                 <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                    <div className={`prose prose-sm dark:prose-invert max-w-none ${deepBrown}`} dangerouslySetInnerHTML={{ __html: block.content }} />
                </div>
            );
        }
        
        if (block.type === 'video' && block.videoContent) {
             return (
                <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                    <div className="not-prose my-2">
                        <h4 className={`text-lg font-semibold mb-1.5 ${deepBrown}`}>{block.videoContent.title || 'Video'}</h4>
                        {block.videoContent.description && <p className={`text-sm mb-2 ${midBrown}`}>{block.videoContent.description}</p>}
                        {(() => {
                            let videoSourceUrl: string | undefined = undefined;
                            const vc = block.videoContent;
                            if (vc?.videoUrl) {
                                videoSourceUrl = vc.videoUrl.startsWith('http')
                                    ? vc.videoUrl
                                    : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${vc.videoUrl.startsWith('/') ? '' : '/'}${vc.videoUrl}`;
                            }
                            let thumbnailSourceUrl: string | undefined = undefined;
                            if (vc?.thumbnailUrl) {
                                thumbnailSourceUrl = vc.thumbnailUrl.startsWith('http')
                                    ? vc.thumbnailUrl
                                    : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${vc.thumbnailUrl.startsWith('/') ? '' : '/'}${vc.thumbnailUrl}`;
                            }
                            if (videoSourceUrl) return <video controls src={videoSourceUrl} poster={thumbnailSourceUrl} className="w-full max-w-2xl mx-auto rounded-md aspect-video bg-black my-2"></video>;
                            return <div className={`p-3 ${editorCardBg} rounded text-center text-xs ${mutedText}`}>Video source not available.</div>;
                        })()}
                        {block.videoContent.isRequired && <span className="text-xs text-red-500">(Required Video)</span>}
                    </div>
                </div>
            );
        }

        console.warn("WeekContentPage: Unsupported block type or missing content for block:", block);
        return <div key={blockKey}>Unsupported block type: {block.type} or missing content.</div>;
    };

    if (isLoading || !courseId || !weekId) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} /></div>;
    }
    if (error) {
        return <div className="text-center p-8 text-red-600"><AlertCircle className="inline mr-2" />Error: {error} <Button onClick={() => navigate(-1)} className={`${outlineButtonClasses} ml-4`}>Go Back</Button></div>;
    }
    if (!weekData) {
        return <div className="text-center p-8 text-gray-500">Week data not found. <Button onClick={() => navigate(-1)} className={`${outlineButtonClasses} ml-4`}>Go Back</Button></div>;
    }

    const sortedSideBarSections = weekData.sections ? [...weekData.sections].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

    let currentSectionIndex = -1;
    let hasNextSection = false;
    let nextSectionData: Section | null = null; // Renamed to avoid conflict
    if (currentSection && sortedSideBarSections.length > 0 && currentSection.id) {
        currentSectionIndex = sortedSideBarSections.findIndex(s => s.id === currentSection.id);
        if (currentSectionIndex !== -1 && currentSectionIndex < sortedSideBarSections.length - 1) {
            hasNextSection = true;
            nextSectionData = sortedSideBarSections[currentSectionIndex + 1];
        }
    }

    return (
        <div className={`flex flex-col md:flex-row min-h-screen ${lightBg}`}>
            <aside className={`w-full md:w-72 lg:w-80 border-r ${themedInputBorder} ${sidebarBg} p-4 md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0`}>
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
                    {sortedSideBarSections.length === 0 && <p className={`${mutedText} text-sm`}>No sections in this week.</p>}
                    {sortedSideBarSections.map(section => (
                        <Button
                            key={section.id} // Key for sidebar items
                            variant="ghost"
                            onClick={() => handleSectionSelect(section.id!)}
                            className={`w-full justify-start text-left h-auto py-2.5 px-3 rounded-md transition-colors duration-150 relative
                                        ${currentSection?.id === section.id
                                            ? `bg-amber-100 dark:bg-amber-700/30 ${goldAccent} font-semibold`
                                            : `${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700/60`
                                        }`}
                        >
                            <span className="truncate pr-6">{section.order}. {section.title}</span>
                            {isProgressUpdating[section.id!] ? (
                                <Loader2 className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                            ) : userProgress[section.id!] ? (
                                <CheckSquare className="ml-auto h-4 w-4 text-green-500 shrink-0 absolute right-3 top-1/2 -translate-y-1/2" />
                            ) : null}
                        </Button>
                    ))}
                </nav>
            </aside>

            <main id="main-content-area" className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                {currentSection && currentSection.id ? (
                    <article key={currentSection.id} id={currentSection.id} className={`prose prose-base lg:prose-lg dark:prose-invert max-w-none ${deepBrown}`}>
                        <h1 className={`text-3xl lg:text-4xl font-bold mb-3 ${deepBrown}`}>{currentSection.title}</h1>
                        {currentSection.description && <p className={`text-lg mb-6 ${midBrown}`}>{currentSection.description}</p>}
                         {Array.isArray(currentSection.content) && currentSection.content.length > 0 ? (
                            ([...currentSection.content].sort((a, b) => (a.order || 0) - (b.order || 0))).map((contentItem, index) => (
                                <div key={contentItem.id || `ci-${index}`} className={`py-6 my-6 ${index > 0 ? `border-t ${themedInputBorder}` : ''}`}>
                                    <h2 className={`text-2xl lg:text-3xl font-semibold mt-2 mb-3 ${deepBrown}`}>{contentItem.title}</h2>
                                    {contentItem.isRequired && <span className={`text-sm font-medium text-red-600 dark:text-red-400 block mb-3`}>Required</span>}
                                    {Array.isArray(contentItem.richContent) && contentItem.richContent.length > 0 ? (
                                        <div className="mt-3 space-y-4">
                                            {contentItem.richContent.map((block, blockIdx) => {
                                                if (!block) {
                                                    console.warn("WeekContentPage: Found empty or invalid rich content block at contentItem:", contentItem.title, "block index:", blockIdx);
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
                                        <p className={mutedText}>Content item type '{contentItem.type}' not fully renderable or content missing.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className={`${mutedText} py-4`}>This section has no learning content items yet.</p>
                        )}
                        <div className={`mt-10 pt-6 border-t ${themedInputBorder} flex flex-col sm:flex-row items-center sm:justify-between gap-4`}>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id={`complete-${currentSection.id}`}
                                    checked={!!userProgress[currentSection.id!]}
                                    disabled={isProgressUpdating[currentSection.id!]}
                                    onCheckedChange={(checked) => handleMarkSectionComplete(currentSection.id!, !!checked)}
                                    className="h-5 w-5 rounded data-[state=checked]:bg-green-500 data-[state=checked]:text-white data-[state=checked]:border-green-600 border-gray-400 dark:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <label
                                    htmlFor={`complete-${currentSection.id}`}
                                    className={`text-base font-medium leading-none ${midBrown} cursor-pointer select-none ${isProgressUpdating[currentSection.id!] ? 'opacity-50 cursor-not-allowed' : '' }`}
                                >
                                    Mark as Completed
                                </label>
                                {isProgressUpdating[currentSection.id!] && (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-500 ml-2" />
                                )}
                            </div>
                            {hasNextSection && nextSectionData && nextSectionData.id && (
                                <Button
                                    onClick={() => handleSectionSelect(nextSectionData!.id!)}
                                    className={`${primaryButtonClasses} flex items-center group`}
                                >
                                    <span>Next: {nextSectionData.title.substring(0,20)}{nextSectionData.title.length > 20 ? '...' : ''}</span>
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            )}
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-10">
                        <HelpCircleIcon className={`mx-auto h-16 w-16 ${mutedText}`} />
                        <p className={`mt-5 text-xl font-semibold ${deepBrown}`}>
                            {(!isLoading && (!courseId || !weekId)) ? "Course or Week ID missing in URL." : 
                             (sortedSideBarSections.length > 0 ? "Select a section to begin" : "No sections available in this week.")}
                        </p>
                        {(!isLoading && courseId && weekId && sortedSideBarSections.length > 0) && <p className={`${mutedText} mt-1`}>Choose a section from the sidebar to view its content.</p>}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WeekContentPage;