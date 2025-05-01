import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
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
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown} z-[60]`;
const CreateEditCourseModal = ({ isOpen, onClose, course, onSave, existingMonthOrders, }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [monthOrder, setMonthOrder] = useState('');
    const [instructor, setInstructor] = useState('');
    const [ects, setEcts] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!course;
    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (isEditing && course) {
                setTitle(course.title || '');
                setDescription(course.description || '');
                setMonthOrder(course.monthOrder ? String(course.monthOrder) : '');
                setInstructor(course.instructor || '');
                setEcts(course.ects ? String(course.ects) : '');
            }
            else {
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
        if (!title || !monthOrder) {
            setError("Course Title and Month Order are required.");
            return;
        }
        const parsedMonthOrder = parseInt(String(monthOrder), 10);
        if (isNaN(parsedMonthOrder) || parsedMonthOrder < 1 || parsedMonthOrder > 6) {
            setError("Month Order must be between 1 and 6.");
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
            instructor: instructor || undefined,
            ects: ects ? parseInt(String(ects), 10) : undefined,
        };
        try {
            if (isEditing && course) {
                await onSave({ ...courseDataPayload, id: course.id });
            }
            else {
                await onSave(courseDataPayload);
            }
        }
        catch (err) {
            setError(err.message || "An unexpected error occurred while saving the course.");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn", children: _jsxs(Card, { className: `w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl animate-scaleIn`, children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: deepBrown, children: isEditing ? "Edit Course" : "Add New Course" }), _jsx(CardDescription, { className: midBrown, children: isEditing ? `Modify details for ${course?.title}` : "Add a new course to the program." })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { className: `h-5 w-5 ${midBrown}` }) })] }), _jsxs(CardContent, { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-2", children: [error && _jsxs("div", { role: "alert", className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), " ", error] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "course-title", className: deepBrown, children: "Course Title" }), _jsx(Input, { id: "course-title", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Introduction to Theology", className: inputClasses, disabled: isSaving, required: true, "aria-required": "true" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "course-month", className: deepBrown, children: "Month Order (1-6)" }), _jsxs(Select, { value: monthOrder ? String(monthOrder) : '', onValueChange: (value) => setMonthOrder(value), disabled: isSaving, required: true, "aria-required": "true", children: [_jsx(SelectTrigger, { id: "course-month", className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Select month..." }) }), _jsx(SelectContent, { className: selectContentClasses, children: [1, 2, 3, 4, 5, 6].map((num) => (_jsxs(SelectItem, { value: String(num), disabled: !isEditing && existingMonthOrders.includes(num), children: ["Month ", num] }, num))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "course-instructor", className: deepBrown, children: "Instructor (Optional)" }), _jsx(Input, { id: "course-instructor", value: instructor, onChange: (e) => setInstructor(e.target.value), placeholder: "e.g., Dr. John Smith", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "course-ects", className: deepBrown, children: "ECTS Credits (Optional)" }), _jsx(Input, { id: "course-ects", type: "number", value: ects, onChange: (e) => setEcts(e.target.value), placeholder: "e.g., 5", className: inputClasses, disabled: isSaving, min: "0", max: "30" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "course-description", className: deepBrown, children: "Description (Optional)" }), _jsx(Input, { id: "course-description", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Brief course description", className: inputClasses, disabled: isSaving })] })] }), _jsxs(CardFooter, { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", className: outlineButtonClasses, onClick: onClose, disabled: isSaving, children: "Cancel" }), _jsx(Button, { className: primaryButtonClasses, onClick: handleSaveClick, disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), " ", isEditing ? "Save Changes" : "Add Course"] })) })] })] }) }));
};
export default CreateEditCourseModal;
