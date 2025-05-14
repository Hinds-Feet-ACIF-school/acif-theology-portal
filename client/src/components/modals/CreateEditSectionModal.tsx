import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { Textarea } from "../ui/textarea.js";
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { type Section } from '../../services/api';

const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;

interface CreateEditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  weekId: string;
  onSave: (sectionData: Section | Omit<Section, 'id'>) => Promise<void>;
  existingSectionOrders: number[];
}

const CreateEditSectionModal: React.FC<CreateEditSectionModalProps> = ({
  isOpen,
  onClose,
  section,
  weekId,
  onSave,
  existingSectionOrders,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!section;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditing && section) {
        setTitle(section.title || '');
        setDescription(section.description || '');
        setOrder(section.order ? String(section.order) : '');
      } else {
        setTitle('');
        setDescription('');
        setOrder('');
      }
    }
  }, [isOpen, section, isEditing]);

  const handleSaveClick = async () => {
    setError(null);
    if (!title || !order) {
      setError("Section Title and Order are required.");
      return;
    }

    const parsedOrder = parseInt(String(order), 10);
    if (isNaN(parsedOrder) || parsedOrder < 1) {
      setError("Order must be a positive number.");
      return;
    }

    if (!isEditing && existingSectionOrders.includes(parsedOrder)) {
      setError(`Order ${parsedOrder} already exists. Please choose a different number.`);
      return;
    }

    if (isEditing && section && parsedOrder !== section.order && existingSectionOrders.includes(parsedOrder)) {
      setError(`Order ${parsedOrder} already exists. Please choose a different number.`);
      return;
    }

    setIsSaving(true);

    const sectionDataPayload = {
      title,
      description,
      order: parsedOrder,
      weekId,
      content: section?.content || [],
    };

    try {
      if (isEditing && section) {
        await onSave({ ...sectionDataPayload, id: section.id });
      } else {
        await onSave(sectionDataPayload as Omit<Section, 'id'>);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving the section.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <Card className={`w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl animate-scaleIn`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className={deepBrown}>{isEditing ? "Edit Section" : "Add New Section"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for ${section?.title}` : "Add a new section to the week."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {error && <div role="alert" className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}

          <div className="space-y-2">
            <Label htmlFor="section-title" className={deepBrown}>Section Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to the Topic"
              className={inputClasses}
              disabled={isSaving}
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-order" className={deepBrown}>Section Order</Label>
            <Input
              id="section-order"
              type="number"
              value={order}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrder(e.target.value)}
              placeholder="Enter section order"
              className={inputClasses}
              disabled={isSaving}
              required
              aria-required="true"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description" className={deepBrown}>Description (Optional)</Label>
            <Textarea
              id="section-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Brief section description"
              className={`${inputClasses} min-h-[100px]`}
              disabled={isSaving}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" className={outlineButtonClasses} onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className={primaryButtonClasses} onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Add Section"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEditSectionModal; 