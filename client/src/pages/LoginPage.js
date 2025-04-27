import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState(null);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handleGoBack = () => {
        navigate(-1);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (loading)
            return;
        try {
            const loggedInUser = await login(formData.email, formData.password);
            if (loggedInUser?.role === 'admin') {
                console.log('Admin logged in, navigating to /admin');
                navigate("/admin", { replace: true });
            }
            else {
                console.log(`User role ${loggedInUser?.role || 'unknown'}, navigating to /dashboard`);
                navigate("/dashboard", { replace: true });
            }
        }
        catch (error) {
            let message = "Invalid email or password. Please try again.";
            if (error?.message) {
                message = error.message;
            }
            else if (error?.response?.data?.message) {
                message = error.response.data.message;
            }
            setFormError(message);
            console.error("Login page error:", error);
        }
    };
    return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-screen py-12 bg-[#FFF8F0] dark:bg-gray-950 px-4", children: _jsxs("div", { className: "mx-auto max-w-md w-full", children: [_jsxs(Card, { className: "bg-white dark:bg-gray-900 border border-[#C5A467]/20 dark:border-[#C5A467]/30 shadow-lg relative", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: handleGoBack, className: `absolute top-3 left-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[${accentColor}] dark:hover:text-[${accentColor}] rounded-full`, "aria-label": "Go back", children: _jsx(ArrowLeft, { className: "h-5 w-5" }) }), _jsxs(CardHeader, { className: "space-y-2 pt-12 pb-6 text-center", children: [_jsx(CardTitle, { className: `text-2xl font-serif ${primaryTextLight} ${primaryTextDark}`, children: "Welcome Back" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Log in to your student account" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(CardContent, { className: "space-y-4 pt-2 pb-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: `${primaryTextLight} ${primaryTextDark} font-medium`, children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleChange, required: true, autoComplete: "email", className: `bg-[#FFF8F0] dark:bg-gray-800 border-[#E0D6C3] dark:border-gray-700 focus:border-[${accentColor}] dark:focus:border-[${accentColor}] focus:ring-[${accentColor}] ${primaryTextLight} ${primaryTextDark}` })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "password", className: `${primaryTextLight} ${primaryTextDark} font-medium`, children: "Password" }), _jsx(Link, { to: "/forgot-password", className: `text-sm text-[${accentColor}] hover:text-[${accentHoverColor}] underline transition-colors`, children: "Forgot password?" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", value: formData.password, onChange: handleChange, required: true, autoComplete: "current-password", className: `bg-[#FFF8F0] dark:bg-gray-800 border-[#E0D6C3] dark:border-gray-700 focus:border-[${accentColor}] dark:focus:border-[${accentColor}] focus:ring-[${accentColor}] ${primaryTextLight} ${primaryTextDark} pr-10` }), _jsx("button", { type: "button", onClick: togglePasswordVisibility, className: `absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[${accentColor}] dark:hover:text-[${accentColor}]`, "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5" })) : (_jsx(Eye, { className: "h-5 w-5" })) })] })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "rememberMe", name: "rememberMe", checked: formData.rememberMe, onChange: handleChange, className: `h-4 w-4 rounded border-[#B08F55] dark:border-gray-600 text-[${accentColor}] focus:ring-[${accentColor}] focus:ring-offset-0 bg-[#FFF8F0] dark:bg-gray-800` }), _jsx("label", { htmlFor: "rememberMe", className: `text-sm ${secondaryTextLight} ${secondaryTextDark}`, children: "Remember me" })] }), formError && (_jsx("p", { className: "text-sm text-red-600 dark:text-red-400 text-center pt-2", children: formError }))] }), _jsx(CardFooter, { className: "pt-4 pb-6", children: _jsx(Button, { type: "submit", className: `w-full bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors disabled:opacity-70`, disabled: loading, children: loading ? 'Logging in...' : 'Log in' }) })] })] }), _jsxs("div", { className: `mt-6 text-center text-sm ${secondaryTextLight} ${secondaryTextDark}`, children: ["Don't have an account?", " ", _jsx(Link, { to: "/register", className: `text-[${accentColor}] hover:text-[${accentHoverColor}] underline font-medium transition-colors`, children: "Register Now" })] })] }) }));
}
