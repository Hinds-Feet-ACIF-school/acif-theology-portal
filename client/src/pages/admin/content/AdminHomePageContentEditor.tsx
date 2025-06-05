import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { PlusCircle, Trash2, UploadCloud, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { toast } from "sonner"; // Optionally remove if completely replacing with inline messages
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";


interface HighlightItem {
  id: string;
  text: string;
}

interface OutcomeItem {
  id: string;
  text: string;
}

export interface HomePageContentData {
  _id?: string;
  identifier?: string;
  hero: {
    logoUrl?: string;
    title: string;
    subtitle: string;
  };
  programHighlights: {
    title: string;
    description: string;
    items: HighlightItem[];
  };
  learningOutcomes: {
    title: string;
    description: string;
    items: OutcomeItem[];
  };
  cta: {
    unauthenticated: {
      title: string;
      description: string;
      investmentLabel: string;
      investmentValueUSD?: string;
      investmentValueETB?: string;
      investmentNote: string;
    };
    authenticated: {
      title: string;
      description: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fetchHomePageContent = async (): Promise<HomePageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/home`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch content" }));
    throw new Error(errorData.message || "Failed to fetch content");
  }
  return response.json();
};

const saveHomePageContent = async (content: HomePageContentData): Promise<HomePageContentData> => {
  const { _id, identifier, createdAt, updatedAt, ...saveData } = content;
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/content/home`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(saveData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save content" }));
    throw new Error(errorData.message || "Failed to save content");
  }
  return response.json();
};


const uploadImageApi = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload image" }));
    throw new Error(errorData.message || "Failed to upload image");
  }
  return response.json();
};


const AdminHomePageContentEditor: React.FC = () => {
  const [content, setContent] = useState<HomePageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // ADDED
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const fetchedContent = await fetchHomePageContent();
        setContent(fetchedContent);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        // Optionally use sonner for initial load error, or rely on the inline error display
        // toast.error("Error Loading Content", { description: errorMessage });
        console.error(err);
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

  const handleInputChange = (section: keyof Omit<HomePageContentData, '_id' | 'identifier' | 'createdAt' | 'updatedAt' | 'hero'> | 'hero', field: string, value: string | undefined) => {
    clearMessages();
    setContent(prev => {
      if (!prev) return null;
      const keys = field.split('.');
      if (keys.length > 1 && section === 'cta') {
         return {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [keys[0]]: {
              ...((prev[section]as any)[keys[0]]),
              [keys[1]]: value,
            }
          }
        };
      } else if (section === 'hero' && keys.length === 1) {
        return {
          ...prev,
          hero: {
            ...prev.hero,
            [field]: value,
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        }
      };
    });
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setError("Please select a logo image to upload.");
      // toast.warning("No file selected", { description: "Please select a logo image to upload." });
      return;
    }
    setIsUploadingLogo(true);
    clearMessages();
    try {
      const uploadResponse = await uploadImageApi(logoFile);
      setContent(prev => prev ? { ...prev, hero: { ...prev.hero, logoUrl: uploadResponse.url } } : null);
      setSuccessMessage("Logo image updated successfully. Remember to save all changes to persist this.");
      // toast.success("Logo Uploaded", { description: "Logo image updated successfully. Remember to save all changes." });
      setLogoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload logo";
      setError(errorMessage);
      // toast.error("Logo Upload Failed", { description: errorMessage });
      console.error("Logo upload error:", uploadError);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleListItemChange = (
    section: 'programHighlights' | 'learningOutcomes',
    index: number,
    value: string
  ) => {
    clearMessages();
    setContent(prev => {
      if (!prev) return null;
      const items = [...prev[section].items];
      items[index] = { ...items[index], text: value };
      return {
        ...prev,
        [section]: {
          ...prev[section],
          items,
        }
      };
    });
  };

  const addListItem = (section: 'programHighlights' | 'learningOutcomes') => {
    clearMessages();
    setContent(prev => {
      if (!prev) return null;
      const newItem = { id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: "" };
      return {
        ...prev,
        [section]: {
          ...prev[section],
          items: [...prev[section].items, newItem],
        }
      };
    });
  };

  const confirmRemoveListItem = (section: 'programHighlights' | 'learningOutcomes', index: number) => {
    clearMessages();
    setContent(prev => {
      if (!prev) return null;
      const items = prev[section].items.filter((_, i) => i !== index);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          items,
        }
      };
    });
    setSuccessMessage(`${section === 'programHighlights' ? 'Highlight' : 'Outcome'} item removed. Save to persist.`);
    // toast.info("Item Removed", { description: `${section === 'programHighlights' ? 'Highlight' : 'Outcome'} item removed successfully.`, });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    clearMessages();
    try {
      const saved = await saveHomePageContent(content);
      setContent(saved);
      setSuccessMessage("Home page content has been successfully updated.");
      // toast.success("Content Saved", {
      //   description: "Home page content has been successfully updated.",
      //   icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      // });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred saving content";
      setError(errorMessage);
      // toast.error("Save Failed", {
      //   description: errorMessage,
      //   icon: <XCircle className="h-5 w-5 text-red-500" />,
      // });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading content editor...</div>;
  // Error during initial load will be handled by the inline error message below.
  if (!content && error) return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Home Page Content</h1>
        <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>Error loading content: {error}. Try refreshing. If the issue persists, initial content might need to be set up.</span>
        </div>
    </div>
  );
  if (!content) return <div className="p-6 text-center">No content data found. Please ensure the backend is running and has initial data or try refreshing.</div>;


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2"> {/* Container for heading and messages */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Home Page Content</h1>
        {successMessage && (
          <div role="alert" className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-md text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0"/>
            <span>{successMessage}</span>
          </div>
        )}
        {error && ( // This will show errors from save, upload etc.
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>{error}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>The main introductory content of the home page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="heroLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo Image
              </label>
              <div className="flex items-center gap-4">
                {content.hero.logoUrl && (
                  <img src={content.hero.logoUrl} alt="Current Logo" className="h-16 w-16 rounded-md object-contain border p-1" />
                )}
                <Input
                  id="heroLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  ref={fileInputRef}
                  className="flex-grow"
                />
                <Button type="button" onClick={handleLogoUpload} disabled={!logoFile || isUploadingLogo} size="sm">
                  {isUploadingLogo ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Logo</>}
                </Button>
              </div>
              {content.hero.logoUrl && (
                 <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-red-500 p-0 h-auto mt-1"
                    onClick={() => handleInputChange('hero', 'logoUrl', undefined)}
                  >
                    Remove Logo
                  </Button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload a new logo for the hero section. Recommended size: 128x128px.
              </p>
            </div>
            <div>
              <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <Input id="heroTitle" value={content.hero.title} onChange={e => handleInputChange('hero', 'title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <Textarea id="heroSubtitle" value={content.hero.subtitle} onChange={e => handleInputChange('hero', 'subtitle', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Highlights</CardTitle>
            <CardDescription>Key features of the program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="phTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <Input id="phTitle" value={content.programHighlights.title} onChange={e => handleInputChange('programHighlights', 'title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="phDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Description</label>
              <Textarea id="phDescription" value={content.programHighlights.description} onChange={e => handleInputChange('programHighlights', 'description', e.target.value)} rows={2} />
            </div>
            <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Highlight Items:</h4>
            {content.programHighlights.items.map((item, index) => (
              <div key={item.id || `ph-item-${index}`} className="flex items-center space-x-2 p-2 border dark:border-gray-700 rounded-md">
                <Input
                  value={item.text}
                  onChange={e => handleListItemChange('programHighlights', index, e.target.value)}
                  className="flex-grow"
                  placeholder={`Highlight ${index + 1}`}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove highlight">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the highlight item: "{item.text.substring(0,50)}{item.text.length > 50 ? '...' : ''}". Changes are not final until saved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={clearMessages}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmRemoveListItem('programHighlights', index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('programHighlights')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Highlight Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Outcomes</CardTitle>
            <CardDescription>What students will achieve.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="loTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <Input id="loTitle" value={content.learningOutcomes.title} onChange={e => handleInputChange('learningOutcomes', 'title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="loDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Description</label>
              <Textarea id="loDescription" value={content.learningOutcomes.description} onChange={e => handleInputChange('learningOutcomes', 'description', e.target.value)} rows={2} />
            </div>
            <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Outcome Items:</h4>
            {content.learningOutcomes.items.map((item, index) => (
              <div key={item.id || `lo-item-${index}`} className="flex items-center space-x-2 p-2 border dark:border-gray-700 rounded-md">
                <Textarea
                  value={item.text}
                  onChange={e => handleListItemChange('learningOutcomes', index, e.target.value)}
                  className="flex-grow"
                  placeholder={`Outcome ${index + 1}`}
                  rows={2}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove outcome">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                         This action cannot be undone. This will permanently delete the outcome item: "{item.text.substring(0,50)}{item.text.length > 50 ? '...' : ''}". Changes are not final until saved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={clearMessages}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmRemoveListItem('learningOutcomes', index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('learningOutcomes')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Outcome Item
            </Button>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Call to Action Section (Bottom)</CardTitle>
            <CardDescription>Content for authenticated and unauthenticated users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset className="border p-4 rounded-md dark:border-gray-600">
              <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">For Unauthenticated Users</legend>
              <div className="space-y-3 mt-2">
                <div>
                  <label htmlFor="ctaUnauthTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <Input id="ctaUnauthTitle" value={content.cta.unauthenticated.title} onChange={e => handleInputChange('cta', 'unauthenticated.title', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="ctaUnauthDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <Textarea id="ctaUnauthDesc" value={content.cta.unauthenticated.description} onChange={e => handleInputChange('cta', 'unauthenticated.description', e.target.value)} rows={2} />
                </div>
                <div>
                  <label htmlFor="ctaInvestLabel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Label</label>
                  <Input id="ctaInvestLabel" value={content.cta.unauthenticated.investmentLabel} onChange={e => handleInputChange('cta', 'unauthenticated.investmentLabel', e.target.value)} />
                </div>
                
                {/* MODIFIED AND ADDED INPUTS FOR USD AND ETB */}
                <div>
                  <label htmlFor="ctaInvestValueUSD" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Value (USD)
                  </label>
                  <Input 
                    id="ctaInvestValueUSD" 
                    value={content.cta.unauthenticated.investmentValueUSD || ''} // Use || '' to ensure controlled component
                    onChange={e => handleInputChange('cta', 'unauthenticated.investmentValueUSD', e.target.value)}
                    placeholder="$100 USD or 100" 
                  />
                </div>
                <div>
                  <label htmlFor="ctaInvestValueETB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Value (ETB)
                  </label>
                  <Input 
                    id="ctaInvestValueETB" 
                    value={content.cta.unauthenticated.investmentValueETB || ''} // Use || '' to ensure controlled component
                    onChange={e => handleInputChange('cta', 'unauthenticated.investmentValueETB', e.target.value)}
                    placeholder="5500 Birr or 5500 ETB"
                  />
               
                </div>
                {/* END OF MODIFICATION */}

                <div>
                  <label htmlFor="ctaInvestNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Note</label>
                  <Textarea id="ctaInvestNote" value={content.cta.unauthenticated.investmentNote} onChange={e => handleInputChange('cta', 'unauthenticated.investmentNote', e.target.value)} rows={2} />
                </div>
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md dark:border-gray-600">
              <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">For Authenticated Users</legend>
              <div className="space-y-3 mt-2">
                <div>
                  <label htmlFor="ctaAuthTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <Input id="ctaAuthTitle" value={content.cta.authenticated.title} onChange={e => handleInputChange('cta', 'authenticated.title', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="ctaAuthDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <Textarea id="ctaAuthDesc" value={content.cta.authenticated.description} onChange={e => handleInputChange('cta', 'authenticated.description', e.target.value)} rows={2} />
                </div>
              </div>
            </fieldset>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t">
          <Button type="submit" size="lg" disabled={isSaving || isLoading || isUploadingLogo}>
            {isSaving ? 'Saving...' : 'Save Home Page Content'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminHomePageContentEditor;