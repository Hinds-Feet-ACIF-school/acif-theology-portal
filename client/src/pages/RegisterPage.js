import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js";
import { Checkbox } from "../components/ui/checkbox.js";
import { useAuth } from "../context/AuthContext.js";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const contentBgLight = "bg-white";
const contentBgDark = "dark:bg-gray-900";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        country: "",
        church: "",
        intake: "",
        agreeTerms: false,
    });
    const [formError, setFormError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (step !== 3)
            return;
        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match");
            return;
        }
        if (!formData.agreeTerms) {
            setFormError("You must agree to the terms and conditions");
            return;
        }
        if (loading)
            return;
        try {
            const registrationData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                country: formData.country,
                church: formData.church,
            };
            await register(registrationData);
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || "Registration failed. Please check your details.";
            setFormError(message);
            console.error("Registration Error:", error);
        }
    };
    const nextStep = () => {
        if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.password.length < 6 || formData.password !== formData.confirmPassword)) {
            setFormError("Please fill all required fields (password minimum 6 characters) and ensure passwords match.");
            return;
        }
        if (step === 2 && !formData.country) {
            setFormError("Please select your country.");
            return;
        }
        setFormError(null);
        setStep((s) => Math.min(s + 1, 3));
    };
    const prevStep = () => {
        setFormError(null);
        setStep((s) => Math.max(s - 1, 1));
    };
    const inputClasses = `flex h-10 w-full rounded-md border ${inputBorderLight} ${inputBorderDark} ${inputBgLight} ${inputBgDark} px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] disabled:cursor-not-allowed disabled:opacity-50 ${primaryTextLight} ${primaryTextDark} shadow-sm transition-colors`;
    const inputWithIconPadding = "pr-10";
    const selectTriggerClasses = `${inputClasses} flex items-center justify-between w-full`;
    const selectContentClasses = `relative z-50 min-w-[8rem] overflow-hidden rounded-md border ${cardBorder} ${contentBgLight} ${contentBgDark} ${primaryTextLight} ${primaryTextDark} shadow-md animate-in fade-in-80`;
    const selectItemClasses = `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-[#C5A467]/10 dark:focus:bg-[#C5A467]/20 data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/20`;
    const buttonPrimaryClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;
    const buttonOutlineClasses = `border border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] hover:border-[${accentColor}] dark:hover:text-[${accentColor}] dark:hover:border-[${accentColor}] hover:bg-transparent dark:hover:bg-transparent transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;
    return (_jsx("div", { className: "flex flex-col items-center min-h-screen py-12 bg-[#FFF8F0] dark:bg-gray-950 px-4", children: _jsxs("div", { className: "container max-w-2xl px-4 md:px-6", children: [_jsx("div", { className: "w-full mb-6 flex justify-start", children: _jsxs("button", { type: "button", onClick: () => navigate(-1), className: `group flex items-center gap-1 ${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] dark:hover:text-[${accentColor}] transition-colors duration-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[${accentColor}] p-1 rounded-md -ml-1`, "aria-label": "Go back", children: [_jsx("span", { className: "inline-flex items-center justify-center w-5 h-5 rounded-full border border-transparent group-hover:border-[#C5A467]/60 dark:group-hover:border-[#C5A467]/60 group-hover:bg-[#C5A467]/10 dark:group-hover:bg-[#C5A467]/20 transition-colors duration-150", children: _jsx(ArrowLeft, { size: 16, strokeWidth: 2.5 }) }), _jsx("span", { children: "Back" })] }) }), _jsx("div", { className: "flex flex-col items-center space-y-4 text-center mb-12", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: `text-3xl font-bold font-serif tracking-tight sm:text-4xl ${primaryTextLight} ${primaryTextDark}`, children: "Register for Certificate Program" }), _jsx("p", { className: `mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`, children: "Complete the registration form to join our next cohort" })] }) }), _jsxs("div", { className: "mx-auto w-full", children: [_jsx("div", { className: "flex items-start justify-between mb-8 max-w-md mx-auto", children: [1, 2, 3].map((num, index, arr) => (_jsxs(React.Fragment, { children: [_jsxs("div", { className: `flex flex-col items-center transition-colors duration-300 ${step >= num ? `text-[${accentColor}]` : `${mutedTextLight} ${mutedTextDark}`}`, children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center mb-2 font-semibold transition-colors duration-300 ${step >= num ? `bg-[${accentColor}] text-[#2A0F0F]` : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}`, children: num }), _jsx("span", { className: "text-xs text-center font-medium", children: num === 1 ? "Account" : num === 2 ? "Profile" : "Confirm" })] }), index < arr.length - 1 && (_jsx("div", { className: "flex-1 px-2 pt-4", children: _jsx("div", { className: `h-1 w-full rounded transition-colors duration-300 ${step > num ? `bg-[${accentColor}]` : "bg-gray-200 dark:bg-gray-700"}` }) }))] }, num))) }), _jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-lg max-w-md mx-auto`, children: _jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [step === 1 && (_jsxs(_Fragment, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Create Your Account" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Enter your details to create your student account" })] }), _jsxs(CardContent, { className: "space-y-4", children: [formError && _jsx("p", { className: "text-red-600 dark:text-red-400 text-xs font-medium mb-4", children: formError }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "firstName", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: "First Name" }), _jsx(Input, { id: "firstName", name: "firstName", value: formData.firstName, onChange: handleChange, required: true, "aria-required": "true", className: inputClasses })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "lastName", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: "Last Name" }), _jsx(Input, { id: "lastName", name: "lastName", value: formData.lastName, onChange: handleChange, required: true, "aria-required": "true", className: inputClasses })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "email", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleChange, required: true, "aria-required": "true", className: inputClasses })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "password", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", value: formData.password, onChange: handleChange, required: true, "aria-required": "true", className: `${inputClasses} ${inputWithIconPadding}`, minLength: 6, "aria-describedby": "password-hint" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer focus:outline-none rounded-full", "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }), _jsx("p", { id: "password-hint", className: "text-xs text-gray-500 dark:text-gray-400", children: "Minimum 6 characters." })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "confirmPassword", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? "text" : "password", value: formData.confirmPassword, onChange: handleChange, required: true, "aria-required": "true", className: `${inputClasses} ${inputWithIconPadding}`, "aria-invalid": !!(formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword), "aria-describedby": "confirmPassword-error" }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer focus:outline-none rounded-full", "aria-label": showConfirmPassword ? "Hide confirmation password" : "Show confirmation password", children: showConfirmPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }), formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (_jsx("p", { id: "confirmPassword-error", className: "text-xs text-red-600 dark:text-red-400 pt-1 font-medium", children: "Passwords do not match." }))] })] }), _jsx(CardFooter, { className: "flex justify-end pt-6", children: _jsx(Button, { type: "button", onClick: nextStep, className: buttonPrimaryClasses, disabled: !formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.password.length < 6 || formData.password !== formData.confirmPassword, children: "Next" }) })] })), step === 2 && (_jsxs(_Fragment, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Your Profile" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Tell us more about yourself" })] }), _jsxs(CardContent, { className: "space-y-4", children: [formError && _jsx("p", { className: "text-red-600 dark:text-red-400 text-xs font-medium mb-4", children: formError }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { htmlFor: "country", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: "Country" }), _jsxs(Select, { value: formData.country, onValueChange: (value) => handleSelectChange("country", value), required: true, children: [_jsx(SelectTrigger, { id: "country", className: selectTriggerClasses, "aria-required": "true", children: _jsx(SelectValue, { placeholder: "Select your country" }) }), _jsxs(SelectContent, { className: selectContentClasses, children: [_jsx(SelectItem, { value: "ethiopia", className: selectItemClasses, children: "Ethiopia" }), _jsx(SelectItem, { value: "kenya", className: selectItemClasses, children: "Kenya" }), _jsx(SelectItem, { value: "nigeria", className: selectItemClasses, children: "Nigeria" }), _jsx(SelectItem, { value: "ghana", className: selectItemClasses, children: "Ghana" }), _jsx(SelectItem, { value: "usa", className: selectItemClasses, children: "United States" }), _jsx(SelectItem, { value: "uk", className: selectItemClasses, children: "United Kingdom" }), _jsx(SelectItem, { value: "other", className: selectItemClasses, children: "Other" })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs(Label, { htmlFor: "church", className: `${primaryTextLight} ${primaryTextDark} text-sm font-medium`, children: ["Church Affiliation ", _jsx("span", { className: "text-xs text-gray-400", children: "(Optional)" })] }), _jsx(Input, { id: "church", name: "church", value: formData.church, onChange: handleChange, placeholder: "Your local church or ministry", className: inputClasses })] })] }), _jsxs(CardFooter, { className: "flex justify-between pt-6", children: [_jsx(Button, { variant: "outline", type: "button", onClick: prevStep, className: buttonOutlineClasses, children: "Back" }), _jsx(Button, { type: "button", onClick: nextStep, className: buttonPrimaryClasses, disabled: !formData.country, children: "Next" })] })] })), step === 3 && (_jsxs(_Fragment, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Confirm & Submit" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Review your information before submitting" })] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: `text-sm ${primaryTextLight} ${primaryTextDark}`, children: [_jsx("strong", { children: "Full Name:" }), " ", formData.firstName, " ", formData.lastName] }), _jsxs("div", { className: `text-sm ${primaryTextLight} ${primaryTextDark}`, children: [_jsx("strong", { children: "Email:" }), " ", formData.email] }), _jsxs("div", { className: `text-sm ${primaryTextLight} ${primaryTextDark}`, children: [_jsx("strong", { children: "Country:" }), " ", formData.country] }), _jsxs("div", { className: `text-sm ${primaryTextLight} ${primaryTextDark}`, children: [_jsx("strong", { children: "Church:" }), " ", formData.church || 'N/A'] }), _jsxs("div", { className: "flex items-start space-x-2 pt-4", children: [_jsx(Checkbox, { id: "agreeTerms", name: "agreeTerms", checked: formData.agreeTerms, onCheckedChange: (checked) => handleSelectChange("agreeTerms", !!checked), required: true, "aria-required": "true", className: `border-[#C5A467]/50 data-[state=checked]:bg-[${accentColor}] data-[state=checked]:text-[#2A0F0F] focus-visible:ring-[${accentColor}] mt-0.5` }), _jsxs(Label, { htmlFor: "agreeTerms", className: `text-xs ${mutedTextLight} ${mutedTextDark} leading-snug`, children: ["I agree to the", " ", _jsx(Link, { to: "/terms", target: "_blank", rel: "noopener noreferrer", className: `underline hover:text-[${accentColor}] transition-colors`, children: "terms and conditions" }), " ", "and", " ", _jsx(Link, { to: "/privacy", target: "_blank", rel: "noopener noreferrer", className: `underline hover:text-[${accentColor}] transition-colors`, children: "privacy policy" }), "."] })] }), formError && _jsx("p", { className: "text-red-600 dark:text-red-400 text-xs font-medium pt-2", children: formError })] }), _jsxs(CardFooter, { className: "flex justify-between pt-6", children: [_jsx(Button, { variant: "outline", type: "button", onClick: prevStep, className: buttonOutlineClasses, children: "Back" }), _jsx(Button, { type: "submit", className: buttonPrimaryClasses, disabled: loading || !formData.agreeTerms, children: loading ? (_jsxs("span", { className: "flex items-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-[#2A0F0F]", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Submitting..."] })) : ("Submit Registration") })] })] }))] }) })] }), _jsx("div", { className: "text-center mt-8", children: _jsxs("p", { className: `${mutedTextLight} ${mutedTextDark} text-sm`, children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: `${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] dark:hover:text-[${accentColor}] font-medium transition-colors`, children: "Log in" })] }) })] }) }));
}
