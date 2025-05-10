import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { Textarea } from "../ui/textarea.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { Checkbox } from "../ui/checkbox.js";
import { X, Save, Loader2, AlertCircle, Plus, Trash2, Video as VideoIcon, FileText as FileTextIcon, HelpCircle, ChevronDown, ChevronUp, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link as LinkIconLucide, Strikethrough, Outdent, Indent, Image as ImageIcon, Table as TableIcon, Code as CodeIcon, AlignJustify, Eye, Edit3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";
// --- Styling Constants ---
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-950';
const editorCardBg = 'dark:bg-gray-900';
const editorToolbarBg = 'bg-gray-100 dark:bg-gray-800';
const mutedText = 'text-gray-600 dark:text-gray-400';
const focusRing = 'focus:ring-2 focus:ring-offset-1 focus:ring-[#C5A467]/80 focus:outline-none';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const themedInputBorder = `border-gray-300 dark:border-gray-700 hover:border-[#C5A467]/70 dark:hover:border-[#C5A467]`;
const themedInputBg = `bg-white dark:bg-gray-800`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${themedInputBg} ${themedInputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400`;
const selectTriggerClasses = `h-9 rounded-md px-3 py-2 text-sm w-full ${themedInputBg} ${themedInputBorder} ${deepBrown} ${focusRing} flex items-center justify-between`;
const selectContentClasses = `border ${themedInputBorder} ${themedInputBg} ${deepBrown} z-[110] shadow-lg`;
// --- End of Interfaces ---
const CreateEditContentModal = ({ isOpen, onClose, content, 
// sectionId, // sectionId is not directly used in this component's logic besides being passed to onSave in some versions.
onSave, }) => {
    const [title, setTitle] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [richContent, setRichContent] = useState([]);
    const [expandedContentIndex, setExpandedContentIndex] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const isEditing = !!content;
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setIsPreviewMode(false);
            if (isEditing && content) {
                setTitle(content.title);
                setIsRequired(content.isRequired || false);
                // If content.richContent exists and is an array, use it. Otherwise, initialize empty.
                // Ensure all richContent items have an ID.
                const initialRichContent = Array.isArray(content.richContent)
                    ? content.richContent.map(rc => ({
                        ...rc,
                        id: rc.id || `rc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
                    }))
                    : [];
                setRichContent(initialRichContent);
            }
            else {
                setTitle('');
                setIsRequired(false);
                setRichContent([]);
            }
        }
    }, [isOpen, content, isEditing]);
    useEffect(() => {
        if (isOpen && !isPreviewMode && richContent.length > 0 && expandedContentIndex === null) {
            const firstEmptyTextIndex = richContent.findIndex(item => item.type === 'text' && (!item.content || item.content === '<p><br></p>'));
            setExpandedContentIndex(firstEmptyTextIndex !== -1 ? firstEmptyTextIndex : 0);
        }
        else if (richContent.length === 0) {
            setExpandedContentIndex(null);
        }
    }, [isOpen, isPreviewMode, richContent, expandedContentIndex]);
    const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const handleAddRichContent = (contentType) => {
        const newBlockId = generateId();
        const newBlock = {
            id: newBlockId,
            type: contentType,
            ...(contentType === 'text' && { content: '<p><br></p>' }),
            ...(contentType === 'video' && {
                videoContent: {
                    id: newBlockId,
                    title: '',
                    description: '',
                    videoFile: new File([''], 'placeholder.mp4', { type: 'video/mp4' }), // Create a placeholder file
                    videoUrl: '',
                    thumbnail: undefined,
                    thumbnailUrl: '',
                    isRequired: true,
                    drmEnabled: false,
                    accessControl: { allowDownload: true, allowSharing: true }
                }
            }),
            ...(contentType === 'quiz' && {
                quizContent: {
                    id: newBlockId, // Use same ID
                    title: '',
                    description: '',
                    questions: [],
                    settings: {
                        shuffleQuestions: false, timeLimit: undefined, passingScore: undefined,
                        showResults: true, allowRetake: true, maxAttempts: undefined,
                        showCorrectAnswers: true, showPoints: true, requireLogin: false,
                        collectEmail: false, allowProgressSaving: true
                    }
                }
            })
        };
        setRichContent(prev => [...prev, newBlock]);
        setExpandedContentIndex(richContent.length); // Expand the newly added block
    };
    const handleRemoveRichContent = (idToRemove) => {
        const indexToRemove = richContent.findIndex(item => item.id === idToRemove);
        setRichContent(prev => prev.filter(item => item.id !== idToRemove));
        if (expandedContentIndex === indexToRemove) {
            setExpandedContentIndex(richContent.length > 1 ? 0 : null);
        }
        else if (expandedContentIndex !== null && expandedContentIndex > indexToRemove) {
            setExpandedContentIndex(prev => prev !== null ? prev - 1 : null);
        }
    };
    const handleUpdateRichContentItem = useCallback((id, updatedData) => {
        setRichContent(prev => prev.map(item => (item.id === id ? { ...item, ...updatedData } : item)));
    }, []);
    const handleSaveClick = async () => {
        setError(null);
        if (!title.trim())
            return setError("Overall content title is required.");
        for (const item of richContent) {
            if (item.type === 'text' && (!item.content || item.content.trim() === '<p><br></p>' || item.content.trim() === '')) {
                return setError("Text content blocks cannot be empty. Please add text or remove the empty block.");
            }
            if (item.type === 'video' && !item.videoContent?.title.trim()) {
                return setError("Video blocks must have a title.");
            }
            if (item.type === 'quiz') {
                if (!item.quizContent?.title.trim())
                    return setError("Quiz blocks must have a title.");
                if (item.quizContent?.questions.length === 0)
                    return setError("Quizzes must have at least one question.");
                if (item.quizContent?.questions.some(q => !q.question.trim()))
                    return setError("All quiz questions must have question text.");
            }
        }
        setIsSaving(true);
        let determinedType;
        if (richContent.length === 0) {
            determinedType = 'text'; // Default if no blocks. Or set error: "Content blocks cannot be empty."
        }
        else if (richContent.some(item => item.type === 'quiz')) {
            determinedType = 'quiz_link'; // Map modal's 'quiz' block type to 'quiz_link' ContentItem type
        }
        else if (richContent.some(item => item.type === 'video')) {
            determinedType = 'video';
        }
        else {
            determinedType = 'text'; // Default if only text blocks or other types
        }
        const payload = {
            id: isEditing ? content?.id : undefined,
            title,
            isRequired,
            richContent: richContent, // Pass the full rich content structure
            type: determinedType,
            order: isEditing ? content?.order || 0 : 0, // Add the required order property
            // Example: if 'quiz_link' needs a URL, you might generate/set it here
            // url: determinedType === 'quiz_link' ? (content?.url || '#quiz-placeholder') : undefined,
            // textContent: (determinedType === 'text' && richContent.length > 0) ? richContent.find(rc => rc.type === 'text')?.content : undefined,
        };
        try {
            await onSave(payload);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred while saving.");
        }
        finally {
            setIsSaving(false);
        }
    };
    // --- RichTextEditor Sub-component ---
    const RichTextEditor = React.memo(({ value, onChange }) => {
        const editorRef = useRef(null);
        const lastHtmlRef = useRef(value);
        useEffect(() => {
            if (editorRef.current && value !== editorRef.current.innerHTML) {
                editorRef.current.innerHTML = value;
                lastHtmlRef.current = value;
            }
        }, []);
        useEffect(() => {
            if (editorRef.current && value !== lastHtmlRef.current && value !== editorRef.current.innerHTML) {
                editorRef.current.innerHTML = value;
                lastHtmlRef.current = value;
                const range = document.createRange();
                const sel = window.getSelection();
                if (sel && editorRef.current.lastChild) {
                    range.setStartAfter(editorRef.current.lastChild);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }, [value]);
        const executeCommand = (command, valueArg) => {
            if (!editorRef.current)
                return;
            editorRef.current.focus();
            document.execCommand(command, false, valueArg);
            const newHtml = editorRef.current.innerHTML;
            if (newHtml !== lastHtmlRef.current) {
                lastHtmlRef.current = newHtml;
                onChange(newHtml);
            }
        };
        const handleInput = () => {
            if (editorRef.current) {
                const newHtml = editorRef.current.innerHTML;
                if (newHtml !== lastHtmlRef.current) {
                    lastHtmlRef.current = newHtml;
                    onChange(newHtml);
                }
            }
        };
        const formatBlock = (tag) => executeCommand('formatBlock', tag);
        const insertLink = () => { const url = prompt("Enter URL:", "https://"); if (url)
            executeCommand('createLink', url); };
        const insertImage = () => { const url = prompt("Enter Image URL:", "https://"); if (url)
            executeCommand('insertImage', url); };
        const insertTable = () => {
            const rows = parseInt(prompt("Rows:", "2") || "2", 10);
            const cols = parseInt(prompt("Columns:", "2") || "2", 10);
            if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1)
                return alert("Invalid dimensions.");
            let table = '<table style="border-collapse: collapse; width: 100%;">';
            for (let r = 0; r < rows; r++) {
                table += '<tr>';
                for (let c = 0; c < cols; c++)
                    table += `<td style="border: 1px solid #ccc; padding: 4px;"><p><br></p></td>`;
                table += '</tr>';
            }
            table += '</table><p><br></p>';
            executeCommand('insertHTML', table);
        };
        const toolbarItems = [
            { type: 'select', label: 'Style', options: [{ value: 'p', label: 'Normal' }, { value: 'h2', label: 'Heading 1' }, { value: 'h3', label: 'Heading 2' }, { value: 'h4', label: 'Heading 3' }, { value: 'blockquote', label: 'Quote' }], action: (tag) => formatBlock(tag) },
            { type: 'divider' },
            { type: 'toggle', cmd: 'bold', Icon: Bold, label: 'Bold' },
            { type: 'toggle', cmd: 'italic', Icon: Italic, label: 'Italic' },
            { type: 'toggle', cmd: 'underline', Icon: Underline, label: 'Underline' },
            { type: 'toggle', cmd: 'strikeThrough', Icon: Strikethrough, label: 'Strikethrough' },
            { type: 'divider' },
            { type: 'toggle', cmd: 'insertUnorderedList', Icon: List, label: 'Bullet List' },
            { type: 'toggle', cmd: 'insertOrderedList', Icon: ListOrdered, label: 'Numbered List' },
            { type: 'toggle', cmd: 'outdent', Icon: Outdent, label: 'Outdent' },
            { type: 'toggle', cmd: 'indent', Icon: Indent, label: 'Indent' },
            { type: 'divider' },
            { type: 'toggle', cmd: 'justifyLeft', Icon: AlignLeft, label: 'Align Left' },
            { type: 'toggle', cmd: 'justifyCenter', Icon: AlignCenter, label: 'Align Center' },
            { type: 'toggle', cmd: 'justifyRight', Icon: AlignRight, label: 'Align Right' },
            { type: 'toggle', cmd: 'justifyFull', Icon: AlignJustify, label: 'Justify' },
            { type: 'divider' },
            { type: 'button', action: insertLink, Icon: LinkIconLucide, label: 'Insert Link' },
            { type: 'button', action: insertImage, Icon: ImageIcon, label: 'Insert Image' },
            { type: 'button', action: insertTable, Icon: TableIcon, label: 'Insert Table' },
            { type: 'button', action: () => executeCommand('insertHTML', '<pre><code>Your Code Here</code></pre>'), Icon: CodeIcon, label: 'Code Block' },
        ];
        return (_jsxs("div", { className: `border rounded-lg ${themedInputBorder} ${editorCardBg} ${darkCardBg}`, children: [_jsx("div", { className: `border-b p-1.5 flex flex-wrap gap-1 items-center ${themedInputBorder} ${editorToolbarBg}`, children: _jsx(TooltipProvider, { delayDuration: 200, children: toolbarItems.map((item, idx) => {
                            if (item.type === 'divider')
                                return _jsx("div", { className: "w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1.5" }, `div-${idx}`);
                            if (item.type === 'select')
                                return (_jsxs(Select, { onValueChange: item.action, defaultValue: item.options?.[0].value, children: [_jsx(SelectTrigger, { className: `${selectTriggerClasses} h-7 text-xs px-2 py-1 w-auto min-w-[100px]`, children: _jsx(SelectValue, { placeholder: item.label }) }), _jsx(SelectContent, { className: selectContentClasses, children: item.options?.map(opt => _jsx(SelectItem, { value: opt.value, className: "text-xs", children: opt.label }, opt.value)) })] }, `sel-${idx}`));
                            const IconCmp = item.Icon;
                            return (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "outline" // Using Button for simplicity, Toggle might need state management
                                            , size: "sm", onClick: () => {
                                                if (item.type === 'toggle' && item.cmd) {
                                                    executeCommand(item.cmd);
                                                }
                                                else if (item.type === 'button' && item.action) {
                                                    item.action();
                                                }
                                            }, className: `${outlineButtonClasses} w-7 h-7 p-0`, children: IconCmp && _jsx(IconCmp, { className: "h-3.5 w-3.5" }) }) }), _jsx(TooltipContent, { className: "text-xs", children: item.label })] }, item.cmd || `btn-${idx}`));
                        }) }) }), _jsx("div", { ref: editorRef, contentEditable: true, onInput: handleInput, className: `p-3 min-h-[150px] max-h-[40vh] overflow-y-auto ${deepBrown} focus:outline-none 
                                prose prose-sm sm:prose dark:prose-invert max-w-none 
                                prose-headings:font-serif prose-headings:mt-3 prose-headings:mb-1.5
                                prose-p:my-1.5
                                prose-a:${goldAccent} hover:prose-a:underline
                                prose-table:w-full prose-td:border prose-td:p-1 prose-th:border prose-th:p-1 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-2 prose-blockquote:italic
                                prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-pre:p-2 prose-pre:rounded prose-pre:text-xs prose-pre:overflow-x-auto
                                `, dangerouslySetInnerHTML: { __html: value } })] }));
    });
    RichTextEditor.displayName = 'RichTextEditor';
    // --- End of RichTextEditor ---
    // --- QuizQuestionEditor Sub-component ---
    const QuizQuestionEditor = React.memo(({ question, onUpdate, onRemove }) => {
        const handleOptionChange = (optIndex, field, value) => {
            const newOptions = [...(question.options || [])];
            if (!newOptions[optIndex])
                newOptions[optIndex] = { id: generateId(), text: '', isCorrect: false };
            // @ts-ignore - TypeScript might complain about assigning string | boolean to a specific field
            newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
            onUpdate({ ...question, options: newOptions });
        };
        const addOption = () => {
            const newOption = { id: generateId(), text: '', isCorrect: false };
            onUpdate({ ...question, options: [...(question.options || []), newOption] });
        };
        const removeOption = (optIndex) => {
            onUpdate({ ...question, options: question.options?.filter((_, i) => i !== optIndex) });
        };
        const questionTypes = [
            { value: 'multiple_choice', label: 'Multiple Choice' },
            { value: 'checkbox', label: 'Checkboxes' },
            { value: 'short_answer', label: 'Short Answer' },
            { value: 'paragraph', label: 'Paragraph' },
        ];
        return (_jsxs(Card, { className: `p-3 space-y-3 ${editorCardBg} border ${themedInputBorder}`, children: [_jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsxs("div", { className: "flex-grow space-y-1", children: [" ", _jsx(Label, { htmlFor: `question-${question.id}`, className: `${midBrown} text-xs font-medium`, children: "Question Text" }), _jsx(Input, { id: `question-${question.id}`, value: question.question, onChange: e => onUpdate({ ...question, question: e.target.value }), placeholder: "Enter question text", className: `${inputClasses} font-medium w-full` })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onRemove, className: `text-red-500 hover:text-red-600 h-8 w-8 p-0 shrink-0 mt-4`, children: _jsx(Trash2, { className: "h-4 w-4" }) }), " "] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: `description-${question.id}`, className: `${midBrown} text-xs font-medium`, children: "Description (Optional)" }), _jsx(Textarea, { id: `description-${question.id}`, value: question.description || '', onChange: e => onUpdate({ ...question, description: e.target.value }), placeholder: "Optional: Description or instructions", className: `${inputClasses} min-h-[40px] text-xs`, rows: 2 })] }), _jsxs(Select, { value: question.type, onValueChange: (type) => {
                        const needsOptions = type === 'multiple_choice' || type === 'checkbox';
                        onUpdate({ ...question, type, options: needsOptions ? (question.options?.length ? question.options : [{ id: generateId(), text: '', isCorrect: false }]) : undefined });
                    }, children: [_jsx(SelectTrigger, { className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Question Type" }) }), _jsx(SelectContent, { className: selectContentClasses, children: questionTypes.map(qt => _jsx(SelectItem, { value: qt.value, className: "text-sm", children: qt.label }, qt.value)) })] }), (question.type === 'multiple_choice' || question.type === 'checkbox') && (_jsxs("div", { className: "space-y-2 pl-1", children: [_jsxs(Label, { className: `${midBrown} text-xs font-medium`, children: ["Options (", question.type === 'multiple_choice' ? 'select one correct' : 'select one or more correct', "):"] }), question.options?.map((opt, optIndex) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex-grow space-y-0.5", children: [" ", _jsxs(Label, { htmlFor: `option-${opt.id}`, className: `${midBrown} text-xs font-medium sr-only`, children: ["Option ", optIndex + 1] }), " ", _jsx(Input, { id: `option-${opt.id}`, value: opt.text, onChange: e => handleOptionChange(optIndex, 'text', e.target.value), className: `${inputClasses} text-sm w-full`, placeholder: `Option ${optIndex + 1}` })] }), _jsx(TooltipProvider, { delayDuration: 100, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Checkbox, { checked: opt.isCorrect, onCheckedChange: checked => handleOptionChange(optIndex, 'isCorrect', !!checked), "aria-label": "Mark as correct", className: `border-${themedInputBorder} data-[state=checked]:${goldBg} data-[state=checked]:text-white` }) }), _jsx(TooltipContent, { className: "text-xs", children: "Correct answer" })] }) }), question.options && question.options.length > 1 && (_jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeOption(optIndex), className: `text-red-500 hover:text-red-600 h-7 w-7 p-0 shrink-0`, children: _jsx(X, { className: "h-3.5 w-3.5" }) }))] }, opt.id))), _jsxs(Button, { variant: "outline", size: "sm", onClick: addOption, className: `${outlineButtonClasses} text-xs mt-1 h-8`, children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Option"] })] })), _jsxs("div", { className: "flex items-center space-x-2 pt-1", children: [_jsx(Checkbox, { id: `q-req-${question.id}`, checked: question.required, onCheckedChange: checked => onUpdate({ ...question, required: !!checked }), className: `border-${themedInputBorder} data-[state=checked]:${goldBg} data-[state=checked]:text-white` }), _jsx(Label, { htmlFor: `q-req-${question.id}`, className: `${midBrown} text-xs font-normal cursor-pointer`, children: "Required" })] })] }));
    });
    QuizQuestionEditor.displayName = 'QuizQuestionEditor';
    // --- End of QuizQuestionEditor ---
    // --- Preview Rendering ---
    const renderPreview = () => (_jsxs("div", { className: `p-3 sm:p-4 space-y-5 prose prose-sm sm:prose dark:prose-invert max-w-none 
                        prose-headings:font-serif prose-headings:text-[${deepBrown}] dark:prose-headings:text-[${deepBrown}] 
                        prose-p:${midBrown} dark:prose-p:${midBrown}
                        prose-a:${goldAccent} hover:prose-a:underline
                        prose-table:w-full prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-1.5 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:p-1.5 prose-th:bg-gray-50 dark:prose-th:bg-gray-800
                        prose-blockquote:border-l-4 prose-blockquote:border-gray-400 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-3 prose-pre:rounded-md prose-pre:text-xs prose-pre:overflow-x-auto
                        `, children: [_jsx("h1", { className: "text-2xl font-bold font-serif mb-3", children: title }), isRequired && _jsx("span", { className: "block text-xs text-red-600 dark:text-red-400 font-semibold mb-3", children: "(This content is marked as required)" }), richContent.length === 0 && _jsx("p", { className: mutedText, children: "No content to preview." }), richContent.map((item) => (_jsxs("div", { className: "mt-4 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0 border-gray-200 dark:border-gray-700", children: [item.type === 'text' && item.content && (_jsx("div", { dangerouslySetInnerHTML: { __html: item.content } })), item.type === 'video' && item.videoContent && (_jsxs("div", { className: "not-prose", children: [_jsx("h3", { className: `text-lg font-semibold mb-1.5 ${deepBrown}`, children: item.videoContent.title }), item.videoContent.description && _jsx("p", { className: `text-sm mb-2 ${midBrown}`, children: item.videoContent.description }), (item.videoContent.videoFile || item.videoContent.videoUrl) ? (_jsx("video", { controls: true, src: item.videoContent.videoFile ? URL.createObjectURL(item.videoContent.videoFile) : item.videoContent.videoUrl, poster: item.videoContent.thumbnail ? URL.createObjectURL(item.videoContent.thumbnail) : item.videoContent.thumbnailUrl, className: "w-full max-w-lg rounded-md aspect-video bg-black", children: "Your browser does not support the video tag." })) : (_jsx("div", { className: `p-4 ${editorCardBg} rounded text-center text-sm ${mutedText}`, children: "Video preview not available (no file or URL)." }))] })), item.type === 'quiz' && item.quizContent && (_jsxs("div", { className: "not-prose", children: [_jsx("h3", { className: `text-lg font-semibold mb-1.5 ${deepBrown}`, children: item.quizContent.title }), item.quizContent.description && _jsx("p", { className: `text-sm mb-2 ${midBrown}`, children: item.quizContent.description }), item.quizContent.settings.timeLimit !== undefined && _jsxs("p", { className: `text-xs mb-2 ${mutedText}`, children: ["Time Limit: ", item.quizContent.settings.timeLimit, " minutes"] }), item.quizContent.questions.length === 0 && _jsx("p", { className: `${mutedText} text-sm`, children: "No questions in this quiz yet." }), _jsx("div", { className: "space-y-3 mt-2", children: item.quizContent.questions.map((q, qIdx) => (_jsxs("div", { className: `p-3 border rounded ${editorCardBg} ${themedInputBorder}`, children: [_jsxs("p", { className: `font-medium ${deepBrown} mb-1`, children: [qIdx + 1, ". ", q.question, " ", q.required && _jsx("span", { className: "text-red-500 text-xs", children: "*" })] }), q.description && _jsx("p", { className: `text-xs ${mutedText} mb-1.5`, children: q.description }), q.options && (q.type === 'multiple_choice' || q.type === 'checkbox') && q.options.map(opt => (_jsx("div", { className: `ml-4 text-sm flex items-center gap-2 ${midBrown}`, children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: q.type === 'multiple_choice' ? 'radio' : 'checkbox', name: `q-${q.id}`, disabled: true, className: "shrink-0", "aria-label": opt.text }), _jsx("span", { children: opt.text })] }) }, opt.id))), (q.type === 'short_answer') && _jsx(Input, { type: "text", placeholder: "Short answer", disabled: true, className: `${inputClasses} text-sm mt-1` }), (q.type === 'paragraph') && _jsx(Textarea, { placeholder: "Paragraph answer", disabled: true, className: `${inputClasses} text-sm mt-1 min-h-[60px]` })] }, q.id))) })] }))] }, `preview-${item.id}`)))] }));
    // --- End of Preview Rendering ---
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", children: _jsxs(Card, { className: `w-full max-w-3xl ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl flex flex-col max-h-[90vh]`, children: [_jsxs(CardHeader, { className: `flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b ${themedInputBorder} sticky top-0 z-10 ${lightCardBg} ${darkCardBg}`, children: [_jsx("div", { id: "modal-title", children: _jsx(CardTitle, { className: `${deepBrown} font-serif text-xl`, children: isEditing ? "Edit Content" : "Add New Content" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setIsPreviewMode(!isPreviewMode), className: `${outlineButtonClasses} text-xs h-8 px-2.5`, children: isPreviewMode ? _jsxs(_Fragment, { children: [_jsx(Edit3, { className: "h-3.5 w-3.5 mr-1.5" }), "Edit Mode"] }) : _jsxs(_Fragment, { children: [_jsx(Eye, { className: "h-3.5 w-3.5 mr-1.5" }), "Preview"] }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: `${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8`, "aria-label": "Close modal", children: _jsx(X, { className: "h-4 w-4" }) })] })] }), _jsxs(CardContent, { className: "flex-1 overflow-y-auto p-3 sm:p-4 space-y-4", children: [error && (_jsxs("div", { role: "alert", className: "p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), " ", _jsx("span", { children: error })] })), isPreviewMode ? (renderPreview()) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs(Label, { htmlFor: "content-title", className: `${deepBrown} text-sm font-medium`, children: ["Overall Content Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "content-title", value: title, onChange: e => setTitle(e.target.value), placeholder: "E.g., Introduction to Theology", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2", children: [_jsx(Label, { className: `${deepBrown} text-sm font-medium`, children: "Content Blocks" }), _jsx("div", { className: "flex flex-wrap gap-1.5 sm:gap-2", children: [{ type: 'text', Icon: FileTextIcon }, { type: 'video', Icon: VideoIcon }, { type: 'quiz', Icon: HelpCircle }].map(btn => (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAddRichContent(btn.type), className: `${outlineButtonClasses} text-xs h-8 px-2.5`, disabled: isSaving, children: [_jsx(btn.Icon, { className: "h-3.5 w-3.5 mr-1.5" }), " Add ", btn.type.charAt(0).toUpperCase() + btn.type.slice(1)] }, btn.type))) })] }), richContent.length === 0 && (_jsx("div", { className: `text-center p-6 border-2 border-dashed ${themedInputBorder} rounded-md ${mutedText} text-sm`, children: "No content blocks added yet. Click a button above to add content." })), richContent.map((item, index) => ( // Added index for expandedContentIndex comparison
                                        _jsxs(Card, { className: `overflow-hidden border ${themedInputBorder} ${editorCardBg} ${darkCardBg}`, children: [_jsxs(CardHeader, { className: `flex flex-row items-center justify-between p-2 sm:p-3 border-b ${themedInputBorder} ${editorToolbarBg}`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [item.type === 'text' && _jsx(FileTextIcon, { className: `h-4 w-4 ${goldAccent}` }), item.type === 'video' && _jsx(VideoIcon, { className: `h-4 w-4 ${goldAccent}` }), item.type === 'quiz' && _jsx(HelpCircle, { className: `h-4 w-4 ${goldAccent}` }), _jsxs(Label, { className: `${deepBrown} text-sm font-medium`, children: [item.type.charAt(0).toUpperCase() + item.type.slice(1), " Block"] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setExpandedContentIndex(expandedContentIndex === index ? null : index), className: `h-7 w-7 ${midBrown}`, "aria-label": "Toggle block", children: expandedContentIndex === index ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveRichContent(item.id), className: `h-7 w-7 text-red-500 hover:text-red-600`, "aria-label": "Remove block", disabled: isSaving, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), expandedContentIndex === index && (_jsxs(CardContent, { className: "p-2 sm:p-3 space-y-3", children: [item.type === 'text' && (_jsx(RichTextEditor, { value: item.content || '', onChange: html => handleUpdateRichContentItem(item.id, { content: html }) })), item.type === 'video' && (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { value: item.videoContent?.title || '', onChange: e => handleUpdateRichContentItem(item.id, { videoContent: { ...(item.videoContent), title: e.target.value } }), placeholder: "Video Title", className: inputClasses }), _jsx(Textarea, { value: item.videoContent?.description || '', onChange: e => handleUpdateRichContentItem(item.id, { videoContent: { ...(item.videoContent), description: e.target.value } }), placeholder: "Video Description (optional)", className: `${inputClasses} min-h-[50px]`, rows: 2 }), _jsxs("div", { children: [_jsx(Label, { className: `${deepBrown} text-xs`, children: "Video File (upload or URL)" }), _jsx(Input, { type: "file", accept: "video/*", onChange: e => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    handleUpdateRichContentItem(item.id, { videoContent: { ...(item.videoContent), videoFile: file, videoUrl: '' } });
                                                                                }
                                                                            }, className: `${inputClasses} mb-1` }), item.videoContent?.videoFile && _jsxs("p", { className: "text-xs mt-1 text-green-600", children: ["File: ", item.videoContent.videoFile.name] }), _jsx(Input, { value: item.videoContent?.videoUrl || '', onChange: e => {
                                                                                const url = e.target.value;
                                                                                if (url) {
                                                                                    handleUpdateRichContentItem(item.id, { videoContent: { ...(item.videoContent), videoUrl: url, videoFile: new File([''], 'placeholder.mp4', { type: 'video/mp4' }) } });
                                                                                }
                                                                            }, placeholder: "Or Video URL (e.g., YouTube, Vimeo)", className: inputClasses })] }), _jsxs("div", { children: [_jsx(Label, { className: `${deepBrown} text-xs`, children: "Thumbnail (optional - upload or URL)" }), _jsx(Input, { type: "file", accept: "image/*", onChange: e => handleUpdateRichContentItem(item.id, { videoContent: { ...(item.videoContent), thumbnail: e.target.files?.[0] || undefined, thumbnailUrl: '' } }), className: `${inputClasses} mb-1` }), item.videoContent?.thumbnail && _jsxs("p", { className: "text-xs mt-1 text-green-600", children: ["File: ", item.videoContent.thumbnail.name] }), _jsx(Input, { value: item.videoContent?.thumbnailUrl || '', onChange: e => handleUpdateRichContentItem(item.id, { videoContent: { ...(item.videoContent), thumbnailUrl: e.target.value, thumbnail: undefined } }), placeholder: "Or Thumbnail URL", className: inputClasses })] })] })), item.type === 'quiz' && (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { value: item.quizContent?.title || '', onChange: e => handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), title: e.target.value } }), placeholder: "Quiz Title", className: inputClasses }), _jsx(Textarea, { value: item.quizContent?.description || '', onChange: e => handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), description: e.target.value } }), placeholder: "Quiz Description (optional)", className: `${inputClasses} min-h-[50px]`, rows: 2 }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: `${deepBrown} text-sm font-medium`, children: "Quiz Settings:" }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Label, { htmlFor: `timeLimit-${item.id}`, className: `${midBrown} text-xs`, children: "Time Limit (min):" }), _jsx(Input, { id: `timeLimit-${item.id}`, type: "number", min: "0", value: item.quizContent?.settings?.timeLimit === undefined ? '' : item.quizContent.settings.timeLimit, onChange: e => handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), settings: { ...(item.quizContent.settings), timeLimit: e.target.value ? parseInt(e.target.value) : undefined } } }), placeholder: "None", className: `${inputClasses} w-20 text-xs h-7` })] }), _jsx(Button, { variant: "link", size: "sm", onClick: () => handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), settings: { ...(item.quizContent.settings), timeLimit: undefined } } }), className: `text-xs h-7 px-1.5 py-0.5 border-0 hover:no-underline ${goldAccent} ${outlineButtonClasses.split(" ").filter(cls => cls.startsWith("hover:") || cls.startsWith("dark:hover:")).join(" ")}`, children: " No Limit " }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Checkbox, { id: `shuffle-${item.id}`, checked: item.quizContent?.settings?.shuffleQuestions || false, onCheckedChange: c => handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), settings: { ...(item.quizContent.settings), shuffleQuestions: !!c } } }), className: `border-${themedInputBorder} data-[state=checked]:${goldBg} data-[state=checked]:text-white` }), _jsx(Label, { htmlFor: `shuffle-${item.id}`, className: `${midBrown} text-xs font-normal cursor-pointer`, children: "Shuffle Qs" })] })] })] }), _jsx(Label, { className: `${deepBrown} text-sm font-medium`, children: "Questions:" }), (item.quizContent?.questions || []).map((q) => (_jsx(QuizQuestionEditor, { question: q, onUpdate: updatedQ => {
                                                                        const newQuestions = (item.quizContent?.questions || []).map(oldQ => oldQ.id === q.id ? updatedQ : oldQ);
                                                                        handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), questions: newQuestions } });
                                                                    }, onRemove: () => handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), questions: (item.quizContent?.questions || []).filter(oldQ => oldQ.id !== q.id) } }) }, q.id))), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                        const newQ = { id: generateId(), type: 'multiple_choice', question: '', required: false, options: [{ id: generateId(), text: '', isCorrect: false }] };
                                                                        handleUpdateRichContentItem(item.id, { quizContent: { ...(item.quizContent), questions: [...(item.quizContent?.questions || []), newQ] } });
                                                                    }, className: `${outlineButtonClasses} text-xs h-8`, children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1.5" }), "Add Question"] })] }))] }))] }, item.id)))] }), _jsxs("div", { className: "flex items-center space-x-2 pt-3 border-t ${themedInputBorder} mt-4", children: [_jsx(Checkbox, { id: "content-required", checked: isRequired, onCheckedChange: c => setIsRequired(!!c), disabled: isSaving, className: `border-${themedInputBorder} data-[state=checked]:${goldBg} data-[state=checked]:text-white` }), _jsx(Label, { htmlFor: "content-required", className: `${midBrown} text-sm font-normal cursor-pointer`, children: "Mark this entire content item as required for completion" })] })] }))] }), _jsxs(CardFooter, { className: `flex justify-end gap-2 pt-3 pb-3 px-4 border-t ${themedInputBorder} sticky bottom-0 z-10 ${lightCardBg} ${darkCardBg}`, children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isSaving, className: `${outlineButtonClasses} h-9`, children: "Cancel" }), !isPreviewMode && (_jsxs(Button, { onClick: handleSaveClick, disabled: isSaving || richContent.length === 0 && !title.trim(), className: `${primaryButtonClasses} h-9`, children: [" ", isSaving ? _jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Saving..."] }) : _jsxs(_Fragment, { children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), isEditing ? "Save Changes" : "Create Content"] })] }))] })] }) }));
};
export default CreateEditContentModal;
