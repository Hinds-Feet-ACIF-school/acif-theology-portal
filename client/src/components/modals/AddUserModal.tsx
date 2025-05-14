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

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        country: '',
        church: '',
        role: 'student' as 'student' | 'admin' | 'instructor', // Added instructor
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value as 'student' | 'admin' | 'instructor' }));
    };

    const validateForm = (): boolean => {
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

    const handleSubmit = async (e: React.FormEvent) => {
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
        } catch (err: any) {
            console.error("Failed to add user:", err);
            setError(err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.");
        } finally {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-[525px] ${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <DialogHeader>
                    {/* Apply className to a span inside DialogTitle */}
                    <DialogTitle>
                        <span className={deepBrown}>Add New User</span>
                    </DialogTitle>
                    {/* Apply className to a span inside DialogDescription */}
                    <DialogDescription>
                        <span className={midBrown}>
                            Enter the details for the new user account. An email is not sent automatically.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="mb-0 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2 text-sm col-span-2 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0"/>
                                <span>{error}</span>
                                <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto p-1 h-auto text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50 -mr-2"><X size={16}/></Button>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="firstName" className={midBrown}>First Name *</Label>
                                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClasses} required disabled={isLoading} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="lastName" className={midBrown}>Last Name *</Label>
                                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClasses} required disabled={isLoading} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email" className={midBrown}>Email Address *</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={inputClasses} required disabled={isLoading} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password" className={midBrown}>Password * <span className='text-xs'> (Min. 6 characters)</span></Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className={inputClasses} required minLength={6} disabled={isLoading} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="country" className={midBrown}>Country *</Label>
                                <Input id="country" name="country" value={formData.country} onChange={handleInputChange} className={inputClasses} required disabled={isLoading} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="church" className={midBrown}>Church (Optional)</Label>
                                <Input id="church" name="church" value={formData.church} onChange={handleInputChange} className={inputClasses} disabled={isLoading} />
                            </div>
                        </div>
                        <div className="space-y-1">
                             <Label htmlFor="role" className={midBrown}>Assign Role *</Label>
                             <Select name="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)} required disabled={isLoading}>
                                <SelectTrigger id="role" className={selectTriggerClasses}>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClasses}>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" className={primaryButtonClasses} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddUserModal;