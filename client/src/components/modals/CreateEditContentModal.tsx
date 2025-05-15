import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Label as ShadcnLabel } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import {
    X, Save, Loader2, AlertCircle, Plus, Trash2, Video as VideoIcon, FileText as FileTextIcon, HelpCircle,
    ChevronDown, ChevronUp, Eye, Edit3, Image as ImageIcon, Table as TableIconLucide
} from 'lucide-react';
import { MantineProvider, TextInput, Textarea, Checkbox as MantineCheckbox, Radio, Tooltip as MantineTooltip, Group, FileInput } from '@mantine/core';
import { RichTextEditor as MantineRTE, Link as TiptapLinkExtension } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { type MantineTheme } from '@mantine/core'; // Keep MantineTheme for style functions
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import ImageTiptapExtension from '@tiptap/extension-image';
import TableTiptapExtension from '@tiptap/extension-table';
import TableRowTiptapExtension from '@tiptap/extension-table-row';
import TableCellTiptapExtension from '@tiptap/extension-table-cell';
import TableHeaderTiptapExtension from '@tiptap/extension-table-header';
import ReactPlayer from 'react-player';

// MODIFIED: Import createMaterial for file uploads
import {
    createMaterial,
    type ContentItem as ApiContentItem,
    type RichContentItemBlock as ApiRichContentItemBlock,
    type QuizBlockContent as ApiQuizBlockContent,
    type VideoBlockContent as ApiVideoBlockContent,
    type QuizQuestion as ApiQuizQuestion,
    type QuizQuestionOption as ApiQuizQuestionOption,
    type Material as ApiMaterial, // Type for the response from createMaterial
} from '../../services/api'; // Adjust path as necessary

// --- Style Constants (no changes from your original) ---
const deepBrownLightHex = '#2A0F0F';
const deepBrownDarkHex = '#FFF8F0';
const goldAccent = 'text-[#C5A467]';
const goldAccentHex = '#C5A467';
const editorDarkBgHex = '#1f2937';
const toolbarDarkBgHex = '#111827';
const editorLightBgHex = '#ffffff';
const toolbarLightBgHex = '#f9fafb';
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
const selectTriggerClasses = `h-9 rounded-md px-3 py-2 text-sm w-full ${themedInputBg} ${themedInputBorder} text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] flex items-center justify-between`;
const selectContentClasses = `border ${themedInputBorder} ${themedInputBg} text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] z-[110] shadow-lg`;
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
        placeholder: { color: isDarkMode ? theme.colors.dark[3] : theme.colors.gray[6] }
    };
};

// --- Modal-specific types (no changes from your original) ---
interface ModalQuizQuestionOption extends ApiQuizQuestionOption {}
interface ModalQuizQuestion extends ApiQuizQuestion { options?: ModalQuizQuestionOption[]; }
interface ModalVideoContentData extends Omit<ApiVideoBlockContent, 'videoFile' | 'thumbnail'> {
    videoFile?: File | undefined;
    thumbnail?: File | undefined;
    videoObjectUrl?: string;
    thumbnailObjectUrl?: string;
}
interface ModalQuizContentData extends Omit<ApiQuizBlockContent, 'settings' | 'questions'> {
    questions: ModalQuizQuestion[];
    settings: Omit<ApiQuizBlockContent['settings'], 'requireLogin' | 'showPoints'> & {
        requireLogin?: boolean; showPoints?: boolean;
    };
}
interface ModalRichContentItem extends Omit<ApiRichContentItemBlock, 'videoContent' | 'quizContent'> {
    videoContent?: ModalVideoContentData;
    quizContent?: ModalQuizContentData;
}
interface CreateEditContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: ApiContentItem | null;
    sectionId: string; // Used for context if createMaterial needs weekId or similar
    onSave: (contentData: ApiContentItem) => Promise<void>;
}

// REMOVED: The local uploadFileToServer function that caused the 405 error.

// --- IntegratedRichTextEditor (no changes from your original) ---
interface IntegratedRichTextEditorProps { value: string; onChange: (html: string) => void; placeholder?: string; }
const IntegratedRichTextEditor: React.FC<IntegratedRichTextEditorProps> = React.memo(({ value, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }), Underline,
            TiptapLinkExtension.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
            Superscript, SubScript, Highlight, TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: placeholder || 'Start writing your text content here...' }),
            ImageTiptapExtension.configure({ inline: false }), TableTiptapExtension.configure({ resizable: true }),
            TableRowTiptapExtension, TableHeaderTiptapExtension, TableCellTiptapExtension,
        ],
        content: value,
        onUpdate: ({ editor: currentEditor }) => { onChange(currentEditor.getHTML()); },
    });
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            const handle = setTimeout(() => { if (editor && !editor.isDestroyed) editor.commands.setContent(value, false); }, 0);
            return () => clearTimeout(handle);
        }
    }, [value, editor]);
    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (url && editor && !editor.isDestroyed) editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);
    const addTable = useCallback(() => {
        if (editor && !editor.isDestroyed) {
            const rows = parseInt(prompt("Enter number of rows:", "3") || "3", 10);
            const cols = parseInt(prompt("Enter number of columns:", "3") || "3", 10);
            if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        }
    }, [editor]);
    if (!editor) return <div className={`p-3 min-h-[150px] border rounded-lg flex items-center justify-center ${mutedText}`}>Editor loading...</div>;
    return (
        <MantineRTE editor={editor} styles={(theme: MantineTheme) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return {
                root: { borderColor: isDarkMode ? '#4b5563' : '#d1d5db', borderRadius: '0.375rem' },
                content: { backgroundColor: isDarkMode ? editorDarkBgHex : editorLightBgHex, color: isDarkMode ? deepBrownDarkHex : deepBrownLightHex, minHeight: '150px', padding: '0.75rem', '&:focus': { outline: 'none' }, '& .ProseMirror': { outline: 'none' }, '& p.is-editor-empty:first-of-type::before': { color: isDarkMode ? theme.colors.dark[3] : theme.colors.gray[5], content: 'attr(data-placeholder)', float: 'left', height: 0, pointerEvents: 'none', }, },
                toolbar: { backgroundColor: isDarkMode ? toolbarDarkBgHex : toolbarLightBgHex, borderColor: isDarkMode ? '#4b5563' : '#d1d5db', borderRadius: '0.375rem 0.375rem 0 0', padding: '0.375rem', },
                control: { backgroundColor: isDarkMode ? toolbarDarkBgHex : toolbarLightBgHex, borderColor: isDarkMode ? '#4b5563' : '#d1d5db', color: isDarkMode ? theme.colors.dark[0] : theme.colors.gray[7], '&[data-active="true"]': { backgroundColor: isDarkMode ? goldAccentHex : goldAccentHex, color: deepBrownLightHex, }, '&:hover': { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', } },
            };
        }}>
            <MantineRTE.Toolbar sticky stickyOffset={60}>
                <MantineRTE.ControlsGroup> <MantineRTE.Bold /> <MantineRTE.Italic /> <MantineRTE.Underline /> <MantineRTE.Strikethrough /> <MantineRTE.ClearFormatting /> <MantineRTE.Highlight /> <MantineRTE.Code /> </MantineRTE.ControlsGroup>
                <MantineRTE.ControlsGroup> <MantineRTE.H1 /> <MantineRTE.H2 /> <MantineRTE.H3 /> <MantineRTE.H4 /> </MantineRTE.ControlsGroup>
                <MantineRTE.ControlsGroup> <MantineRTE.Blockquote /> <MantineRTE.Hr /> <MantineRTE.BulletList /> <MantineRTE.OrderedList /> <MantineRTE.Subscript /> <MantineRTE.Superscript /> </MantineRTE.ControlsGroup>
                <MantineRTE.ControlsGroup> <MantineRTE.Link /> <MantineRTE.Unlink /> </MantineRTE.ControlsGroup>
                <MantineRTE.ControlsGroup> <MantineRTE.Control onClick={addImage} aria-label="Insert image" title="Insert image"> <ImageIcon size={16} /> </MantineRTE.Control> <MantineRTE.Control onClick={addTable} aria-label="Insert table" title="Insert table"> <TableIconLucide size={16} /> </MantineRTE.Control> </MantineRTE.ControlsGroup>
                <MantineRTE.ControlsGroup> <MantineRTE.AlignLeft /> <MantineRTE.AlignCenter /> <MantineRTE.AlignJustify /> <MantineRTE.AlignRight /> </MantineRTE.ControlsGroup>
                <MantineRTE.ControlsGroup> <MantineRTE.Undo /> <MantineRTE.Redo /> </MantineRTE.ControlsGroup>
            </MantineRTE.Toolbar>
            <MantineRTE.Content className={`prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-serif prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:my-2 prose-a:text-[${goldAccentHex}] hover:prose-a:underline dark:prose-headings:text-gray-200 dark:prose-p:text-gray-300 dark:prose-strong:text-gray-100 dark:prose-li:text-gray-300 dark:prose-blockquote:text-gray-400`} />
        </MantineRTE>
    );
});
IntegratedRichTextEditor.displayName = 'IntegratedRichTextEditor';

// --- OptionInput (no changes from your original) ---
interface OptionInputProps { optionId: string; initialText: string; placeholder: string; onTextChange: (text: string) => void; questionType: 'multiple_choice' | 'checkbox'; isCorrect: boolean; onCorrectChange: (isCorrect: boolean) => void; onRemove: () => void; canRemove: boolean; }
const OptionInput: React.FC<OptionInputProps> = React.memo(({ optionId, initialText, placeholder, onTextChange, questionType, isCorrect, onCorrectChange, onRemove, canRemove }) => {
    const [localText, setLocalText] = useState(initialText);
    useEffect(() => { if (initialText !== localText) setLocalText(initialText); }, [initialText]);
    const handleBlur = () => { if (localText !== initialText) onTextChange(localText); };
    return (
        <div key={optionId} className="flex items-center gap-2">
            {questionType === 'multiple_choice' ? (<MantineTooltip label="Mark as correct" position="top" withArrow><Radio checked={isCorrect} onChange={(event) => onCorrectChange(event.currentTarget.checked)} name={`correct-opt-${optionId.split('_')[0]}`} aria-label={`Mark option as correct`} size="xs" /></MantineTooltip>) : (<MantineTooltip label="Mark as correct" position="top" withArrow><MantineCheckbox checked={isCorrect} onChange={(event) => onCorrectChange(event.currentTarget.checked)} aria-label={`Mark option as correct`} size="xs" /></MantineTooltip>)}
            <div className="flex-grow"><ShadcnLabel htmlFor={`option-input-${optionId}`} className="sr-only">{placeholder}</ShadcnLabel><TextInput id={`option-input-${optionId}`} value={localText} onChange={(event) => setLocalText(event.currentTarget.value)} onBlur={handleBlur} placeholder={placeholder} size="xs" className="w-full" styles={mantineInputStyles} /></div>
            {canRemove && (<Button variant="ghost" size="icon" onClick={onRemove} className={`text-red-500 hover:text-red-600 h-7 w-7 p-0 shrink-0`} aria-label={`Remove option`}><X className="h-3.5 w-3.5"/></Button>)}
        </div>
    );
});
OptionInput.displayName = 'OptionInput';

// --- CreateEditContentModal Component ---
const CreateEditContentModal: React.FC<CreateEditContentModalProps> = ({
    isOpen, onClose, content: apiContentProp, onSave, sectionId,
}) => {
    const [title, setTitle] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [richContent, setRichContent] = useState<ModalRichContentItem[]>([]);
    const [expandedContentIndex, setExpandedContentIndex] = useState<number | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const richContentRef = useRef(richContent);

    const isEditing = !!apiContentProp;
    const generateId = useCallback(() => `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, []);

    useEffect(() => { richContentRef.current = richContent; }, [richContent]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setIsPreviewMode(false);
            let currentRichContentState: ModalRichContentItem[] = [];

            if (isEditing && apiContentProp && apiContentProp.richContent) {
                setTitle(apiContentProp.title);
                setIsRequired(apiContentProp.isRequired || false);
                currentRichContentState = apiContentProp.richContent.map((apiRcBlock) => {
                    const blockId = apiRcBlock.id || generateId();
                    let modalVideoContent: ModalVideoContentData | undefined = undefined;
                    if (apiRcBlock.videoContent) {
                        modalVideoContent = {
                            ...apiRcBlock.videoContent, id: apiRcBlock.videoContent.id || blockId,
                            videoFile: undefined, // Reset file on open, user must re-select if editing
                            thumbnail: undefined, // Reset file on open
                            videoObjectUrl: undefined, 
                            thumbnailObjectUrl: undefined,
                            isRequired: typeof apiRcBlock.videoContent.isRequired === 'boolean' ? apiRcBlock.videoContent.isRequired : false,
                        };
                    }
                    let modalQuizContent: ModalQuizContentData | undefined = undefined;
                    if (apiRcBlock.quizContent) {
                        modalQuizContent = {
                            ...apiRcBlock.quizContent,
                            questions: apiRcBlock.quizContent.questions.map(q => ({ ...q, options: q.options ? q.options.map(opt => ({ ...opt })) : undefined })),
                            settings: { ...apiRcBlock.quizContent.settings }
                        };
                    }
                    return { ...apiRcBlock, id: blockId, videoContent: modalVideoContent, quizContent: modalQuizContent, content: apiRcBlock.content || '<p></p>', };
                });
            } else {
                setTitle('');
                setIsRequired(false);
                 // For new content, ensure richContent is empty
                currentRichContentState = [];
            }
            setRichContent(currentRichContentState);
            setExpandedContentIndex(currentRichContentState.length > 0 ? 0 : null);
        } else {
            // Cleanup Object URLs and file states on close
            richContentRef.current.forEach(item => {
                if (item.videoContent) {
                    if (item.videoContent.videoObjectUrl) URL.revokeObjectURL(item.videoContent.videoObjectUrl);
                    if (item.videoContent.thumbnailObjectUrl) URL.revokeObjectURL(item.videoContent.thumbnailObjectUrl);
                }
            });
            setRichContent(prev => prev.map(item => item.videoContent ? { ...item, videoContent: { ...item.videoContent, videoFile: undefined, thumbnail: undefined, videoObjectUrl: undefined, thumbnailObjectUrl: undefined } } : item));
            setExpandedContentIndex(null);
        }
    }, [isOpen, apiContentProp, isEditing, generateId]);

    useEffect(() => {
        // General cleanup for object URLs when component unmounts
        return () => {
            richContentRef.current.forEach(item => {
                if (item.videoContent?.videoObjectUrl) URL.revokeObjectURL(item.videoContent.videoObjectUrl);
                if (item.videoContent?.thumbnailObjectUrl) URL.revokeObjectURL(item.videoContent.thumbnailObjectUrl);
            });
        };
    }, []);

    const handleAddRichContent = (contentType: ModalRichContentItem['type']) => {
        const newBlockId = generateId();
        let newBlock: ModalRichContentItem = { id: newBlockId, type: contentType, order: richContent.length };
        if (contentType === 'text') newBlock.content = '<p></p>';
        else if (contentType === 'video') newBlock.videoContent = { id: newBlockId, title: '', description: '', videoFile: undefined, videoUrl: '', videoObjectUrl: undefined, thumbnail: undefined, thumbnailUrl: '', thumbnailObjectUrl: undefined, isRequired: false, drmEnabled: false, accessControl: { allowDownload: true, allowSharing: true }, duration: 0 };
        else if (contentType === 'quiz') newBlock.quizContent = { id: newBlockId, databaseQuizId: newBlockId, title: '', description: '', questions: [], settings: { shuffleQuestions: false, timeLimit: undefined, passingScore: undefined, showResults: true, allowRetake: true, maxAttempts: undefined, showCorrectAnswers: true, showPoints: false, requireLogin: false, collectEmail: false, allowProgressSaving: true } };
        setRichContent(prev => { const updated = [...prev, newBlock]; setExpandedContentIndex(updated.length - 1); return updated; });
    };

    const handleRemoveRichContent = (idToRemove: string) => {
        const indexToRemove = richContent.findIndex(item => item.id === idToRemove);
        const itemToRemove = richContent[indexToRemove];
        if (itemToRemove?.videoContent?.videoObjectUrl) URL.revokeObjectURL(itemToRemove.videoContent.videoObjectUrl);
        if (itemToRemove?.videoContent?.thumbnailObjectUrl) URL.revokeObjectURL(itemToRemove.videoContent.thumbnailObjectUrl);
        setRichContent(prev => {
            const newRichContent = prev.filter(item => item.id !== idToRemove);
            if (expandedContentIndex === indexToRemove) {
                 // If the removed item was expanded, expand the previous one or the first, or none if empty
                setExpandedContentIndex(newRichContent.length > 0 ? Math.max(0, indexToRemove -1) : null);
            } else if (expandedContentIndex !== null && expandedContentIndex > indexToRemove) {
                setExpandedContentIndex(prevIdx => prevIdx !== null ? prevIdx - 1 : null);
            }
            return newRichContent;
        });
    };

    const handleUpdateRichContentItem = useCallback((itemId: string, updatedData: Partial<Omit<ModalRichContentItem, 'id' | 'type'>>) => {
        setRichContent(prev => prev.map(item => {
            if (item.id === itemId) {
                const newUpdate = { ...updatedData };
                if (newUpdate.videoContent && item.videoContent) newUpdate.videoContent = { ...item.videoContent, ...newUpdate.videoContent };
                if (newUpdate.quizContent && item.quizContent) newUpdate.quizContent = { ...item.quizContent, ...newUpdate.quizContent };
                return { ...item, ...newUpdate };
            }
            return item;
        }));
    }, []);

    const handleSaveClick = async () => {
        setError(null);
        if (!title.trim()) { setError("Overall content title is required."); return; }
        if (richContent.length === 0) { setError("Content must have at least one block (Text, Video, or Quiz)."); return; }

        for (const item of richContent) {
            const isEmptyText = !item.content || item.content.trim() === '<p></p>' || item.content.trim() === '<p><br></p>' || item.content.trim() === '';
            if (item.type === 'text' && isEmptyText) { setError("Text content blocks cannot be empty. Please add text or remove the empty block."); return; }
            if (item.type === 'video' && item.videoContent) {
                if (!item.videoContent.title.trim()) { setError("Video blocks must have a title."); return; }
                if (!item.videoContent.videoFile && !item.videoContent.videoUrl?.trim()) { setError(`Video block "${item.videoContent.title || 'Untitled'}" must have a video file or URL.`); return; }
            }
            if (item.type === 'quiz' && item.quizContent) {
                if (!item.quizContent.title.trim()) { setError("Quiz blocks must have a title."); return; }
                if (!item.quizContent.questions || item.quizContent.questions.length === 0) { setError(`Quiz "${item.quizContent.title || 'Untitled'}" must have at least one question.`); return; }
                if (item.quizContent.questions.some(q => !q.question.trim())) { setError(`All questions in quiz "${item.quizContent.title || 'Untitled'}" must have text.`); return; }
                for (const q of item.quizContent.questions) {
                    if ((q.type === 'multiple_choice' || q.type === 'checkbox') && (!q.options || q.options.length === 0)) { setError(`Question "${q.question.substring(0, 20)}..." in quiz "${item.quizContent.title || 'Untitled'}" requires at least one option.`); return; }
                    if ((q.type === 'multiple_choice' || q.type === 'checkbox') && q.options?.some(opt => !opt.text.trim())) { setError(`All options for question "${q.question.substring(0, 20)}..." in quiz "${item.quizContent.title || 'Untitled'}" must have text.`); return; }
                    if (q.type === 'multiple_choice' && !(q.options?.some(opt => opt.isCorrect))) { setError(`Multiple choice question "${q.question.substring(0, 20)}..." in quiz "${item.quizContent.title || 'Untitled'}" must have one correct answer selected.`); return; }
                }
            }
        }
        setIsSaving(true);
        try {
            const finalRichContentForApi: ApiRichContentItemBlock[] = await Promise.all(
                richContent.map(async (modalRcBlock, index): Promise<ApiRichContentItemBlock> => {
                    let apiVideoContent: ApiVideoBlockContent | undefined = undefined;
                    if (modalRcBlock.type === 'video' && modalRcBlock.videoContent) {
                        const { videoFile, thumbnail, videoObjectUrl, thumbnailObjectUrl, ...restVideo } = modalRcBlock.videoContent;
                        let finalVideoUrl = restVideo.videoUrl;
                        let finalThumbnailUrl = restVideo.thumbnailUrl;

                        if (videoFile instanceof File) {
                            const formData = new FormData();
                            formData.append('file', videoFile);
                            // IMPORTANT: Add any other required fields for your /materials endpoint
                            // Example: formData.append('title', restVideo.title || `Video for Content: ${title}`);
                            // Example: formData.append('type', 'video_asset'); // Or whatever type your backend expects
                            // Example: formData.append('weekId', sectionId); // `sectionId` prop is available for context

                            const uploadedMaterial: ApiMaterial = await createMaterial(formData);
                            if (!uploadedMaterial.contentUrl) {
                                throw new Error(`Video upload for "${restVideo.title || 'video'}" succeeded but the server did not return a content URL.`);
                            }
                            finalVideoUrl = uploadedMaterial.contentUrl;
                        }
                        if (thumbnail instanceof File) {
                            try {
                                const formData = new FormData();
                                formData.append('file', thumbnail);
                                // IMPORTANT: Add any other required fields for your /materials endpoint
                                // Example: formData.append('title', `${restVideo.title || 'Thumbnail'} for Content: ${title}`);
                                // Example: formData.append('type', 'image_asset');
                                // Example: formData.append('weekId', sectionId);

                                const uploadedThumbnail: ApiMaterial = await createMaterial(formData);
                                if (!uploadedThumbnail.contentUrl) {
                                    console.error("Thumbnail upload succeeded but server did not return a content URL. Using original or no thumbnail.");
                                    // Keep original thumbnailUrl if upload fails or if it was an external URL initially
                                    finalThumbnailUrl = restVideo.thumbnailUrl || ''; 
                                } else {
                                    finalThumbnailUrl = uploadedThumbnail.contentUrl;
                                }
                            } catch (e: any) {
                                console.error("Thumbnail upload error for video:", restVideo.title, e.message || e);
                                finalThumbnailUrl = restVideo.thumbnailUrl || ''; // Revert to original on error
                            }
                        }
                        apiVideoContent = { ...restVideo, videoUrl: finalVideoUrl, thumbnailUrl: finalThumbnailUrl };
                    }

                    let apiQuizContent: ApiQuizBlockContent | undefined = undefined;
                    if (modalRcBlock.type === 'quiz' && modalRcBlock.quizContent) {
                        const dbQuizId = modalRcBlock.quizContent.databaseQuizId || modalRcBlock.quizContent.id;
                        apiQuizContent = { ...modalRcBlock.quizContent, databaseQuizId: dbQuizId, questions: modalRcBlock.quizContent.questions.map(q => ({ ...q, options: q.options ? q.options.map(opt => ({ ...opt })) : undefined, })), settings: { ...modalRcBlock.quizContent.settings } };
                    }
                    return { 
                        id: modalRcBlock.id, // This ID is client-generated; backend might re-assign or use its own
                        type: modalRcBlock.type, 
                        order: modalRcBlock.order ?? index, // Ensure order is set
                        content: modalRcBlock.content, 
                        videoContent: apiVideoContent, 
                        quizContent: apiQuizContent, 
                    };
                })
            );

            let determinedType: ApiContentItem['type'];
            const hasQuiz = finalRichContentForApi.some(item => item.type === 'quiz');
            const hasVideo = finalRichContentForApi.some(item => item.type === 'video');
            if (hasQuiz) determinedType = 'quiz_link';
            else if (hasVideo) determinedType = 'video';
            else determinedType = 'text';

            const payload: ApiContentItem = {
                ...(isEditing && apiContentProp?.id && { id: apiContentProp.id }),
                title, isRequired, richContent: finalRichContentForApi,
                type: determinedType, order: apiContentProp?.order ?? 0,
            };
            await onSave(payload);
            // onClose(); // Typically called by the parent component after onSave promise resolves

        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "An unexpected error occurred during save.";
            if (!error) setError(message); // Avoid overwriting specific validation errors shown earlier
            console.error("Save Error Details:", err.response?.data || err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- QuizQuestionEditor (no changes needed here for this specific fix) ---
    const QuizQuestionEditor: React.FC<{ question: ModalQuizQuestion; onUpdate: (updatedQuestion: ModalQuizQuestion) => void; onRemove: () => void; }> = React.memo(({ question, onUpdate, onRemove }) => {
        const [localQuestionText, setLocalQuestionText] = useState(question.question);
        const [localDescription, setLocalDescription] = useState(question.description || '');
        const cardRef = useRef<HTMLDivElement>(null);
        const prevOptionsLength = useRef<number | undefined>(question.options?.length);
        useEffect(() => { if (question.question !== localQuestionText) setLocalQuestionText(question.question); const desc = question.description || ''; if (desc !== localDescription) setLocalDescription(desc); }, [question.question, question.description]);
        useEffect(() => { const currentLength = question.options?.length ?? 0; const previousLength = prevOptionsLength.current ?? 0; if (currentLength > previousLength && cardRef.current) { setTimeout(() => { cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 0); } prevOptionsLength.current = currentLength; }, [question.options?.length]);
        const handleQuestionBlur = () => { if (localQuestionText.trim() !== question.question) onUpdate({ ...question, question: localQuestionText.trim() }); };
        const handleDescriptionBlur = () => { const currentDesc = question.description || ''; if (localDescription.trim() !== currentDesc) { const updatedDesc = localDescription.trim() ? localDescription.trim() : undefined; onUpdate({ ...question, description: updatedDesc }); } };
        const handleOptionTextChange = (optIndex: number, newText: string) => { const newOptions = [...(question.options || [])]; if (newOptions[optIndex]) { newOptions[optIndex] = { ...newOptions[optIndex], text: newText }; onUpdate({ ...question, options: newOptions }); } };
        const handleOptionCorrectChange = (optIndex: number, isCorrect: boolean) => { const newOptions = [...(question.options || [])]; if (!newOptions[optIndex]) return; const updatedOption = { ...newOptions[optIndex], isCorrect }; if (isCorrect && question.type === 'multiple_choice') { newOptions.forEach((opt, i) => { if (i !== optIndex) opt.isCorrect = false; }); } newOptions[optIndex] = updatedOption; onUpdate({ ...question, options: newOptions }); };
        const addOption = () => { const newOption: ModalQuizQuestionOption = { id: generateId(), text: '', isCorrect: false }; onUpdate({ ...question, options: [...(question.options || []), newOption] }); };
        const removeOption = (optIndex: number) => { onUpdate({ ...question, options: question.options?.filter((_, i) => i !== optIndex) }); };
        const questionTypes = [ { value: 'multiple_choice' as const, label: 'Multiple Choice (Single Answer)' }, { value: 'checkbox' as const, label: 'Checkboxes (Multiple Answers)' }, /* { value: 'short_answer' as const, label: 'Short Answer' }, { value: 'paragraph' as const, label: 'Paragraph Answer' },*/ ];
        return (
            <Card ref={cardRef} className={`p-3 space-y-3 ${editorCardBgMantine} border ${themedInputBorder}`}>
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow space-y-1"><TextInput label={<span className={`${midBrown} text-xs font-medium`}>Question Text <span className="text-red-500">*</span></span>} id={`question-${question.id}`} value={localQuestionText} onChange={(event) => setLocalQuestionText(event.currentTarget.value)} onBlur={handleQuestionBlur} placeholder="Enter question text" required size="sm" className="font-medium w-full" styles={mantineInputStyles} /></div>
                    <Button variant="ghost" size="icon" onClick={onRemove} className={`text-red-500 hover:text-red-600 h-8 w-8 p-0 shrink-0 mt-5`} aria-label="Remove question"><Trash2 className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-1"><Textarea label={<span className={`${midBrown} text-xs font-medium`}>Description (Optional)</span>} id={`description-${question.id}`} value={localDescription} onChange={(event) => setLocalDescription(event.currentTarget.value)} onBlur={handleDescriptionBlur} placeholder="Optional: Add more details or instructions" autosize minRows={2} size="sm" className="text-xs" styles={mantineInputStyles} /></div>
                <Select value={question.type} onValueChange={(type: ApiQuizQuestion['type']) => { const needsOptions = type === 'multiple_choice' || type === 'checkbox'; const currentOptions = question.options; let resetOptions: ModalQuizQuestionOption[] | undefined; if (!needsOptions) resetOptions = undefined; else if (needsOptions && currentOptions && (question.type === 'multiple_choice' || question.type === 'checkbox')) { if (type === 'multiple_choice') { let foundFirstCorrect = false; resetOptions = currentOptions.map(opt => { if (opt.isCorrect && !foundFirstCorrect) { foundFirstCorrect = true; return opt; } return {...opt, isCorrect: false}; }); } else resetOptions = currentOptions; } else resetOptions = [{ id: generateId(), text: '', isCorrect: false }]; onUpdate({...question, type, options: resetOptions }); }}>
                    <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select Question Type" /></SelectTrigger>
                    <SelectContent className={selectContentClasses}>{questionTypes.map(qt => <SelectItem key={qt.value} value={qt.value} className="text-sm">{qt.label}</SelectItem>)}</SelectContent>
                </Select>
                {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                    <div className="space-y-2 pl-1">
                        <ShadcnLabel className={`${midBrown} text-xs font-medium`}>Options {question.type === 'multiple_choice' ? '(select one correct)' : '(select one or more correct)'}: <span className="text-red-500">*</span></ShadcnLabel>
                        {question.options?.map((opt, optIndex) => (<OptionInput key={opt.id} optionId={opt.id} initialText={opt.text} placeholder={`Option ${optIndex + 1}`} onTextChange={(newText) => handleOptionTextChange(optIndex, newText)} questionType={question.type as 'multiple_choice' | 'checkbox'} isCorrect={opt.isCorrect ?? false} onCorrectChange={(isCorrect) => handleOptionCorrectChange(optIndex, isCorrect)} onRemove={() => removeOption(optIndex)} canRemove={(question.options?.length ?? 0) > 1} />))}
                        <Button variant="outline" size="sm" onClick={addOption} className={`${outlineButtonClasses} text-xs mt-1 h-8`}><Plus className="h-3.5 w-3.5 mr-1"/>Add Option</Button>
                    </div>
                )}
                <Group mt="xs"><MantineCheckbox id={`q-req-${question.id}`} checked={question.required} onChange={(event) => onUpdate({...question, required: event.currentTarget.checked})} label={<span className={`${midBrown} text-xs font-normal cursor-pointer`}>Required Question</span>} size="xs" /></Group>
            </Card>
        );
    });
    QuizQuestionEditor.displayName = 'QuizQuestionEditor';

    // --- renderPreview (no changes needed here for this specific fix) ---
    const renderPreview = () => {
        return (
            <div className={`p-3 sm:p-4 space-y-5 prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-[${deepBrownLightHex}] dark:prose-headings:text-[${deepBrownDarkHex}] prose-p:text-[${midBrownLightHex}] dark:prose-p:text-[${midBrownDarkHex}] prose-a:text-[${goldAccentHex}] hover:prose-a:underline prose-table:w-full prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-1.5 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:p-1.5 prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-blockquote:border-l-4 prose-blockquote:border-gray-400 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-3 prose-pre:rounded-md prose-pre:text-xs prose-pre:overflow-x-auto`}>
                <h1 className="text-2xl font-bold font-serif mb-3">{title || "Untitled Content"}</h1> {isRequired && <span className="block text-xs text-red-600 dark:text-red-400 font-semibold mb-3">(Required)</span>}
                {richContent.length === 0 && <p className={mutedText}>No content blocks to preview.</p>}
                {richContent.map((item, index) => (
                    <div key={`preview-${item.id}`} className={`mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 border-gray-200 dark:border-gray-700 ${index > 0 ? 'mt-6 pt-6' : ''}`}>
                        {item.type === 'text' && item.content && (<div dangerouslySetInnerHTML={{ __html: item.content || '<p class="text-gray-500 italic">Empty text block</p>' }} />)}
                        {item.type === 'video' && item.videoContent && (
                            <div className="not-prose">
                                <h3 className={`text-lg font-semibold mb-1.5 text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}]`}>{item.videoContent.title || "Untitled Video"}</h3>
                                {item.videoContent.description && <p className={`text-sm mb-2 ${midBrown}`}>{item.videoContent.description}</p>}
                                {item.videoContent.isRequired && <span className="text-xs text-red-500 mb-2 block">(Required Video)</span>}
                                {(() => { const videoSrc = item.videoContent.videoObjectUrl || item.videoContent.videoUrl; const posterSrc = item.videoContent.thumbnailObjectUrl || item.videoContent.thumbnailUrl; if (videoSrc) { return (<div className="aspect-video w-full max-w-xl bg-black rounded-md overflow-hidden mx-auto my-2 player-wrapper"><ReactPlayer className="react-player" url={videoSrc} controls={true} width='100%' height='100%' light={posterSrc || false} playing={false} config={{ file: { attributes: { controlsList: 'nodownload', disablePictureInPicture: true, }, forceVideo: true } }} onError={(e: any) => console.error('ReactPlayer Error', e)} /></div>); } else { return ( <div className={`p-4 ${editorCardBgMantine} rounded text-center text-sm ${mutedText} border ${themedInputBorder}`}> Video source not available for preview. If you selected a file, it will be uploaded on save. </div> ); } })()}
                            </div>
                        )}
                        {item.type === 'quiz' && item.quizContent && (
                            <div className="not-prose">
                                <h3 className={`text-lg font-semibold mb-1.5 text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}]`}>{item.quizContent.title || "Untitled Quiz"}</h3>
                                {item.quizContent.description && <p className={`text-sm mb-2 ${midBrown}`}>{item.quizContent.description}</p>}
                                {(item.quizContent.settings?.timeLimit != null) && <p className={`text-xs mb-2 ${mutedText}`}>Time Limit: {item.quizContent.settings.timeLimit} min</p>}
                                {(!item.quizContent.questions || item.quizContent.questions.length === 0) && <p className={`${mutedText} text-sm`}>No questions in this quiz preview.</p>}
                                <div className="space-y-3 mt-2">
                                    {item.quizContent.questions?.map((q, qIdx) => (
                                        <div key={q.id} className={`p-3 border rounded ${editorCardBgMantine} ${themedInputBorder}`}>
                                            <p className={`font-medium text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] mb-1`}>{qIdx + 1}. {q.question} {q.required && <span className="text-red-500 text-xs">*</span>}</p>
                                            {q.description && <p className={`text-xs ${mutedText} mb-1.5`}>{q.description}</p>}
                                            {(q.type === 'multiple_choice' || q.type === 'checkbox') && q.options?.map(opt => (<div key={opt.id} className={`ml-4 text-sm flex items-center gap-2 text-[${midBrownLightHex}] dark:text-[${midBrownDarkHex}] my-1`}><div className={`w-4 h-4 border rounded-${q.type === 'multiple_choice' ? 'full' : 'sm'} border-gray-400 dark:border-gray-500 shrink-0`}></div><span>{opt.text}</span>{(opt.isCorrect ?? false) && <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-2">(Correct)</span>}</div>))}
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            {/* CORRECTED MantineProvider: Removed potentially problematic props for local provider if they cause TS errors. */}
            {/* These are typically set at the root of your application. */}
            <MantineProvider 
                // theme={{}} // You can add specific theme overrides here if needed for this modal only
            >
                <Card className={`w-full max-w-3xl ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl flex flex-col max-h-[90vh] rounded-lg overflow-hidden`}>
                    <CardHeader className={`flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b ${themedInputBorder} sticky top-0 z-10 ${lightCardBg} ${darkCardBg}`}>
                        <div id="modal-title"> <CardTitle className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] font-serif text-xl`}>{isEditing ? "Edit Content" : "Add New Content"}</CardTitle> </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)} className={`${outlineButtonClasses} text-xs h-8 px-2.5`} aria-label={isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}> {isPreviewMode ? <><Edit3 className="h-3.5 w-3.5 mr-1.5"/>Edit</> : <><Eye className="h-3.5 w-3.5 mr-1.5"/>Preview</>} </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className={`${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8 rounded-full`} aria-label="Close modal"><X className="h-4 w-4"/></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                        {error && ( <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2"> <AlertCircle className="h-4 w-4 shrink-0"/> <span>{error}</span> </div> )}
                        {isPreviewMode ? ( renderPreview() ) : (
                            <>
                                <TextInput
                                    label={<span className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium`}>Overall Content Title <span className="text-red-500">*</span></span>}
                                    id="content-title" value={title} onChange={(event) => setTitle(event.currentTarget.value)}
                                    placeholder="E.g., Week 1: Introduction" disabled={isSaving} required size="sm" styles={mantineInputStyles}
                                />
                                <div className="space-y-3 pt-3">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <ShadcnLabel className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium mb-1 sm:mb-0`}>Content Blocks</ShadcnLabel>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2"> {[ { type: 'text', Icon: FileTextIcon, label: 'Text' }, { type: 'video', Icon: VideoIcon, label: 'Video' }, { type: 'quiz', Icon: HelpCircle, label: 'Quiz' } ].map(btn => ( <Button key={btn.type} variant="outline" size="sm" onClick={() => handleAddRichContent(btn.type as ApiRichContentItemBlock['type'])} className={`${outlineButtonClasses} text-xs h-8 px-2.5`} disabled={isSaving}> <btn.Icon className="h-3.5 w-3.5 mr-1.5"/> Add {btn.label} </Button> ))} </div>
                                    </div>
                                    {richContent.length === 0 && ( <div className={`text-center p-6 border-2 border-dashed ${themedInputBorder} rounded-md ${mutedText} text-sm`}> No content blocks added yet. Click a button above. </div> )}
                                    {richContent.map((item, index) => (
                                        <Card key={item.id} className={`overflow-hidden border ${themedInputBorder} ${editorCardBgMantine} ${darkCardBg}`}>
                                            <CardHeader className={`flex flex-row items-center justify-between p-2 sm:p-3 border-b ${themedInputBorder} ${editorToolbarBgMantine} cursor-pointer`} onClick={() => setExpandedContentIndex(expandedContentIndex === index ? null : index)} >
                                                <div className="flex items-center gap-2 min-w-0"> {item.type === 'text' && <FileTextIcon className={`h-4 w-4 ${goldAccent} shrink-0`} />} {item.type === 'video' && <VideoIcon className={`h-4 w-4 ${goldAccent} shrink-0`} />} {item.type === 'quiz' && <HelpCircle className={`h-4 w-4 ${goldAccent} shrink-0`} />} <ShadcnLabel className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium truncate cursor-pointer`}> {item.type === 'text' && 'Text Block'} {item.type === 'video' && (item.videoContent?.title || 'Video Block')} {item.type === 'quiz' && (item.quizContent?.title || 'Quiz Block')} </ShadcnLabel> </div>
                                                <div className="flex items-center shrink-0"> <Button variant="ghost" size="icon" className={`h-7 w-7 ${midBrown}`} aria-label={expandedContentIndex === index ? "Collapse block" : "Expand block"}> {expandedContentIndex === index ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>} </Button> <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveRichContent(item.id); }} className={`h-7 w-7 text-red-500 hover:text-red-600`} aria-label="Remove block" disabled={isSaving}><Trash2 className="h-4 w-4"/></Button> </div>
                                            </CardHeader>
                                            {expandedContentIndex === index && (
                                                <CardContent className="p-2 sm:p-3 space-y-3">
                                                    {item.type === 'text' && ( <IntegratedRichTextEditor value={item.content || '<p></p>'} onChange={html => handleUpdateRichContentItem(item.id, { content: html })} placeholder="Start writing your text content here..." /> )}
                                                    {item.type === 'video' && item.videoContent && (
                                                        <div className="space-y-3">
                                                            <TextInput label={<>Video Title <span className="text-red-500">*</span></>} placeholder="Enter video title" size="sm" value={item.videoContent.title} onChange={e => handleUpdateRichContentItem(item.id, {videoContent: {...item.videoContent!, title: e.target.value}})} styles={mantineInputStyles}/>
                                                            <Textarea label="Video Description (Optional)" placeholder="Add a description..." size="sm" minRows={2} autosize value={item.videoContent.description || ''} onChange={e => handleUpdateRichContentItem(item.id, {videoContent: {...item.videoContent!, description: e.target.value}})} styles={mantineInputStyles}/>
                                                            <FileInput label="Video File" placeholder="Select video file" accept="video/*" value={item.videoContent.videoFile || null}
                                                                onChange={(file: File | null) => {
                                                                    const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.videoObjectUrl;
                                                                    let newUrl: string | undefined = undefined; if (file) newUrl = URL.createObjectURL(file);
                                                                    handleUpdateRichContentItem(item.id, { videoContent: { ...item.videoContent!, videoFile: file || undefined, videoUrl: '', videoObjectUrl: newUrl } });
                                                                    if (oldUrl && oldUrl !== newUrl) URL.revokeObjectURL(oldUrl);
                                                                }} clearable size="sm" styles={mantineInputStyles} />
                                                            {item.videoContent.videoFile && <p className="text-xs mt-1 text-green-600 dark:text-green-400">Selected: {item.videoContent.videoFile.name}</p>}
                                                            <TextInput label="Or Video URL" placeholder="https://..." value={item.videoContent.videoUrl || ''}
                                                                onChange={(event) => {
                                                                    const url = event.currentTarget.value; const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.videoObjectUrl;
                                                                    handleUpdateRichContentItem(item.id, { videoContent: { ...item.videoContent!, videoUrl: url, videoFile: undefined, videoObjectUrl: undefined } });
                                                                    if (oldUrl) URL.revokeObjectURL(oldUrl);
                                                                }} size="sm" styles={mantineInputStyles} />
                                                            <FileInput label="Video Thumbnail (Optional)" placeholder="Select image file" accept="image/*" value={item.videoContent.thumbnail || null}
                                                                onChange={(file: File | null) => {
                                                                     const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.thumbnailObjectUrl;
                                                                     let newUrl: string | undefined = undefined; if (file) newUrl = URL.createObjectURL(file);
                                                                     handleUpdateRichContentItem(item.id, { videoContent: { ...item.videoContent!, thumbnail: file || undefined, thumbnailUrl: '', thumbnailObjectUrl: newUrl } });
                                                                     if (oldUrl && oldUrl !== newUrl) URL.revokeObjectURL(oldUrl);
                                                                }} clearable size="sm" styles={mantineInputStyles} />
                                                            {item.videoContent.thumbnail && <p className="text-xs mt-1 text-green-600 dark:text-green-400">Selected: {item.videoContent.thumbnail.name}</p>}
                                                            <TextInput label="Or Thumbnail URL (Optional)" placeholder="https://..." value={item.videoContent.thumbnailUrl || ''}
                                                                onChange={(event) => {
                                                                    const url = event.currentTarget.value; const current = richContent.find(rc => rc.id === item.id); const oldUrl = current?.videoContent?.thumbnailObjectUrl;
                                                                    handleUpdateRichContentItem(item.id, { videoContent: { ...item.videoContent!, thumbnailUrl: url, thumbnail: undefined, thumbnailObjectUrl: undefined } });
                                                                    if (oldUrl) URL.revokeObjectURL(oldUrl);
                                                                }} size="sm" styles={mantineInputStyles} />
                                                            <MantineCheckbox label={<span className={`${midBrown} text-xs font-normal cursor-pointer`}>Mark this specific video as required</span>} checked={item.videoContent.isRequired === true} onChange={(event) => handleUpdateRichContentItem(item.id, { videoContent: { ...item.videoContent!, isRequired: event.currentTarget.checked }})} size="xs" className="mt-3 pt-1" disabled={isSaving} />
                                                        </div>
                                                    )}
                                                    {item.type === 'quiz' && item.quizContent && (
                                                         <div className="space-y-3">
                                                            <TextInput label={<>Quiz Title <span className="text-red-500">*</span></>} placeholder="Enter quiz title" size="sm" value={item.quizContent.title} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, title: e.target.value}})} styles={mantineInputStyles} />
                                                            <Textarea label="Quiz Description (Optional)" placeholder="Instructions..." size="sm" minRows={2} autosize value={item.quizContent.description || ''} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, description: e.target.value}})} styles={mantineInputStyles} />
                                                            <details className="group">
                                                                <summary className={`list-none flex items-center justify-between cursor-pointer p-2 border rounded-md ${themedInputBorder} ${editorToolbarBgMantine}`}> <span className={`${midBrown} text-sm font-medium`}>Quiz Settings</span> <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform"/> </summary>
                                                                <div className={`mt-2 p-3 border rounded-md border-t-0 rounded-t-none ${themedInputBorder} space-y-3 bg-white dark:bg-gray-800/30`}>
                                                                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                                        <div className="flex items-center gap-1"><ShadcnLabel htmlFor={`timeLimit-${item.id}`} className={`${midBrown} text-xs`}>Time Limit (min):</ShadcnLabel><TextInput id={`timeLimit-${item.id}`} type="number" min="1" value={item.quizContent.settings?.timeLimit ?? ''} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, settings: {...item.quizContent!.settings, timeLimit: e.currentTarget.value ? Math.max(1, parseInt(e.currentTarget.value)) : undefined }}})} placeholder="None" size="xs" className="w-20" styles={mantineInputStyles}/></div>
                                                                        <div className="flex items-center gap-1"><ShadcnLabel htmlFor={`passScore-${item.id}`} className={`${midBrown} text-xs`}>Pass Score (%):</ShadcnLabel><TextInput id={`passScore-${item.id}`} type="number" min="0" max="100" value={item.quizContent.settings?.passingScore ?? ''} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, settings: {...item.quizContent!.settings, passingScore: e.currentTarget.value ? Math.max(0, Math.min(100, parseInt(e.currentTarget.value))) : undefined }}})} placeholder="None" size="xs" className="w-20" styles={mantineInputStyles}/></div>
                                                                        <Group>
                                                                            <MantineCheckbox id={`shuffle-${item.id}`} checked={item.quizContent.settings?.shuffleQuestions ?? false} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, settings: {...item.quizContent!.settings, shuffleQuestions: e.currentTarget.checked }}})} label={<span className={midBrown}>Shuffle Qs</span>} size="xs"/>
                                                                            <MantineCheckbox id={`retake-${item.id}`} checked={item.quizContent.settings?.allowRetake ?? false} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, settings: {...item.quizContent!.settings, allowRetake: e.currentTarget.checked }}})} label={<span className={midBrown}>Allow Retakes</span>} size="xs"/>
                                                                            <MantineCheckbox id={`showPoints-${item.id}`} checked={item.quizContent.settings?.showPoints ?? false} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, settings: {...item.quizContent!.settings, showPoints: e.currentTarget.checked }}})} label={<span className={midBrown}>Show Points</span>} size="xs"/>
                                                                            <MantineCheckbox id={`requireLogin-${item.id}`} checked={item.quizContent.settings?.requireLogin ?? false} onChange={e => handleUpdateRichContentItem(item.id, {quizContent: {...item.quizContent!, settings: {...item.quizContent!.settings, requireLogin: e.currentTarget.checked }}})} label={<span className={midBrown}>Require Login</span>} size="xs"/>
                                                                        </Group>
                                                                     </div>
                                                                </div>
                                                            </details>
                                                            <ShadcnLabel className={`text-[${deepBrownLightHex}] dark:text-[${deepBrownDarkHex}] text-sm font-medium block pt-2`}>Questions: <span className="text-red-500">*</span></ShadcnLabel>
                                                            {(item.quizContent.questions || []).map((q) => ( <QuizQuestionEditor key={q.id} question={q} onUpdate={updatedQ => { if (!item.quizContent?.questions) return; const newQs = item.quizContent.questions.map(oldQ => oldQ.id === q.id ? updatedQ : oldQ); handleUpdateRichContentItem(item.id, { quizContent: { ...item.quizContent!, questions: newQs } }); }} onRemove={() => { if (!item.quizContent?.questions) return; handleUpdateRichContentItem(item.id, { quizContent: { ...item.quizContent!, questions: item.quizContent.questions.filter(oldQ => oldQ.id !== q.id) } }); }} /> ))}
                                                            <Button variant="outline" size="sm" onClick={() => { const newQ: ModalQuizQuestion = {id: generateId(), type: 'multiple_choice', question: '', required: false, options: [{id: generateId(), text:'', isCorrect:false}]}; handleUpdateRichContentItem(item.id, { quizContent: { ...item.quizContent!, questions: [...(item.quizContent!.questions || []), newQ] } }); }} className={`${outlineButtonClasses} text-xs h-8`}><Plus className="h-3.5 w-3.5 mr-1.5"/>Add Question</Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                                <Group mt="lg"> <MantineCheckbox id="content-required" checked={isRequired} onChange={(event) => setIsRequired(event.currentTarget.checked)} disabled={isSaving} label={<span className={`${midBrown} text-sm font-normal cursor-pointer`}>Mark this entire content item as required</span>} size="sm" /> </Group>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className={`flex justify-end gap-2 pt-3 pb-3 px-4 border-t ${themedInputBorder} sticky bottom-0 z-10 ${lightCardBg} ${darkCardBg}`}>
                        <Button variant="outline" onClick={onClose} disabled={isSaving} className={`${outlineButtonClasses} h-9`}>Cancel</Button>
                        {!isPreviewMode && ( <Button onClick={handleSaveClick} disabled={isSaving || !title.trim() || richContent.length === 0} className={`${primaryButtonClasses} h-9`}> {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>{isEditing ? "Save Changes" : "Create Content"}</>} </Button> )}
                    </CardFooter>
                </Card>
            </MantineProvider>
        </div>
    );
};

export default CreateEditContentModal;