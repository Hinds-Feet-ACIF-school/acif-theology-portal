import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label as ShadcnLabel } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
    X, Save, Loader2, AlertCircle, Plus, Trash2, Video as VideoIcon, FileText as FileTextIcon, HelpCircle,
    ChevronDown, ChevronUp, Eye, Edit3, Image as ImageIcon, Download,
    CheckCircle
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
    type Material as ApiMaterial,
    type ApiDocumentBlockContentForSave,
} from '../../services/api';

// Import extracted components (ADJUST PATHS AS NEEDED)
import DocumentViewer from '../DocumentViewer';
import QuizQuestionEditor, { type ModalQuizQuestion, type ModalQuizQuestionOption } from '../QuizQuestionEditor'; // Assuming types are exported or defined centrally
import IntegratedRichTextEditor from '../IntegratedRichTextEditor';


const deepBrownLightHex = '#2A0F0F';
const deepBrownDarkHex = '#FFF8F0';
const goldAccent = 'text-[#C5A467]';
const goldAccentHex = '#C5A467';
const editorDarkBgHex = '#1f2937';
const editorLightBgHex = '#ffffff';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
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
    videoFile?: File | undefined;
    thumbnail?: File | undefined;
    videoObjectUrl?: string;
    thumbnailObjectUrl?: string;
    title: string;
    isRequired: boolean;
}
interface ModalQuizContentData extends Omit<ApiQuizBlockContentFromApi, 'settings' | 'questions' | 'id'> {
    id: string;
    questions: ModalQuizQuestion[];
    settings: Omit<ApiQuizBlockContentFromApi['settings'], 'requireLogin' | 'showPoints'> & {
        requireLogin?: boolean; showPoints?: boolean;
    };
}
interface ModalDocumentContentData extends ApiDocumentBlockContentForSave {
    documentFile?: File | undefined;
    documentObjectUrl?: string;
}

interface ModalRichContentItem {
    id: string;
    type: 'text' | 'video' | 'quiz' | 'document';
    order: number;
    content?: string;
    videoContent?: ModalVideoContentData;
    quizContent?: ModalQuizContentData;
    documentContent?: ModalDocumentContentData;
}

interface CreateEditContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: ApiContentItemFromApi | null;
    onSave: (contentData: ApiContentItemFromApi) => Promise<ApiContentItemFromApi | void>;
    sectionId: string;
    weekIdForFileUploads: string;
}

const CreateEditContentModal: React.FC<CreateEditContentModalProps> = ({
    isOpen, onClose, content: apiContentPropFromParent, onSave,
    sectionId,
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
    const richContentRef = useRef(richContent);

    const isEditingLocally = !!currentContentItem?.id;
    const generateId = useCallback(() => `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, []);

    useEffect(() => { richContentRef.current = richContent; }, [richContent]);

    const mapApiBlockToModalBlock = useCallback((apiRcBlock: ApiRichContentItemBlockFromApi, index: number): ModalRichContentItem => {
        const blockId = apiRcBlock.id || generateId();
        const blockType = apiRcBlock.type as ModalRichContentItem['type'];
        const modalBlockBase: Pick<ModalRichContentItem, 'id' | 'type' | 'order'> = {
            id: blockId, type: blockType, order: apiRcBlock.order ?? index,
        };
        if (blockType === 'text') return { ...modalBlockBase, type: 'text', content: apiRcBlock.content || '<p></p>' };
        if (blockType === 'video' && apiRcBlock.videoContent) return { ...modalBlockBase, type: 'video', videoContent: { ...(apiRcBlock.videoContent as ApiVideoBlockContentFromApi), id: apiRcBlock.videoContent.id || blockId, videoFile: undefined, thumbnail: undefined, videoObjectUrl: undefined, thumbnailObjectUrl: undefined, isRequired: apiRcBlock.videoContent.isRequired ?? false } };
        if (blockType === 'quiz' && apiRcBlock.quizContent) {
            const qc = apiRcBlock.quizContent as ApiQuizBlockContentFromApi;
            return {
                ...modalBlockBase, type: 'quiz', quizContent: {
                    ...qc,
                    id: qc.id || blockId,
                    questions: (qc.questions as ApiQuizQuestionFromApi[] || []).map(q => ({ ...q, id: q.id || generateId(), options: q.options ? (q.options as ApiQuizQuestionOptionFromApi[]).map(opt => ({ ...opt, id: opt.id || generateId() })) : [] })),
                    settings: { ...(qc.settings as ApiQuizBlockContentFromApi['settings']), requireLogin: qc.settings.requireLogin ?? false, showPoints: qc.settings.showPoints ?? false }
                }
            };
        }
        if (blockType === 'document' && apiRcBlock.documentContent) return { ...modalBlockBase, type: 'document', documentContent: { ...(apiRcBlock.documentContent as ApiDocumentBlockContentForSave), id: apiRcBlock.documentContent.id || blockId, documentFile: undefined, documentObjectUrl: undefined, } };
        console.warn("Mapping warning: Unrecognized rich content block:", apiRcBlock);
        return { ...modalBlockBase, type: 'text', content: '<p>Corrupted block.</p>' };
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
                const mappedRichContent = (initialContentToLoad.richContent as ApiRichContentItemBlockFromApi[] || []).map(mapApiBlockToModalBlock);
                setRichContent(mappedRichContent);
                setExpandedContentIndex(mappedRichContent.length > 0 ? 0 : null);
                 if (!currentContentItem && apiContentPropFromParent) {
                    setCurrentContentItem(apiContentPropFromParent);
                }
            } else {
                setTitle(''); setIsRequired(false); setRichContent([]); setExpandedContentIndex(null); setCurrentContentItem(null);
            }
        } else {
            richContentRef.current.forEach(item => {
                if (item.videoContent?.videoObjectUrl) URL.revokeObjectURL(item.videoContent.videoObjectUrl);
                if (item.videoContent?.thumbnailObjectUrl) URL.revokeObjectURL(item.videoContent.thumbnailObjectUrl);
                if (item.documentContent?.documentObjectUrl) URL.revokeObjectURL(item.documentContent.documentObjectUrl);
            });
        }
    }, [isOpen, apiContentPropFromParent, mapApiBlockToModalBlock, currentContentItem]);

    useEffect(() => {
        if (apiContentPropFromParent && apiContentPropFromParent !== currentContentItem) {
             setCurrentContentItem(apiContentPropFromParent);
        }
    }, [apiContentPropFromParent, currentContentItem]);

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
        if (contentType === 'text') newBlock.content = '<p></p>';
        else if (contentType === 'video') newBlock.videoContent = { id: newBlockId, title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: 0, isRequired: false, drmEnabled: false, accessControl: { allowDownload: true, allowSharing: true }};
        else if (contentType === 'quiz') newBlock.quizContent = { 
            id: newBlockId, 
            databaseQuizId: newBlockId, 
            title: '', 
            description: '', 
            questions: [], 
            settings: { 
                shuffleQuestions: false, 
                showResults: true, 
                allowRetake: true, 
                showCorrectAnswers: true,
                passingScore: 70,
                timeLimit: undefined,
                maxAttempts: undefined,
                showPoints: false,
                requireLogin: false,
                collectEmail: false
            }
        };
        else if (contentType === 'document') newBlock.documentContent = { id: newBlockId, title: '', description: '', documentUrl: '', originalFileName: '' };
        setRichContent(prev => { const updated = [...prev, newBlock].map((b,i) => ({...b, order: i})); setExpandedContentIndex(updated.length - 1); return updated; });
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
            if (expandedContentIndex === indexToRemove) setExpandedContentIndex(newRichContent.length > 0 ? Math.max(0, indexToRemove -1) : null);
            else if (expandedContentIndex !== null && expandedContentIndex > indexToRemove) setExpandedContentIndex(prevIdx => prevIdx !== null ? prevIdx - 1 : null);
            return newRichContent;
        });
        setSuccessMessage(null); setErrorModal(null);
    };

    const handleUpdateRichContentItem = useCallback((itemId: string, updatedFields: Partial<Omit<ModalRichContentItem, 'id' | 'type' | 'order'>>) => {
        setRichContent(prevRichContent =>
            prevRichContent.map(item => {
                if (item.id === itemId) {
                    const newItem = { ...item };
                    if (updatedFields.content !== undefined && item.type === 'text') newItem.content = updatedFields.content;
                    if (updatedFields.videoContent && item.type === 'video' && newItem.videoContent) newItem.videoContent = { ...newItem.videoContent, ...updatedFields.videoContent };
                    if (updatedFields.quizContent && item.type === 'quiz' && newItem.quizContent) {
                        const newQuizSettings = updatedFields.quizContent.settings ? { ...newItem.quizContent.settings, ...updatedFields.quizContent.settings } : newItem.quizContent.settings;
                        newItem.quizContent = { ...newItem.quizContent, ...updatedFields.quizContent, settings: newQuizSettings };
                    }
                    if (updatedFields.documentContent && item.type === 'document' && newItem.documentContent) newItem.documentContent = { ...newItem.documentContent, ...updatedFields.documentContent };
                    return newItem;
                }
                return item;
            })
        );
        setSuccessMessage(null); setErrorModal(null);
    }, []);

    const handleSaveClick = async () => {
        setErrorModal(null); setSuccessMessage(null);
        if (!title.trim()) { setErrorModal("Overall content title is required."); return; }
        if (richContent.length === 0) { setErrorModal("Content must have at least one block."); return; }
        if (!weekIdForFileUploads && richContent.some(item => (item.type === 'video' && item.videoContent?.videoFile) || (item.type === 'document' && item.documentContent?.documentFile) || (item.type === 'video' && item.videoContent?.thumbnail))) {
            setErrorModal("Cannot upload files: Week context is missing."); setIsSaving(false); return;
        }
        setIsSaving(true);
        try {
            const finalRichContentForApi: ApiRichContentItemBlockFromApi[] = await Promise.all(
                richContent.map(async (modalRcBlock, index): Promise<ApiRichContentItemBlockFromApi> => {
                    const baseBlock: Pick<ApiRichContentItemBlockFromApi, 'id' | 'type' | 'order'> = { id: modalRcBlock.id, type: modalRcBlock.type, order: modalRcBlock.order ?? index };
                    if (modalRcBlock.type === 'text') return { ...baseBlock, content: modalRcBlock.content || '<p></p>' };
                    if (modalRcBlock.type === 'video' && modalRcBlock.videoContent) {
                        const { videoFile, thumbnail, videoObjectUrl, thumbnailObjectUrl, ...restVideo } = modalRcBlock.videoContent;
                        let finalVideoUrl = restVideo.videoUrl; let finalThumbnailUrl = restVideo.thumbnailUrl;
                        if (videoFile) {
                            const formData = new FormData(); formData.append('file', videoFile); formData.append('weekId', weekIdForFileUploads); formData.append('title', restVideo.title || `Video: ${title}`); formData.append('type', 'video_asset');
                            const uploadedMaterial = await createMaterial(formData);
                            if (!uploadedMaterial?.contentUrl) throw new Error(`Video upload failed.`);
                            finalVideoUrl = uploadedMaterial.contentUrl;
                        }
                        if (thumbnail) {
                            const formData = new FormData(); formData.append('file', thumbnail); formData.append('weekId', weekIdForFileUploads); formData.append('title', `Thumbnail for ${restVideo.title || title}`); formData.append('type', 'image_asset');
                            try { const uploadedThumbnail = await createMaterial(formData); finalThumbnailUrl = uploadedThumbnail?.contentUrl || finalThumbnailUrl; } catch (e) { console.error("Thumbnail upload error:", e); }
                        }
                        return { ...baseBlock, videoContent: { ...restVideo, videoUrl: finalVideoUrl, thumbnailUrl: finalThumbnailUrl } as ApiVideoBlockContentFromApi };
                    }
                    if (modalRcBlock.type === 'quiz' && modalRcBlock.quizContent) {
                        const { questions, id: quizContentId, ...restQuiz } = modalRcBlock.quizContent;
                        const questionsWithIds = questions.map(q => ({ ...q, id: q.id || generateId(), options: q.options?.map(opt => ({ ...opt, id: opt.id || generateId() })) }));
                        return { ...baseBlock, quizContent: { ...restQuiz, id: quizContentId, questions: questionsWithIds as ApiQuizQuestionFromApi[] } as ApiQuizBlockContentFromApi };
                    }
                    if (modalRcBlock.type === 'document' && modalRcBlock.documentContent) {
                        const { documentFile, documentObjectUrl, ...restDoc } = modalRcBlock.documentContent;
                        let { documentUrl: finalDocumentUrl, originalFileName, fileSize, fileType } = restDoc;
                        if (documentFile) {
                            const formData = new FormData(); formData.append('file', documentFile); formData.append('weekId', weekIdForFileUploads); formData.append('title', restDoc.title || `Document: ${title}`); formData.append('type', 'document_asset');
                            const uploadedMaterial = await createMaterial(formData);
                            if (!uploadedMaterial?.contentUrl) throw new Error(`Document upload failed.`);
                            finalDocumentUrl = uploadedMaterial.contentUrl; originalFileName = documentFile.name; fileSize = documentFile.size; fileType = documentFile.type;
                        }
                        return { ...baseBlock, documentContent: { ...restDoc, id: restDoc.id, documentUrl: finalDocumentUrl || '', originalFileName, fileSize, fileType } as ApiDocumentBlockContentForSave };
                    }
                    throw new Error(`Unhandled block type: ${modalRcBlock.type}`);
                })
            );
            let determinedType: ApiContentItemFromApi['type'] = 'text';
            if (finalRichContentForApi.some(item => item.type === 'quiz')) determinedType = 'quiz_link';
            else if (finalRichContentForApi.some(item => item.type === 'video')) determinedType = 'video';
            else if (finalRichContentForApi.length === 1 && finalRichContentForApi[0].type === 'document') determinedType = 'document';
            const payload: ApiContentItemFromApi = { ...(currentContentItem?.id && { id: currentContentItem.id }), title, isRequired, richContent: finalRichContentForApi, type: determinedType, order: currentContentItem?.order ?? 0 };
            const savedOrUpdatedContent = await onSave(payload);
            if (savedOrUpdatedContent && 'id' in savedOrUpdatedContent) {
                setCurrentContentItem(savedOrUpdatedContent as ApiContentItemFromApi);
                setTitle(savedOrUpdatedContent.title);
                setIsRequired(savedOrUpdatedContent.isRequired || false);
                const mappedRichContent = (savedOrUpdatedContent.richContent as ApiRichContentItemBlockFromApi[] || []).map(mapApiBlockToModalBlock);
                setRichContent(mappedRichContent);
                setSuccessMessage(isEditingLocally ? "Changes saved successfully!" : "Content created successfully!");
                if (!isEditingLocally) setExpandedContentIndex(mappedRichContent.length > 0 ? 0 : null);
            } else if (!isEditingLocally) {
                setTitle(''); setIsRequired(false); setRichContent([]); setExpandedContentIndex(null); setCurrentContentItem(null);
                setSuccessMessage("Content created successfully! Add another or close.");
            } else {
                 setSuccessMessage("Changes saved successfully!");
            }
        } catch (err: any) {
            setErrorModal(err.response?.data?.message || err.message || "Save error.");
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
                                    const docUrl = item.documentContent.documentObjectUrl || item.documentContent.documentUrl;
                                    const fileName = item.documentContent.originalFileName;
                                    const fileTypeFromContent = item.documentContent.fileType;

                                    console.log('[Modal Preview] Evaluating Document Block. ID:', item.id, {
                                        docUrl: docUrl ? `present: ${docUrl.substring(0, 50)}...` : 'absent', // Log only start of URL
                                        isDocUrlValid: !!docUrl,
                                        fileName,
                                        fileTypeFromContent,
                                    });

                                    let isViewableType = false;
                                    const lowerFileName = fileName?.toLowerCase();
                                    if (fileTypeFromContent) {
                                        isViewableType = fileTypeFromContent === 'application/pdf' ||
                                                       fileTypeFromContent === 'application/vnd.ms-powerpoint' ||
                                                       fileTypeFromContent === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                                    } else if (lowerFileName) {
                                        isViewableType = lowerFileName.endsWith('.pdf') ||
                                                       lowerFileName.endsWith('.ppt') ||
                                                       lowerFileName.endsWith('.pptx');
                                    }
                                    console.log('[Modal Preview] Document Block. ID:', item.id, 'isViewableType:', isViewableType);


                                    if (docUrl && isViewableType) {
                                        console.log('[Modal Preview] RENDERING DocumentViewer for ID:', item.id, 'with URL starting:', docUrl ? docUrl.substring(0,50) + '...' : 'N/A');
                                        return (
                                            <div className="mt-2 mb-3">
                                                <DocumentViewer
                                                    fileUrl={docUrl}
                                                    fileType={fileTypeFromContent}
                                                    originalFileName={fileName}
                                                    themedInputBorder={themedInputBorder}
                                                    mutedText={mutedText}
                                                />
                                            </div>
                                        );
                                    } else if (docUrl) {
                                        console.log('[Modal Preview] Document Block (Fallback). ID:', item.id, 'docUrl present, but not viewable type or viewer failed. isViewableType:', isViewableType);
                                        return (
                                            <div className="my-2">
                                                <p className={`text-sm ${mutedText} mb-2`}>
                                                    {isViewableType ? "Preview loading or an issue occurred processing this file." : "Slide-by-slide preview is not available for this file type."}
                                                </p>
                                            </div>
                                        );
                                    } else {
                                        console.log('[Modal Preview] Document Block (No URL/File). ID:', item.id);
                                        return (
                                            <div className={`my-2 p-3 ${editorCardBgMantine} rounded text-sm ${mutedText} border ${themedInputBorder}`}>
                                                Document file not yet selected or URL is missing.
                                            </div>
                                        );
                                    }
                                })()}
                                
                                {(item.documentContent.documentUrl || item.documentContent.documentObjectUrl) && (
                                    <div>
                                        <a 
                                            href={item.documentContent.documentObjectUrl || item.documentContent.documentUrl!} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            download={item.documentContent.originalFileName || 'document'}
                                            className={`${primaryButtonClasses} inline-flex items-center text-xs px-2.5 py-1.5 rounded`}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1.5"/>
                                            Download {item.documentContent.originalFileName || 'Document'}
                                        </a>
                                    </div>
                                )}
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
                                            {(q.type === 'multiple_choice' || q.type === 'checkbox') && q.options?.map(opt => (
                                                <div key={opt.id} className={`ml-4 text-sm flex items-center gap-2 text-[${midBrownLightHex}] dark:text-[${midBrownDarkHex}] my-1`}>
                                                    <div className={`w-4 h-4 border rounded-${q.type === 'multiple_choice' ? 'full' : 'sm'} border-gray-400 dark:border-gray-500 shrink-0`}></div>
                                                    <span>{opt.text}</span>
                                                    {(opt.isCorrect ?? false) && <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-2">(Correct)</span>}
                                                </div>
                                            ))}
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
    const documentFileAcceptTypes = ".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <MantineProvider theme={{ colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }}>
                <Card className={`w-full max-w-3xl ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl flex flex-col max-h-[90vh] rounded-lg overflow-hidden`}>
                    <CardHeader className={`flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b ${themedInputBorder} sticky top-0 z-10 ${lightCardBg} ${darkCardBg}`}>
                        <div id="modal-title"> <CardTitle className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] font-serif text-xl`}>{isEditingLocally ? "Edit Content" : "Add New Content"}</CardTitle> </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)} className={`${outlineButtonClasses} text-xs h-8 px-2.5`} aria-label={isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}> {isPreviewMode ? <><Edit3 className="h-3.5 w-3.5 mr-1.5"/>Edit</> : <><Eye className="h-3.5 w-3.5 mr-1.5"/>Preview</>} </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className={`${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8 rounded-full`} aria-label="Close modal"><X className="h-4 w-4"/></Button>
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
                                            <CardHeader className={`flex flex-row items-center justify-between p-2 sm:p-3 border-b ${themedInputBorder} ${editorToolbarBgMantine} cursor-pointer`} onClick={() => setExpandedContentIndex(expandedContentIndex === index ? null : index)} >
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
                                                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${midBrown}`} aria-label={expandedContentIndex === index ? "Collapse block" : "Expand block"}> {expandedContentIndex === index ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>} </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveRichContent(item.id); }} className={`h-7 w-7 text-red-500 hover:text-red-600`} aria-label="Remove block" disabled={isSaving}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </CardHeader>
                                            {expandedContentIndex === index && (
                                                <CardContent className="p-2 sm:p-3 space-y-3">
                                                    {item.type === 'text' && ( <IntegratedRichTextEditor value={item.content || '<p></p>'} onChange={html => {handleUpdateRichContentItem(item.id, { content: html }); setSuccessMessage(null); setErrorModal(null);}} placeholder="Start writing text..." weekIdForImageUploads={weekIdForFileUploads} mutedTextClass={mutedText} /> )}

                                                    {item.type === 'video' && item.videoContent && (
                                                        <div className="space-y-3">
                                                            <TextInput label={<><span className={`