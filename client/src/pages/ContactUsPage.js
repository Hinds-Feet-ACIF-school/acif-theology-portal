import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Textarea } from '../components/ui/textarea.js';
import { Label } from '../components/ui/label.js';
import { Card, CardContent, CardFooter } from '../components/ui/card.js';
import { Mail, Send, Loader2, CheckCircle } from 'lucide-react';
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-900";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const goldBg = `bg-[${accentColor}]`;
const goldBgHover = `hover:bg-[${accentHoverColor}]`;
export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setError("Please fill out all required fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            console.log("Submitting contact form:", formData);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }
        catch (err) {
            console.error("Contact form submission error:", err);
            setError(err.message || "Failed to send message. Please try again later.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const inputClasses = `flex h-10 w-full rounded-md border ${inputBorderLight} ${inputBorderDark} ${inputBgLight} ${inputBgDark} px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] disabled:cursor-not-allowed disabled:opacity-50 ${primaryTextLight} ${primaryTextDark} shadow-sm transition-colors`;
    const textareaClasses = `${inputClasses} min-h-[100px]`;
    const buttonPrimaryClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: [_jsx("section", { className: `w-full py-16 md:py-24 lg:py-32 ${altSectionBgLight} ${altSectionBgDark} border-b ${cardBorder}`, children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "flex flex-col items-center space-y-4 text-center", children: [_jsx(Mail, { className: `h-10 w-10 text-[${accentColor}] mb-3` }), _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: `text-3xl font-bold font-serif tracking-tight sm:text-4xl md:text-5xl ${primaryTextLight} ${primaryTextDark}`, children: "Contact Us" }), _jsx("p", { className: `mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`, children: "We'd love to hear from you! Reach out with any questions or inquiries." })] })] }) }) }), _jsx("section", { className: `w-full py-12 md:py-16 lg:py-20 ${sectionBgLight} ${sectionBgDark}`, children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-2 lg:gap-16", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: `text-2xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Get in Touch" }), _jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: _jsx(CardContent, { className: "p-6 space-y-4", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Mail, { className: `h-5 w-5 text-[${accentColor}] mt-1 flex-shrink-0` }), _jsxs("div", { children: [_jsx("h3", { className: `font-semibold ${primaryTextLight} ${primaryTextDark}`, children: "Email" }), _jsx("a", { href: "mailto:info@apostolictheology.org", className: `${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] transition-colors break-all`, children: "info@apostolictheology.org" }), _jsx("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark} mt-1`, children: "For general inquiries and admissions" })] })] }) }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: `text-2xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Send Us a Message" }), _jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: _jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [_jsxs(CardContent, { className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "name", className: `${primaryTextLight} ${primaryTextDark}`, children: "Name" }), _jsx(Input, { id: "name", name: "name", value: formData.name, onChange: handleChange, required: true, className: inputClasses })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "email", className: `${primaryTextLight} ${primaryTextDark}`, children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleChange, required: true, className: inputClasses })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "subject", className: `${primaryTextLight} ${primaryTextDark}`, children: "Subject" }), _jsx(Input, { id: "subject", name: "subject", value: formData.subject, onChange: handleChange, required: true, className: inputClasses })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "message", className: `${primaryTextLight} ${primaryTextDark}`, children: "Message" }), _jsx(Textarea, { id: "message", name: "message", value: formData.message, onChange: handleChange, required: true, rows: 5, className: textareaClasses })] }), error && (_jsx("p", { className: "text-sm font-medium text-red-600 dark:text-red-400", children: error })), success && (_jsxs("p", { className: "text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16 }), " Message sent successfully! We'll be in touch soon."] }))] }), _jsx(CardFooter, { className: "p-6 pt-0", children: _jsx(Button, { type: "submit", className: buttonPrimaryClasses, disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Sending..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), " Send Message"] })) }) })] }) })] })] }) }) })] }));
}
