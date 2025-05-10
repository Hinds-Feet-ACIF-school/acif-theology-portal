import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/modals/CreateEditQuizModal.tsx
import { useState, useEffect } from 'react'; // Added ChangeEvent
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
import { Label } from "../ui/label.js";
import { X, Save, Loader2, AlertCircle } from 'lucide-react'; // Removed unused LinkIcon
// --- Theme Constants ---
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
const inputBorder = 'border-gray-300 dark:border-gray-700'; // Used inputBorder from api.ts for consistency
const themedInputBorder = `border-gray-300 dark:border-gray-700 hover:border-[#C5A467]/70 dark:hover:border-[#C5A467]`;
const themedInputBg = `bg-white dark:bg-gray-800`;
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]'; // You can define this or use ShadCN's default
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${themedInputBg} ${themedInputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400`;
const CreateEditQuizModal = ({ isOpen, onClose, quiz, weekId, // weekId from props
onSave, }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [quizUrl, setQuizUrl] = useState('');
    const [points, setPoints] = useState(''); // number | string to handle input field
    const [dueDateOffsetDays, setDueDateOffsetDays] = useState(''); // number | string | null
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!quiz;
    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (isEditing && quiz) {
                setTitle(quiz.title || '');
                setDescription(quiz.description || '');
                setInstructions(quiz.instructions || '');
                setQuizUrl(quiz.quizUrl || '');
                setPoints(quiz.points ?? ''); // Use ?? to handle undefined or null gracefully
                setDueDateOffsetDays(quiz.dueDateOffsetDays === undefined ? '' : quiz.dueDateOffsetDays); // Handle undefined specifically if needed
            }
            else {
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
        if (!title.trim()) {
            setError("Quiz Title is required.");
            return;
        }
        const currentWeekId = isEditing && quiz ? quiz.weekId : weekId;
        if (!currentWeekId) {
            setError("Week ID is missing. Cannot save quiz.");
            return;
        }
        let parsedPoints = undefined;
        if (points !== '' && points !== null) { // Check for null as well
            const num = parseInt(String(points), 10);
            if (!isNaN(num) && num >= 0) {
                parsedPoints = num;
            }
            else {
                setError("Points must be a non-negative number.");
                return;
            }
        }
        let parsedDueDateOffset = undefined; // undefined means not set
        if (dueDateOffsetDays === null) { // Explicitly null (e.g. user cleared it after it was set)
            parsedDueDateOffset = null;
        }
        else if (dueDateOffsetDays !== '' && dueDateOffsetDays !== undefined) {
            const num = parseInt(String(dueDateOffsetDays), 10);
            if (!isNaN(num) && num >= 0) {
                parsedDueDateOffset = num;
            }
            else {
                setError("Due Date Offset must be a non-negative number if provided.");
                return;
            }
        }
        // If dueDateOffsetDays is '' or undefined, parsedDueDateOffset remains undefined (meaning not set)
        setIsSaving(true);
        const quizDataPayload = {
            title: title.trim(),
            description: description.trim() || undefined, // Send undefined if empty
            instructions: instructions.trim() || undefined, // Send undefined if empty
            quizUrl: quizUrl.trim() || undefined, // Send undefined if empty
            points: parsedPoints,
            dueDateOffsetDays: parsedDueDateOffset,
            // weekId is handled below based on editing or creating
        };
        try {
            if (isEditing && quiz) {
                await onSave({ ...quizDataPayload, id: quiz.id, weekId: currentWeekId });
            }
            else {
                // For creation, weekId must be present
                await onSave({ ...quizDataPayload, weekId: currentWeekId });
            }
            // onClose(); // Parent should close on successful save
        }
        catch (err) {
            setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
            console.error("Error saving quiz in modal:", err);
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4", children: _jsxs(Card, { className: `w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${themedInputBorder} shadow-xl`, children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pt-4 pb-3 px-4", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: deepBrown, children: isEditing ? "Edit Quiz" : "Add New Quiz" }), _jsx(CardDescription, { className: midBrown, children: isEditing ? `Modify details for "${quiz?.title}"` : "Enter details for the new quiz." })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { className: `h-5 w-5 ${midBrown}` }) })] }), _jsxs(CardContent, { className: "space-y-3 max-h-[70vh] overflow-y-auto p-4", children: [error && (_jsxs("div", { className: "p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700", children: [_jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), " ", _jsx("span", { children: error })] })), _jsxs("div", { className: "space-y-1.5", children: [_jsxs(Label, { htmlFor: "quiz-title", className: `${deepBrown} text-sm`, children: ["Quiz Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "quiz-title", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Week 1 Comprehension Quiz", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "quiz-url", className: `${deepBrown} text-sm`, children: "Quiz URL (Optional, e.g., Google Forms)" }), _jsx(Input, { id: "quiz-url", type: "url", value: quizUrl, onChange: (e) => setQuizUrl(e.target.value), placeholder: "https://forms.gle/your-quiz-link", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "quiz-description", className: `${deepBrown} text-sm`, children: "Description (Optional)" }), _jsx(Textarea, { id: "quiz-description", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Briefly describe the quiz purpose or topics covered.", rows: 2, className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "quiz-instructions", className: `${deepBrown} text-sm`, children: "Instructions (Optional)" }), _jsx(Textarea, { id: "quiz-instructions", value: instructions, onChange: (e) => setInstructions(e.target.value), placeholder: "Provide any specific instructions for taking the quiz.", rows: 3, className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "quiz-points", className: `${deepBrown} text-sm`, children: "Points (Optional)" }), _jsx(Input, { id: "quiz-points", type: "number", min: "0", value: points, onChange: (e) => setPoints(e.target.value === '' ? '' : parseInt(e.target.value, 10)), placeholder: "e.g., 100", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "quiz-due-offset", className: `${deepBrown} text-sm`, children: "Due Offset (Days, Optional)" }), _jsx(Input, { id: "quiz-due-offset", type: "number", min: "0", value: dueDateOffsetDays ?? '', onChange: (e) => {
                                                const val = e.target.value;
                                                setDueDateOffsetDays(val === '' ? null : parseInt(val, 10)); // Set to null if empty, else parse
                                            }, placeholder: "Days after week start", className: inputClasses, disabled: isSaving })] })] })] }), _jsxs(CardFooter, { className: "flex justify-end gap-2 pt-3 pb-3 px-4 border-t ${themedInputBorder}", children: [_jsx(Button, { variant: "outline", className: outlineButtonClasses, onClick: onClose, disabled: isSaving, children: "Cancel" }), _jsx(Button, { className: primaryButtonClasses, onClick: handleSaveClick, disabled: isSaving || !title.trim(), children: isSaving ? (_jsxs(_Fragment, { children: [" ", _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Saving... "] })) : (_jsxs(_Fragment, { children: [" ", _jsx(Save, { className: "mr-2 h-4 w-4" }), " ", isEditing ? "Save Changes" : "Add Quiz", " "] })) })] })] }) }));
};
export default CreateEditQuizModal;
