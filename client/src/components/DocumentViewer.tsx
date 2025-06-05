// src/components/DocumentViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button"; // Assuming path is correct
import { ChevronLeft, ChevronRight, Loader2 as ViewerLoaderIcon, AlertTriangle as ViewerAlertIcon } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface DocumentViewerProps {
    fileUrl: string;
    fileType?: string;
    originalFileName?: string;
    themedInputBorder: string;
    mutedText: string;
    // Add a callback for when the number of pages is determined (especially for PDF)
    onLoadSuccess?: (numPages: number) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    fileUrl,
    fileType: initialFileType,
    originalFileName,
    themedInputBorder,
    mutedText,
    onLoadSuccess: parentOnLoadSuccess, // Prop for parent component
}) => {
    console.log('[DV] Component rendering with props:', {
        hasFileUrl: !!fileUrl,
        initialFileType,
        originalFileName,
        hasParentCallback: !!parentOnLoadSuccess
    });

    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [docType, setDocType] = useState<'pdf' | 'office' | 'unsupported' | null>(null); // 'office' for pptx, docx etc.
    const [iframeReady, setIframeReady] = useState(false);

    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const isMountedRef = useRef<boolean>(true);
    const loadAttemptRef = useRef<number>(0);
    const iframeSetupTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Cleanup on unmount
    useEffect(() => {
        console.log('[DV] Mount effect running');
        isMountedRef.current = true;
        return () => {
            console.log('[DV] Unmounting component');
            isMountedRef.current = false;
            if (iframeRef.current) {
                iframeRef.current.src = 'about:blank';
            }
            if (iframeSetupTimeoutRef.current) {
                clearTimeout(iframeSetupTimeoutRef.current);
            }
        };
    }, []);

    // Effect 1: Type detection
    useEffect(() => {
        console.log('[DV] Effect 1 (Type Detection) - Starting with state:', {
            docType,
            isLoading,
            error,
            isMounted: isMountedRef.current
        });

        if (!isMountedRef.current) {
            console.log('[DV] Effect 1 - Skipping: component unmounted');
            return;
        }

        setIsLoading(true);
        setError(null);
        setNumPages(null);
        setCurrentPage(1);
        loadAttemptRef.current = 0;
        setIframeReady(false);

        let determinedType: 'pdf' | 'office' | 'unsupported' = 'unsupported';
        const lowerFileName = originalFileName?.toLowerCase();
        const lowerFileType = initialFileType?.toLowerCase();

        // First check fileType if available
        if (lowerFileType) {
            if (lowerFileType === 'application/pdf') {
                determinedType = 'pdf';
            } else if (
                lowerFileType.includes('powerpoint') ||
                lowerFileType.includes('presentationml') ||
                lowerFileType.includes('msword') ||
                lowerFileType.includes('wordprocessingml') ||
                lowerFileType.includes('officedocument')
            ) {
                determinedType = 'office';
            }
        }
        
        // If type not determined by fileType, check file extension
        if (determinedType === 'unsupported' && lowerFileName) {
            const extension = lowerFileName.split('.').pop();
            switch (extension) {
                case 'pdf':
                    determinedType = 'pdf';
                    break;
                case 'ppt':
                case 'pptx':
                case 'doc':
                case 'docx':
                case 'xls':
                case 'xlsx':
                    determinedType = 'office';
                    break;
            }
        }

        // If still not determined, try to infer from URL
        if (determinedType === 'unsupported' && fileUrl) {
            const urlLower = fileUrl.toLowerCase();
            if (urlLower.endsWith('.pdf')) {
                determinedType = 'pdf';
            } else if (
                urlLower.endsWith('.ppt') ||
                urlLower.endsWith('.pptx') ||
                urlLower.endsWith('.doc') ||
                urlLower.endsWith('.docx') ||
                urlLower.endsWith('.xls') ||
                urlLower.endsWith('.xlsx')
            ) {
                determinedType = 'office';
            }
        }

        console.log('[DV] Effect 1 - Determined Type:', determinedType);
        setDocType(determinedType);

        if (determinedType === 'unsupported') {
            setError("Preview is not available for this file type.");
            setIsLoading(false);
        } else if (!fileUrl) {
            setError("File URL is missing, cannot load document.");
            setIsLoading(false);
        }
    }, [fileUrl, initialFileType, originalFileName]);

    // Effect 2: Iframe setup for Office documents
    useEffect(() => {
        console.log('[DV] Effect 2 - Starting check:', { 
            docType, 
            hasFileUrl: !!fileUrl, 
            hasIframeRef: !!iframeRef.current,
            isMounted: isMountedRef.current,
            isLoading,
            error,
            iframeReady
        });
        
        if (docType !== 'office') {
            console.log('[DV] Effect 2 - Skipping: docType is not office');
            return;
        }
        if (!fileUrl) {
            console.log('[DV] Effect 2 - Skipping: no fileUrl provided');
            return;
        }

        // Clear any existing timeout
        if (iframeSetupTimeoutRef.current) {
            clearTimeout(iframeSetupTimeoutRef.current);
        }

        const setupIframe = () => {
            if (!isMountedRef.current) {
                console.log('[DV] Effect 2 - Component unmounted, skipping iframe setup');
                return;
            }

            if (!iframeRef.current) {
                console.log('[DV] Effect 2 - Iframe ref not available, will retry');
                iframeSetupTimeoutRef.current = setTimeout(setupIframe, 100);
                return;
            }

            console.log('[DV] Effect 2 - Setting up iframe');
            const iframe = iframeRef.current;
            let hasLoadedFired = false;
            let loadTimeout: NodeJS.Timeout;
            let retryCount = 0;
            const MAX_RETRIES = 2;

            const onLoad = () => {
                console.log('[DV] onLoad event fired');
                hasLoadedFired = true;
                if (!isMountedRef.current) {
                    console.log('[DV] onLoad - Component unmounted, ignoring');
                    return;
                }

                console.log('[DV] Iframe loaded successfully');
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                        console.log('[DV] Iframe document readyState:', iframeDoc.readyState);
                        // Check for Firebase auth page
                        if (iframeDoc.body.innerHTML.includes('fireauth.iframe.AuthRelay')) {
                            console.log('[DV] Detected Firebase auth page, retrying with direct URL');
                            // Retry with direct URL
                            if (retryCount < MAX_RETRIES) {
                                retryCount++;
                                const directUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
                                console.log(`[DV] Retry ${retryCount}: Setting iframe src to direct URL:`, directUrl.substring(0,100)+'...');
                                iframe.src = directUrl;
                                return;
                            }
                        }
                        // Check for Microsoft viewer error messages
                        const errorElements = iframeDoc.querySelectorAll('.error-message, .errorMessage, .error');
                        if (errorElements.length > 0) {
                            const errorText = Array.from(errorElements).map(el => el.textContent).join(', ');
                            console.error('[DV] Microsoft viewer reported error:', errorText);
                            setError(`Microsoft viewer error: ${errorText}`);
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('[DV] Could not access iframe content (likely due to same-origin policy):', e);
                }

                clearTimeout(loadTimeout);
                setIsLoading(false);
                setError(null);
                setNumPages(1);
                setCurrentPage(1);
                if (parentOnLoadSuccess) parentOnLoadSuccess(1);
            };

            const onError = (error: Event | string) => {
                console.log('[DV] onError event fired:', error);
                if (!isMountedRef.current || hasLoadedFired) {
                    console.log('[DV] onError - Component unmounted or already loaded, ignoring');
                    return;
                }

                console.error('[DV] Iframe failed to load:', error);
                clearTimeout(loadTimeout);
                
                // Retry logic for transient errors
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    console.log(`[DV] Retrying iframe load (attempt ${retryCount}/${MAX_RETRIES})`);
                    setTimeout(() => {
                        if (isMountedRef.current && iframe) {
                            const directUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
                            console.log(`[DV] Retry ${retryCount}: Setting iframe src to direct URL:`, directUrl.substring(0,100)+'...');
                            iframe.src = directUrl;
                        }
                    }, 1000 * retryCount); // Exponential backoff
                    return;
                }

                setError("Failed to load document preview. Please try downloading the file instead.");
                setIsLoading(false);
            };

            // Set a timeout to handle cases where the iframe doesn't load
            loadTimeout = setTimeout(() => {
                if (!hasLoadedFired && isMountedRef.current) {
                    console.warn('[DV] Iframe load timeout');
                    setError("Document preview timed out. Please try downloading the file instead.");
                    setIsLoading(false);
                }
            }, 30000); // 30 second timeout

            // Add message event listener to catch potential cross-origin errors
            const onMessage = (event: MessageEvent) => {
                // Only process messages from Microsoft viewer domain
                if (event.origin === 'https://view.officeapps.live.com') {
                    console.log('[DV] Received message from viewer:', event.data);
                    if (typeof event.data === 'string' && event.data.includes('error')) {
                        onError(event.data);
                    }
                }
            };

            console.log('[DV] Adding event listeners to iframe');
            iframe.addEventListener('load', onLoad);
            iframe.addEventListener('error', onError);
            window.addEventListener('message', onMessage);

            // Use Microsoft Office Online Viewer with direct URL
            const directUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
            console.log('[DV] Setting iframe src to direct URL:', directUrl.substring(0,100)+'...');
            iframe.src = directUrl;

            return () => {
                console.log('[DV] Cleaning up iframe effect');
                clearTimeout(loadTimeout);
                iframe.removeEventListener('load', onLoad);
                iframe.removeEventListener('error', onError);
                window.removeEventListener('message', onMessage);
                if (iframe.contentWindow) {
                    try {
                        iframe.src = 'about:blank';
                    } catch(e) {
                        console.warn('[DV] Iframe cleanup failed:', e);
                    }
                }
            };
        };

        // Start the iframe setup process
        setupIframe();

        return () => {
            if (iframeSetupTimeoutRef.current) {
                clearTimeout(iframeSetupTimeoutRef.current);
            }
        };
    }, [docType, fileUrl, parentOnLoadSuccess, isLoading, error]);

    // Add a debug effect to track state changes
    useEffect(() => {
        console.log('[DV] State changed:', { 
            docType, 
            isLoading, 
            error, 
            hasIframeRef: !!iframeRef.current, 
            iframeReady,
            hasFileUrl: !!fileUrl
        });
    }, [docType, isLoading, error, iframeReady, fileUrl]);

    // PDF Load Success
    const handlePdfLoadSuccess = ({ numPages: totalPages }: { numPages: number }) => {
        console.log('[DV] PDF Loaded. Total pages:', totalPages);
        setNumPages(totalPages);
        setCurrentPage(1);
        setIsLoading(false);
        setError(null);
        if (parentOnLoadSuccess) { // Call parent callback
            parentOnLoadSuccess(totalPages);
        }
    };

    // PDF Load Error
    const handlePdfLoadError = (loadError: Error) => {
        console.error("[DV] PDF Load Error:", loadError);
        setError(`Failed to load PDF: ${loadError.message}.`);
        setIsLoading(false);
    };

    const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => numPages ? Math.min(numPages, prev + 1) : 1);

    // PDF width calculation
    const [pdfWidth, setPdfWidth] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (docType !== 'pdf' || !pdfContainerRef.current) {
            setPdfWidth(undefined);
            return;
        }
        let isComponentMounted = true;
        const calculateWidth = () => {
            if (isComponentMounted && pdfContainerRef.current) {
                const newWidth = Math.max(pdfContainerRef.current.getBoundingClientRect().width * 0.95, 300);
                setPdfWidth(newWidth);
            }
        };
        const timeoutId = setTimeout(calculateWidth, 50); // Reduced delay
        window.addEventListener('resize', calculateWidth);
        return () => {
            isComponentMounted = false;
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateWidth);
        };
    }, [docType, pdfContainerRef]); // Removed pdfContainerRef.current as it's not stable

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-4 min-h-[250px] text-gray-500 dark:text-gray-400">
                <ViewerLoaderIcon className="h-8 w-8 animate-spin mb-2"/>
                <p>Loading document preview...</p>
                {docType === 'office' && (
                    <p className="text-xs mt-1">(This may take a few moments for Office documents)</p>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center p-4 min-h-[150px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border ${themedInputBorder} rounded-md`}>
                <ViewerAlertIcon className="h-8 w-8 mb-2"/>
                <p className="text-center text-sm font-medium">Error Previewing Document</p>
                <p className="text-center text-xs mt-1">{error}</p>
                {originalFileName && (
                    <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">
                        File: {originalFileName}
                    </p>
                )}
            </div>
        );
    }
    
    if (docType === 'unsupported' || (!isLoading && numPages === null && (docType === 'pdf' || docType === 'office'))) {
         return (
            <div className={`flex flex-col items-center justify-center p-4 min-h-[100px] text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border ${themedInputBorder} rounded-md`}>
                <ViewerAlertIcon className="h-6 w-6 mb-2"/>
                <p className="text-center text-sm">
                    {docType === 'unsupported'
                        ? "Preview is not available for this file type."
                        : "Document preview could not be generated or the document is empty."
                    }
                </p>
                 {originalFileName && <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">File: {originalFileName}</p>}
            </div>
        );
    }

    return (
        <div className={`document-viewer-container w-full border ${themedInputBorder} rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800`}>
            <div className="viewer-content bg-gray-100 dark:bg-gray-900 p-1 sm:p-2 min-h-[300px] flex justify-center items-center overflow-auto relative" style={{height: '500px'}}>
                {docType === 'pdf' && fileUrl && (
                    <div ref={pdfContainerRef} className="w-full pdf-viewer-wrapper">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={handlePdfLoadSuccess}
                            onLoadError={handlePdfLoadError}
                            loading={
                                <div className="flex flex-col items-center justify-center p-4 min-h-[250px] text-gray-500 dark:text-gray-400">
                                    <ViewerLoaderIcon className="h-8 w-8 animate-spin mb-2"/>
                                    <p>Loading PDF metadata...</p>
                                </div>
                            }
                            className="flex flex-col items-center"
                        >
                            {pdfWidth && numPages !== null && (
                                <Page
                                    pageNumber={currentPage}
                                    width={pdfWidth}
                                    renderAnnotationLayer={true}
                                    renderTextLayer={true}
                                    loading={<div className="flex items-center justify-center p-4 min-h-[300px]"><ViewerLoaderIcon className="h-5 w-5 animate-spin"/> Rendering page...</div>}
                                    className="react-pdf__Page shadow-lg"
                                />
                            )}
                        </Document>
                    </div>
                )}
                {docType === 'office' && fileUrl && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center p-4 min-h-[250px] text-gray-500 dark:text-gray-400">
                                <ViewerLoaderIcon className="h-8 w-8 animate-spin mb-2"/>
                                <p>Loading document preview...</p>
                                <p className="text-xs mt-1">(This may take a few moments for Office documents)</p>
                            </div>
                        )}
                        <iframe
                            ref={iframeRef}
                            title={originalFileName || 'Document Preview'}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                border: 'none',
                                display: isLoading ? 'none' : 'block'
                            }}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                            allow="fullscreen"
                            onLoad={() => {
                                console.log('[DV] Iframe onLoad event fired');
                                if (iframeRef.current) {
                                    setIframeReady(true);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {docType === 'pdf' && numPages !== null && numPages > 1 && (
                <div className="flex items-center justify-between gap-2 sm:gap-4 p-2 border-t bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700">
                    <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage <= 1 || isLoading} className="h-8 px-2.5 text-xs" aria-label="Previous Page">
                        <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Prev</span>
                    </Button>
                    <span className={`text-xs sm:text-sm ${mutedText}`}>
                        Page {currentPage} of {numPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage >= numPages || isLoading} className="h-8 px-2.5 text-xs" aria-label="Next Page">
                        <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;