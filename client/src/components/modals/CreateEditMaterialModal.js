import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { X, Save, Loader2, AlertCircle, UploadCloud } from 'lucide-react';
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
const fileInputClasses = `file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 ${inputClasses}`;
const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;
const CreateEditMaterialModal = ({ isOpen, onClose, material, weekId, onSave, }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('reading');
    const [details, setDetails] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const isEditing = !!material;
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            if (isEditing && material) {
                setTitle(material.title || '');
                setType(material.type || 'reading');
                setDetails(material.details || '');
                setContentUrl(material.contentUrl || '');
            }
            else {
                setTitle('');
                setType('reading');
                setDetails('');
                setContentUrl('');
            }
        }
    }, [isOpen, material, isEditing]);
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                setError("Invalid file type. Please upload a PDF.");
                setFile(null);
                if (fileInputRef.current)
                    fileInputRef.current.value = "";
                return;
            }
            setError(null);
            setFile(selectedFile);
        }
        else {
            setFile(null);
        }
    };
    const handleSaveClick = async () => {
        setError(null);
        if (!title || !type) {
            setError("Material Title and Type are required.");
            return;
        }
        if (type === 'reading' && !isEditing && !file) {
            setError("A PDF file is required for 'Reading' type when creating.");
            return;
        }
        if (type !== 'reading' && !contentUrl) {
            setError("A URL is required for Video, Resource, or Quiz types.");
            return;
        }
        if (!weekId && !isEditing) {
            setError("Internal Error: Week ID is missing. Cannot create material.");
            return;
        }
        setIsSaving(true);
        const useFormData = type === 'reading' && (!isEditing || (isEditing && file));
        let dataToSend;
        if (useFormData && file) {
            dataToSend = new FormData();
            dataToSend.append('title', title);
            dataToSend.append('type', type);
            dataToSend.append('details', details);
            dataToSend.append('file', file);
            if (isEditing && material) {
            }
            else if (weekId) {
                dataToSend.append('weekId', weekId);
            }
        }
        else {
            dataToSend = {
                title,
                type,
                details,
                contentUrl: type !== 'reading' ? contentUrl : (isEditing ? material?.contentUrl : ''),
                weekId: isEditing && material ? material.weekId : weekId,
            };
        }
        try {
            if (isEditing && material) {
                await onSave(useFormData ? dataToSend : { ...dataToSend, id: material.id });
            }
            else {
                await onSave(dataToSend);
            }
        }
        catch (err) {
            setError(err.message || "An unexpected error occurred while saving the material.");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4", children: _jsxs(Card, { className: `w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl`, children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: deepBrown, children: isEditing ? "Edit Material" : "Add New Material" }), _jsx(CardDescription, { className: midBrown, children: isEditing ? `Modify details for ${material?.title}` : "Add a new learning material." })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, "aria-label": "Close modal", children: _jsx(X, { className: `h-5 w-5 ${midBrown}` }) })] }), _jsxs(CardContent, { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-2", children: [error && _jsxs("div", { className: "mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), " ", error] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "material-title", className: deepBrown, children: "Material Title" }), _jsx(Input, { id: "material-title", value: title, 
                                    // *** FIX LINE 186 ***
                                    onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Week 1 Reading: The Trinity", className: inputClasses, disabled: isSaving })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "material-type", className: deepBrown, children: "Material Type" }), _jsxs(Select, { value: type, onValueChange: (value) => {
                                        setType(value);
                                        if (value === 'reading')
                                            setContentUrl('');
                                        else
                                            setFile(null);
                                    }, disabled: isSaving, children: [_jsx(SelectTrigger, { id: "material-type", className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Select type..." }) }), _jsxs(SelectContent, { className: selectContentClasses, children: [_jsx(SelectItem, { value: "reading", children: "Reading (PDF)" }), _jsx(SelectItem, { value: "video", children: "Video (Link)" }), _jsx(SelectItem, { value: "resource", children: "Resource (Link)" }), _jsx(SelectItem, { value: "quiz", children: "Quiz (Link/External)" })] })] })] }), type === 'reading' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "material-file", className: deepBrown, children: "PDF File" }), _jsxs("div", { className: `flex items-center p-2 border rounded-md ${inputBorder}`, children: [_jsx("span", { className: `flex-1 mr-2 text-sm truncate ${file ? deepBrown : mutedText}`, children: file ? file.name : (isEditing && material?.contentUrl ? 'Current file stored (upload new to replace)' : 'No file selected') }), _jsx(Input, { id: "material-file", type: "file", ref: fileInputRef, onChange: handleFileChange, className: "hidden", accept: ".pdf", disabled: isSaving }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", className: outlineButtonClasses, onClick: () => fileInputRef.current?.click(), disabled: isSaving, children: [_jsx(UploadCloud, { className: "mr-2 h-4 w-4" }), " Choose PDF"] })] }), isEditing && material?.contentUrl && !file && (_jsx("p", { className: `text-xs ${mutedText}`, children: "Leave empty to keep the current file." }))] })), (type === 'video' || type === 'resource' || type === 'quiz') && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "material-url", className: deepBrown, children: type === 'video' ? 'Video URL' : type === 'quiz' ? 'Quiz URL' : 'Resource URL' }), _jsx(Input, { id: "material-url", value: contentUrl, 
                                    // *** FIX LINE 255 ***
                                    onChange: (e) => setContentUrl(e.target.value), placeholder: "Paste URL here (e.g., YouTube, Vimeo, external site)", className: inputClasses, disabled: isSaving })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "material-details", className: deepBrown, children: "Details (Optional)" }), _jsx(Input, { id: "material-details", value: details, 
                                    // *** FIX LINE 268 ***
                                    onChange: (e) => setDetails(e.target.value), placeholder: "e.g., Est. Reading Time: 45 mins, Video Duration: 15:30", className: inputClasses, disabled: isSaving })] })] }), _jsxs(CardFooter, { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", className: outlineButtonClasses, onClick: onClose, disabled: isSaving, children: "Cancel" }), _jsx(Button, { className: primaryButtonClasses, onClick: handleSaveClick, disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), " ", isEditing ? "Save Changes" : "Add Material"] })) })] })] }) }));
};
export default CreateEditMaterialModal;
