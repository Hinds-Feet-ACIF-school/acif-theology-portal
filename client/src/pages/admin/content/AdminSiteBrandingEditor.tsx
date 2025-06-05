// src/pages/admin/content/AdminSiteBrandingEditor.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { CheckCircle, AlertCircle, UploadCloud, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { cn } from "../../../lib/utils";

import { SiteBrandingContentData } from '../../../types/siteBrandingContentTypes'; // Updated type import

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Functions
const fetchSiteBrandingContentFromAPI = async (): Promise<SiteBrandingContentData | null> => {
  console.log("Fetching site branding content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/site-branding`); // Updated endpoint
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return (data && data.header && data.footer) ? data : null;
  } catch (error) {
    console.error("Error fetching site branding content:", error);
    throw error;
  }
};

const saveSiteBrandingContentToAPI = async (content: SiteBrandingContentData): Promise<SiteBrandingContentData> => {
  console.log("Saving site branding content to API:", content);
  const token = localStorage.getItem('token'); // Standardized key
  
  const contentToSaveCleaned = JSON.parse(JSON.stringify(content));
  if (contentToSaveCleaned.header && contentToSaveCleaned.header.hasOwnProperty('siteLogoUrl') && contentToSaveCleaned.header.siteLogoUrl === "") {
    delete contentToSaveCleaned.header.siteLogoUrl;
  }
  if (contentToSaveCleaned.footer && contentToSaveCleaned.footer.hasOwnProperty('footerLogoUrl') && contentToSaveCleaned.footer.footerLogoUrl === "") {
    delete contentToSaveCleaned.footer.footerLogoUrl;
  }
  const { _id, identifier, createdAt, updatedAt, ...finalDataToSave } = contentToSaveCleaned;

  const response = await fetch(`${API_BASE_URL}/content/site-branding`, { // Updated endpoint
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(finalDataToSave),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save site branding content" }));
    throw new Error(errorData.message || "Failed to save site branding content");
  }
  return response.json();
};

const uploadFileApi = async (file: File): Promise<{ url: string }> => {
  // ... (uploadFileApi remains the same, ensure token key is correct: 'adminAuthToken')
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token'); 
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST', body: formData,
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload file" }));
    throw new Error(errorData.message || "Failed to upload file");
  }
  return response.json();
};

const getInitialSiteBrandingData = (): SiteBrandingContentData => ({
  header: {
    siteName: "Apostolic Theology",
    siteLogoUrl: "",
  },
  footer: {
    footerSiteName: "Apostolic Theology",
    copyrightText: "International Apostolic Church",
    tagline: '"Study to shew thyself approved unto God..." - 2 Timothy 2:15',
    footerLogoUrl: "",
  }
});

const AdminSiteBrandingEditor: React.FC = () => {
  const [content, setContent] = useState<SiteBrandingContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // ... (isSaving, error, successMessage states remain)
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // States for Header Logo
  const [headerLogoFile, setHeaderLogoFile] = useState<File | null>(null);
  const [isUploadingHeaderLogo, setIsUploadingHeaderLogo] = useState(false);
  const headerLogoFileInputRef = useRef<HTMLInputElement>(null);

  // States for Footer Logo
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false);
  const footerLogoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true); setError(null); setSuccessMessage(null);
      try {
        let fetched = await fetchSiteBrandingContentFromAPI();
        if (fetched) {
          // Ensure optional URLs are initialized as empty strings for controlled inputs
          if (!fetched.header) fetched.header = { siteName: "", siteLogoUrl: ""};
          else if (typeof fetched.header.siteLogoUrl === 'undefined') fetched.header.siteLogoUrl = "";
          
          if (!fetched.footer) fetched.footer = { footerSiteName: "", copyrightText: "", tagline: "", footerLogoUrl: ""};
          else if (typeof fetched.footer.footerLogoUrl === 'undefined') fetched.footer.footerLogoUrl = "";
          
          setContent(fetched);
        } else {
          setContent(getInitialSiteBrandingData());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown load error");
        setContent(getInitialSiteBrandingData());
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const clearMessages = () => { setError(null); setSuccessMessage(null); };

  const handleNestedInputChange = (section: 'header' | 'footer', field: string, value: string) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return getInitialSiteBrandingData();
        return {
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            }
        }
    });
  };
  
  // --- Header Logo Handlers ---
  const handleHeaderLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (event.target.files && event.target.files[0]) setHeaderLogoFile(event.target.files[0]);
    else setHeaderLogoFile(null);
  };
  const handleHeaderLogoUpload = async () => {
    if (!headerLogoFile) { setError("Please select a header logo file."); return; }
    setIsUploadingHeaderLogo(true); clearMessages();
    try {
      const res = await uploadFileApi(headerLogoFile);
      handleNestedInputChange('header', 'siteLogoUrl', res.url);
      setSuccessMessage("Header logo uploaded. Save changes to persist.");
      setHeaderLogoFile(null);
      if (headerLogoFileInputRef.current) headerLogoFileInputRef.current.value = "";
    } catch (err) { setError(err instanceof Error ? err.message : "Header logo upload failed");
    } finally { setIsUploadingHeaderLogo(false); }
  };
  const handleRemoveHeaderLogo = () => {
    clearMessages();
    handleNestedInputChange('header', 'siteLogoUrl', "");
    setSuccessMessage("Header logo removed. Save changes to persist.");
  };

  // --- Footer Logo Handlers ---
  const handleFooterLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (event.target.files && event.target.files[0]) setFooterLogoFile(event.target.files[0]);
    else setFooterLogoFile(null);
  };
  const handleFooterLogoUpload = async () => {
    if (!footerLogoFile) { setError("Please select a footer logo file."); return; }
    setIsUploadingFooterLogo(true); clearMessages();
    try {
      const res = await uploadFileApi(footerLogoFile);
      handleNestedInputChange('footer', 'footerLogoUrl', res.url);
      setSuccessMessage("Footer logo uploaded. Save changes to persist.");
      setFooterLogoFile(null);
      if (footerLogoFileInputRef.current) footerLogoFileInputRef.current.value = "";
    } catch (err) { setError(err instanceof Error ? err.message : "Footer logo upload failed");
    } finally { setIsUploadingFooterLogo(false); }
  };
  const handleRemoveFooterLogo = () => {
    clearMessages();
    handleNestedInputChange('footer', 'footerLogoUrl', "");
    setSuccessMessage("Footer logo removed. Save changes to persist.");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) { setError("No content to save."); return; }
    setIsSaving(true); clearMessages();
    try {
      let saved = await saveSiteBrandingContentToAPI(content);
      // Ensure optional URLs are empty strings if undefined
      if (!saved.header) saved.header = { siteName: "", siteLogoUrl: ""};
      else if (typeof saved.header.siteLogoUrl === 'undefined') saved.header.siteLogoUrl = "";
      if (!saved.footer) saved.footer = { footerSiteName: "", copyrightText: "", tagline: "", footerLogoUrl: ""};
      else if (typeof saved.footer.footerLogoUrl === 'undefined') saved.footer.footerLogoUrl = "";
      setContent(saved);
      setSuccessMessage("Site branding content saved successfully!");
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed");
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="p-6 text-center">Loading Site Branding Editor...</div>;
  // ... (Error and loading conditional rendering as before)
  if (!content) return <div className="p-6 text-center">Content data is not available. Please try refreshing the page.</div>;


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Site Branding (Header & Footer)</h1>
        {successMessage && (  <div role="alert" className={cn("mb-6 p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700")}>
                <div className="flex items-center gap-2"> <CheckCircle className="h-5 w-5 shrink-0"/> <span>{successMessage}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div> )}
        {error && (  <div role="alert" className={cn("mb-6 p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700")}>
                <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>{error}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div> )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section Card */}
        <Card>
          <CardHeader><CardTitle>Header Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="headerSiteName" className="block text-sm font-medium mb-1">Site Name (Header)</label>
              <Input id="headerSiteName" value={content.header.siteName} onChange={(e) => handleNestedInputChange('header', 'siteName', e.target.value)} />
            </div>
            <div className="space-y-3 pt-4 border-t mt-4">
                <h3 className="text-md font-semibold">Header Logo (Main Site Logo)</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                        {(content.header.siteLogoUrl || headerLogoFile) ? (
                            <img src={headerLogoFile ? URL.createObjectURL(headerLogoFile) : (content.header.siteLogoUrl || '')} alt="Header Logo Preview" className="h-16 w-16 rounded-md object-contain border p-1"/>
                        ) : <div className="h-16 w-16 rounded-md border p-1 flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>}
                    </div>
                    {/* Upload */}
                    <div className="flex-grow space-y-2">
                        <Input id="headerSiteLogoFile" type="file" accept="image/*,.svg" onChange={handleHeaderLogoFileChange} ref={headerLogoFileInputRef} />
                        <Button type="button" onClick={handleHeaderLogoUpload} disabled={!headerLogoFile || isUploadingHeaderLogo} size="sm" className="w-full sm:w-auto">
                            {isUploadingHeaderLogo ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Header Logo</>}
                        </Button>
                    </div>
                </div>
                {content.header.siteLogoUrl && (
                    <Button type="button" variant="link" size="sm" onClick={handleRemoveHeaderLogo} className="text-red-500 p-0 h-auto mt-1">
                        <Trash2 className="mr-1 h-3 w-3"/> Remove Current Header Logo
                    </Button>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Section Card */}
        <Card>
          <CardHeader><CardTitle>Footer Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="footerSiteName" className="block text-sm font-medium mb-1">Site Name (Footer)</label>
              <Input id="footerSiteName" value={content.footer.footerSiteName} onChange={(e) => handleNestedInputChange('footer', 'footerSiteName', e.target.value)} />
            </div>
            <div>
              <label htmlFor="copyrightText" className="block text-sm font-medium mb-1">Copyright Holder Text</label>
              <Input id="copyrightText" value={content.footer.copyrightText} onChange={(e) => handleNestedInputChange('footer', 'copyrightText', e.target.value)} placeholder="e.g., International Apostolic Church" />
            </div>
            <div>
              <label htmlFor="tagline" className="block text-sm font-medium mb-1">Tagline / Quote (Footer)</label>
              <Input id="tagline" value={content.footer.tagline} onChange={(e) => handleNestedInputChange('footer', 'tagline', e.target.value)} />
            </div>
             <div className="space-y-3 pt-4 border-t mt-4">
                <h3 className="text-md font-semibold">Footer Logo (Optional)</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     {/* Preview */}
                    <div className="flex-shrink-0">
                        {(content.footer.footerLogoUrl || footerLogoFile) ? (
                            <img src={footerLogoFile ? URL.createObjectURL(footerLogoFile) : (content.footer.footerLogoUrl || '')} alt="Footer Logo Preview" className="h-16 w-16 rounded-md object-contain border p-1"/>
                        ) : <div className="h-16 w-16 rounded-md border p-1 flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>}
                    </div>
                    {/* Upload */}
                     <div className="flex-grow space-y-2">
                        <Input id="footerLogoFile" type="file" accept="image/*,.svg" onChange={handleFooterLogoFileChange} ref={footerLogoFileInputRef}/>
                        <Button type="button" onClick={handleFooterLogoUpload} disabled={!footerLogoFile || isUploadingFooterLogo} size="sm" className="w-full sm:w-auto">
                            {isUploadingFooterLogo ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Footer Logo</>}
                        </Button>
                    </div>
                </div>
                {content.footer.footerLogoUrl && (
                    <Button type="button" variant="link" size="sm" onClick={handleRemoveFooterLogo} className="text-red-500 p-0 h-auto mt-1">
                        <Trash2 className="mr-1 h-3 w-3"/> Remove Current Footer Logo
                    </Button>
                )}
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t">
          <Button type="submit" size="lg" disabled={isSaving || isLoading || isUploadingHeaderLogo || isUploadingFooterLogo}>
            {isSaving ? 'Saving...' : (isUploadingHeaderLogo || isUploadingFooterLogo ? 'Processing Logo...' : 'Save Site Branding')}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminSiteBrandingEditor;