import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/modals/SectionPreviewModal.tsx
import { Component, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.js";
import { X } from 'lucide-react';
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
// --- Styling Constants ---
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]'; // Should be light on dark
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]'; // Should be light on dark
const goldAccent = 'text-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-950'; // Main modal dark background
const editorCardBg = 'dark:bg-gray-800'; // Slightly lighter for internal cards/blocks if needed
const themedInputBorder = `border-gray-300 dark:border-gray-600`; // Darker border for dark mode
const mutedText = 'text-gray-600 dark:text-gray-400';
const themedInputBg = `bg-white dark:bg-gray-700`; // Darker input background
const focusRing = 'focus:ring-2 focus:ring-offset-1 focus:ring-[#C5A467]/80 focus:outline-none';
const inputClasses = `h-9 rounded-md px-3 text-sm ${themedInputBg} ${themedInputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400`;
const defaultDarkTextColor = 'dark:text-gray-200'; // Fallback for text if prose-invert isn't enough
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("SectionPreviewModal ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded fixed inset-0 z-[200] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Preview Error" }), _jsx("p", { className: "text-sm", children: this.props.fallbackMessage || "Something went wrong while rendering the preview." }), this.state.error && (_jsxs("details", { className: "mt-2 text-left text-xs", children: [_jsx("summary", { children: "Error Details" }), _jsxs("pre", { className: "mt-1 p-2 bg-red-50 rounded whitespace-pre-wrap break-all", children: [this.state.error.toString(), this.state.errorInfo && `\nComponent Stack:\n${this.state.errorInfo.componentStack}`] })] }))] }) }));
        }
        return this.props.children;
    }
}
const SectionPreviewModalComponent = ({ isOpen, onClose, section, }) => {
    if (!isOpen)
        return null;
    // Log the entire section data when modal opens for debugging
    useEffect(() => {
        if (isOpen) {
            console.log("SectionPreviewModal received section:", JSON.stringify(section, (key, value) => {
                if (value instanceof File) {
                    return { name: value.name, type: value.type, size: value.size };
                }
                return value;
            }, 2));
        }
    }, [isOpen, section]);
    const renderRichContentBlock = (block, blockIndex) => {
        return (_jsxs("div", { className: `mt-3 pt-3 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`, children: [block.type === 'text' && block.content && (_jsx("div", { className: `prose prose-sm dark:prose-invert max-w-none ${defaultDarkTextColor}`, dangerouslySetInnerHTML: { __html: block.content } })), block.type === 'video' && block.videoContent && (_jsxs("div", { className: "not-prose", children: [_jsx("h4", { className: `text-md font-semibold mb-1 ${deepBrown}`, children: block.videoContent.title || 'Video' }), block.videoContent.description && _jsx("p", { className: `text-sm mb-1.5 ${midBrown}`, children: block.videoContent.description }), (() => {
                            let videoSourceUrl = undefined;
                            if (block.videoContent?.videoUrl) {
                                videoSourceUrl = block.videoContent.videoUrl.startsWith('http')
                                    ? block.videoContent.videoUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${block.videoContent.videoUrl.startsWith('/') ? '' : '/'}${block.videoContent.videoUrl}`;
                            }
                            else if (block.videoContent?.videoFile instanceof File) {
                                try {
                                    videoSourceUrl = URL.createObjectURL(block.videoContent.videoFile);
                                }
                                catch (e) {
                                    console.error("Error creating object URL for videoFile:", e);
                                }
                            }
                            let thumbnailSourceUrl = undefined;
                            if (block.videoContent?.thumbnailUrl) {
                                thumbnailSourceUrl = block.videoContent.thumbnailUrl.startsWith('http')
                                    ? block.videoContent.thumbnailUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${block.videoContent.thumbnailUrl.startsWith('/') ? '' : '/'}${block.videoContent.thumbnailUrl}`;
                            }
                            else if (block.videoContent?.thumbnail instanceof File) {
                                try {
                                    thumbnailSourceUrl = URL.createObjectURL(block.videoContent.thumbnail);
                                }
                                catch (e) {
                                    console.error("Error creating object URL for thumbnail:", e);
                                }
                            }
                            if (videoSourceUrl) {
                                return (_jsx("video", { controls: true, src: videoSourceUrl, poster: thumbnailSourceUrl, className: "w-full max-w-md rounded-md aspect-video bg-black my-2", children: "Your browser does not support the video tag." }));
                            }
                            else {
                                return (_jsx("div", { className: `p-3 ${editorCardBg} rounded text-center text-xs ${mutedText}`, children: "Video source not available (no URL or valid file)." }));
                            }
                        })(), block.videoContent.isRequired && _jsx("span", { className: "text-xs text-red-500", children: "(Required Video)" })] })), block.type === 'quiz' && block.quizContent && (_jsxs("div", { className: "not-prose my-2", children: [_jsx("h4", { className: `text-md font-semibold mb-1 ${deepBrown}`, children: block.quizContent.title || 'Quiz' }), block.quizContent.description && _jsx("p", { className: `text-sm mb-1.5 ${midBrown}`, children: block.quizContent.description }), block.quizContent.settings?.timeLimit !== undefined && _jsxs("p", { className: `text-xs mb-2 ${mutedText}`, children: ["Time Limit: ", block.quizContent.settings.timeLimit, " minutes"] }), Array.isArray(block.quizContent.questions) && block.quizContent.questions.length > 0 ? (_jsx("div", { className: "space-y-3 mt-2", children: block.quizContent.questions.map((q, qIdx) => (_jsxs("div", { className: `p-3 border rounded ${editorCardBg} ${themedInputBorder}`, children: [_jsxs("p", { className: `font-medium ${deepBrown} mb-1`, children: [qIdx + 1, ". ", q.question, " ", q.required && _jsx("span", { className: "text-red-500 text-xs", children: "*" })] }), q.description && _jsx("p", { className: `text-xs ${mutedText} mb-1.5`, children: q.description }), Array.isArray(q.options) && (q.type === 'multiple_choice' || q.type === 'checkbox') && q.options.map((opt, optIdx) => (_jsx("div", { className: `ml-4 text-sm flex items-center gap-2 ${midBrown}`, children: _jsxs("label", { className: "flex items-center gap-2 cursor-default", children: [_jsx("input", { type: q.type === 'multiple_choice' ? 'radio' : 'checkbox', name: `preview-q-${q.id}`, disabled: true, className: "shrink-0 accent-amber-600 dark:accent-amber-500" }), _jsx("span", { children: opt.text })] }) }, opt.id || `opt-${qIdx}-${optIdx}`))), (q.type === 'short_answer') && _jsx(Input, { type: "text", placeholder: "Short answer (preview)", disabled: true, className: `${inputClasses} text-sm mt-1` }), (q.type === 'paragraph') && _jsx(Textarea, { placeholder: "Paragraph answer (preview)", disabled: true, className: `${inputClasses} text-sm mt-1 min-h-[60px]` })] }, q.id || `q-${qIdx}`))) })) : (_jsx("p", { className: `text-xs ${mutedText}`, children: block.quizContent.questions === undefined ? 'Quiz questions loading or unavailable.' : 'Quiz has no questions.' }))] }))] }, block.id || `block-${blockIndex}`));
    };
    const renderContentItemPreview = (item, index) => {
        return (_jsxs("div", { className: `p-4 my-4 border rounded-lg ${themedInputBorder} ${lightCardBg} ${darkCardBg}`, children: [_jsx("h3", { className: `text-xl font-semibold mb-2 ${deepBrown}`, children: item.title || `Content Item ${index + 1}` }), item.isRequired && _jsx("p", { className: "text-sm text-red-500 dark:text-red-400 mb-2", children: "(Required)" }), item.type === 'text' && item.content && (!item.richContent || item.richContent.length === 0) && (_jsx("div", { className: `prose prose-sm dark:prose-invert max-w-none ${defaultDarkTextColor}`, dangerouslySetInnerHTML: { __html: item.content } })), item.type === 'video' && item.url && (!item.richContent || item.richContent.length === 0) && (_jsx("div", { className: "not-prose", children: _jsx("video", { controls: true, src: item.url, className: "w-full max-w-lg rounded-md aspect-video bg-black", children: " Video not supported. " }) })), item.type === 'quiz_link' && item.url && (!item.richContent || item.richContent.length === 0) && (_jsxs("p", { className: midBrown, children: [" Quiz Link: ", _jsx("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: `${goldAccent} hover:underline`, children: item.title || item.url }), " "] })), Array.isArray(item.richContent) && item.richContent.length > 0 && (_jsx("div", { className: "mt-2 space-y-3", children: item.richContent.map((block, idx) => block ? renderRichContentBlock(block, idx) : null) })), !item.content && !item.url && (!item.richContent || item.richContent.length === 0) && (_jsx("p", { className: mutedText, children: "No specific preview for this content type or content is empty." }))] }, item.id || `item-${index}`));
    };
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4", role: "dialog", "aria-modal": "true", "aria-labelledby": "section-preview-title", children: _jsxs(Card, { className: `w-full max-w-4xl ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl flex flex-col max-h-[90vh]`, children: [_jsxs(CardHeader, { className: `flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b ${themedInputBorder} sticky top-0 z-10 ${lightCardBg} ${darkCardBg}`, children: [_jsx("div", { id: "section-preview-title", children: _jsxs(CardTitle, { className: `${deepBrown} font-serif text-xl`, children: ["Preview: ", section.title || 'Untitled Section'] }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: `${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8`, "aria-label": "Close modal", children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs(CardContent, { className: `flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 prose prose-sm sm:prose dark:prose-invert max-w-none ${defaultDarkTextColor}`, children: [_jsx("h2", { className: `text-2xl font-bold font-serif mb-2 ${deepBrown}`, children: section.title || 'Untitled Section' }), section.description && (_jsx("p", { className: `mb-4 text-base ${midBrown}`, children: section.description })), Array.isArray(section.content) && section.content.length > 0 ? (section.content.map((item, index) => item ? renderContentItemPreview(item, index) : null)) : (_jsx("p", { className: mutedText, children: "This section has no content items." }))] })] }) }));
};
const SectionPreviewModal = (props) => (_jsx(ErrorBoundary, { fallbackMessage: "Could not render section preview. Check console for details.", children: _jsx(SectionPreviewModalComponent, { ...props }) }));
export default SectionPreviewModal;
