import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Define the data structure for these pages
export interface LegalPageContentData {
  _id?: string;
  identifier: 'privacy' | 'terms';
  title: string;
  content: string; // The main body of the text
  createdAt?: string;
  updatedAt?: string;
}

// Define the type for the component's props
interface AdminLegalPageEditorProps {
  pageType: 'privacy' | 'terms';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Reusable API functions
const fetchLegalPageContent = async (pageType: 'privacy' | 'terms'): Promise<LegalPageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/${pageType}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch ${pageType} content` }));
    throw new Error(errorData.message);
  }
  return response.json();
};

const saveLegalPageContent = async (pageType: 'privacy' | 'terms', content: LegalPageContentData): Promise<LegalPageContentData> => {
  const { _id, identifier, createdAt, updatedAt, ...saveData } = content;
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/content/${pageType}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(saveData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to save ${pageType} content` }));
    throw new Error(errorData.message);
  }
  return response.json();
};

const AdminLegalPageEditor: React.FC<AdminLegalPageEditorProps> = ({ pageType }) => {
  const [content, setContent] = useState<LegalPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pageTitle = pageType === 'privacy' ? 'Privacy Policy' : 'Terms of Use';

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const fetchedContent = await fetchLegalPageContent(pageType);
        setContent(fetchedContent);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [pageType]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (field: keyof Omit<LegalPageContentData, '_id' | 'identifier' | 'createdAt' | 'updatedAt'>, value: string) => {
    clearMessages();
    setContent(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    clearMessages();
    try {
      const saved = await saveLegalPageContent(pageType, content);
      setContent(saved);
      setSuccessMessage(`${pageTitle} content has been successfully updated.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `An unknown error occurred saving ${pageType} content`;
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading content editor...</div>;
  if (!content) return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit {pageTitle}</h1>
        <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>Error loading content: {error}. This might mean the content needs to be created in the database first.</span>
        </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit {pageTitle}</h1>
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
          <CardHeader>
            <CardTitle>{pageTitle} Content</CardTitle>
            <CardDescription>Update the title and main content for this page. The text supports line breaks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Title</label>
              <Input id="pageTitle" value={content.title} onChange={e => handleInputChange('title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="pageContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Page Content</label>
              <Textarea
                id="pageContent"
                value={content.content}
                onChange={e => handleInputChange('content', e.target.value)}
                rows={25}
                placeholder="Enter the full text for the page here. Paragraphs will be preserved."
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t">
          <Button type="submit" size="lg" disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : `Save ${pageTitle}`}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminLegalPageEditor;