// src/pages/admin/content/AdminUserDashboardPageContentEditor.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { CheckCircle, AlertCircle, UploadCloud, Video, Trash2 } from 'lucide-react';

import {
  DashboardPageContentData,
} from '../../../types/dashboardPageContentTypes'; // Ensure path is correct

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- REAL API FUNCTIONS (fetchDashboardPageContentFromAPI, saveDashboardPageContentToAPI, uploadFileApi) ---
// ... (These functions remain the same as in the previous version) ...
const fetchDashboardPageContentFromAPI = async (): Promise<DashboardPageContentData | null> => {
  console.log("Fetching user dashboard page content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/user-dashboard`);
    if (!response.ok) {
      console.warn(`Failed to fetch User Dashboard content from API. Status: ${response.status}`);
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data === 'object' && data !== null && data.guidanceSection) {
      console.log("Successfully fetched User Dashboard content from API.");
      return data;
    } else {
      console.warn("API returned data not in the expected DashboardPageContentData format, or it was empty/null.");
      return null;
    }
  } catch (error) {
    console.error("Network or JSON parsing error during fetchDashboardPageContentFromAPI:", error);
    throw error;
  }
};

const saveDashboardPageContentToAPI = async (content: DashboardPageContentData): Promise<DashboardPageContentData> => {
  console.log("Saving user dashboard page content to API:", content);
  const token = localStorage.getItem('token');
  // Prepare data: if videoUrl is an empty string, consider removing it or setting to null based on backend preference
  const contentToSaveCleaned = JSON.parse(JSON.stringify(content)); // Deep clone
  if (contentToSaveCleaned.guidanceSection && contentToSaveCleaned.guidanceSection.videoUrl === "") {
    delete contentToSaveCleaned.guidanceSection.videoUrl; // Or set to null: contentToSaveCleaned.guidanceSection.videoUrl = null;
  }
  const { _id, identifier, createdAt, updatedAt, ...finalDataToSave } = contentToSaveCleaned;


  const response = await fetch(`${API_BASE_URL}/content/user-dashboard`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(finalDataToSave),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save User Dashboard content" }));
    throw new Error(errorData.message || "Failed to save User Dashboard content");
  }
  return response.json();
};

const uploadFileApi = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');

  console.log('[UPLOAD] Attempting to upload. Token from localStorage:', token);

  if (!token) {
    console.error('[UPLOAD] No token found in localStorage. Admin might not be logged in or token key is wrong.');
    // Optionally, you could throw an error here or alert the user
    // throw new Error("Authentication token not found. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload file" }));
    throw new Error(errorData.message || "Failed to upload file");
  }
  return response.json();
};


// --- FALLBACK/INITIAL DATA ---
const getInitialDashboardPageData = (): DashboardPageContentData => ({
  guidanceSection: {
    title: "Get Started Smoothly!",
    description: "New to the platform or need a quick tour? Our guide video will walk you through everything.",
    buttonText: "Watch Platform Guide",
    videoUrl: "", // Initialize as empty string for controlled input, will be undefined if not set by API
  },
});

