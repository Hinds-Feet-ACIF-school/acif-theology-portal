import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
import { Label } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
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
const CreateEditWeekModal = ({ isOpen, onClose, week, courseId, onSave, existingWeekNumbers, }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [weekNumber, setWeekNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!week;
    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (isEditing && week) {
                setTitle(week.title || '');
                setDescription(week.description || '');
                setWeekNumber(week.weekNumber ? String(week.weekNumber) : '');
            }
            else {
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
            courseId: isEditing && week ? week.courseId : courseId,
        };
        try {
            if (isEditing && week) {
                await onSave({ ...weekDataPayload, id: week.id });
            }
            else {
                await onSave(weekDataPayload);
            }
        }
        catch (err) {
            setError(err.message || "An unexpected error occurred while saving the week.");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4", children: _jsxs(Card, { className: `w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl`, children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: deepBrown, children: isEditing ? "Edit Week" : "Add New Week" }), _jsx(CardDescription, { className: midBrown, children: isEditing ? `Modify details for Week ${week?.weekNumber}` : "Define a new weekly module." })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { className: `h-5 w-5 ${midBrown}` }) })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && _jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), " ", error] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "week-number", className: deepBrown, children: "Week Number (1-4)" }), _jsxs(Select, { value: String(weekNumber), 
                                    // *** FIX LINE 158 ***
                                    onValueChange: (value) => setWeekNumber(value), disabled: isSaving, children: [_jsx(SelectTrigger, { id: "week-number", className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Select week..." }) }), _jsx(SelectContent, { className: selectContentClasses, children: [1, 2, 3, 4].map(num => (_jsxs(SelectItem, { value: String(num), children: ["Week ", num] }, num))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "week-title", className: deepBrown, children: "Week Title" }), _jsx(Input, { id: "week-title", value: title, 
                                    // *** FIX LINE 177 ***
                                    onChange: (e) => setTitle(e.target.value), placeholder: "e.g., The Nature & Attributes of God", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "week-description", className: deepBrown, children: "Description (Optional)" }), _jsx(Textarea, { id: "week-description", value: description, 
                                    // *** FIX LINE 189 ***
                                    onChange: (e) => setDescription(e.target.value), placeholder: "Briefly describe the topics covered this week...", rows: 3, className: inputClasses, disabled: isSaving })] })] }), _jsxs(CardFooter, { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", className: outlineButtonClasses, onClick: onClose, disabled: isSaving, children: "Cancel" }), _jsx(Button, { className: primaryButtonClasses, onClick: handleSaveClick, disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), " ", isEditing ? "Save Changes" : "Create Week"] })) })] })] }) }));
};
export default CreateEditWeekModal;
