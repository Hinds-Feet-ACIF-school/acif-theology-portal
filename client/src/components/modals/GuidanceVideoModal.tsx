// Example: src/components/modals/GuidanceVideoModal.tsx
import React from 'react';
import ReactPlayer from 'react-player';
import { Button } from '../ui/button'; // Adjust path
import { X } from 'lucide-react';

interface GuidanceVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string; // URL of your guidance video
}

const GuidanceVideoModal: React.FC<GuidanceVideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-[#2A0F0F] dark:text-[#FFF8F0]">Platform Guidance</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close video modal">
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="aspect-video w-full bg-black rounded-md">
                        {videoUrl ? (
                            <ReactPlayer url={videoUrl} controls width="100%" height="100%" />
                        ) : (
                            <p className="text-center text-gray-500 p-8">Video loading or not available.</p>
                        )}
                    </div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                        Watch this short video to learn how to navigate the platform, access your courses, and make the most of your learning experience.
                    </p>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
                     <Button onClick={onClose} className="bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F]">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GuidanceVideoModal;