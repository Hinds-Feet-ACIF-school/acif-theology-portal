import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Loader2, AlertCircle, ArrowLeft, CheckSquare, HelpCircle as HelpCircleIcon, ArrowRight } from 'lucide-react';
import * as apiService from '../services/api';
import type { Week, Section, ContentItem, RichContentItemBlock, QuizBlockContent, UserQuizSubmission, VideoBlockContent } from '../services/api';
import QuizDisplay from '../components/QuizDisplay';
import { useAuth } from '../context/AuthContext.js';
import ReactPlayer from 'react-player'; // Added ReactPlayer import

const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const lightBg = 'bg-[#FFF8F0] dark:bg-gray-950';
const sidebarBg = 'bg-gray-100 dark:bg-gray-800';
const themedInputBorder = `border-gray-300 dark:border-gray-600`;
const mutedText = 'text-gray-800 dark:text-gray-400';
const editorCardBg = 'dark:bg-gray-800/50'; // This was also used in admin for 'Video source not available' bg
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
        // console.log("WeekContentPage: useEffect [courseId, weekId] - Params are:", { courseId, weekId });

        if (!courseId || !weekId) {
            // console.log("WeekContentPage: courseId or weekId from useParams is still undefined. Waiting.");
            setIsLoading(true); 
            return; 
        }

        const fetchWeekAndProgress = async () => {
            // console.log("WeekContentPage: Starting fetchWeekAndProgress with defined:", { weekId, courseId });
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

                // console.log("WeekContentPage: Fetched week data:", fetchedWeek ? fetchedWeek.title : 'No week data');
                // DEBUG: Log the entire fetchedWeek structure to inspect richContent
                // console.log("WeekContentPage: Full Fetched Week Data:", JSON.stringify(fetchedWeek, null, 2));


                if (fetchedWeek && Array.isArray(fetchedWeek.sections)) {
                    setWeekData(fetchedWeek);
                    const sortedSectionsForInit = [...fetchedWeek.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
                    if (sortedSectionsForInit.length > 0) {
                        const hashSectionId = window.location.hash.substring(1);
                        const restoredSection = sortedSectionsForInit.find(s => s.id === hashSectionId);
                        const sectionToSet = restoredSection || sortedSectionsForInit[0];
                        setCurrentSection(sectionToSet);
                        // console.log("WeekContentPage: Current section set to:", sectionToSet?.title);
                    } else {
                        setCurrentSection(null);
                        // console.log("WeekContentPage: No sections in fetched week.");
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
                // console.log("WeekContentPage: fetchWeekAndProgress finished.");
            }
        };
        
        fetchWeekAndProgress();
    }, [courseId, weekId]); 
    
    const fetchInitialQuizSubmission = useCallback(async (actualQuizDatabaseId: string) => {
        if (!currentUser || !actualQuizDatabaseId) {
            // console.warn("WeekContentPage: fetchInitialQuizSubmission - SKIPPING due to missing currentUser or actualQuizDatabaseId:", 
                // { hasUser: !!currentUser, id: actualQuizDatabaseId });
            return;
        }
        // console.log("WeekContentPage: fetchInitialQuizSubmission - FETCHING for actualQuizDatabaseId:", actualQuizDatabaseId);
        
        setLoadingSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: true }));
        try {
            const submission = await apiService.getMySubmissionForQuiz(actualQuizDatabaseId);
            // console.log(`WeekContentPage: fetchInitialQuizSubmission - RECEIVED submission for ${actualQuizDatabaseId}:`, submission ? 'Submission found' : 'No submission');
            setInitialSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: submission }));
        } catch (err) {
            console.error(`WeekContentPage: Failed to fetch initial submission for quiz ${actualQuizDatabaseId}:`, err);
            setInitialSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: null }));
        } finally {
            setLoadingSubmissions(prev => ({ ...prev, [actualQuizDatabaseId]: false }));
        }
    }, [currentUser]);


    useEffect(() => {
        if (currentSection?.content && currentUser && courseId && weekId) { 
            // console.log("WeekContentPage: useEffect for fetching quiz submissions - TRIGGERED for section:", currentSection.title);
            currentSection.content.forEach(contentItem => {
                if (contentItem.richContent) {
                    contentItem.richContent.forEach(block => {
                        const actualQuizDatabaseId = block.quizContent?.databaseQuizId;
                        if (block.type === 'quiz' && actualQuizDatabaseId) {
                            if (initialSubmissions[actualQuizDatabaseId] === undefined && !loadingSubmissions[actualQuizDatabaseId]) {
                                // console.log(`WeekContentPage: Queuing fetch for quiz ${actualQuizDatabaseId} in section ${currentSection.title}`);
                                fetchInitialQuizSubmission(actualQuizDatabaseId);
                            } else {
                                // console.log(`WeekContentPage: Skipping fetch for quiz ${actualQuizDatabaseId}, status: initial=${initialSubmissions[actualQuizDatabaseId]}, loading=${loadingSubmissions[actualQuizDatabaseId]}`);
                            }
                        }
                    });
                }
            });
        } else {
            // console.log("WeekContentPage: useEffect for fetching quiz submissions - SKIPPED (waiting for section, user, or route params).", {
                // hasSection: !!currentSection,
                // hasUser: !!currentUser,
                // hasCourseId: !!courseId,
                // hasWeekId: !!weekId
            // });
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
            // console.log("WeekContentPage: handleSectionSelect - New section selected:", selected.title);
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
        // console.log(`WeekContentPage: Quiz ${dbQuizId} submitted successfully. Refetching submission.`);
        fetchInitialQuizSubmission(dbQuizId);
    };

    const renderRichContentBlock = (block: RichContentItemBlock, blockIndex: number, contentItemTitle: string) => {
        const blockKey = block.id || `block-${blockIndex}`;

        if (block.type === 'quiz' && block.quizContent) {
            const actualQuizDatabaseId = block.quizContent.databaseQuizId;
                                                    
            if (!actualQuizDatabaseId) {
                console.error("WeekContentPage: Quiz content block is missing a databaseQuizId.", block.quizContent);
                return <div key={blockKey} className="text-sm text-red-500">Quiz config error: Missing Quiz ID.</div>;
            }

            const currentRouteCourseId = params.courseId;
            const currentRouteWeekId = params.weekId;

            if (!currentRouteCourseId || !currentRouteWeekId) {
                // console.warn(`WeekContentPage: renderRichContentBlock for quiz ${actualQuizDatabaseId} - Route params missing. QuizDisplay might not init context.`);
                return (
                    <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                        <div className="p-4 text-orange-600">Initializing quiz context... (Route IDs missing)</div>
                    </div>
                );
            }
            
            // console.log(`WeekContentPage: Rendering QuizDisplay for quiz ${actualQuizDatabaseId}. Passing quizData.title: ${block.quizContent.title}, questions count: ${block.quizContent.questions?.length || 0}`);
            // console.log(`WeekContentPage: Full quizData for ${actualQuizDatabaseId}:`, JSON.parse(JSON.stringify(block.quizContent)));

            return (
                <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                    <QuizDisplay
                        key={actualQuizDatabaseId}
                        quizData={block.quizContent}
                        databaseQuizId={actualQuizDatabaseId}
                        initialUserSubmission={initialSubmissions[actualQuizDatabaseId]}
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
                    <div className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none ${deepBrown}`} dangerouslySetInnerHTML={{ __html: block.content }} />
                </div>
            );
        }
        
        if (block.type === 'video' && block.videoContent) {
            // <<< START DEBUG LOGGING >>>
            if (block.videoContent) { 
                console.log(
                    `[DEBUG] WeekContentPage Video Block in "${contentItemTitle}":`,
                    {
                        blockId: block.id,
                        videoTitle: block.videoContent.title,
                        isRequiredValue: block.videoContent.isRequired,
                        typeOfIsRequired: typeof block.videoContent.isRequired,
                        fullVideoContentObject: JSON.parse(JSON.stringify(block.videoContent)) 
                    }
                );
            }
            // <<< END DEBUG LOGGING >>>

            return (
                <div key={blockKey} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                    <div className="not-prose my-2">
                        <h4 className={`text-lg sm:text-xl font-semibold mb-1.5 ${deepBrown}`}>{block.videoContent.title || 'Video'}</h4>
                        {block.videoContent.description && <p className={`text-sm sm:text-base mb-2 ${midBrown}`}>{block.videoContent.description}</p>}
                        {(() => {
                            let videoSourceUrl: string | undefined = undefined;
                            const vc = block.videoContent; // vc is VideoBlockContent
                            if (vc?.videoUrl) {
                                // Assuming direct URLs or platform URLs that ReactPlayer can handle
                                // If videoUrl is relative, prefix it (like you did for admin preview)
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

                            if (videoSourceUrl) {
                                return (
                                    <div className="aspect-video w-full max-w-2xl bg-black rounded-md overflow-hidden mx-auto my-2 player-wrapper">
                                        <ReactPlayer
                                            className="react-player"
                                            url={videoSourceUrl}
                                            controls={true}
                                            width='100%'
                                            height='100%'
                                            light={thumbnailSourceUrl || false}
                                            playing={false}
                                            config={{
                                                file: {
                                                    attributes: {
                                                        controlsList: 'nodownload',
                                                        disablePictureInPicture: true,
                                                    },
                                                    forceVideo: true 
                                                }
                                            }}
                                            onError={(e: any) => console.error('ReactPlayer Error on user side:', e, 'for URL:', videoSourceUrl)}
                                        />
                                    </div>
                                );
                            }
                            return <div className={`p-3 ${editorCardBg} rounded text-center text-xs ${mutedText}`}>Video source not available.</div>;
                        })()}
                        {block.videoContent.isRequired === true && <span className="text-xs text-red-500">(Required Video)</span>}
                    </div>
                </div>
            );
        }

        console.warn("WeekContentPage: Unsupported block type or missing content for block:", block);
        return <div key={blockKey} className="text-sm text-red-500">Unsupported block type: {block.type} or missing content. Check console.</div>;
    };

    if (isLoading || !courseId || !weekId) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen">
                <aside className={`w-full md:w-72 lg:w-80 border-r ${themedInputBorder} ${sidebarBg} p-4 md:sticky md:top-0 md:h-screen shrink-0 animate-pulse`}>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>)}
                    </div>
                </aside>
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex justify-center items-center">
                    <Loader2 className={`h-12 w-12 sm:h-16 sm:w-16 animate-spin ${goldAccent}`} />
                </main>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4" />
                <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${deepBrown}`}>{error}</h2>
                <p className={`${midBrown} mb-6`}>There was an issue loading the content. Please try again later or contact support.</p>
                <Button onClick={() => navigate(-1)} className={`${outlineButtonClasses} text-sm sm:text-base`}>Go Back</Button>
            </div>
        );
    }
    if (!weekData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <HelpCircleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${deepBrown}`}>Week Data Not Found</h2>
                <p className={`${midBrown} mb-6`}>The requested week could not be loaded. It might not exist or there was an issue fetching it.</p>
                <Button onClick={() => navigate(-1)} className={`${outlineButtonClasses} text-sm sm:text-base`}>Go Back</Button>
            </div>
        );
    }

    const sortedSideBarSections = weekData.sections ? [...weekData.sections].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

    let currentSectionIndex = -1;
    let hasNextSection = false;
    let nextSectionData: Section | null = null;
    if (currentSection && sortedSideBarSections.length > 0 && currentSection.id) {
        currentSectionIndex = sortedSideBarSections.findIndex(s => s.id === currentSection.id);
        if (currentSectionIndex !== -1 && currentSectionIndex < sortedSideBarSections.length - 1) {
            hasNextSection = true;
            nextSectionData = sortedSideBarSections[currentSectionIndex + 1];
        }
    }

    return (
        <div className={`flex flex-col md:flex-row min-h-screen ${lightBg}`}>
            <aside className={`w-full md:w-72 lg:w-80 border-r ${themedInputBorder} ${sidebarBg} p-3 sm:p-4 md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0`}>
                <div className="mb-3 sm:mb-4">
                    {courseId && (
                        <Button variant="link" onClick={() => navigate(`/courses/${courseId}`)} className={`p-0 mb-2 sm:mb-3 text-xs sm:text-sm ${goldAccent} hover:underline flex items-center`}>
                            <ArrowLeft className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to Course
                        </Button>
                    )}
                    <h2 className={`text-lg sm:text-xl font-semibold ${deepBrown}`}>Week {weekData.weekNumber}: {weekData.title}</h2>
                    {weekData.description && <p className={`text-xs sm:text-sm mt-1 ${midBrown}`}>{weekData.description}</p>}
                </div>
                <nav className="space-y-1 sm:space-y-1.5">
                    {sortedSideBarSections.length === 0 && <p className={`${mutedText} text-xs sm:text-sm`}>No sections in this week.</p>}
                    {sortedSideBarSections.map(section => (
                        <Button
                            key={section.id}
                            variant="ghost"
                            onClick={() => handleSectionSelect(section.id!)}
                            className={`w-full justify-start text-left h-auto py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-md transition-colors duration-150 relative text-xs sm:text-sm
                                        ${currentSection?.id === section.id
                                            ? `bg-amber-100 dark:bg-amber-700/30 ${goldAccent} font-semibold`
                                            : `${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700/60`
                                        }`}
                        >
                            <span className="truncate pr-5 sm:pr-6">{section.order}. {section.title}</span>
                            {isProgressUpdating[section.id!] ? (
                                <Loader2 className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 shrink-0 animate-spin absolute right-2 sm:right-3 top-1/2 -translate-y-1/2" />
                            ) : userProgress[section.id!] ? (
                                <CheckSquare className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2" />
                            ) : null}
                        </Button>
                    ))}
                </nav>
            </aside>

            <main id="main-content-area" className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
                {currentSection && currentSection.id ? (
                    <article key={currentSection.id} id={currentSection.id} className={`max-w-none`}> {/* Removed prose classes from article for better control with rich content */}
                        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 ${deepBrown}`}>{currentSection.title}</h1>
                        {currentSection.description && <p className={`text-base sm:text-lg mb-4 sm:mb-6 ${midBrown}`}>{currentSection.description}</p>}
                         {Array.isArray(currentSection.content) && currentSection.content.length > 0 ? (
                            ([...currentSection.content].sort((a, b) => (a.order || 0) - (b.order || 0))).map((contentItem, index) => (
                                <div key={contentItem.id || `ci-${index}`} className={`py-4 sm:py-6 my-4 sm:my-6 ${index > 0 ? `border-t ${themedInputBorder}` : ''}`}>
                                    <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold mt-1 sm:mt-2 mb-2 sm:mb-3 ${deepBrown}`}>{contentItem.title}</h2>
                                    {/*
                                    console.log(
                                        `[DEBUG] WeekContentPage ContentItem: "${contentItem.title}"`,
                                        {
                                            contentItemId: contentItem.id,
                                            isRequiredValue: contentItem.isRequired,
                                            typeOfIsRequired: typeof contentItem.isRequired,
                                        }
                                    );
                                    */}
                                    {contentItem.isRequired === true && <span className={`text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 block mb-2 sm:mb-3`}>Required</span>}
                                    
                                    {Array.isArray(contentItem.richContent) && contentItem.richContent.length > 0 ? (
                                        <div className="mt-2 sm:mt-3 space-y-3 sm:space-y-4">
                                            {contentItem.richContent.map((block, blockIdx) => {
                                                if (!block) {
                                                    console.warn("WeekContentPage: Found empty or invalid rich content block at contentItem:", contentItem.title, "block index:", blockIdx);
                                                    return <div key={`empty-block-${blockIdx}`} className="text-xs sm:text-sm text-red-500">Empty or invalid rich content block found.</div>;
                                                }
                                                return renderRichContentBlock(block, blockIdx, contentItem.title); 
                                            })}
                                        </div>
                                    ) : contentItem.type === 'text' && contentItem.content ? ( // This is for old-style direct text content
                                        <div className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none ${deepBrown}`} dangerouslySetInnerHTML={{ __html: contentItem.content }} />
                                    ) : contentItem.type === 'video' && contentItem.url && !contentItem.richContent? ( // Old-style direct video URL
                                        <div className="not-prose my-3 sm:my-4">
                                            <h4 className={`text-lg sm:text-xl font-semibold mb-1.5 ${deepBrown}`}>{contentItem.title || 'Video'}</h4>
                                             <div className="aspect-video w-full max-w-2xl bg-black rounded-md overflow-hidden mx-auto my-2 player-wrapper">
                                                <ReactPlayer
                                                    className="react-player"
                                                    url={contentItem.url}
                                                    controls={true}
                                                    width='100%'
                                                    height='100%'
                                                    playing={false}
                                                    onError={(e: any) => console.error('ReactPlayer Error (legacy video):', e, 'for URL:', contentItem.url)}
                                                />
                                            </div>
                                        </div>
                                    ) : contentItem.type === 'quiz_link' && contentItem.url ? ( // Old-style direct quiz link
                                        <div className="my-3 sm:my-4">
                                            <a href={contentItem.url} target="_blank" rel="noopener noreferrer">
                                                <Button className={`${primaryButtonClasses} text-xs sm:text-sm`}> Go to Quiz: {contentItem.title} </Button>
                                            </a>
                                        </div>
                                    ) : (
                                        <p className={`${mutedText} text-xs sm:text-sm`}>Content item type '{contentItem.type}' not fully renderable or content missing.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className={`${mutedText} py-4 text-sm sm:text-base`}>This section has no learning content items yet.</p>
                        )}
                        <div className={`mt-8 sm:mt-10 pt-4 sm:pt-6 border-t ${themedInputBorder} flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-4`}>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <Checkbox
                                    id={`complete-${currentSection.id}`}
                                    checked={!!userProgress[currentSection.id!]}
                                    disabled={isProgressUpdating[currentSection.id!]}
                                    onCheckedChange={(checked) => handleMarkSectionComplete(currentSection.id!, !!checked)}
                                    className="h-4 w-4 sm:h-5 sm:w-5 rounded data-[state=checked]:bg-green-500 data-[state=checked]:text-white data-[state=checked]:border-green-600 border-gray-400 dark:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <label
                                    htmlFor={`complete-${currentSection.id}`}
                                    className={`text-sm sm:text-base font-medium leading-none ${midBrown} cursor-pointer select-none ${isProgressUpdating[currentSection.id!] ? 'opacity-50 cursor-not-allowed' : '' }`}
                                >
                                    Mark as Completed
                                </label>
                                {isProgressUpdating[currentSection.id!] && (
                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-gray-500 ml-2" />
                                )}
                            </div>
                            {hasNextSection && nextSectionData && nextSectionData.id && (
                                <Button
                                    onClick={() => handleSectionSelect(nextSectionData!.id!)}
                                    className={`${primaryButtonClasses} flex items-center group text-xs sm:text-sm w-full sm:w-auto justify-center`}
                                >
                                    <span>Next: {nextSectionData.title.substring(0,20)}{nextSectionData.title.length > 20 ? '...' : ''}</span>
                                    <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            )}
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-10">
                        <HelpCircleIcon className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 ${mutedText}`} />
                        <p className={`mt-4 sm:mt-5 text-lg sm:text-xl font-semibold ${deepBrown}`}>
                            {(!isLoading && (!courseId || !weekId)) ? "Course or Week ID missing in URL." : 
                             (sortedSideBarSections.length > 0 ? "Select a section to begin" : "No sections available in this week.")}
                        </p>
                        {(!isLoading && courseId && weekId && sortedSideBarSections.length > 0) && <p className={`${mutedText} mt-1 text-sm sm:text-base`}>Choose a section from the sidebar to view its content.</p>}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WeekContentPage;