import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
import { Label } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { Week } from '../../services/api';

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


interface CreateEditWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  week: Week | null;
  courseId: string | undefined;
  onSave: (weekData: Week | Omit<Week, 'id'>) => Promise<void>;
  existingWeekNumbers: number[];
}

const CreateEditWeekModal: React.FC<CreateEditWeekModalProps> = ({
  isOpen,
  onClose,
  week,
  courseId,
  onSave,
  existingWeekNumbers,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weekNumber, setWeekNumber] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!week;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditing && week) {
        setTitle(week.title || '');
        setDescription(week.description || '');
        setWeekNumber(week.weekNumber ? String(week.weekNumber) : '');
      } else {
        setTitle('');
        setDescription('');
        setWeekNumber('');
      }
    }
  }, [isOpen, week, isEditing]);

  const handleSaveClick = async () => {
    setError(null);
    if (!title || !weekNumber) {
      setError("Week Title and Week Number are required.");
      return;
    }

    if (!isEditing && !courseId) {
        setError("Internal Error: Course ID is missing. Cannot create week.");

        return;
    }

    const parsedWeekNumber = parseInt(String(weekNumber), 10);
    if (isNaN(parsedWeekNumber) || parsedWeekNumber < 1 || parsedWeekNumber > 4) {
        setError("Week Number must be between 1 and 4.");
        return;
    }


    if (!isEditing && existingWeekNumbers.includes(parsedWeekNumber)) {
        setError(`Week number ${parsedWeekNumber} already exists for this course. Please choose a different number.`);
        return;
    }
    if (isEditing && week && parsedWeekNumber !== week.weekNumber && existingWeekNumbers.includes(parsedWeekNumber)) {
         setError(`Week number ${parsedWeekNumber} already exists for this course. Please choose a different number.`);
        return;
    }

    setIsSaving(true);


    const weekDataPayload = {
      title,
      description,
      weekNumber: parsedWeekNumber,

      courseId: isEditing && week ? week.courseId : courseId!,
    };

    try {
      if (isEditing && week) {

        await onSave({ ...weekDataPayload, id: week.id });
      } else {


        await onSave(weekDataPayload as Omit<Week, 'id'>);
      }

    } catch (err: any) {

      setError(err.message || "An unexpected error occurred while saving the week.");


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
            <CardTitle className={deepBrown}>{isEditing ? "Edit Week" : "Add New Week"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for Week ${week?.weekNumber}` : "Define a new weekly module."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}

          <div className="space-y-2">
            <Label htmlFor="week-number" className={deepBrown}>Week Number (1-4)</Label>
             <Select
                value={String(weekNumber)}
                // *** FIX LINE 158 ***
                onValueChange={(value: string) => setWeekNumber(value)}
                disabled={isSaving}
             >
                <SelectTrigger id="week-number" className={selectTriggerClasses}>
                    <SelectValue placeholder="Select week..." />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                    {[1, 2, 3, 4].map(num => (
                        <SelectItem key={num} value={String(num)}>Week {num}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="week-title" className={deepBrown}>Week Title</Label>
            <Input
              id="week-title"
              value={title}
              // *** FIX LINE 177 ***
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., The Nature & Attributes of God"
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="week-description" className={deepBrown}>Description (Optional)</Label>
            <Textarea
              id="week-description"
              value={description}
              // *** FIX LINE 189 ***
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Briefly describe the topics covered this week..."
              rows={3}
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
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Create Week"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEditWeekModal;