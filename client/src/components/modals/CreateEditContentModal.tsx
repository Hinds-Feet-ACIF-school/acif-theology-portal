import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label as ShadcnLabel } from "../ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"; // Not used, can be removed
import {
    X, Save, Loader2, AlertCircle, Plus, Trash2, Video as VideoIcon, FileText as FileTextIcon, HelpCircle,
    ChevronDown, ChevronUp, Eye, Edit3, Image as ImageIcon, Download, // ImageIcon not used
    CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { MantineProvider, TextInput, Textarea, Checkbox as MantineCheckbox, Group, FileInput } from '@mantine/core';
import { type MantineTheme } from '@mantine/core';
import ReactPlayer from 'react-player';

import {
    createMaterial,
    type ContentItem as ApiContentItemFromApi,
    type RichContentItemBlock as ApiRichContentItemBlockFromApi,
    type QuizBlockContent as ApiQuizBlockContentFromApi,
    type VideoBlockContent as ApiVideoBlockContentFromApi,
    type QuizQuestion as ApiQuizQuestionFromApi,
    type QuizQuestionOption as ApiQuizQuestionOptionFromApi,
    // type Material as ApiMaterial, // Not directly used here, createMaterial result is handled
    type ApiDocumentBlockContentForSave, // ASSUMPTION: This type in services/api.ts is updated
                                         // to include viewablePdfUrl and totalSlides.
} from '../../services/api';

import DocumentViewer from '../DocumentViewer'; // Ensure this is the react-pdf based viewer
import QuizQuestionEditor, { type ModalQuizQuestion, type ModalQuizQuestionOption } from '../QuizQuestionEditor';
import IntegratedRichTextEditor from '../IntegratedRichTextEditor';


const deepBrownLightHex = '#2A0F0F';
const deepBrownDarkHex = '#FFF8F0';
const goldAccent = 'text-[#C5A467]';
const goldAccentHex = '#C5A467';
const editorDarkBgHex = '#1f2937';
const editorLightBgHex = '#ffffff';
// const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]'; // Defined but also as hex, choose one
const midBrownLightHex = '#4A1F1F';
const midBrownDarkHex = '#E0D6C3';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-950';
const themedInputBorder = `border-gray-300 dark:border-gray-700`;
const themedInputBg = `bg-white dark:bg-gray-800`;
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const mutedText = 'text-gray-600 dark:text-gray-400';
const editorCardBgMantine = 'dark:bg-gray-900';
const editorToolbarBgMantine = 'bg-gray-100 dark:bg-gray-800';

// const inputClasses = `block w-full px-3 py-2 border ${themedInputBorder} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${themedInputBg} text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}]`; // Defined but not used


const mantineInputStyles = (theme: MantineTheme) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return {
        input: {
            backgroundColor: isDarkMode ? editorDarkBgHex : editorLightBgHex,
            borderColor: isDarkMode ? theme.colors.dark[4] : theme.colors.gray[4],
            color: isDarkMode ? deepBrownDarkHex : deepBrownLightHex,
            lineHeight: theme.lineHeights.md,
            '&::placeholder': { color: isDarkMode ? theme.colors.dark[3] : theme.colors.gray[6] },
        },
        label: {
            color: isDarkMode ? deepBrownDarkHex : deepBrownLightHex,
            fontSize: theme.fontSizes.xs, fontWeight: 500, marginBottom: '4px',
        },
    };
};

interface ModalVideoContentData extends Omit<ApiVideoBlockContentFromApi, 'videoFile' | 'thumbnail' | 'id'> {
    id: string;
    videoFile?: File;
    thumbnail?: File;
    videoObjectUrl?: string;
    thumbnailObjectUrl?: string;
    title: string;
    isRequired: boolean;
    accessControl: {
        allowDownload: boolean;
        allowSharing: boolean;
        expirationDate?: Date;
    };
}

interface QuizSettings {
    shuffleQuestions: boolean;
    timeLimit?: number;
    passingScore?: number;
    showResults: boolean;
    allowRetake: boolean;
    maxAttempts?: number;
    showCorrectAnswers: boolean;
    collectEmail: boolean;
    requireLogin: boolean; // Retained from original
    showPoints: boolean; // Retained from original
}

const defaultQuizSettings: QuizSettings = {
    shuffleQuestions: false,
    showResults: true,
    allowRetake: true,
    showCorrectAnswers: true,
    collectEmail: false,
    requireLogin: false,
    showPoints: false
};

interface ModalQuizContentData extends Omit<ApiQuizBlockContentFromApi, 'settings' | 'questions' | 'id'> {
    id: string;
    questions: ModalQuizQuestion[];
    settings: Omit<ApiQuizBlockContentFromApi['settings'], 'requireLogin' | 'showPoints'> & {
        requireLogin?: boolean; showPoints?: boolean;
    };
}

// Updated ModalDocumentContentData
interface ModalDocumentContentData extends Omit<ApiDocumentBlockContentForSave, 'documentFile' | 'documentObjectUrl'> {
    id: string;
    documentFile?: File | undefined;       // Local file object for upload
    documentObjectUrl?: string;    // Local URL.createObjectURL for immediate preview if PDF is uploaded
    
    // Fields expected from API (or set after local processing for preview if possible)
    documentUrl: string; 
    viewablePdfUrl?: string; 
    originalFileName?: string;
    fileSize?: number; 
    fileType?: string; 
    totalSlides?: number; 
    currentSlide?: number; 
}


interface ModalRichContentItem {
    id: string;
    type: 'text' | 'video' | 'quiz' | 'document';
    order: number;
    content?: string; // For text type
    videoContent?: ModalVideoContentData;
    quizContent?: ModalQuizContentData;
    documentContent?: ModalDocumentContentData;
}

interface CreateEditContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: ApiContentItemFromApi | null; // Content being edited, or null for new content
    onSave: (contentData: ApiContentItemFromApi) => Promise<ApiContentItemFromApi | void>;
    sectionId: string; // Not directly used in this snippet but often needed for context
    weekIdForFileUploads: string; // Crucial for `createMaterial`
}

const CreateEditContentModal: React.FC<CreateEditContentModalProps> = ({
    isOpen, onClose, content: apiContentPropFromParent, onSave,
    // sectionId, // Not directly used
    weekIdForFileUploads,
}) => {
    const [currentContentItem, setCurrentContentItem] = useState<ApiContentItemFromApi | null>(apiContentPropFromParent);
    const [title, setTitle] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setErrorModal] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [richContent, setRichContent] = useState<ModalRichContentItem[]>([]);
    const [expandedContentIndex, setExpandedContentIndex] = useState<number | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const richContentRef = useRef(richContent); // To access latest richContent in closures (like useEffect cleanup)

    const isEditingLocally = !!currentContentItem?.id;
    const generateId = useCallback(() => `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, []);
    useEffect(() => { richContentRef.current = richContent; }, [richContent]);

    const mapApiBlockToModalBlock = useCallback((apiRcBlock: ApiRichContentItemBlockFromApi, index: number): ModalRichContentItem => {
        const blockId = apiRcBlock.id || generateId();
        const blockType = apiRcBlock.type as ModalRichContentItem['type']; // Trusting API type
        const modalBlockBase: Pick<ModalRichContentItem, 'id' | 'type' | 'order'> = {
            id: blockId, type: blockType, order: apiRcBlock.order ?? index,
        };

        if (blockType === 'text') {
            return { ...modalBlockBase, type: 'text', content: apiRcBlock.content || '<p></p>' };
        }
        if (blockType === 'video' && apiRcBlock.videoContent) {
            // Ensure all required fields for ModalVideoContentData are present or defaulted
            const vcApi = apiRcBlock.videoContent as ApiVideoBlockContentFromApi;
            return {
                ...modalBlockBase,
                type: 'video',
                videoContent: {
                    id: vcApi.id || blockId, // Use API ID or generate
                    title: vcApi.title || '',
                    description: vcApi.description || '',
                    videoUrl: vcApi.videoUrl || '',
                    thumbnailUrl: vcApi.thumbnailUrl || '',
                    duration: vcApi.duration || 0,
                    isRequired: vcApi.isRequired ?? false,
                    drmEnabled: vcApi.drmEnabled ?? false,
                    accessControl: vcApi.accessControl || { allowDownload: true, allowSharing: true },
                    // Local-only fields, not from API
                    videoFile: undefined,
                    thumbnail: undefined,
                    videoObjectUrl: undefined,
                    thumbnailObjectUrl: undefined,
                }
            };
        }
        if (blockType === 'quiz' && apiRcBlock.quizContent) {
            const qc = apiRcBlock.quizContent as ApiQuizBlockContentFromApi;
            return {
                ...modalBlockBase, type: 'quiz', quizContent: {
                    ...qc,
                    id: qc.id || blockId,
                    questions: (qc.questions as ApiQuizQuestionFromApi[] || []).map((api_q): ModalQuizQuestion => {
                        const { type: apiType, ...restOfApiQ } = api_q;
                        const modalQuestionType = apiType as ModalQuizQuestion['type'];
                        const mappedOptions = api_q.options
                            ? (api_q.options as ApiQuizQuestionOptionFromApi[]).map(opt => ({ ...opt, id: opt.id || generateId() }))
                            : [];
                        return {
                            ...restOfApiQ,
                            id: restOfApiQ.id || generateId(),
                            type: modalQuestionType,
                            options: mappedOptions,
                            question: restOfApiQ.question || "",
                            required: restOfApiQ.required ?? false,
                            description: restOfApiQ.description,
                            correctAnswer: restOfApiQ.correctAnswer as string | string[] | undefined,
                        };
                    }),
                    settings: { ...(qc.settings as ApiQuizBlockContentFromApi['settings']), requireLogin: qc.settings.requireLogin ?? false, showPoints: qc.settings.showPoints ?? false }
                }
            };
        }
        if (blockType === 'document' && apiRcBlock.documentContent) {
            const docContentFromApi = apiRcBlock.documentContent as ApiDocumentBlockContentForSave;
            // docContentFromApi should now contain: id, title, description,
            // documentUrl (original file), viewablePdfUrl (converted PDF),
            // originalFileName, fileSize, fileType, totalSlides
            return {
                ...modalBlockBase,
                type: 'document',
                documentContent: {
                    ...docContentFromApi, // Spread all fields from API
                    id: docContentFromApi.id || blockId, // Ensure ID
                    // Local-only fields:
                    documentFile: undefined,
                    documentObjectUrl: undefined,
                    currentSlide: 1, // Always start at slide 1 when loading
                    // totalSlides will be populated from docContentFromApi.totalSlides
                }
            };
        }
        console.warn("Mapping warning: Unrecognized or incomplete rich content block from API:", apiRcBlock);
        return { ...modalBlockBase, type: 'text', content: '<p>Corrupted or unsupported block.</p>' }; // Fallback
    }, [generateId]);

    useEffect(() => {
        if (isOpen) {
            setErrorModal(null);
            setSuccessMessage(null);
            setIsPreviewMode(false);
            const initialContentToLoad = currentContentItem || apiContentPropFromParent;

            if (initialContentToLoad) {
                setTitle(initialContentToLoad.title);
                setIsRequired(initialContentToLoad.isRequired || false);
                const mappedRichContent = (initialContentToLoad.richContent as ApiRichContentItemBlockFromApi[] || [])
                    .map(mapApiBlockToModalBlock)
                    .sort((a,b) => a.order - b.order); // Ensure sorted by order
                setRichContent(mappedRichContent);
                setExpandedContentIndex(mappedRichContent.length > 0 ? 0 : null);
                 if (!currentContentItem && apiContentPropFromParent) { // If currentContentItem was null but prop exists
                    setCurrentContentItem(apiContentPropFromParent);
                }
            } else { // Reset for new content
                setTitle(''); setIsRequired(false); setRichContent([]); setExpandedContentIndex(null); setCurrentContentItem(null);
            }
        } else { // Modal is closing
            richContentRef.current.forEach(item => { // Use ref for latest state
                if (item.videoContent?.videoObjectUrl) URL.revokeObjectURL(item.videoContent.videoObjectUrl);
                if (item.videoContent?.thumbnailObjectUrl) URL.revokeObjectURL(item.videoContent.thumbnailObjectUrl);
                if (item.documentContent?.documentObjectUrl) URL.revokeObjectURL(item.documentContent.documentObjectUrl);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, apiContentPropFromParent, mapApiBlockToModalBlock]); // currentContentItem removed to prevent re-mapping if it changes internally

    // Sync currentContentItem if the prop changes from parent (e.g., parent re-fetches and passes new version)
    useEffect(() => {
        if (apiContentPropFromParent && apiContentPropFromParent !== currentContentItem) {
             setCurrentContentItem(apiContentPropFromParent);
        }
    }, [apiContentPropFromParent, currentContentItem]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            richContentRef.current.forEach(item => {
                if (item.videoContent?.videoObjectUrl) URL.revokeObjectURL(item.videoContent.videoObjectUrl);
                if (item.videoContent?.thumbnailObjectUrl) URL.revokeObjectURL(item.videoContent.thumbnailObjectUrl);
                if (item.documentContent?.documentObjectUrl) URL.revokeObjectURL(item.documentContent.documentObjectUrl);
            });
        };
    }, []);

    const handleAddRichContent = (contentType: ModalRichContentItem['type']) => {
        const newBlockId = generateId();
        let newBlock: ModalRichContentItem = { id: newBlockId, type: contentType, order: richContent.length };

        if (contentType === 'text') {
            newBlock.content = '<p></p>';
        } else if (contentType === 'video') {
            newBlock.videoContent = { id: newBlockId, title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: 0, isRequired: false, drmEnabled: false, accessControl: { allowDownload: true, allowSharing: true }};
        } else if (contentType === 'quiz') {
            newBlock.quizContent = {
                id: newBlockId, databaseQuizId: newBlockId, title: '', description: '', questions: [],
                settings: { ...defaultQuizSettings }
            };
        } else if (contentType === 'document') {
            newBlock.documentContent = { 
                id: newBlockId, title: '', description: '', 
                documentUrl: '', // Will be original file URL after save
                viewablePdfUrl: undefined, // Will be PDF URL after save & conversion
                originalFileName: '',
                currentSlide: 1, 
                totalSlides: undefined 
            };
        }
        setRichContent(prev => { 
            const updated = [...prev, newBlock].map((b,i) => ({...b, order: i})); 
            setExpandedContentIndex(updated.length - 1); 
            return updated; 
        });
        setSuccessMessage(null); setErrorModal(null);
    };

    const handleRemoveRichContent = (idToRemove: string) => {
        const itemToRemove = richContentRef.current.find(item => item.id === idToRemove);
        if (itemToRemove?.videoContent?.videoObjectUrl) URL.revokeObjectURL(itemToRemove.videoContent.videoObjectUrl);
        if (itemToRemove?.videoContent?.thumbnailObjectUrl) URL.revokeObjectURL(itemToRemove.videoContent.thumbnailObjectUrl);
        if (itemToRemove?.documentContent?.documentObjectUrl) URL.revokeObjectURL(itemToRemove.documentContent.documentObjectUrl);
        
        const indexToRemove = richContent.findIndex(item => item.id === idToRemove);
        setRichContent(prev => {
            const newRichContent = prev.filter(item => item.id !== idToRemove).map((item, idx) => ({ ...item, order: idx }));
            if (expandedContentIndex === indexToRemove) {
                setExpandedContentIndex(newRichContent.length > 0 ? Math.max(0, indexToRemove - 1) : null);
            } else if (expandedContentIndex !== null && expandedContentIndex > indexToRemove) {
                setExpandedContentIndex(prevIdx => prevIdx !== null ? prevIdx - 1 : null);
            }
            return newRichContent;
        });
        setSuccessMessage(null); setErrorModal(null);
    };

    const handleUpdateRichContentItem = useCallback((itemId: string, updatedFields: Partial<Omit<ModalRichContentItem, 'id' | 'type' | 'order'>>) => {
        setRichContent(prevRichContent =>
            prevRichContent.map(item => {
                if (item.id === itemId) {
                    const newItem = { ...item };
                    if (updatedFields.content !== undefined && item.type === 'text') {
                        newItem.content = updatedFields.content;
                    }
                    if (updatedFields.videoContent && item.type === 'video' && newItem.videoContent) {
                        newItem.videoContent = { ...newItem.videoContent, ...updatedFields.videoContent };
                    }
                    if (updatedFields.quizContent && item.type === 'quiz' && newItem.quizContent) {
                        const newQuizSettings = updatedFields.quizContent.settings 
                            ? { ...newItem.quizContent.settings, ...updatedFields.quizContent.settings } 
                            : newItem.quizContent.settings;
                        newItem.quizContent = { ...newItem.quizContent, ...updatedFields.quizContent, settings: newQuizSettings };
                    }
                    if (updatedFields.documentContent && item.type === 'document' && newItem.documentContent) {
                        const oldDocContent = newItem.documentContent;
                        newItem.documentContent = { ...newItem.documentContent, ...updatedFields.documentContent };
                        
                        // If a new local file is selected or local preview URL changes, reset slide state
                        // as the viewable content has changed.
                        const newFileSelected = updatedFields.documentContent.documentFile !== undefined; // Explicitly checking for presence
                        const objectUrlChanged = updatedFields.documentContent.documentObjectUrl !== oldDocContent.documentObjectUrl;

                        if (newFileSelected || objectUrlChanged) {
                            newItem.documentContent.currentSlide = 1;
                            newItem.documentContent.totalSlides = undefined; // Will be re-evaluated by DocumentViewer
                            newItem.documentContent.viewablePdfUrl = undefined; // New local file, so remote PDF URL is invalid until save
                        }
                    }
                    return newItem;
                }
                return item;
            })
        );
        setSuccessMessage(null); setErrorModal(null);
    }, []);

    const handleUpdateQuizSettings = (itemId: string, settings: Partial<QuizSettings>) => {
        const currentItem = richContent.find(rc => rc.id === itemId);
        if (!currentItem?.quizContent) return;
        
        const updatedSettings: QuizSettings = {
            ...defaultQuizSettings, // Base defaults
            ...currentItem.quizContent.settings, // Current item's settings
            ...settings // New partial settings
        };
        
        handleUpdateRichContentItem(itemId, {
            quizContent: {
                ...currentItem.quizContent,
                settings: updatedSettings
            }
        });
    };

    const handleUpdateVideoContent = (itemId: string, videoContentUpdate: Partial<ModalVideoContentData>) => {
        const currentItem = richContent.find(rc => rc.id === itemId);
        if (!currentItem?.videoContent) return;
        
        handleUpdateRichContentItem(itemId, {
            videoContent: {
                ...currentItem.videoContent,
                ...videoContentUpdate,
                // id: currentItem.videoContent.id // ID should not change with updates
            }
        });
    };

    // This is called by DocumentViewer in preview mode when a PDF successfully loads
    const handleDocumentLoadSuccessInPreview = (itemId: string, numPages: number) => {
        setRichContent(prevRichContent =>
            prevRichContent.map(rcItem => {
                if (rcItem.id === itemId && rcItem.documentContent) {
                    // Only update if totalSlides is different, to avoid unnecessary re-renders
                    if (rcItem.documentContent.totalSlides !== numPages) {
                        return {
                            ...rcItem,
                            documentContent: {
                                ...rcItem.documentContent,
                                totalSlides: numPages,
                                // currentSlide: rcItem.documentContent.currentSlide || 1, // Keep current slide or reset
                            },
                        };
                    }
                }
                return rcItem;
            })
        );
    };

    const goToPrevSlide = (itemId: string) => {
        setRichContent(prevRichContent =>
            prevRichContent.map(rcItem => {
                if (rcItem.id === itemId && rcItem.documentContent && rcItem.documentContent.currentSlide && rcItem.documentContent.currentSlide > 1) {
                    return {
                        ...rcItem,
                        documentContent: { ...rcItem.documentContent, currentSlide: rcItem.documentContent.currentSlide - 1 },
                    };
                }
                return rcItem;
            })
        );
    };

    const goToNextSlide = (itemId: string) => {
        setRichContent(prevRichContent =>
            prevRichContent.map(rcItem => {
                if (rcItem.id === itemId && rcItem.documentContent && rcItem.documentContent.currentSlide && rcItem.documentContent.totalSlides && rcItem.documentContent.currentSlide < rcItem.documentContent.totalSlides) {
                    return {
                        ...rcItem,
                        documentContent: { ...rcItem.documentContent, currentSlide: rcItem.documentContent.currentSlide + 1 },
                    };
                }
                return rcItem;
            })
        );
    };


    const handleSaveClick = async () => {
        setErrorModal(null); setSuccessMessage(null);
        if (!title.trim()) { setErrorModal("Overall content title is required."); return; }
        if (richContent.length === 0) { setErrorModal("Content must have at least one block."); return; }
        
        const hasFileToUpload = richContent.some(item => 
            (item.type === 'video' && (item.videoContent?.videoFile || item.videoContent?.thumbnail)) ||
            (item.type === 'document' && item.documentContent?.documentFile)
        );
        if (hasFileToUpload && !weekIdForFileUploads) {
            setErrorModal("Cannot upload new files: Week context (weekIdForFileUploads) is missing.");
            setIsSaving(false);
            return;
        }

        setIsSaving(true);
        try {
            const finalRichContentForApi: ApiRichContentItemBlockFromApi[] = await Promise.all(
                richContent.map(async (modalRcBlock, index): Promise<ApiRichContentItemBlockFromApi> => {
                    const baseBlock: Pick<ApiRichContentItemBlockFromApi, 'id' | 'type' | 'order'> = { 
                        id: modalRcBlock.id, 
                        type: modalRcBlock.type, 
                        order: modalRcBlock.order ?? index 
                    };

                    if (modalRcBlock.type === 'text') {
                        return { ...baseBlock, content: modalRcBlock.content || '<p></p>' };
                    }
                    if (modalRcBlock.type === 'video' && modalRcBlock.videoContent) {
                        const { videoFile, thumbnail, videoObjectUrl, thumbnailObjectUrl, ...restVideo } = modalRcBlock.videoContent;
                        let finalVideoUrl = restVideo.videoUrl; 
                        let finalThumbnailUrl = restVideo.thumbnailUrl;

                        if (videoFile && weekIdForFileUploads) { // Ensure weekIdForFileUploads for new uploads
                            const formData = new FormData(); 
                            formData.append('file', videoFile); 
                            formData.append('weekId', weekIdForFileUploads); 
                            formData.append('title', restVideo.title || `Video for: ${title}`); 
                            formData.append('type', 'video_asset');
                            const uploadedMaterial = await createMaterial(formData);
                            if (!uploadedMaterial?.contentUrl) throw new Error(`Video upload failed for "${restVideo.title}".`);
                            finalVideoUrl = uploadedMaterial.contentUrl;
                        }
                        if (thumbnail && weekIdForFileUploads) { // Ensure weekIdForFileUploads for new uploads
                            const formData = new FormData(); 
                            formData.append('file', thumbnail); 
                            formData.append('weekId', weekIdForFileUploads); 
                            formData.append('title', `Thumbnail for ${restVideo.title || title}`); 
                            formData.append('type', 'image_asset');
                            try { 
                                const uploadedThumbnail = await createMaterial(formData); 
                                finalThumbnailUrl = uploadedThumbnail?.contentUrl || finalThumbnailUrl; 
                            } catch (e) { 
                                console.error("Thumbnail upload error:", e); 
                                // Potentially non-critical, so we might proceed with old/no thumbnail URL
                            }
                        }
                        return { ...baseBlock, videoContent: { ...restVideo, videoUrl: finalVideoUrl, thumbnailUrl: finalThumbnailUrl } as ApiVideoBlockContentFromApi };
                    }
                    if (modalRcBlock.type === 'quiz' && modalRcBlock.quizContent) {
                        const { questions: modalQuestions, id: quizContentId, ...restQuiz } = modalRcBlock.quizContent;
                        const questionsForApi: ApiQuizQuestionFromApi[] = modalQuestions.map((modal_q): ApiQuizQuestionFromApi => ({
                            ...modal_q,
                            id: modal_q.id || generateId(),
                            required: modal_q.required,
                            description: modal_q.description === null ? undefined : modal_q.description, // Ensure null becomes undefined for API
                            options: (modal_q.options || []).map(opt => ({ ...opt, id: opt.id || generateId() })) as ApiQuizQuestionOptionFromApi[],
                        } as ApiQuizQuestionFromApi)); // Cast might be needed depending on strictness
                        
                        return {
                            ...baseBlock, type: 'quiz',
                            quizContent: {
                                ...restQuiz, id: quizContentId, questions: questionsForApi,
                                settings: { ...restQuiz.settings, requireLogin: restQuiz.settings.requireLogin ?? false, showPoints: restQuiz.settings.showPoints ?? false }
                            } as ApiQuizBlockContentFromApi
                        };
                    }
                    if (modalRcBlock.type === 'document' && modalRcBlock.documentContent) {
                        // Destructure ALL expected fields from modalRcBlock.documentContent
                        const { documentFile, documentObjectUrl, currentSlide, id: docId, title: docTitle, description: docDesc,
                                documentUrl, viewablePdfUrl, originalFileName, fileSize, fileType, totalSlides, 
                                ...otherDocProps // any other properties that might be on ModalDocumentContentData but not in ApiDocumentBlockContentForSave
                              } = modalRcBlock.documentContent;
                    
                        let finalDocumentUrl = documentUrl; // Existing original file URL
                        let finalViewablePdfUrl = viewablePdfUrl; // Existing viewable PDF URL
                        let finalTotalSlides = totalSlides;
                        let finalOriginalFileName = originalFileName;
                        let finalFileSize = fileSize;
                        let finalFileType = fileType;
                    
                        if (documentFile && weekIdForFileUploads) { // If a new file was selected for upload
                            const formData = new FormData(); 
                            formData.append('file', documentFile); 
                            formData.append('weekId', weekIdForFileUploads); 
                            formData.append('title', docTitle || `Document for: ${title}`); 
                            formData.append('type', 'document_asset'); // Backend uses this to trigger conversion
                            
                            // ASSUMPTION: backend createMaterial for 'document_asset' now returns:
                            // { contentUrl (original), viewablePdfUrl (converted PDF), numPages, originalFileName, fileSize, fileType }
                            const uploadedMaterial = await createMaterial(formData); 
                            
                            if (!uploadedMaterial?.contentUrl || !uploadedMaterial?.viewablePdfUrl) {
                                throw new Error(`Document processing and conversion failed for "${docTitle}".`);
                            }
                            finalDocumentUrl = uploadedMaterial.contentUrl; // URL to original .ppt, .docx etc.
                            finalViewablePdfUrl = uploadedMaterial.viewablePdfUrl; // URL to converted .pdf
                            finalTotalSlides = uploadedMaterial.numPages; // Or whatever your backend calls it (e.g., totalPages)
                            finalOriginalFileName = uploadedMaterial.originalFileName || documentFile.name; 
                            finalFileSize = uploadedMaterial.fileSize || documentFile.size; 
                            finalFileType = uploadedMaterial.fileType || documentFile.type;
                        }
                        
                        // Construct the object for the API, ensuring all fields of ApiDocumentBlockContentForSave are present
                        const documentContentForApi: ApiDocumentBlockContentForSave = {
                            id: docId,
                            title: docTitle,
                            description: docDesc,
                            documentUrl: finalDocumentUrl || '', // Original file URL (must not be undefined for API)
                            viewablePdfUrl: finalViewablePdfUrl, // Converted PDF URL (can be undefined if no conversion)
                            originalFileName: finalOriginalFileName,
                            fileSize: finalFileSize,
                            fileType: finalFileType,
                            totalSlides: finalTotalSlides,
                            ...otherDocProps // spread any other valid properties for ApiDocumentBlockContentForSave
                        };

                        return { ...baseBlock, type: 'document', documentContent: documentContentForApi };
                    }
                    throw new Error(`Unhandled block type during save: ${modalRcBlock.type}`);
                })
            );

            let determinedType: ApiContentItemFromApi['type'] = 'text'; // Default
            if (finalRichContentForApi.some(item => item.type === 'quiz')) determinedType = 'quiz_link';
            else if (finalRichContentForApi.some(item => item.type === 'video')) determinedType = 'video';
            else if (finalRichContentForApi.length === 1 && finalRichContentForApi[0].type === 'document') determinedType = 'document';
            // Could add more sophisticated type determination if needed

            const payload: ApiContentItemFromApi = { 
                ...(currentContentItem?.id && { id: currentContentItem.id }), 
                title, isRequired, richContent: finalRichContentForApi, 
                type: determinedType, 
                order: currentContentItem?.order ?? 0 
            };

            const savedOrUpdatedContent = await onSave(payload);

            if (savedOrUpdatedContent && 'id' in savedOrUpdatedContent) {
                // Successfully saved/updated, update local state with response from API
                const apiResponseContent = savedOrUpdatedContent as ApiContentItemFromApi;
                setCurrentContentItem(apiResponseContent); // Update the base item
                setTitle(apiResponseContent.title);
                setIsRequired(apiResponseContent.isRequired || false);
                const mappedRichContent = (apiResponseContent.richContent as ApiRichContentItemBlockFromApi[] || [])
                    .map(mapApiBlockToModalBlock)
                    .sort((a,b) => a.order - b.order); // Ensure sorted after mapping API response
                setRichContent(mappedRichContent);
                setSuccessMessage(isEditingLocally ? "Changes saved successfully!" : "Content created successfully!");
                if (!isEditingLocally) { // If new content was created
                    // Expand the first block of the newly created content, or nothing if no blocks
                    setExpandedContentIndex(mappedRichContent.length > 0 ? 0 : null);
                }
            } else if (!isEditingLocally) { // New content, but onSave didn't return the full object (or void)
                // Reset form for adding another new item
                setTitle(''); setIsRequired(false); setRichContent([]); setExpandedContentIndex(null); setCurrentContentItem(null);
                setSuccessMessage("Content created successfully! Add another or close.");
            } else { // Editing, but onSave didn't return the full object
                 setSuccessMessage("Changes saved successfully!");
                 // Local state might be slightly out of sync if API only returned success, not the full object.
                 // This relies on the parent component potentially re-fetching and passing updated props.
            }
        } catch (err: any) {
            setErrorModal(err.response?.data?.message || err.message || "An unexpected error occurred during save.");
            console.error("Save Error:", err.response?.data || err);
        } finally {
            setIsSaving(false);
        }
    };

    const renderPreview = () => {
        return (
             <div className={`p-3 sm:p-4 space-y-5 prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-[${deepBrownLightHex}] dark:prose-headings:text-[${deepBrownDarkHex}] prose-p:text-[${midBrownLightHex}] dark:prose-p:text-[${midBrownDarkHex}] prose-a:text-[${goldAccentHex}] hover:prose-a:underline prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5`}>
                <h1 className="text-2xl font-bold font-serif mb-3">{title || "Untitled Content"}</h1>
                {isRequired && <span className="block text-xs text-red-600 dark:text-red-400 font-semibold mb-3">(Required)</span>}
                {richContent.length === 0 && <p className={mutedText}>No content blocks to preview.</p>}
                
                {richContent.map((item, index) => (
                    <div key={`preview-${item.id}`} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 border-gray-200 dark:border-gray-700 ${index > 0 ? 'mt-6 pt-6' : ''}`}>
                        {item.type === 'text' && item.content && (<div dangerouslySetInnerHTML={{ __html: item.content || '' }} />)}
                        
                        {item.type === 'video' && item.videoContent && (
                            <div className="not-prose">
                                <h3 className={`text-lg font-semibold mb-1.5 text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}]`}>{item.videoContent.title || "Video"}</h3>
                                {item.videoContent.description && <p className={`text-sm mb-2 text-[${midBrownLightHex}] dark:text-[${midBrownDarkHex}]`}>{item.videoContent.description}</p>}
                                {item.videoContent.isRequired && <span className="text-xs text-red-500 mb-2 block">(Required Video)</span>}
                                {(() => {
                                    const videoSrc = item.videoContent.videoObjectUrl || item.videoContent.videoUrl;
                                    const posterSrc = item.videoContent.thumbnailObjectUrl || item.videoContent.thumbnailUrl;
                                    if (videoSrc) return (<div className="aspect-video w-full max-w-xl bg-black rounded-md overflow-hidden mx-auto my-2"><ReactPlayer className="react-player" url={videoSrc} controls width='100%' height='100%' light={posterSrc || false} config={{ file: { attributes: { controlsList: 'nodownload', disablePictureInPicture: true }}}} /></div>);
                                    return (<div className={`p-4 ${editorCardBgMantine} rounded text-center text-sm ${mutedText} border ${themedInputBorder}`}>Video source missing.</div>);
                                })()}
                            </div>
                        )}
                        
                        {item.type === 'document' && item.documentContent && (
                             <div className="not-prose document-block-preview space-y-2">
                                <h3 className={`text-lg font-medium mb-1 text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}]`}>{item.documentContent.title || "Untitled Document"}</h3>
                                {item.documentContent.description && <p className={`text-xs mb-1 text-[${midBrownLightHex}] dark:text-[${midBrownDarkHex}]`}>{item.documentContent.description}</p>}
                                
                                {(() => {
                                    const docContent = item.documentContent;
                                    // URL for viewer: local PDF file (documentObjectUrl) or converted PDF from server (viewablePdfUrl)
                                    const urlForViewer = docContent.documentObjectUrl || docContent.viewablePdfUrl;
                                    
                                    const isPdfMimeType = docContent.fileType === 'application/pdf';
                                    const isPdfExtension = (docContent.originalFileName || '').toLowerCase().endsWith('.pdf');
                                    // A viewablePdfUrl implies it's a PDF ready for viewing, even if original was PPT/DOC
                                    const isConsideredPdfForViewing = isPdfMimeType || isPdfExtension || !!docContent.viewablePdfUrl;

                                    if (urlForViewer && isConsideredPdfForViewing) {
                                        return (
                                            <>
                                            <div className="mt-2 mb-3">
                                                <DocumentViewer
                                                    key={`doc-viewer-preview-${item.id}-${docContent.currentSlide}`} // Key change might force re-render if needed
                                                    fileUrl={urlForViewer}
                                                    pageNumber={docContent.currentSlide || 1}
                                                    themedInputBorder={themedInputBorder} // Pass your theme classes
                                                    mutedText={mutedText} // Pass your theme classes
                                                    onLoadSuccess={(loadedPages) => handleDocumentLoadSuccessInPreview(item.id, loadedPages)}
                                                    onLoadError={(error) => {
                                                        console.warn("PDF load error in preview for item:", item.id, error);
                                                        // Optionally clear totalSlides or show a specific message in the item state
                                                        handleUpdateRichContentItem(item.id, { documentContent: {...docContent, totalSlides: undefined, viewablePdfUrl: undefined }});
                                                    }}
                                                    showError={true} // Show errors in admin preview
                                                />
                                            </div>
                                            {docContent.totalSlides && docContent.totalSlides > 0 && ( // Check totalSlides > 0
                                                <div className="flex items-center justify-center space-x-3 mt-2 mb-1">
                                                    <Button
                                                        variant="outline" size="sm"
                                                        onClick={() => goToPrevSlide(item.id)}
                                                        disabled={(docContent.currentSlide || 1) === 1}
                                                        className={`${outlineButtonClasses} h-8 w-8 p-0`} aria-label="Previous slide"
                                                    > <ChevronLeft className="h-4 w-4" /> </Button>
                                                    <span className={`text-xs ${mutedText}`}>
                                                        Slide {docContent.currentSlide || 1} of {docContent.totalSlides}
                                                    </span>
                                                    <Button
                                                        variant="outline" size="sm"
                                                        onClick={() => goToNextSlide(item.id)}
                                                        disabled={(docContent.currentSlide || 1) === docContent.totalSlides}
                                                        className={`${outlineButtonClasses} h-8 w-8 p-0`} aria-label="Next slide"
                                                    > <ChevronRight className="h-4 w-4" /> </Button>
                                                </div>
                                            )}
                                            </>
                                        );
                                    } else if (docContent.documentUrl || docContent.documentObjectUrl) { // Original file exists, but not viewable as PDF in preview
                                        return (<div className="my-2"><p className={`text-sm ${mutedText} mb-2`}>
                                            {isConsideredPdfForViewing ? "Loading preview..." : 
                                            "Slide preview for this file type will be available after saving and processing. You can download the original file."}
                                        </p></div>);
                                    } else { // No document uploaded or processed
                                        return (<div className={`my-2 p-3 ${editorCardBgMantine} rounded text-sm ${mutedText} border ${themedInputBorder}`}>Document missing or not yet processed.</div>);
                                    }
                                })()}
                                
                                {/* Download button - should link to original file */}
                                {(() => {
                                    const downloadUrl = item.documentContent?.documentObjectUrl || item.documentContent?.documentUrl;
                                    const downloadFileName = item.documentContent?.originalFileName || 'document';
                                    if (downloadUrl) {
                                        return (
                                            <div className="mt-2">
                                                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download={downloadFileName} 
                                                   className={`${primaryButtonClasses} inline-flex items-center text-xs px-2.5 py-1.5 rounded`}>
                                                    <Download className="h-3.5 w-3.5 mr-1.5"/>Download {downloadFileName}
                                                </a>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
   {item.type === 'quiz' && item.quizContent && (
                             <div className="not-prose">
                                <h3 className={`text-lg font-semibold mb-1.5 text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}]`}>{item.quizContent.title || "Quiz"}</h3>
                                {item.quizContent.description && <p className={`text-sm mb-2 text-[${midBrownLightHex}] dark:text-[${midBrownDarkHex}]`}>{item.quizContent.description}</p>}
                                {(item.quizContent.settings?.timeLimit != null) && <p className={`text-xs mb-2 ${mutedText}`}>Time Limit: {item.quizContent.settings.timeLimit} min</p>}
                                {(!item.quizContent.questions || item.quizContent.questions.length === 0) && <p className={`${mutedText} text-sm`}>No questions.</p>}
                                <div className="space-y-3 mt-2">
                                    {item.quizContent.questions?.map((q, qIdx) => (
                                        <div key={q.id} className={`p-3 border rounded ${editorCardBgMantine} ${themedInputBorder}`}>
                                            <p className={`font-medium text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] mb-1`}>{qIdx + 1}. {q.question} {q.required && <span className="text-red-500 text-xs">*</span>}</p>
                                            {q.description && <p className={`text-xs ${mutedText} mb-1.5`}>{q.description}</p>}
                                            {(q.type === 'multiple_choice' || q.type === 'checkbox') && q.options?.map((opt: ModalQuizQuestionOption) => (
                                                <div key={opt.id} className={`ml-4 text-sm flex items-center gap-2 text-[${midBrownLightHex}] dark:text-[${midBrownDarkHex}] my-1`}>
                                                    <div className={`w-4 h-4 border rounded-${q.type === 'multiple_choice' ? 'full' : 'sm'} border-gray-400 dark:border-gray-500 shrink-0`}></div>
                                                    <span>{opt.text}</span>
                                                    {(opt.isCorrect ?? false) && <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-2">(Correct)</span>}
                                                </div>
                                            ))}
                                            {(q.type === 'short_answer' || q.type === 'essay' || q.type === 'paragraph') && (
                                                <div className={`ml-4 text-sm italic ${mutedText}`}>Answer area for {q.type.replace('_', ' ')}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;
    
    // Accepted file types for document upload input
    const documentFileAcceptTypes = ".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <MantineProvider theme={{
                primaryColor: 'blue',
                defaultRadius: 'md',
                colors: {
                    blue: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1']
                }
            }}>
                <Card className={`w-full max-w-3xl ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl flex flex-col max-h-[90vh] rounded-lg overflow-hidden`}>
                    <CardHeader className={`flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b ${themedInputBorder} sticky top-0 z-10 ${lightCardBg} ${darkCardBg}`}>
                        <div id="modal-title"> <CardTitle className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] font-serif text-xl`}>{isEditingLocally ? "Edit Content" : "Add New Content"}</CardTitle> </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)} className={`${outlineButtonClasses} text-xs h-8 px-2.5`} aria-label={isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}> {isPreviewMode ? <><Edit3 className="h-3.5 w-3.5 mr-1.5"/>Edit</> : <><Eye className="h-3.5 w-3.5 mr-1.5"/>Preview</>} </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className={`text-${midBrownLightHex} dark:text-${midBrownDarkHex} hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8 rounded-full`} aria-label="Close modal"><X className="h-4 w-4"/></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                        {successMessage && ( <div role="alert" className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-md text-sm flex items-center gap-2"> <CheckCircle className="h-4 w-4 shrink-0"/> <span>{successMessage}</span> </div> )}
                        {error && ( <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2"> <AlertCircle className="h-4 w-4 shrink-0"/> <span>{error}</span> </div> )}
                        
                        {isPreviewMode ? ( renderPreview() ) : (
                            <>
                                <TextInput
                                    label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Overall Content Title <span className="text-red-500">*</span></span>}
                                    id="content-title" value={title} onChange={(event) => { setTitle(event.currentTarget.value); setSuccessMessage(null); setErrorModal(null);}}
                                    placeholder="E.g., Week 1: Introduction" disabled={isSaving} required size="sm" styles={mantineInputStyles}
                                />
                                <div className="space-y-3 pt-3">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <ShadcnLabel className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium mb-1 sm:mb-0`}>Content Blocks</ShadcnLabel>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {[
                                                { type: 'text' as ModalRichContentItem['type'], Icon: FileTextIcon, label: 'Text' },
                                                { type: 'video' as ModalRichContentItem['type'], Icon: VideoIcon, label: 'Video' },
                                                { type: 'quiz' as ModalRichContentItem['type'], Icon: HelpCircle, label: 'Quiz' },
                                                { type: 'document' as ModalRichContentItem['type'], Icon: FileTextIcon, label: 'Document' }
                                            ].map(btn => (
                                                <Button key={btn.type} variant="outline" size="sm"
                                                        onClick={() => handleAddRichContent(btn.type)}
                                                        className={`${outlineButtonClasses} text-xs h-8 px-2.5`} disabled={isSaving}>
                                                    <btn.Icon className="h-3.5 w-3.5 mr-1.5"/> Add {btn.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    {richContent.length === 0 && ( <div className={`text-center p-6 border-2 border-dashed ${themedInputBorder} rounded-md ${mutedText} text-sm`}> No content blocks added yet. Click a button above. </div> )}

                                    {richContent.map((item, index) => (
                                        <Card key={item.id} className={`overflow-hidden border ${themedInputBorder} ${editorCardBgMantine} ${darkCardBg}`}>
                                            <CardHeader 
                                                className={`flex flex-row items-center justify-between p-2 sm:p-3 border-b ${themedInputBorder} ${editorToolbarBgMantine} cursor-pointer`} 
                                                onClick={() => setExpandedContentIndex(expandedContentIndex === index ? null : index)} >
                                                {/* ... CardHeader content for block type icon and title ... */}
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {item.type === 'text' && <FileTextIcon className={`h-4 w-4 ${goldAccent} shrink-0`} />}
                                                    {item.type === 'video' && <VideoIcon className={`h-4 w-4 ${goldAccent} shrink-0`} />}
                                                    {item.type === 'quiz' && <HelpCircle className={`h-4 w-4 ${goldAccent} shrink-0`} />}
                                                    {item.type === 'document' && <FileTextIcon className={`h-4 w-4 ${goldAccent} shrink-0`} />}
                                                    <ShadcnLabel className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium truncate cursor-pointer`}>
                                                        {item.type === 'text' && 'Text Block'}
                                                        {item.type === 'video' && (item.videoContent?.title || 'Video Block')}
                                                        {item.type === 'quiz' && (item.quizContent?.title || 'Quiz Block')}
                                                        {item.type === 'document' && (item.documentContent?.title || 'Document Block')}
                                                    </ShadcnLabel>
                                                </div>
                                                <div className="flex items-center shrink-0">
                                                    <Button variant="ghost" size="icon" className={`h-7 w-7 text-${midBrownLightHex} dark:text-${midBrownDarkHex}`} aria-label={expandedContentIndex === index ? "Collapse block" : "Expand block"}> {expandedContentIndex === index ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>} </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveRichContent(item.id); }} className={`h-7 w-7 text-red-500 hover:text-red-600`} aria-label="Remove block" disabled={isSaving}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </CardHeader>
                                            {expandedContentIndex === index && (
                                                <CardContent className="p-2 sm:p-3 space-y-3">
                                                    {item.type === 'text' && ( <IntegratedRichTextEditor value={item.content || '<p></p>'} onChange={html => {handleUpdateRichContentItem(item.id, { content: html }); setSuccessMessage(null); setErrorModal(null);}} placeholder="Start writing text..." weekIdForImageUploads={weekIdForFileUploads} mutedTextClass={mutedText} /> )}
                                                    {item.type === 'video' && item.videoContent && (
                                                        <div className="space-y-3">
                                                            <TextInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Video Title</span>} value={item.videoContent.title} onChange={(event) => handleUpdateVideoContent(item.id, { title: event.currentTarget.value })} placeholder="Enter video title" disabled={isSaving} required size="sm" styles={mantineInputStyles} />
                                                            <Textarea label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Video Description(Optional)</span>} placeholder="Add a description..." size="sm" minRows={2} autosize value={item.videoContent.description || ''} onChange={e => {handleUpdateVideoContent(item.id, { description: e.target.value }); setSuccessMessage(null); setErrorModal(null);}} styles={mantineInputStyles} />
                                                            <FileInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Video File</span>} placeholder="Select video file" accept="video/*" value={item.videoContent.videoFile || null}
                                                                onChange={(file: File | null) => {
                                                                    const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.videoObjectUrl;
                                                                    let newUrl = file ? URL.createObjectURL(file) : undefined;
                                                                    handleUpdateVideoContent(item.id, { videoFile: file || undefined, videoUrl: '', videoObjectUrl: newUrl } );
                                                                    if (oldUrl && oldUrl !== newUrl) URL.revokeObjectURL(oldUrl);
                                                                    setSuccessMessage(null); setErrorModal(null);
                                                                }} clearable size="sm" styles={mantineInputStyles} />
                                                            {item.videoContent.videoFile && <p className="text-xs mt-1 text-green-600 dark:text-green-400">Selected: {item.videoContent.videoFile.name}</p>}
                                                            <TextInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Or Video URL</span>} placeholder="https://..." value={item.videoContent.videoUrl || ''}
                                                                onChange={(event) => {
                                                                    const url = event.currentTarget.value; const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.videoObjectUrl;
                                                                    handleUpdateVideoContent(item.id, { videoUrl: url, videoFile: undefined, videoObjectUrl: undefined } );
                                                                    if (oldUrl) URL.revokeObjectURL(oldUrl);
                                                                    setSuccessMessage(null); setErrorModal(null);
                                                                }} size="sm" styles={mantineInputStyles} />
                                                            <FileInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Thumbnail (Optional)</span>} placeholder="Select image" accept="image/*" value={item.videoContent.thumbnail || null}
                                                                onChange={(file: File | null) => {
                                                                     const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.thumbnailObjectUrl;
                                                                     let newUrl = file ? URL.createObjectURL(file) : undefined;
                                                                     handleUpdateVideoContent(item.id, { thumbnail: file || undefined, thumbnailUrl: '', thumbnailObjectUrl: newUrl } );
                                                                     if (oldUrl && oldUrl !== newUrl) URL.revokeObjectURL(oldUrl);
                                                                     setSuccessMessage(null); setErrorModal(null);
                                                                }} clearable size="sm" styles={mantineInputStyles} />
                                                            {item.videoContent.thumbnail && <p className="text-xs mt-1 text-green-600 dark:text-green-400">Selected: {item.videoContent.thumbnail.name}</p>}
                                                            <TextInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Or Thumbnail URL</span>} placeholder="https://..." value={item.videoContent.thumbnailUrl || ''}
                                                                onChange={(event) => {
                                                                    const url = event.currentTarget.value; const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.thumbnailObjectUrl;
                                                                    handleUpdateVideoContent(item.id, { thumbnailUrl: url, thumbnail: undefined, thumbnailObjectUrl: undefined } );
                                                                    if (oldUrl) URL.revokeObjectURL(oldUrl);
                                                                    setSuccessMessage(null); setErrorModal(null);
                                                                }} size="sm" styles={mantineInputStyles} />
                                                            <MantineCheckbox
                                                                label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm`}>Video required</span>}
                                                                checked={item.videoContent.isRequired === true}
                                                                onChange={(event) => {
                                                                    handleUpdateVideoContent(item.id, { isRequired: event.currentTarget.checked });
                                                                    setSuccessMessage(null);
                                                                    setErrorModal(null);
                                                                }}
                                                                size="xs"
                                                                className="mt-3 pt-1"
                                                                disabled={isSaving}
                                                            />
                                                        </div>
                                                    )}
                                                    {item.type === 'quiz' && item.quizContent && (
                                                         <div className="space-y-3">
                                                            <TextInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Quiz Title</span>} value={item.quizContent.title} onChange={(event) => {handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, title: event.currentTarget.value}}); setSuccessMessage(null); setErrorModal(null);}} placeholder="Enter quiz title" disabled={isSaving} required size="sm" styles={mantineInputStyles} />
                                                            <Textarea label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Quiz Description</span>} placeholder="Instructions..." size="sm" minRows={2} autosize value={item.quizContent.description || ''} onChange={e => {handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, description: e.target.value}}); setSuccessMessage(null); setErrorModal(null);}} styles={mantineInputStyles} />
                                                            <details className="group">
                                                                <summary className={`list-none flex items-center justify-between cursor-pointer p-2 border rounded-md ${themedInputBorder} ${editorToolbarBgMantine}`}> <span className={`text-[${deepBrownLightHex}] text-sm font-medium`}>Quiz Settings</span> <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform"/> </summary>
                                                                <div className={`mt-2 p-3 border rounded-md border-t-0 rounded-t-none ${themedInputBorder} space-y-3 bg-white dark:bg-gray-800/30`}>
                                                                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                                        <div className="flex items-center gap-1">
                                                                            <ShadcnLabel htmlFor={`timeLimit-${item.id}`} className={`text-[${deepBrownLightHex}] text-xs`}>Time Limit (min):</ShadcnLabel>
                                                                            <TextInput
                                                                                id={`timeLimit-${item.id}`}
                                                                                type="number"
                                                                                min="1"
                                                                                value={item.quizContent.settings?.timeLimit ?? ''}
                                                                                onChange={e => {
                                                                                    handleUpdateQuizSettings(item.id, {
                                                                                        timeLimit: e.currentTarget.value ? Math.max(1, parseInt(e.currentTarget.value)) : undefined
                                                                                    });
                                                                                }}
                                                                                placeholder="None"
                                                                                size="xs"
                                                                                className="w-20"
                                                                                styles={mantineInputStyles}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <ShadcnLabel htmlFor={`passScore-${item.id}`} className={`text-[${deepBrownLightHex}] text-xs`}>Pass Score (%):</ShadcnLabel>
                                                                            <TextInput
                                                                                id={`passScore-${item.id}`}
                                                                                type="number"
                                                                                min="0"
                                                                                max="100"
                                                                                value={item.quizContent.settings?.passingScore ?? ''}
                                                                                onChange={e => {
                                                                                    handleUpdateQuizSettings(item.id, {
                                                                                        passingScore: e.currentTarget.value ? Math.max(0, Math.min(100, parseInt(e.currentTarget.value))) : undefined
                                                                                    });
                                                                                }}
                                                                                placeholder="None"
                                                                                size="xs"
                                                                                className="w-20"
                                                                                styles={mantineInputStyles}
                                                                            />
                                                                        </div>
                                                                        <Group>
                                                                            <MantineCheckbox
                                                                                id={`shuffle-${item.id}`}
                                                                                checked={item.quizContent.settings?.shuffleQuestions ?? false}
                                                                                onChange={(e) => {
                                                                                    handleUpdateQuizSettings(item.id, { shuffleQuestions: e.currentTarget.checked });
                                                                                    setSuccessMessage(null);
                                                                                    setErrorModal(null);
                                                                                }}
                                                                                label={<span className={`text-[${deepBrownLightHex}] text-sm font-normal`}>Shuffle Qs</span>}
                                                                                size="xs"
                                                                            />
                                                                            <MantineCheckbox
                                                                                id={`retake-${item.id}`}
                                                                                checked={item.quizContent.settings?.allowRetake ?? true}
                                                                                onChange={(e) => {
                                                                                    handleUpdateQuizSettings(item.id, { allowRetake: e.currentTarget.checked });
                                                                                    setSuccessMessage(null);
                                                                                    setErrorModal(null);
                                                                                }}
                                                                                label={<span className={`text-[${deepBrownLightHex}] text-sm font-normal`}>Allow Retakes</span>}
                                                                                size="xs"
                                                                            />
                                                                        </Group>
                                                                     </div>
                                                                </div>
                                                            </details>
                                                            <ShadcnLabel className={`text-[${deepBrownLightHex}] text-sm font-medium block pt-2`}>Questions: <span className="text-red-500">*</span></ShadcnLabel>
                                                            {(item.quizContent.questions || []).map((q) => ( <QuizQuestionEditor key={q.id} question={q} generateId={generateId} onUpdate={updatedQ => { if (!item.quizContent?.questions) return; const newQs = item.quizContent.questions.map(oldQ => oldQ.id === q.id ? updatedQ : oldQ); handleUpdateRichContentItem(item.id, { quizContent: { ...item.quizContent!, questions: newQs } }); setSuccessMessage(null); setErrorModal(null);}} onRemove={() => { if (!item.quizContent?.questions) return; handleUpdateRichContentItem(item.id, { quizContent: { ...item.quizContent!, questions: item.quizContent.questions.filter(oldQ => oldQ.id !== q.id) } }); setSuccessMessage(null); setErrorModal(null);}} /> ))}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newQ: ModalQuizQuestion = {
                                                                        id: generateId(),
                                                                        type: 'essay',
                                                                        question: '',
                                                                        required: false,
                                                                        options: [{id: generateId(), text:'', isCorrect:false}]
                                                                    };
                                                                    handleUpdateRichContentItem(item.id, {
                                                                        quizContent: {
                                                                            ...item.quizContent!,
                                                                            questions: [...(item.quizContent!.questions || []), newQ]
                                                                        }
                                                                    });
                                                                    setSuccessMessage(null);
                                                                    setErrorModal(null);
                                                                }}
                                                                className={`${outlineButtonClasses} text-xs h-8`}
                                                            >
                                                                <Plus className="h-3.5 w-3.5 mr-1.5"/>Add Question
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {item.type === 'document' && item.documentContent && (
                                                        <div className="space-y-3">
                                                            <TextInput label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Document Title</span>} placeholder="Enter document title" size="sm"
                                                                value={item.documentContent.title}
                                                                onChange={e => {handleUpdateRichContentItem(item.id, {documentContent: {...item.documentContent!, title: e.target.value}}); setSuccessMessage(null); setErrorModal(null);}}
                                                                styles={mantineInputStyles}
                                                            />
                                                            <Textarea label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Document Description</span>} placeholder="Add a description..." size="sm" minRows={2} autosize
                                                                value={item.documentContent.description || ''}
                                                                onChange={e => {handleUpdateRichContentItem(item.id, {documentContent: {...item.documentContent!, description: e.target.value}}); setSuccessMessage(null); setErrorModal(null);}}
                                                                styles={mantineInputStyles}
                                                            />
                                                            <FileInput
                                                                label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Document File</span>}
                                                                placeholder="Select PDF, DOC(X), PPT(X) file"
                                                                accept={documentFileAcceptTypes}
                                                                value={item.documentContent.documentFile || null}
                                                                onChange={(file: File | null) => {
                                                                    const current = richContent.find(rc => rc.id === item.id);
                                                                    const oldUrl = current?.documentContent?.documentObjectUrl;
                                                                    let newUrl = file ? URL.createObjectURL(file) : undefined;

                                                                    const docContentUpdate: Partial<ModalDocumentContentData> = {
                                                                        documentFile: file || undefined,
                                                                        documentUrl: '',
                                                                        documentObjectUrl: newUrl,
                                                                        originalFileName: file?.name || item.documentContent?.originalFileName,
                                                                        currentSlide: 1, 
                                                                        totalSlides: undefined 
                                                                    };

                                                                    handleUpdateRichContentItem(item.id, { documentContent: { ...item.documentContent!, ...docContentUpdate }});

                                                                    if (oldUrl && oldUrl !== newUrl) URL.revokeObjectURL(oldUrl);
                                                                    setSuccessMessage(null); setErrorModal(null);
                                                                }}
                                                                clearable size="sm" styles={mantineInputStyles}
                                                            />
                                                            {item.documentContent.documentFile && <p className="text-xs mt-1 text-green-600 dark:text-green-400">Selected: {item.documentContent.documentFile.name}</p>}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                                <Group mt="lg"> <MantineCheckbox id="content-required" checked={isRequired} onChange={(event) => {setIsRequired(event.currentTarget.checked); setSuccessMessage(null); setErrorModal(null);}} disabled={isSaving} label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-normal cursor-pointer`}>Mark this entire content item as required</span>} size="sm" /> </Group>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className={`flex justify-end gap-2 pt-3 pb-3 px-4 border-t ${themedInputBorder} sticky bottom-0 z-10 ${lightCardBg} ${darkCardBg}`}>
                        <Button variant="outline" onClick={onClose} disabled={isSaving} className={`${outlineButtonClasses} h-9`}>Cancel</Button>
                        {!isPreviewMode && ( <Button onClick={handleSaveClick} disabled={isSaving || !title.trim() || richContent.length === 0} className={`${primaryButtonClasses} h-9`}> {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>{isEditingLocally ? "Save Changes" : "Create Content"}</>} </Button> )}
                    </CardFooter>
                </Card>
            </MantineProvider>
        </div>
    );
};

export default CreateEditContentModal;