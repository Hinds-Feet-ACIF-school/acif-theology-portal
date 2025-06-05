// src/pages/admin/content/AdminAboutPageContentEditor.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { PlusCircle, Trash2, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';

import {
  AboutPageContentData,
  CoreValueItemData,
} from '../../../types/aboutPageContentTypes'; // Ensure this path is correct

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- REAL API FUNCTIONS ---
const fetchAboutPageContentFromAPI = async (): Promise<AboutPageContentData | null> => {
  console.log("Attempting to fetch About Us page content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/about`);
    if (!response.ok) {
      console.warn(`Failed to fetch About Us content from API. Status: ${response.status}`);
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data === 'object' && data !== null && data.hero?.title) {
      console.log("Successfully fetched About Us content from API.");
      return data;
    } else {
      console.warn("API returned data not in the expected AboutPageContentData format, or it was empty/null.");
      return null; // Or potentially return a default structure if that's desired
    }
  } catch (error) {
    console.error("Network or JSON parsing error during fetchAboutPageContentFromAPI:", error);
    // Propagate the error or return null to be handled by the caller
    throw error; // It's often better to let the caller handle UI for errors
  }
};

const saveAboutPageContentToAPI = async (content: AboutPageContentData): Promise<AboutPageContentData> => {
  console.log("Saving About Us page content to API:", content);
  const token = localStorage.getItem('token');
  const { _id, identifier, createdAt, updatedAt, ...contentToSave } = content;

  const response = await fetch(`${API_BASE_URL}/content/about`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(contentToSave),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save About Us content" }));
    throw new Error(errorData.message || "Failed to save About Us content");
  }
  return response.json();
};

// --- IMAGE UPLOAD API FUNCTION ---
const uploadImageApi = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload image" }));
    throw new Error(errorData.message || "Failed to upload image");
  }
  return response.json();
};


// --- FALLBACK/INITIAL DATA (if API fetch fails or returns null) ---
const getInitialAboutUsPageData = (): AboutPageContentData => ({
  hero: {
    logoUrl: "", // Default empty logo URL
    title: "About Our Program",
    subtitle: "Equipping believers for faithful understanding and service through theological education rooted in Apostolic and Evangelical traditions.",
  },
  missionVision: {
    missionTitle: "Our Mission",
    missionDescription: "To provide accessible, comprehensive, and spiritually enriching theological education that grounds students in the core doctrines of the Christian faith, emphasizes Apostolic distinctives, and equips them for effective ministry and personal growth within the context of the global Apostolic movement and the broader Evangelical world.",
    visionTitle: "Our Vision",
    visionDescription: "To be a leading online resource for theological training, fostering a global community of knowledgeable, passionate, and servant-hearted believers who faithfully interpret Scripture, articulate sound doctrine, live transformed lives, and effectively share the Gospel of Jesus Christ.",
  },
  coreValues: {
    title: "Our Core Values",
    items: [
      { id: "cv1", title: "Biblical Fidelity", desc: "Upholding the Bible as the inspired, infallible Word of God." },
      { id: "cv2", title: "Apostolic Foundation", desc: "Emphasizing the doctrines and practices taught by the Apostles." },
      { id: "cv3", title: "Doctrinal Clarity", desc: "Striving for accurate understanding and articulation of core Christian beliefs." },
      { id: "cv4", title: "Academic Rigor", desc: "Commitment to sound scholarship and critical thinking within a faith context." },
      { id: "cv5", title: "Community & Fellowship", desc: "Fostering interaction and support among students and instructors." },
      { id: "cv6", title: "Practical Application", desc: "Connecting theological knowledge to everyday life, ministry, and service." },
    ],
  },
  // cta: {} // CTA section removed
});


const AdminAboutPageContentEditor: React.FC = () => {
  const [content, setContent] = useState<AboutPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null);
  const [isUploadingHeroLogo, setIsUploadingHeroLogo] = useState(false);
  const heroLogoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const fetchedContentFromApi = await fetchAboutPageContentFromAPI();
        if (fetchedContentFromApi) {
          setContent(fetchedContentFromApi);
        } else {
          // This case might indicate an API issue or empty data from API,
          // but for robustness, we fall back to initial data.
          console.warn("API returned null or malformed data for About Us content, using initial fallback data.");
          setContent(getInitialAboutUsPageData());
        }
      } catch (err) {
        console.error("Error loading About Us content:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during loading. Using fallback data.");
        setContent(getInitialAboutUsPageData()); // Fallback to initial data on error
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
        const newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
        let currentLevel: any = newContent;

        for (let i = 0; i < keys.length; i++) {
            const keyPart = keys[i];
            // No array match needed here as About Us page structure doesn't have arrays directly at path keys
            // All arrays are nested like 'coreValues.items'

            if (i === keys.length - 1) { // Last key in path, assign value
                currentLevel[keyPart] = value;
            } else { // Navigate deeper
                if (!currentLevel[keyPart] || typeof currentLevel[keyPart] !== 'object') {
                     currentLevel[keyPart] = {}; // Create object if not exists or not an object
                }
                currentLevel = currentLevel[keyPart];
            }
        }
        return newContent;
    });
  };

  const handleListItemChange = (listPath: string, index: number, fieldKey: keyof CoreValueItemData, value: string) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = listPath.split('.'); // e.g., "coreValues.items"
        let newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
        
        let parentObject: any = newContent;
        // Navigate to the parent of the array
        for (let i = 0; i < keys.length -1; i++) {
            parentObject = parentObject[keys[i]];
            if (!parentObject || typeof parentObject !== 'object') {
                console.error("Invalid path in handleListItemChange (parent navigation)", listPath);
                return prev; // Path is invalid
            }
        }
        // Get the array itself
        const listName = keys[keys.length - 1];
        const currentArray = parentObject[listName];

        if (Array.isArray(currentArray) && currentArray[index]) {
            (currentArray[index] as any)[fieldKey] = value;
        } else {
            console.error("Error in handleListItemChange: array or item not found", listPath, index, fieldKey);
            return prev;
        }
        return newContent;
    });
};

  const addListItemByPath = (listPath: string, newItemPrototype: () => object) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = listPath.split('.');
        let newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
        let currentObject: any = newContent;
        const newItem = newItemPrototype();

        // Navigate to the parent of the array
        for (let i = 0; i < keys.length - 1; i++) {
            const keyPart = keys[i];
            if (!currentObject[keyPart] || typeof currentObject[keyPart] !== 'object') {
                currentObject[keyPart] = {}; // Create path if it doesn't exist
            }
            currentObject = currentObject[keyPart];
        }
        
        // Add to the array
        const listName = keys[keys.length - 1];
        if (!currentObject[listName] || !Array.isArray(currentObject[listName])) {
            currentObject[listName] = []; // Initialize if not an array
        }
        currentObject[listName].push(newItem);
        
        return newContent;
    });
  };

  const removeListItemByPath = (listPath: string, indexToRemove: number) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = listPath.split('.');
        let newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
        let currentObject: any = newContent;

        // Navigate to the parent of the array
        for (let i = 0; i < keys.length - 1; i++) {
            const keyPart = keys[i];
            if (currentObject[keyPart] && typeof currentObject[keyPart] === 'object') {
                currentObject = currentObject[keyPart];
            } else { 
                console.error("Invalid path in removeListItemByPath (parent navigation)", listPath);
                return prev; /* Invalid path */ 
            }
        }
        
        // Remove from the array
        const listName = keys[keys.length - 1];
        if (Array.isArray(currentObject[listName])) {
            currentObject[listName] = currentObject[listName].filter((_: any, idx: number) => idx !== indexToRemove);
        } else { 
            console.error("Target for removal is not an array in removeListItemByPath", listPath);
            return prev; 
        }
        
        return newContent;
    });
    setSuccessMessage("Item removed. Remember to save to persist this change.");
  };

  const handleHeroLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    if (event.target.files && event.target.files[0]) {
      setHeroLogoFile(event.target.files[0]);
    } else {
      setHeroLogoFile(null);
    }
  };

  const handleHeroLogoUpload = async () => {
    if (!heroLogoFile) {
      setError("Please select a logo image to upload for the hero section.");
      return;
    }
    setIsUploadingHeroLogo(true);
    clearMessages();
    try {
      const uploadResponse = await uploadImageApi(heroLogoFile);
      handleInputChange('hero.logoUrl', uploadResponse.url); // Use the generic input handler
      setSuccessMessage("Hero logo updated. Remember to save all changes to persist this.");
      setHeroLogoFile(null); // Clear the file input state
      if (heroLogoFileInputRef.current) {
        heroLogoFileInputRef.current.value = ""; // Reset the file input visually
      }
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload hero logo";
      setError(errorMessage);
    } finally {
      setIsUploadingHeroLogo(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) {
        setError("No content to save.");
        return;
    }
    setIsSaving(true);
    clearMessages();
    try {
      const savedContent = await saveAboutPageContentToAPI(content);
      setContent(savedContent);
      setSuccessMessage("About Us page content saved successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading About Us Page editor...</div>;
  
  if (!content && error && !isLoading) { // Critical error if content is null AND there's an error after loading attempt
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit About Us Page</h1>
            <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0"/>
                <span>Critical Error: {error}. Unable to initialize editor.</span>
            </div>
        </div>
      );
  }
  if (!content) return <div className="p-6 text-center">Content is not available. Please try refreshing the page. If the issue persists, ensure initial content can be set up by the backend.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
         <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit About Us Page Content</h1>
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
        {/* Hero Section */}
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="heroLogoUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Logo Image
              </label>
              <div className="flex items-center gap-4">
                {content.hero.logoUrl && (
                  <img src={content.hero.logoUrl} alt="Current Hero Logo" className="h-16 w-16 rounded-md object-contain border p-1 bg-gray-100 dark:bg-gray-700" />
                )}
                <Input
                  id="heroLogoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroLogoFileChange}
                  ref={heroLogoFileInputRef}
                  className="flex-grow"
                />
                <Button type="button" onClick={handleHeroLogoUpload} disabled={!heroLogoFile || isUploadingHeroLogo} size="sm">
                  {isUploadingHeroLogo ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Logo</>}
                </Button>
              </div>
              {content.hero.logoUrl && (
                 <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-red-500 p-0 h-auto mt-1 hover:text-red-700 dark:hover:text-red-400"
                    onClick={() => handleInputChange('hero.logoUrl', '')} 
                  >
                    Remove Logo
                  </Button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload a new logo for the hero section. Recommended size: 128x128px. An empty URL will use the site's default logo.
              </p>
            </div>
            <div>
              <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <Input id="heroTitle" value={content.hero.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('hero.title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <Textarea id="heroSubtitle" value={content.hero.subtitle} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('hero.subtitle', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision Section */}
        <Card>
          <CardHeader><CardTitle>Mission & Vision</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="missionTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mission Title</label>
              <Input id="missionTitle" value={content.missionVision.missionTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('missionVision.missionTitle', e.target.value)} />
            </div>
            <div>
              <label htmlFor="missionDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mission Description</label>
              <Textarea id="missionDescription" value={content.missionVision.missionDescription} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('missionVision.missionDescription', e.target.value)} rows={4} />
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700"/>
            <div>
              <label htmlFor="visionTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vision Title</label>
              <Input id="visionTitle" value={content.missionVision.visionTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('missionVision.visionTitle', e.target.value)} />
            </div>
            <div>
              <label htmlFor="visionDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vision Description</label>
              <Textarea id="visionDescription" value={content.missionVision.visionDescription} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('missionVision.visionDescription', e.target.value)} rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Core Values Section */}
        <Card>
          <CardHeader><CardTitle>Core Values</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="coreValuesTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <Input id="coreValuesTitle" value={content.coreValues.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('coreValues.title', e.target.value)} />
            </div>
            <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Value Items:</h4>
            {(content.coreValues.items || []).map((item, index) => (
              <Card key={item.id} className="p-3 space-y-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <div>
                  <label htmlFor={`cvItemTitle-${index}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Value Title</label>
                  <Input id={`cvItemTitle-${index}`} value={item.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleListItemChange('coreValues.items', index, 'title', e.target.value)} />
                </div>
                <div>
                  <label htmlFor={`cvItemDesc-${index}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Value Description</label>
                  <Textarea id={`cvItemDesc-${index}`} value={item.desc} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleListItemChange('coreValues.items', index, 'desc', e.target.value)} rows={2}/>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeListItemByPath('coreValues.items', index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Value
                </Button>
              </Card>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addListItemByPath('coreValues.items', () => ({ id: `cvItem-${Date.now()}-${Math.random().toString(16).slice(2)}`, title: "New Value", desc: "" }) )}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Core Value
            </Button>
          </CardContent>
        </Card>

        {/* CTA Section is removed */}

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" size="lg" disabled={isSaving || isLoading || isUploadingHeroLogo}>
            {isSaving ? 'Saving...' : (isUploadingHeroLogo ? 'Uploading Logo...' : 'Save About Us Content')}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminAboutPageContentEditor;