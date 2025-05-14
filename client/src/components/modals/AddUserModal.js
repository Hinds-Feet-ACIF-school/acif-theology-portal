import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/modals/AddUserModal.tsx (or wherever it is)
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.js';
import { Loader2, AlertCircle, X } from 'lucide-react';
import * as apiService from '../../services/api';
// import { AdminManagedUser } from '../../pages/admin/StudentManagementPage.js'; // Not used in this component
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const selectTriggerClasses = `h-10 rounded-md px-3 text-sm w-full ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;
const inputClasses = `h-10 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        country: '',
        church: '',
        role: 'student', // Added instructor
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.country || !formData.role) {
            setError('Please fill in all required fields (First Name, Last Name, Email, Password, Country, Role).');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        setError(null);
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                country: formData.country,
                church: formData.church || undefined, // Send undefined if empty, backend might prefer this over null
                role: formData.role,
            };
            await apiService.createUserAdmin(userData);
            onSuccess();
        }
        catch (err) {
            console.error("Failed to add user:", err);
            setError(err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    React.useEffect(() => {
        if (!isOpen) {
            setFormData({
                firstName: '', lastName: '', email: '', password: '',
                country: '', church: '', role: 'student'
            });
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: `sm:max-w-[525px] ${lightCardBg} ${darkCardBg} border ${inputBorder}`, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: _jsx("span", { className: deepBrown, children: "Add New User" }) }), _jsx(DialogDescription, { children: _jsx("span", { className: midBrown, children: "Enter the details for the new user account. An email is not sent automatically." }) })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 py-4", children: [error && (_jsxs("div", { className: "mb-0 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2 text-sm col-span-2 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0" }), _jsx("span", { children: error }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setError(null), className: "ml-auto p-1 h-auto text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50 -mr-2", children: _jsx(X, { size: 16 }) })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "firstName", className: midBrown, children: "First Name *" }), _jsx(Input, { id: "firstName", name: "firstName", value: formData.firstName, onChange: handleInputChange, className: inputClasses, required: true, disabled: isLoading })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "lastName", className: midBrown, children: "Last Name *" }), _jsx(Input, { id: "lastName", name: "lastName", value: formData.lastName, onChange: handleInputChange, className: inputClasses, required: true, disabled: isLoading })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "email", className: midBrown, children: "Email Address *" }), _jsx(Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleInputChange, className: inputClasses, required: true, disabled: isLoading })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs(Label, { htmlFor: "password", className: midBrown, children: ["Password * ", _jsx("span", { className: 'text-xs', children: " (Min. 6 characters)" })] }), _jsx(Input, { id: "password", name: "password", type: "password", value: formData.password, onChange: handleInputChange, className: inputClasses, required: true, minLength: 6, disabled: isLoading })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "country", className: midBrown, children: "Country *" }), _jsx(Input, { id: "country", name: "country", value: formData.country, onChange: handleInputChange, className: inputClasses, required: true, disabled: isLoading })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "church", className: midBrown, children: "Church (Optional)" }), _jsx(Input, { id: "church", name: "church", value: formData.church, onChange: handleInputChange, className: inputClasses, disabled: isLoading })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "role", className: midBrown, children: "Assign Role *" }), _jsxs(Select, { name: "role", value: formData.role, onValueChange: (value) => handleSelectChange('role', value), required: true, disabled: isLoading, children: [_jsx(SelectTrigger, { id: "role", className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Select role" }) }), _jsxs(SelectContent, { className: selectContentClasses, children: [_jsx(SelectItem, { value: "student", children: "Student" }), _jsx(SelectItem, { value: "instructor", children: "Instructor" }), _jsx(SelectItem, { value: "admin", children: "Admin" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: isLoading, children: "Cancel" }), _jsxs(Button, { type: "submit", className: primaryButtonClasses, disabled: isLoading, children: [isLoading ? _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null, isLoading ? 'Creating...' : 'Create User'] })] })] })] }) }));
};
export default AddUserModal;
