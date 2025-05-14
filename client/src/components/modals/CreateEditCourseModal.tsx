import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { Course } from '../../services/api';

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

interface CreateEditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: (courseData: Course | Omit<Course, 'id'>) => Promise<void>;
  existingMonthOrders: number[];
}

const CreateEditCourseModal: React.FC<CreateEditCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onSave,
  existingMonthOrders,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [monthOrder, setMonthOrder] = useState<number | string>('');
  const [instructor, setInstructor] = useState('');
  const [ects, setEcts] = useState<number | string>('');
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
        // UPDATED LINE:
        setInstructor(course.instructorName || course.instructor || '');
        setEcts(course.ects ? String(course.ects) : '');
      } else { // Reset for new course
        setTitle('');
        setDescription('');
        setMonthOrder('');
        setInstructor('');
        setEcts('');
      }
    }
  }, [isOpen, course, isEditing]);

  const handleSaveClick = async () => {
    setError(null);
    if (!title || monthOrder === '') {
      setError("Course Title and Month Order are required.");
      return;
    }

    const parsedMonthOrder = parseInt(String(monthOrder), 10);
    if (isNaN(parsedMonthOrder) || parsedMonthOrder < 1) {
      setError("Month Order must be a positive number.");
      return;
    }

    if (!isEditing && existingMonthOrders.includes(parsedMonthOrder)) {
      setError(`Month order ${parsedMonthOrder} already exists. Please choose a different number.`);
      return;
    }

    if (isEditing && course && parsedMonthOrder !== course.monthOrder && existingMonthOrders.includes(parsedMonthOrder)) {
      setError(`Month order ${parsedMonthOrder} already exists. Please choose a different number.`);
      return;
    }

    setIsSaving(true);

    const courseDataPayload = {
      title,
      description,
      monthOrder: parsedMonthOrder,
      // UPDATED LINE:
      instructor: instructor.trim() ? instructor.trim() : undefined,
      ects: ects && !isNaN(parseInt(String(ects), 10)) ? parseInt(String(ects), 10) : undefined,
    };

    try {
      if (isEditing && course) {
        await onSave({ ...courseDataPayload, id: course.id });
      } else {
        await onSave(courseDataPayload as Omit<Course, 'id'>);
      }

    } catch (err: any) {
      console.error("Error saving course:", err);
      setError(err.message || "An unexpected error occurred while saving the course.");
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
            <CardTitle className={deepBrown}>{isEditing ? "Edit Course" : "Add New Course"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for ${course?.title}` : "Add a new course to the program."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {error && <div role="alert" className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}

          <div className="space-y-2">
            <Label htmlFor="course-title" className={deepBrown}>Course Title</Label>
            <Input
              id="course-title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Theology"
              className={inputClasses}
              disabled={isSaving}
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-month" className={deepBrown}>Month Order</Label>
            <Input
              id="course-month"
              type="number"
              value={monthOrder}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthOrder(e.target.value)}
              placeholder="Enter order number (e.g., 1, 2, 7)"
              className={inputClasses}
              disabled={isSaving}
              required
              aria-required="true"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-instructor" className={deepBrown}>Instructor (Optional)</Label>
            <Input
              id="course-instructor"
              value={instructor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstructor(e.target.value)}
              placeholder="e.g., Dr. John Smith"
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-ects" className={deepBrown}>ECTS Credits (Optional)</Label>
            <Input
              id="course-ects"
              type="number"
              value={ects}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEcts(e.target.value)}
              placeholder="e.g., 5"
              className={inputClasses}
              disabled={isSaving}
              min="0"

            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description" className={deepBrown}>Description (Optional)</Label>
            <Input
              id="course-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder="Brief course description"
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
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Add Course"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEditCourseModal;