// src/pages/admin/content/AdminContactPageContentEditor.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react'; // For messages

import {
  ContactPageContentData,
  // ContactInfoItemData, // Not directly used as a list type here, but emailInfo matches its structure
} from '../../../types/contactPageContentTypes'; // Adjust path as needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- REAL API FUNCTIONS ---
const fetchContactPageContentFromAPI = async (): Promise<ContactPageContentData | null> => {
  console.log("Attempting to fetch Contact Us page content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/contact`);
    if (!response.ok) {
      console.warn(`Failed to fetch Contact Us content from API. Status: ${response.status}`);
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data === 'object' && data !== null && data.hero?.title && data.getInTouch?.emailInfo) {
      console.log("Successfully fetched Contact Us content from API.");
      return data;
    } else {
      console.warn("API returned data not in the expected ContactPageContentData format, or it was empty/null.");
      return null;
    }
  } catch (error) {
    console.error("Network or JSON parsing error during fetchContactPageContentFromAPI:", error);
    throw error; 
  }
};

const saveContactPageContentToAPI = async (content: ContactPageContentData): Promise<ContactPageContentData> => {
  console.log("Saving Contact Us page content to API:", content);
  const token = localStorage.getItem('token');
  const { _id, identifier, createdAt, updatedAt, ...contentToSave } = content;

  const response = await fetch(`${API_BASE_URL}/content/contact`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(contentToSave),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save Contact Us content" }));
    throw new Error(errorData.message || "Failed to save Contact Us content");
  }
  return response.json();
};

// --- FALLBACK/INITIAL DATA ---
const getInitialContactUsPageData = (): ContactPageContentData => ({
  hero: {
    title: "Contact Us",
    subtitle: "We'd love to hear from you! Reach out with any questions or inquiries.",
  },
  getInTouch: {
    title: "Get in Touch",
    emailInfo: {
      id: "mainEmail", // This ID is mostly for consistency if it were part of a list
      type: "Email",
      value: "info@apostolictheology.org",
      description: "For general inquiries and admissions",
    },
  },
  sendMessage: {
    title: "Send Us a Message",
  },
});


const AdminContactPageContentEditor: React.FC = () => {
  const [content, setContent] = useState<ContactPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const fetchedContent = await fetchContactPageContentFromAPI();
        if (fetchedContent) {
          setContent(fetchedContent);
        } else {
          console.warn("API returned null for Contact Us content, using initial fallback data.");
          setContent(getInitialContactUsPageData());
        }
      } catch (err) {
        console.error("Error loading Contact Us content:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during loading. Using fallback data.");
        setContent(getInitialContactUsPageData());
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
        let newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
        let currentLevel: any = newContent;

        for (let i = 0; i < keys.length; i++) {
            const keyPart = keys[i];
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) {
        setError("No content to save.");
        return;
    }
    setIsSaving(true);
    clearMessages();
    try {
      const savedContent = await saveContactPageContentToAPI(content);
      setContent(savedContent);
      setSuccessMessage("Contact Us page content saved successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading Contact Us Page editor...</div>;
  
  if (!content && error && !isLoading) {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Contact Us Page</h1>
            <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0"/>
                <span>Critical Error: {error}. Unable to initialize editor.</span>
            </div>
        </div>
      );
  }
  if (!content) return <div className="p-6 text-center">Content is not available. Please try refreshing. If the issue persists, ensure initial content setup on the backend.</div>;


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Contact Us Page Content</h1>
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
              <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <Input id="heroTitle" value={content.hero.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('hero.title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <Textarea id="heroSubtitle" value={content.hero.subtitle} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('hero.subtitle', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Get in Touch Section */}
        <Card>
          <CardHeader><CardTitle>"Get in Touch" Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="getIntouchTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <Input id="getIntouchTitle" value={content.getInTouch.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('getInTouch.title', e.target.value)} />
            </div>
            <fieldset className="border p-3 rounded-md dark:border-gray-700">
                <legend className="text-sm font-semibold px-1 text-gray-700 dark:text-gray-300">Email Information</legend>
                <div className="space-y-3 mt-1">
                    <div>
                        <label htmlFor="emailValue" className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Email Address</label>
                        <Input 
                            id="emailValue" 
                            type="email" 
                            value={content.getInTouch.emailInfo.value} 
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('getInTouch.emailInfo.value', e.target.value)} 
                        />
                    </div>
                    <div>
                        <label htmlFor="emailDescription" className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Description (e.g., For general inquiries)</label>
                        <Textarea 
                            id="emailDescription" 
                            value={content.getInTouch.emailInfo.description} 
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('getInTouch.emailInfo.description', e.target.value)} 
                            rows={2}
                        />
                    </div>
                    {/* The 'type' (Email) and 'id' (mainEmail) for emailInfo are structural and not typically user-editable */}
                </div>
            </fieldset>
            {/* If you were to implement a list of contact items (phone, address etc.), you'd map and provide add/remove functionality here. */}
          </CardContent>
        </Card>

        {/* Send Us a Message Section */}
        <Card>
          <CardHeader><CardTitle>"Send Us a Message" Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="sendMessageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title (Above Form)</label>
              <Input id="sendMessageTitle" value={content.sendMessage.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('sendMessage.title', e.target.value)} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Note: The contact form itself (fields, submission logic) is managed by the page's code and is not editable here. Only the surrounding text elements are.
            </p>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" size="lg" disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Contact Us Content'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminContactPageContentEditor;