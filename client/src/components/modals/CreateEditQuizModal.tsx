// src/components/modals/CreateEditQuizModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
import { Label } from "../ui/label.js";
import { X, Save, Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Quiz } from '../../pages/admin/CourseManagementPage.js';

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
// --- End Theme Constants ---

interface CreateEditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  weekId: string | undefined;
  onSave: (quizData: Quiz | Omit<Quiz, 'id'>) => Promise<void>;
}

const CreateEditQuizModal: React.FC<CreateEditQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  weekId,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [quizUrl, setQuizUrl] = useState('');
  const [points, setPoints] = useState<number | string>('');
  const [dueDateOffsetDays, setDueDateOffsetDays] = useState<number | string | null>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!quiz;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditing && quiz) {
        setTitle(quiz.title || '');
        setDescription(quiz.description || '');
        setInstructions(quiz.instructions || '');
        setQuizUrl(quiz.quizUrl || '');
        setPoints(quiz.points ?? '');
        setDueDateOffsetDays(quiz.dueDateOffsetDays ?? '');
      } else {
        setTitle('');
        setDescription('');
        setInstructions('');
        setQuizUrl('');
        setPoints('');
        setDueDateOffsetDays('');
      }
    }
  }, [isOpen, quiz, isEditing]);

  const handleSaveClick = async () => {
    setError(null);
    if (!title) {
      setError("Quiz Title is required.");
      return;
    }
    if (!weekId && !isEditing) {
        setError("Week ID is missing. Cannot create quiz.");
        return;
    }

    let parsedPoints: number | undefined = undefined;
    if (points !== '') {
        const num = parseInt(String(points), 10);
        if (!isNaN(num) && num >= 0) {
            parsedPoints = num;
        } else {
            setError("Points must be a non-negative number.");
            return;
        }
    }

    let parsedDueDateOffset: number | null | undefined = undefined;
    if (dueDateOffsetDays !== '' && dueDateOffsetDays !== null) {
         const num = parseInt(String(dueDateOffsetDays), 10);
         if (!isNaN(num) && num >= 0) {
             parsedDueDateOffset = num;
         } else {
             setError("Due Date Offset must be a non-negative number.");
            return;
         }
    } else if (dueDateOffsetDays === null) {
        parsedDueDateOffset = null;
    }

     if (quizUrl && !quizUrl.startsWith('http://') && !quizUrl.startsWith('https://')) {
        // Optional: Add URL validation or allow relative paths
        // Consider adding a check/warning if needed
     }

    setIsSaving(true);
    const quizData = {
      title,
      description,
      instructions,
      quizUrl,
      points: parsedPoints,
      dueDateOffsetDays: parsedDueDateOffset,
      weekId: isEditing && quiz ? quiz.weekId : weekId!, // Ensure weekId is non-null for creation
    };

    try {
      if (isEditing && quiz) {
        await onSave({ ...quizData, id: quiz.id });
      } else {
        await onSave(quizData as Omit<Quiz, 'id'>);
      }
      // Don't close here, let parent handle on success
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving the quiz.");
      console.error("Error saving quiz in modal:", err);
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
            <CardTitle className={deepBrown}>{isEditing ? "Edit Quiz" : "Add New Quiz"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for ${quiz?.title}` : "Add a quiz for this week."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}

          <div className="space-y-2">
            <Label htmlFor="quiz-title" className={deepBrown}>Quiz Title</Label>
            <Input
              id="quiz-title"
              value={title}
              // *** FIX LINE 168 ***
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., Week 1 Comprehension Quiz"
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="quiz-url" className={deepBrown}>Quiz URL (Optional)</Label>
            <Input
              id="quiz-url"
              value={quizUrl}
              // *** FIX LINE 180 ***
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuizUrl(e.target.value)}
              placeholder="e.g., https://forms.google.com/..."
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-description" className={deepBrown}>Description (Optional)</Label>
            <Textarea
              id="quiz-description"
              value={description}
              // *** FIX LINE 192 ***
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Briefly describe the quiz purpose..."
              rows={2}
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="quiz-instructions" className={deepBrown}>Instructions (Optional)</Label>
            <Textarea
              id="quiz-instructions"
              value={instructions}
              // *** FIX LINE 205 ***
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
              placeholder="Instructions for taking the quiz..."
              rows={3}
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="quiz-points" className={deepBrown}>Points (Optional)</Label>
                <Input
                id="quiz-points"
                type="number"
                min="0"
                value={points}
                // *** FIX LINE 221 ***
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoints(e.target.value)}
                placeholder="e.g., 100"
                className={inputClasses}
                disabled={isSaving}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="quiz-due-offset" className={deepBrown}>Due Offset (Days, Optional)</Label>
                <Input
                id="quiz-due-offset"
                type="number"
                min="0"
                value={dueDateOffsetDays ?? ''}
                // *** FIX LINE 234 ***
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDateOffsetDays(e.target.value === '' ? null : e.target.value)}
                placeholder="Days after week start (e.g., 7)"
                className={inputClasses}
                disabled={isSaving}
                />
            </div>
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
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Add Quiz"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEditQuizModal;