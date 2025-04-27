// src/components/modals/CreateEditCourseModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button.js"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js"; 
import { Input } from "../ui/input.js";    
import { Textarea } from "../ui/textarea.js"; 
import { Label } from "../ui/label.js";    
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js"; 
import { X, Save, Loader2, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  monthOrder: number;
  instructor?: string;
  instructorName?: string;
  ects?: number;
}

// --- Theme Constants (keep as is) ---
const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
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
const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;
// --- End Theme Constants ---

interface CreateEditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: (courseData: Course | Omit<Course, 'id'>) => Promise<void>;
}

const CreateEditCourseModal: React.FC<CreateEditCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [monthOrder, setMonthOrder] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!course;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditing && course) {
        setTitle(course.title || '');
        setDescription(course.description || '');
        setMonthOrder(course.monthOrder ? String(course.monthOrder) : '');
      } else {
        setTitle('');
        setDescription('');
        setMonthOrder('');
      }
    }
  }, [isOpen, course, isEditing]);

  const handleSaveClick = async () => {
    setError(null);
    if (!title || !monthOrder) {
      setError("Course Title and Month Order are required.");
      return;
    }

    const parsedMonthOrder = parseInt(String(monthOrder), 10);
    if (isNaN(parsedMonthOrder) || parsedMonthOrder < 1 || parsedMonthOrder > 6) {
        setError("Month Order must be a number between 1 and 6.");
        return;
    }

    setIsSaving(true);
    const courseData = {
      title,
      description,
      monthOrder: parsedMonthOrder,
    };

    try {
      if (isEditing && course) {
        await onSave({ ...courseData, id: course.id });
      } else {
        await onSave(courseData as Omit<Course, 'id'>); // Assert type for creation
      }
      // No onClose here, parent handles success
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error saving course in modal:", err);
      // Don't close on error, let user see message
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className={`w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className={deepBrown}>{isEditing ? "Edit Course" : "Add New Course"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for Month ${course?.monthOrder}` : "Define a new course for the program."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}
          <div className="space-y-2">
            <Label htmlFor="course-title" className={deepBrown}>Course Title</Label>
            <Input
              id="course-title"
              value={title}
              // *** FIX TS7006 HERE ***
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., Foundations of the Christian Faith"
              className={inputClasses}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-month" className={deepBrown}>Month Order (1-6)</Label>
             <Select
                value={String(monthOrder)}
                // *** FIX TS7006 HERE ***
                onValueChange={(value: string) => setMonthOrder(value)} // Assuming value is string from Select
                disabled={isEditing || isSaving} // Consider if editing month should be allowed
             >
                <SelectTrigger id="course-month" className={selectTriggerClasses}>
                    <SelectValue placeholder="Select month..." />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={String(num)}>Month {num}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-description" className={deepBrown}>Description (Optional)</Label>
            <Textarea
              id="course-description"
              value={description}
              // *** FIX TS7006 HERE ***
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="A brief overview of the course content..."
              rows={4}
              className={inputClasses}
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
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Create Course"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEditCourseModal;