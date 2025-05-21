// src/components/modals/SectionPreviewModal.tsx

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.js";
import { X, FileText, Video as VideoIcon, HelpCircle, Download } from 'lucide-react';
import { Input } from "../ui/input.js"; 
import { Textarea } from "../ui/textarea.js";
import DocumentViewer from '../DocumentViewer.js';

import type { Section, ContentItem, RichContentItemBlock, VideoBlockContent, QuizBlockContent, QuizQuestion as ApiQuizQuestion } from '../../services/api';

const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-950';
const editorCardBg = 'dark:bg-gray-800';
const themedInputBorder = `border-gray-300 dark:border-gray-600`;
const mutedText = 'text-gray-600 dark:text-gray-400';
const themedInputBg = `bg-white dark:bg-gray-700`;
const focusRing = 'focus:ring-2 focus:ring-offset-1 focus:ring-[#C5A467]/80 focus:outline-none';
const inputClasses = `h-9 rounded-md px-3 text-sm ${themedInputBg} ${themedInputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400`;
const defaultDarkTextColor = 'dark:text-gray-200';
const primaryButtonClasses = 'bg-[#C5A467] hover:bg-[#B08E4F] text-white dark:bg-[#D4B77D] dark:hover:bg-[#C5A467] transition-colors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SectionPreviewModal ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded fixed inset-0 z-[200] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Preview Error</h2>
            <p className="text-sm">{this.props.fallbackMessage || "Something went wrong while rendering the preview."}</p>
            {this.state.error && (
              <details className="mt-2 text-left text-xs">
                <summary>Error Details</summary>
                <pre className="mt-1 p-2 bg-red-50 rounded whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                  {this.state.errorInfo && `\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface SectionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: Section;
}

const SectionPreviewModalComponent: React.FC<SectionPreviewModalProps> = ({
    isOpen,
    onClose,
    section,
}) => {
    if (!isOpen) return null;

    useEffect(() => {
        if (isOpen) {
            console.log("SectionPreviewModal received section:", JSON.stringify(section, (key, value) => {
                if (value instanceof File) { return { name: value.name, type: value.type, size: value.size }; }
                return value;
            }, 2));
        }
    }, [isOpen, section]);

    const renderRichContentBlock = (block: RichContentItemBlock, blockIndex: number) => {
        const blockKey = block.id || `block-${blockIndex}`;
        
        return (
            <div key={blockKey} className={`mt-3 pt-3 border-t first:mt-0 first:pt-0 first:border-t-0 ${themedInputBorder}`}>
                {block.type === 'text' && block.content && (
                    <div className={`prose prose-sm dark:prose-invert max-w-none ${defaultDarkTextColor}`} dangerouslySetInnerHTML={{ __html: block.content }} />
                )}
                {block.type === 'video' && block.videoContent && (
                    <div className="not-prose">
                        <h4 className={`text-md font-semibold mb-1 ${deepBrown}`}>{block.videoContent.title || 'Video'}</h4>
                        {block.videoContent.description && <p className={`text-sm mb-1.5 ${midBrown}`}>{block.videoContent.description}</p>}

                        {(() => {
                            let videoSourceUrl: string | undefined = undefined;
                            if (block.videoContent?.videoUrl) {
                                videoSourceUrl = block.videoContent.videoUrl.startsWith('http') 
                                    ? block.videoContent.videoUrl 
                                    : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${block.videoContent.videoUrl.startsWith('/') ? '' : '/'}${block.videoContent.videoUrl}`;
                            } else if (block.videoContent?.videoFile instanceof File) {
                                try { videoSourceUrl = URL.createObjectURL(block.videoContent.videoFile); }
                                catch (e) { console.error("Error creating object URL for videoFile:", e); }
                            }

                            let thumbnailSourceUrl: string | undefined = undefined;
                            if (block.videoContent?.thumbnailUrl) {
                                thumbnailSourceUrl = block.videoContent.thumbnailUrl.startsWith('http')
                                    ? block.videoContent.thumbnailUrl
                                    : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${block.videoContent.thumbnailUrl.startsWith('/') ? '' : '/'}${block.videoContent.thumbnailUrl}`;
                            } else if (block.videoContent?.thumbnail instanceof File) {
                                try { thumbnailSourceUrl = URL.createObjectURL(block.videoContent.thumbnail); }
                                catch (e) { console.error("Error creating object URL for thumbnail:", e); }
                            }

                            if (videoSourceUrl) {
                                return (
                                    <video controls src={videoSourceUrl} poster={thumbnailSourceUrl} className="w-full max-w-md rounded-md aspect-video bg-black my-2">
                                        Your browser does not support the video tag.
                                    </video>
                                );
                            } else {
                                return (
                                    <div className={`p-3 ${editorCardBg} rounded text-center text-xs ${mutedText}`}>
                                        Video source not available (no URL or valid file).
                                    </div>
                                );
                            }
                        })()}
                        {block.videoContent.isRequired === true && <span className="text-xs text-red-500">(Required Video)</span>}
                    </div>
                )}
                {block.type === 'quiz' && block.quizContent && (
                     <div className="not-prose my-2">
                        <h4 className={`text-md font-semibold mb-1 ${deepBrown}`}>{block.quizContent.title || 'Quiz'}</h4>
                        {block.quizContent.description && <p className={`text-sm mb-1.5 ${midBrown}`}>{block.quizContent.description}</p>}
                        {block.quizContent.settings?.timeLimit !== undefined && <p className={`text-xs mb-2 ${mutedText}`}>Time Limit: {block.quizContent.settings.timeLimit} minutes</p>}

                        {Array.isArray(block.quizContent.questions) && block.quizContent.questions.length > 0 ? (
                            <div className="space-y-3 mt-2">
                                {block.quizContent.questions.map((q: ApiQuizQuestion, qIdx: number) => (
                                    <div key={q.id || `q-${qIdx}`} className={`p-3 border rounded ${editorCardBg} ${themedInputBorder}`}>
                                        <p className={`font-medium ${deepBrown} mb-1`}>
                                            {qIdx + 1}. {q.question} {q.required && <span className="text-red-500 text-xs">*</span>}
                                        </p>
                                        {q.description && <p className={`text-xs ${mutedText} mb-1.5`}>{q.description}</p>}
                                        
                                        {Array.isArray(q.options) && (q.type === 'multiple_choice' || q.type === 'checkbox') && q.options.map((opt, optIdx) => (
                                            <div key={opt.id || `opt-${qIdx}-${optIdx}`} className={`ml-4 text-sm flex items-center gap-2 ${midBrown}`}>
                                                <label className="flex items-center gap-2 cursor-default">
                                                    <input 
                                                        type={q.type === 'multiple_choice' ? 'radio' : 'checkbox'} 
                                                        name={`preview-q-${q.id}`}
                                                        disabled
                                                        className="shrink-0 accent-amber-600 dark:accent-amber-500"
                                                    /> 
                                                    <span>{opt.text}</span>
                                                </label>
                                            </div>
                                        ))}
                                       </div>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-xs ${mutedText}`}>
                                {block.quizContent.questions === undefined ? 'Quiz questions loading or unavailable.' : 'Quiz has no questions.'}
                            </p>
                        )}
                    </div>
                )}
                {block.type === 'document' && block.documentContent && (
                    <div className="not-prose document-block-preview space-y-2">
                        <h4 className={`text-md font-semibold mb-1 ${deepBrown}`}>{block.documentContent.title || "Untitled Document"}</h4>
                        {block.documentContent.description && <p className={`text-sm mb-1.5 ${midBrown}`}>{block.documentContent.description}</p>}
                        
                        {(() => {
                            const docUrl = block.documentContent.documentUrl;
                            const fileName = block.documentContent.originalFileName;
                            const fileTypeFromContent = block.documentContent.fileType;

                            console.log('[Modal Preview] Evaluating Document Block. ID:', block.id, {
                                docUrl: docUrl || 'absent',
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
                            console.log('[Modal Preview] Document Block. ID:', block.id, 'isViewableType:', isViewableType);

                            if (docUrl && isViewableType) {
                                console.log('[Modal Preview] RENDERING DocumentViewer for ID:', block.id, 'with URL:', docUrl);
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
                                console.log('[Modal Preview] Document Block (Fallback). ID:', block.id, 'docUrl present, but not viewable type or viewer failed. isViewableType:', isViewableType);
                                return (
                                    <div className="my-2">
                                        <p className={`text-sm ${mutedText} mb-2`}>
                                            {isViewableType ? "Preview loading or an issue occurred processing this file." : "Slide-by-slide preview is not available for this file type."}
                                        </p>
                                        <a 
                                            href={docUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            download={fileName || 'document'}
                                            className={`${primaryButtonClasses} inline-flex items-center text-xs px-2.5 py-1.5 rounded`}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1.5"/>
                                            Download {fileName || 'Document'}
                                        </a>
                                    </div>
                                );
                            } else {
                                console.log('[Modal Preview] Document Block (No URL/File). ID:', block.id);
                                return (
                                    <div className={`my-2 p-3 ${editorCardBg} rounded text-sm ${mutedText} border ${themedInputBorder}`}>
                                        Document file not yet selected or URL is missing.
                                    </div>
                                );
                            }
                        })()}
                    </div>
                )}
            </div>
        );
    };

    const renderContentItemPreview = (item: ContentItem, index: number) => {
        return (
            <div key={item.id || `item-${index}`} className={`p-4 my-4 border rounded-lg ${themedInputBorder} ${lightCardBg} ${darkCardBg}`}>
                <h3 className={`text-xl font-semibold mb-2 ${deepBrown}`}>{item.title || `Content Item ${index + 1}`}</h3>
                {item.isRequired === true && <p className="text-sm text-red-500 dark:text-red-400 mb-2">(Required)</p>}

                {item.type === 'text' && item.content && (!item.richContent || item.richContent.length === 0) && (
                     <div className={`prose prose-sm dark:prose-invert max-w-none ${defaultDarkTextColor}`} dangerouslySetInnerHTML={{ __html: item.content }} />
                )}
                {item.type === 'video' && item.url && (!item.richContent || item.richContent.length === 0) && (
                    <div className="not-prose">
                        <video controls src={item.url} className="w-full max-w-lg rounded-md aspect-video bg-black"> Video not supported. </video>
                    </div>
                )}
                {item.type === 'quiz_link' && item.url && (!item.richContent || item.richContent.length === 0) && (
                    <p className={midBrown}> Quiz Link: <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${goldAccent} hover:underline`}>{item.title || item.url}</a> </p>
                )}

                {Array.isArray(item.richContent) && item.richContent.length > 0 && (
                    <div className="mt-2 space-y-3">
                        {item.richContent.map((block, idx) => block ? renderRichContentBlock(block, idx) : null)}
                    </div>
                )}
                
                {!item.content && !item.url && (!item.richContent || item.richContent.length === 0) && (
                    <p className={mutedText}>No specific preview for this content type or content is empty.</p>
                )}
            </div>
        );
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="section-preview-title">
            <Card className={`w-full max-w-4xl ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl flex flex-col max-h-[90vh]`}>
                <CardHeader className={`flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b ${themedInputBorder} sticky top-0 z-10 ${lightCardBg} ${darkCardBg}`}>
                    <div id="section-preview-title">
                        <CardTitle className={`${deepBrown} font-serif text-xl`}>Preview: {section.title || 'Untitled Section'}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className={`${midBrown} hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8`} aria-label="Close modal">
                        <X className="h-4 w-4"/>
                    </Button>
                </CardHeader>

                <CardContent className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 prose prose-sm sm:prose dark:prose-invert max-w-none ${defaultDarkTextColor}`}>
                    <h2 className={`text-2xl font-bold font-serif mb-2 ${deepBrown}`}>{section.title || 'Untitled Section'}</h2>
                    {section.description && (
                        <p className={`mb-4 text-base ${midBrown}`}>{section.description}</p>
                    )}
                    {Array.isArray(section.content) && section.content.length > 0 ? (
                        section.content.map((item, index) => item ? renderContentItemPreview(item, index) : null)
                    ) : (
                        <p className={mutedText}>This section has no content items.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );

};


const SectionPreviewModal: React.FC<SectionPreviewModalProps> = (props) => (
    <ErrorBoundary fallbackMessage="Could not render section preview. Check console for details.">
        <SectionPreviewModalComponent {...props} />
    </ErrorBoundary>
);

export default SectionPreviewModal;