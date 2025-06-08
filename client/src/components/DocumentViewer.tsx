// src/components/DocumentViewer.tsx (or SlideViewer.tsx)
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Loader2, AlertCircle } from 'lucide-react';

// Configure worker
// You can copy the worker file from 'pdfjs-dist/build/pdf.worker.entry.js' to your public folder
// Or use a CDN:
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
    fileUrl?: string; // This should be the URL to the CONVERTED PDF
    pageNumber: number;
    onLoadSuccess: (numPages: number) => void;
    onLoadError?: (error: Error) => void;
    themedInputBorder?: string;
    mutedText?: string;
    containerClassName?: string;
    showError?: boolean; // New prop to control error display
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    fileUrl,
    pageNumber,
    onLoadSuccess,
    onLoadError,
    themedInputBorder = 'border-gray-300 dark:border-gray-700',
    mutedText = 'text-gray-600 dark:text-gray-400',
    containerClassName = 'relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden',
    showError = true, // Default to true
}) => {
    const [loadError, setLoadError] = useState<Error | null>(null);

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
        setLoadError(null);
        onLoadSuccess(numPages);
    };

    const handleLoadError = (error: Error) => {
        console.error('Failed to load PDF:', error);
        setLoadError(error);
        if (onLoadError) {
            onLoadError(error);
        }
    };

    if (!fileUrl) {
        if (!showError) return null; // Don't render anything if no fileUrl and showError is false
        return (
            <div className={`${containerClassName} border ${themedInputBorder} flex items-center justify-center rounded-md`}>
                <p className={`text-sm ${mutedText}`}>No document selected or URL is missing.</p>
            </div>
        );
    }

    return (
        <div className={`${containerClassName} border ${themedInputBorder} rounded-md`}>
            <Document
                file={fileUrl}
                onLoadSuccess={handleLoadSuccess}
                onLoadError={handleLoadError}
                loading={
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                        <Loader2 className={`h-8 w-8 animate-spin ${mutedText}`} />
                        <p className={`text-xs mt-2 ${mutedText}`}>Loading document...</p>
                    </div>
                }
                error={ 
                    showError && loadError && ( // Only show error if showError is true
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <p className={`text-xs mt-2 text-red-600 dark:text-red-400 text-center`}>
                                Error loading PDF. It might be corrupted or an invalid format for viewing.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">({loadError.message})</p>
                        </div>
                    )
                }
                className="flex justify-center items-center h-full w-full"
            >
                <Page
                    pageNumber={pageNumber}
                    width={Math.min(window.innerWidth * 0.8, 800)} // Responsive width
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="flex justify-center" // Center page content
                />
            </Document>
        </div>
    );
};

export default DocumentViewer;