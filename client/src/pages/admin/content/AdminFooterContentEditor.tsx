// src/pages/admin/content/AdminFooterContentEditor.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
// import { Textarea } from '../../../components/ui/textarea'; // Textarea not strictly needed for current fields
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { CheckCircle, AlertCircle, UploadCloud, Image as ImageIcon, Trash2, X } from 'lucide-react'; // Added X for close button
import { cn } from "../../../lib/utils"; // Assuming you have a utility for cn

import { FooterContentData } from '../../../types/footerContentTypes'; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Functions (fetch, save, upload)
const fetchFooterContentFromAPI = async (): Promise<FooterContentData | null> => {
  console.log("Fetching footer content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/footer`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const data = await response.json();
    // Basic validation: check if at least siteName exists, indicating valid data structure
    return (data && data.siteName !== undefined) ? data : null;
  } catch (error) {
    console.error("Error fetching footer content:", error);
    throw error; // Re-throw to be caught by useEffect
  }
};

const saveFooterContentToAPI = async (content: FooterContentData): Promise<FooterContentData> => {
  console.log("Saving footer content to API:", content);
  const token = localStorage.getItem('token'); // Ensure this key is correct
  
  // Create a deep copy to modify before sending
  const contentToSaveCleaned = JSON.parse(JSON.stringify(content));

  // If logoUrl is an empty string, remove the property before saving
  // This ensures that if a logo is removed, the field is not saved as ""
  if (contentToSaveCleaned.hasOwnProperty('logoUrl') && contentToSaveCleaned.logoUrl === "") {
    delete contentToSaveCleaned.logoUrl;
  }
  
  const { _id, identifier, createdAt, updatedAt, ...finalDataToSave } = contentToSaveCleaned;

  const response = await fetch(`${API_BASE_URL}/content/footer`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(finalDataToSave),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save footer content" }));
    throw new Error(errorData.message || "Failed to save footer content");
  }
  return response.json();
};

const uploadFileApi = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token'); // Ensure this key is correct
  const response = await fetch(`${API_BASE_URL}/upload`, { // Make sure this endpoint exists and is configured
    method: 'POST', body: formData,
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload file" }));
    throw new Error(errorData.message || "Failed to upload file");
  }
  return response.json();
};

const getInitialFooterData = (): FooterContentData => ({
  siteName: "Apostolic Theology",
  copyrightText: "International Apostolic Church. All rights reserved.",
  tagline: '"Study to shew thyself approved unto God..." - 2 Timothy 2:15',
  logoUrl: "", // Initialize as empty string for controlled input behavior
});