const AdminUserDashboardPageContentEditor: React.FC = () => {
  const [content, setContent] = useState<DashboardPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [guidanceVideoFile, setGuidanceVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const guidanceVideoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        let fetchedContent = await fetchDashboardPageContentFromAPI();
        if (fetchedContent) {
          // Ensure guidanceSection.videoUrl is at least an empty string for controlled input
          if (fetchedContent.guidanceSection && typeof fetchedContent.guidanceSection.videoUrl === 'undefined') {
            fetchedContent.guidanceSection.videoUrl = "";
          }
          setContent(fetchedContent);
        } else {
          console.warn("API returned null for dashboard content, using initial fallback data.");
          setContent(getInitialDashboardPageData());
        }
      } catch (err) {
        console.error("Error loading dashboard content:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during loading. Using fallback data.");
        setContent(getInitialDashboardPageData());
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (path: string, value: any) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = path.split('.');
        let newContent = JSON.parse(JSON.stringify(prev));
        let currentLevel: any = newContent;
        for (let i = 0; i < keys.length; i++) {
            const keyPart = keys[i];
            if (i === keys.length - 1) {
                currentLevel[keyPart] = value;
            } else {
                if (!currentLevel[keyPart] || typeof currentLevel[keyPart] !== 'object') {
                     currentLevel[keyPart] = {};
                }
                currentLevel = currentLevel[keyPart];
            }
        }
        return newContent;
    });
  };

  const handleGuidanceVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (event.target.files && event.target.files[0]) {
      setGuidanceVideoFile(event.target.files[0]);
      // When a file is selected, we anticipate it will replace any manual URL upon upload.
      // No need to clear videoUrl here; upload will overwrite it.
    } else {
      setGuidanceVideoFile(null);
    }
  };

  const handleGuidanceVideoUpload = async () => {
    if (!guidanceVideoFile) {
      setError("Please select a video file to upload.");
      return;
    }
    setIsUploadingVideo(true);
    clearMessages();
    try {
      const uploadResponse = await uploadFileApi(guidanceVideoFile);
      handleInputChange('guidanceSection.videoUrl', uploadResponse.url);
      setSuccessMessage("Guidance video uploaded. Its URL is now set. Save all changes to persist.");
      setGuidanceVideoFile(null);
      if (guidanceVideoFileInputRef.current) {
        guidanceVideoFileInputRef.current.value = "";
      }
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload guidance video";
      setError(errorMessage);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRemoveVideoUrl = () => {
    clearMessages();
    handleInputChange('guidanceSection.videoUrl', ''); // Set to empty string
    setGuidanceVideoFile(null); // Also clear any selected file
    if(guidanceVideoFileInputRef.current) guidanceVideoFileInputRef.current.value = "";
    setSuccessMessage("Video URL and selected file (if any) cleared. Save changes to persist.");
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) {
      setError("No content to save.");
      return;
    }
    setIsSaving(true);
    clearMessages();
    try {
      // The saveDashboardPageContentToAPI function will handle cleaning up empty videoUrl
      const savedContent = await saveDashboardPageContentToAPI(content);
      // Ensure videoUrl is an empty string if undefined after save, for controlled input
      if (savedContent.guidanceSection && typeof savedContent.guidanceSection.videoUrl === 'undefined') {
        savedContent.guidanceSection.videoUrl = "";
      }
      setContent(savedContent);
      setSuccessMessage("User Dashboard page content saved successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading User Dashboard Page editor...</div>;
  
  if (!content && error && !isLoading) { 
      return (
        <div className="container mx-auto p-4 md:p-6 space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit User Dashboard Page</h1>
            <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0"/>
                <span>Critical Error: {error}. Unable to initialize editor.</span>
            </div>
        </div>
      );
  }
  if (!content) return <div className="p-6 text-center">Content is not available. Please try refreshing.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit User Dashboard Page Content</h1>
        {successMessage && (
          <div role="alert" className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-md text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0"/>
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Guidance Video Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="guidanceTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <Input 
                id="guidanceTitle" 
                value={content.guidanceSection.title} 
                onChange={(e) => handleInputChange('guidanceSection.title', e.target.value)} 
              />
            </div>
            <div>
              <label htmlFor="guidanceDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description Text</label>
              <Textarea 
                id="guidanceDescription" 
                value={content.guidanceSection.description} 
                onChange={(e) => handleInputChange('guidanceSection.description', e.target.value)} 
                rows={3} 
              />
            </div>
            <div>
              <label htmlFor="guidanceButtonText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
              <Input 
                id="guidanceButtonText" 
                value={content.guidanceSection.buttonText} 
                onChange={(e) => handleInputChange('guidanceSection.buttonText', e.target.value)} 
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 pt-2">Guidance Video (Optional)</h3>
                {/* Video Upload Section */}
                <div className="space-y-1">
                  <label htmlFor="guidanceVideoFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Video File
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="guidanceVideoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleGuidanceVideoFileChange}
                      ref={guidanceVideoFileInputRef}
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={handleGuidanceVideoUpload} 
                      disabled={!guidanceVideoFile || isUploadingVideo} 
                      size="sm"
                    >
                      {isUploadingVideo ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Video</>}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Uploading a video will set its URL below. Max file size depends on server configuration.
                  </p>
                </div>

                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 my-2">
                    <span className="px-2">OR</span>
                </div>

                {/* Manual Video URL Input */}
                <div className="space-y-1">
                  <label htmlFor="guidanceVideoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter External Video URL
                  </label>
                  <Input 
                    id="guidanceVideoUrl" 
                    type="url"
                    value={content.guidanceSection.videoUrl || ""} // Ensure controlled input
                    onChange={(e) => {
                      handleInputChange('guidanceSection.videoUrl', e.target.value);
                      if (guidanceVideoFileInputRef.current) guidanceVideoFileInputRef.current.value = "";
                      setGuidanceVideoFile(null);
                    }}
                    placeholder="e.g., https://www.youtube.com/embed/your_video_id"
                  />
                </div>

                {/* Display current video URL and remove button */}
                {(content.guidanceSection.videoUrl || guidanceVideoFile) && (
                     <div className="mt-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                        {content.guidanceSection.videoUrl && !guidanceVideoFile && (
                             <div className="flex items-center justify-between gap-2">
                                <div className='flex items-center gap-2 min-w-0'>
                                    <Video className="h-5 w-5 text-blue-500 flex-shrink-0"/>
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                        Current Video URL: {content.guidanceSection.videoUrl}
                                    </span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleRemoveVideoUrl}
                                    className="text-red-500 hover:text-red-700 h-7 w-7 flex-shrink-0"
                                    aria-label="Remove video URL"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                        {guidanceVideoFile && (
                             <div className="flex items-center justify-between gap-2">
                                <div className='flex items-center gap-2 min-w-0'>
                                    <Video className="h-5 w-5 text-green-500 flex-shrink-0"/>
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                        Selected file for upload: {guidanceVideoFile.name} 
                                        {content.guidanceSection.videoUrl ? " (will replace current URL upon successful upload)" : ""}
                                    </span>
                                </div>
                               {/* Optionally show a remove button for selected file too */}
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                        setGuidanceVideoFile(null);
                                        if(guidanceVideoFileInputRef.current) guidanceVideoFileInputRef.current.value = "";
                                        clearMessages();
                                    }}
                                    className="text-red-500 hover:text-red-700 h-7 w-7 flex-shrink-0"
                                    aria-label="Clear selected file"
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                        {!content.guidanceSection.videoUrl && !guidanceVideoFile && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">No video URL set or file selected.</p>
                        )}
                    </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave both empty if no guidance video is needed. If a video is uploaded, its URL will be used.
                </p>
            </div>


          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" size="lg" disabled={isSaving || isLoading || isUploadingVideo}>
            {isSaving ? 'Saving...' : (isUploadingVideo ? 'Uploading Video...' : 'Save Dashboard Content')}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminUserDashboardPageContentEditor;