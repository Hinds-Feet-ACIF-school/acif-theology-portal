// src/components/DocumentViewer.tsx

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 as ViewerLoaderIcon, AlertTriangle as ViewerAlertIcon } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface DocumentViewerProps {
    fileUrl: string;
    fileType?: string; // Changed from initialFileType for consistency, ensure parent passes this
    originalFileName?: string;
    themedInputBorder: string;
    mutedText: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    fileUrl,
    fileType: initialFileType, // Keep prop name consistent if used widely
    originalFileName,
    themedInputBorder,
    mutedText,
}) => {
    // Initial console log from props
    // console.log('[DocumentViewer] Instantiated/Re-rendered. Props:', { fileUrl, initialFileType, originalFileName });

    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [docType, setDocType] = useState<'pdf' | 'pptx' | 'unsupported' | null>(null);
    
    const [pptxContainer, setPptxContainer] = useState<HTMLDivElement | null>(null);
    const [isRefReady, setIsRefReady] = useState<boolean>(false); // Explicit state for ref readiness

    const pdfContainerRef = useRef<HTMLDivElement>(null);

    // Log for unmount check
    useEffect(() => {
        const currentFileUrlForLog = fileUrl;
        console.log(`[DocumentViewer] Mounted/Updated. Processing: ${currentFileUrlForLog}`);
        return () => {
            console.log(`[DocumentViewer] Unmounted. Was processing: ${currentFileUrlForLog}`);
        };
    }, [fileUrl]); // Effect runs on mount and when fileUrl changes

    // Log state in render body
    // console.log(`[DV Render] States: docType=${docType}, isRefReady=${isRefReady}, pptxContainer=${!!pptxContainer}, isLoading=${isLoading}, numPages=${numPages}`);


    const setPptxRenderDivRef = useCallback((element: HTMLDivElement | null) => {
        console.log('[DV Ref Callback] Setting PPTX ref:', { 
            element: !!element, 
            currentIsRefReady: isRefReady, // Log current state value, not from closure if possible
            docTypeFromState: docType,
            elementId: element?.id,
        });
        if (element) {
            setPptxContainer(element);
            if (!isRefReady) setIsRefReady(true); // Set ready if element is provided
        } else {
            // Element is null (e.g., div unmounted)
            setPptxContainer(null);
            if (isRefReady) setIsRefReady(false);
        }
    }, [isRefReady, docType]); // Dependencies ensure callback is stable unless these change

    useLayoutEffect(() => {
        console.log('[DV Effect 1 - Type Detection] Running. Inputs:', { fileUrl, initialFileType, originalFileName, currentIsLoading: isLoading });
        setIsLoading(true);
        setError(null);
        setNumPages(null);
        setCurrentPage(1);

        let determinedType: 'pdf' | 'pptx' | 'unsupported' = 'unsupported';
        const lowerFileName = originalFileName?.toLowerCase();

        if (initialFileType) {
            if (initialFileType === 'application/pdf') determinedType = 'pdf';
            else if (initialFileType === 'application/vnd.ms-powerpoint' || initialFileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') determinedType = 'pptx';
        } else if (lowerFileName) {
            if (lowerFileName.endsWith('.pdf')) determinedType = 'pdf';
            else if (lowerFileName.endsWith('.pptx') || lowerFileName.endsWith('.ppt')) determinedType = 'pptx';
        }
        
        setDocType(determinedType);

        if (determinedType === 'unsupported') {
            setError("Slide-by-slide preview is not available for this file type.");
            setIsLoading(false);
        } else if (!fileUrl) {
            setError("File URL is missing, cannot load document.");
            setIsLoading(false);
        }
    }, [fileUrl, initialFileType, originalFileName]);

    const onDocumentLoadSuccess = useCallback(({ numPages: totalPages }: { numPages: number }) => {
        console.log('[DV PDF] onDocumentLoadSuccess. Total pages:', totalPages);
        setNumPages(totalPages);
        setCurrentPage(1);
        setIsLoading(false);
        setError(null);
    }, []);

    const onDocumentLoadError = useCallback((loadError: Error) => {
        console.error("[DV PDF] onDocumentLoadError:", loadError);
        setError(`Failed to load PDF: ${loadError.message}.`);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        console.log(`[DV Effect 2 - PPTX Render Attempt] Running. docType: ${docType}, fileUrl: ${fileUrl}, pptxContainer: ${!!pptxContainer}, isRefReady: ${isRefReady}, isLoading: ${isLoading}`);

        if (docType !== 'pptx' || !fileUrl) {
            if (docType === 'pptx' && isLoading) { // If it was supposed to be pptx but something is wrong
                // console.log('[DV Effect 2] Conditions not met for PPTX (no URL or wrong type). Setting isLoading false if it was true.');
                // setIsLoading(false); // Let Effect 1 handle this, or onDocumentLoadError for PDF
            }
            return;
        }

        if (!isRefReady || !pptxContainer) {
            console.log('[DV Effect 2] PPTX mode, but ref not ready or container not set. Waiting...');
            // If not loading, but should be for PPTX, set it.
            // This can happen if Effect 1 set it to false due to temp unsupported state.
            if(!isLoading) setIsLoading(true);
            return;
        }
        
        // At this point: docType is 'pptx', fileUrl exists, isRefReady is true, pptxContainer exists.
        // Ensure isLoading is true before starting the async operation.
        if (!isLoading) {
            console.log('[DV Effect 2] All conditions met for PPTX, but was not loading. Setting isLoading to true and will retry.');
            setIsLoading(true);
            return; // Effect will re-run with isLoading=true
        }

        console.log('[DV Effect 2] All conditions met, isLoading is true. Starting PPTX render process.');
        if (error) setError(null); // Clear previous errors before attempting to render

        let isMounted = true;
        const slideClassName = 'pptx-custom-slide'; // Ensure this class is unique or well-scoped

        const renderPptxFile = async () => {
            if (!pptxContainer) { // Guard against null container, though isRefReady should cover this
                console.error("[DV PPTX Proc] pptxContainer is null, cannot render.");
                if (isMounted) {
                    setError("PPTX preview container not available.");
                    setIsLoading(false);
                }
                return;
            }
            
            // Clear previous content explicitly
            pptxContainer.innerHTML = ''; 
            // Add a temporary loading message inside the container
            const loadingMessage = document.createElement('p');
            loadingMessage.textContent = 'Processing PPTX file...';
            pptxContainer.appendChild(loadingMessage);

            try {
                console.log('[DV PPTX Proc] Fetching file:', fileUrl);
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
                const arrayBuffer = await response.arrayBuffer();
                console.log('[DV PPTX Proc] File fetched. ArrayBuffer length:', arrayBuffer.byteLength);

                if (!isMounted || !pptxContainer) { // Check again after await
                     console.log('[DV PPTX Proc] Component unmounted or container lost during fetch.');
                     if (isMounted) setIsLoading(false); return;
                }
                
                // Clear the "Processing..." message
                pptxContainer.innerHTML = '';

                console.log('[DV PPTX Proc] Importing pptx-preview...');
                const PptxPreviewModule = await import('pptx-preview');
                console.log('[DV PPTX Proc] Imported PptxPreviewModule:', PptxPreviewModule);
                
                const containerRect = pptxContainer.getBoundingClientRect();
                const previewerOptions = {
                    width: containerRect.width > 0 ? containerRect.width : 600,
                    height: containerRect.height > 0 ? containerRect.height : 450, // Adjust as needed
                    slideClassName: slideClassName, // Use the defined class
                    minSlideWidth: 300, // Example: ensure slides aren't too small
                    minSlideHeight: 200, // Example
                };
                console.log('[DV PPTX Proc] Previewer options being used:', previewerOptions);

                if (!PptxPreviewModule || typeof PptxPreviewModule.init !== 'function') {
                    throw new Error("pptx-preview module not properly loaded or init method not found");
                }
                
                const previewer = PptxPreviewModule.init(pptxContainer, previewerOptions);
                console.log('[DV PPTX Proc] Previewer instance created:', previewer);

                if (typeof previewer.preview !== 'function') {
                    throw new Error("Previewer instance does not have a preview method");
                }

                await previewer.preview(arrayBuffer);
                console.log('[DV PPTX Proc] Preview call completed.');

                // Wait a bit for slides to be rendered DOM, pptx-preview might not offer a direct callback
                await new Promise(resolve => setTimeout(resolve, 500)); // Adjust timeout if needed

                if (!isMounted || !pptxContainer) { 
                    console.log('[DV PPTX Proc] Component unmounted or container lost after preview call.');
                    if(isMounted) setIsLoading(false); 
                    return; 
                }

                const slides = pptxContainer.querySelectorAll(`.${slideClassName}`);
                console.log(`[DV PPTX Proc] Slides found with class ".${slideClassName}":`, slides.length);

                if (slides.length > 0) {
                    setNumPages(slides.length);
                    setCurrentPage(1); 
                    setError(null);
                } else {
                    // Even if preview call succeeds, if no slides are found, it's an issue
                    throw new Error("No slides were rendered by pptx-preview or they could not be found.");
                }
            } catch (e: any) {
                console.error("[DV PPTX Proc] CATCH BLOCK ERROR:", e);
                if (isMounted) setError(`PPTX Preview Error: ${e.message}`);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        renderPptxFile();
        return () => { 
            isMounted = false; 
            console.log('[DV Effect 2] Cleanup for PPTX effect.');
            // Optionally, clean up pptxContainer if necessary, though new renderPptxFile clears it.
        };
    }, [docType, fileUrl, isRefReady, pptxContainer, isLoading, error]); // Added isLoading and error


    // Effect for managing PPTX slide visibility
    useEffect(() => {
        if (docType !== 'pptx' || !pptxContainer || numPages === null || isLoading) return;
        
        // console.log(`[DV PPTX Slide Vis] Updating. CurrentPage: ${currentPage}, NumPages: ${numPages}, IsLoading: ${isLoading}`);
        const slideClassNameToQuery = '.pptx-custom-slide'; 
        const slides = pptxContainer.querySelectorAll(slideClassNameToQuery);

        if (slides.length > 0 && slides.length === numPages) {
            slides.forEach((slide, index) => {
                (slide as HTMLElement).style.display = (index === currentPage - 1) ? 'block' : 'none';
            });
        } else if (slides.length !== numPages && numPages > 0) {
            console.warn(`[DV PPTX Slide Vis] Mismatch: Found ${slides.length} slide elements, but numPages is ${numPages}.`);
        }
    }, [docType, currentPage, numPages, isLoading, pptxContainer]); // Added pptxContainer

    const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => numPages ? Math.min(numPages, prev + 1) : 1);

    // PDF width calculation
    const [pdfWidth, setPdfWidth] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (docType !== 'pdf' || !pdfContainerRef.current) { setPdfWidth(undefined); return; }
        let isMounted = true;
        const calculateWidth = () => {
            if (isMounted && pdfContainerRef.current) {
                // Ensure a minimum width if container is too small, or use a percentage
                const newWidth = Math.max(pdfContainerRef.current.getBoundingClientRect().width * 0.95, 300);
                setPdfWidth(newWidth);
            }
        };
        // Delay calculation slightly to ensure layout is stable
        const timeoutId = setTimeout(calculateWidth, 100); 
        window.addEventListener('resize', calculateWidth);
        return () => {
            isMounted = false;
            clearTimeout(timeoutId); 
            window.removeEventListener('resize', calculateWidth); 
        };
    }, [docType, pdfContainerRef.current]); // Depend on ref.current to re-calc if it changes

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-4 min-h-[250px] text-gray-500 dark:text-gray-400">
                <ViewerLoaderIcon className="h-8 w-8 animate-spin mb-2"/>
                <p>Loading document preview...</p>
                {docType === 'pptx' && pptxContainer && <p className="text-xs mt-1">(Initializing PPTX viewer...)</p>}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center p-4 min-h-[150px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border ${themedInputBorder} rounded-md`}>
                <ViewerAlertIcon className="h-8 w-8 mb-2"/>
                <p className="text-center text-sm font-medium">Error Previewing Document</p>
                <p className="text-center text-xs mt-1">{error}</p>
                {originalFileName && <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">File: {originalFileName}</p>}
            </div>
        );
    }
    
    if (docType === 'unsupported' || ((docType === 'pdf' || docType === 'pptx') && numPages === null && !isLoading)) { // Added !isLoading
         return (
            <div className={`flex flex-col items-center justify-center p-4 min-h-[100px] text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border ${themedInputBorder} rounded-md`}>
                <ViewerAlertIcon className="h-6 w-6 mb-2"/>
                <p className="text-center text-sm">
                    {docType === 'unsupported'
                        ? "Slide-by-slide preview is not available for this file type."
                        : "Document preview could not be generated or the document is empty."
                    }
                </p>
                 {originalFileName && <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">File: {originalFileName}</p>}
            </div>
        );
    }

    return (
        <div className={`document-viewer-container w-full border ${themedInputBorder} rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800`}>
            <div className="viewer-content bg-gray-100 dark:bg-gray-900 p-1 sm:p-2 min-h-[300px] flex justify-center items-center overflow-auto relative">
                {docType === 'pdf' && fileUrl && (
                    <div ref={pdfContainerRef} className="w-full pdf-viewer-wrapper">
                         <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<div className="flex items-center justify-center p-4"><ViewerLoaderIcon className="h-6 w-6 animate-spin"/> Loading PDF...</div>}
                            className="flex flex-col items-center"
                        >
                            {pdfWidth && ( // Only render Page if pdfWidth is calculated
                                <Page
                                    pageNumber={currentPage}
                                    width={pdfWidth}
                                    renderAnnotationLayer={true}
                                    renderTextLayer={true}
                                    loading={<div className="flex items-center justify-center p-4 min-h-[300px]"><ViewerLoaderIcon className="h-5 w-5 animate-spin"/> Rendering page...</div>}
                                    className="react-pdf__Page shadow-lg" // Added shadow for better visibility
                                />
                            )}
                        </Document>
                    </div>
                )}
                {docType === 'pptx' && (
                    <div 
                        ref={setPptxRenderDivRef}
                        id="pptx-render-container"
                        className="pptx-render-area w-full h-full max-w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-gray-700" // Changed dark bg
                        style={{ 
                            display: 'block', // Ensure it's block for pptx-preview to measure
                            position: 'relative', // For potential absolute positioned elements within by the library
                            // minHeight: '300px', // Already in className
                            // width: '100%', // Already in className
                        }}
                    >
                        {/* This container will be filled by pptx-preview. 
                            A loading state specifically for when pptx-preview is working can be added here if Effect 2 doesn't cover it.
                            But the main isLoading flag should handle the overall loading appearance.
                        */}
                         {(isLoading && numPages === null) && ( // More specific loading message for PPTX init
                            <div className="flex flex-col items-center justify-center p-4 absolute inset-0 text-gray-600 dark:text-gray-300">
                                <ViewerLoaderIcon className="h-6 w-6 animate-spin mb-2"/>
                                <p className="text-sm">Preparing PPTX preview...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {numPages !== null && numPages > 0 && (
                <div className="flex items-center justify-between gap-2 sm:gap-4 p-2 border-t bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1 || isLoading} // Disable controls while loading
                        className="h-8 px-2.5 text-xs"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Prev</span>
                    </Button>
                    <span className={`text-xs sm:text-sm ${mutedText}`}>
                        Page {currentPage} of {numPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= numPages || isLoading} // Disable controls while loading
                        className="h-8 px-2.5 text-xs"
                        aria-label="Next Page"
                    >
                        <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;