const AdminFooterContentEditor: React.FC = () => {
  const [content, setContent] = useState<FooterContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true); setError(null); setSuccessMessage(null);
      try {
        let fetched = await fetchFooterContentFromAPI();
        if (fetched) {
          // Ensure logoUrl is an empty string if undefined for controlled input
          if (typeof fetched.logoUrl === 'undefined') {
            fetched.logoUrl = "";
          }
          setContent(fetched);
        } else {
          console.warn("API returned null for footer content, using initial fallback data.");
          setContent(getInitialFooterData());
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while loading footer content.";
        setError(errorMessage);
        console.error("Error loading footer content in useEffect:", err);
        setContent(getInitialFooterData()); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const clearMessages = () => { setError(null); setSuccessMessage(null); };

  const handleInputChange = (
    field: keyof Omit<FooterContentData, '_id' | 'identifier' | 'createdAt' | 'updatedAt' | 'logoUrl'>, 
    value: string
  ) => {
    clearMessages();
    setContent(prev => prev ? { ...prev, [field]: value } : getInitialFooterData()); // Fallback if prev is null
  };
  
  const handleLogoUrlChange = (value: string) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return getInitialFooterData(); // Should not happen if loaded
        return { ...prev, logoUrl: value };
    });
    // If a URL is manually set or cleared, reset the file input and selected file state
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    setLogoFile(null);
  }

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
      // When a file is selected, it implies intent to use it.
      // You could clear the manual URL here, or let the upload action overwrite it.
      // For now, let's not auto-clear manual URL on file selection, upload will confirm.
    } else {
      setLogoFile(null);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) { setError("Please select a logo file to upload."); return; }
    setIsUploadingLogo(true); clearMessages();
    try {
      const res = await uploadFileApi(logoFile);
      handleLogoUrlChange(res.url); // This updates content.logoUrl and clears file input
      setSuccessMessage("Logo uploaded successfully. Its URL is now set. Remember to save all changes.");
      // setLogoFile(null); // Already handled by handleLogoUrlChange calling setLogoFile(null)
      // if (logoFileInputRef.current) logoFileInputRef.current.value = ""; // Also handled
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logo upload failed";
      setError(errorMessage);
    } finally {
      setIsUploadingLogo(false);
    }
  };
  
  const handleRemoveLogo = () => {
    handleLogoUrlChange(""); // Sets logoUrl to empty string, clears file input and selected file
    setSuccessMessage("Current logo URL cleared. Save changes to make it permanent.");
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) { setError("No content data available to save."); return; }
    setIsSaving(true); clearMessages();
    try {
      const saved = await saveFooterContentToAPI(content);
      // Ensure logoUrl is an empty string if undefined after save, for controlled input
      if (saved.logoUrl === undefined) {
          saved.logoUrl = "";
      }
      setContent(saved);
      setSuccessMessage("Footer content saved successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save footer content";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading Footer Editor...</div>;
  
  if (!content && error && !isLoading) {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Footer Content</h1>
            <div role="alert" className={cn("p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700")}>
                <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>Critical Error: {error}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>
        </div>
      );
  }
  if (!content) return <div className="p-6 text-center">Content data is not available. Please try refreshing the page.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Footer Content</h1>
        {successMessage &&  
         <div role="alert" className={cn("p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700")}>
                <div className="flex items-center gap-2"> <CheckCircle className="h-5 w-5 shrink-0"/> <span>{successMessage}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>}
        {error &&  (
            <div role="alert" className={cn("p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700")}>
                <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>{error}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Footer Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name (Brand)</label>
              <Input id="siteName" value={content.siteName} onChange={(e) => handleInputChange('siteName', e.target.value)} />
            </div>
            <div>
              <label htmlFor="copyrightText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text (Main Holder)</label>
              <Input 
                id="copyrightText" 
                value={content.copyrightText} 
                onChange={(e) => handleInputChange('copyrightText', e.target.value)} 
                placeholder="e.g., International Apostolic Church"
              />
            </div>
            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline / Quote</label>
              <Input 
                id="tagline" 
                value={content.tagline} 
                onChange={(e) => handleInputChange('tagline', e.target.value)} 
                placeholder="e.g., Study to shew thyself approved..."
              />
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Footer Logo (Optional)</h3>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0">
                        {(content.logoUrl || logoFile) ? (
                            <img 
                                src={logoFile ? URL.createObjectURL(logoFile) : content.logoUrl} 
                                alt="Logo Preview" 
                                className="h-16 w-16 rounded-md object-contain border p-1 bg-gray-100 dark:bg-gray-700"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-md border p-1 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <ImageIcon size={24}/>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow space-y-2">
                        <Input
                          id="footerLogoFile" type="file" accept="image/*,.svg" // Added SVG
                          onChange={handleLogoFileChange} ref={logoFileInputRef}
                        />
                        <Button 
                            type="button" 
                            onClick={handleLogoUpload} 
                            disabled={!logoFile || isUploadingLogo} 
                            size="sm" 
                            className="w-full sm:w-auto"
                        >
                          {isUploadingLogo ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Selected Logo</>}
                        </Button>
                    </div>
                 </div>
                 {content.logoUrl && ( // Show remove button only if a URL is currently set
                    <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        onClick={handleRemoveLogo} 
                        className="text-red-500 hover:text-red-600 p-0 h-auto mt-1 flex items-center gap-1"
                    >
                        <Trash2 className="h-3.5 w-3.5"/> Remove Current Logo & URL
                    </Button>
                 )}
                 <p className="text-xs text-gray-500 dark:text-gray-400">Upload a small logo for the footer. If no logo is provided, a default might be used or it can be omitted.</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                Note: Navigation links (About Us, Contact, Privacy, Terms) are typically managed directly in the Footer component's code for structural consistency.
            </p>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" size="lg" disabled={isSaving || isLoading || isUploadingLogo}>
            {isSaving ? 'Saving...' : (isUploadingLogo ? 'Processing Logo...' : 'Save Footer Content')}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminFooterContentEditor;