import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.js";
import { Menu, X, LogOut } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/AuthContext.js";
export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { user, logout } = useAuth();
    const isAuthenticated = !!user;
    const baseNavigation = [
        { name: "Home", href: "/" },
        { name: "Program Overview", href: "/program-overview" },
        { name: "Courses", href: "/courses", requiresAuth: true },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];
    const filteredNavigation = baseNavigation.filter(item => !item.requiresAuth || isAuthenticated);
    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
            navigate("/");
        }
        catch (error) {
            console.error("Logout failed:", error);
        }
    };
    return (_jsxs("header", { className: "sticky top-0 px-4 z-50 w-full border-b border-[#C5A467]/20 bg-[#FFF8F0] dark:bg-[#2A0F0F] backdrop-blur supports-[backdrop-filter]:bg-[#FFF8F0]/90 dark:supports-[backdrop-filter]:bg-[#2A0F0F]/90", children: [_jsxs("div", { className: "container mx-auto flex h-16 items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("img", { src: logo, alt: "Apostolic Theology Logo", className: "h-8 w-8 rounded-full object-cover" }), _jsx("span", { className: "font-serif font-bold text-lg text-[#2A0F0F] dark:text-[#E0D6C3] hidden md:inline-block", children: "Apostolic Theology" })] }) }), _jsxs("nav", { className: "hidden md:flex items-center gap-8", children: [filteredNavigation.map((item) => (_jsx(Link, { to: item.href, className: `font-serif text-sm font-medium transition-colors hover:text-[#C5A467] ${pathname === item.href
                                    ? "text-[#2A0F0F] dark:text-white"
                                    : "text-[#4A1F1F] dark:text-[#E0D6C3]/80"}`, children: item.name }, item.name))), isAuthenticated && (_jsx(Link, { to: "/dashboard", className: `font-serif text-sm font-medium transition-colors hover:text-[#C5A467] ${pathname === "/dashboard"
                                    ? "text-[#2A0F0F] dark:text-white"
                                    : "text-[#4A1F1F] dark:text-[#E0D6C3]/80"}`, children: "Dashboard" }))] }), _jsx("div", { className: "hidden md:flex items-center gap-4", children: isAuthenticated ? (_jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: handleLogout, className: "border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center gap-1.5", children: [_jsx(LogOut, { size: 14 }), "Log out"] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", children: _jsx(Button, { variant: "outline", size: "sm", className: "border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10", children: "Log in" }) }), _jsx(Link, { to: "/register", children: _jsx(Button, { className: "bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold", size: "sm", children: "Register" }) })] })) }), _jsx("button", { type: "button", className: "md:hidden text-[#2A0F0F] dark:text-[#E0D6C3]", onClick: () => setIsMenuOpen(!isMenuOpen), "aria-label": isMenuOpen ? "Close menu" : "Open menu", "aria-expanded": isMenuOpen ? "true" : "false", "aria-controls": "mobile-menu", children: isMenuOpen ? _jsx(X, { className: "h-6 w-6" }) : _jsx(Menu, { className: "h-6 w-6" }) })] }), isMenuOpen && (_jsx("div", { id: "mobile-menu", className: "md:hidden py-4 px-4 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20 absolute top-16 inset-x-0 z-40 shadow-md", children: _jsxs("nav", { className: "flex flex-col space-y-4", children: [filteredNavigation.map((item) => (_jsx(Link, { to: item.href, className: `block py-2 font-serif text-base font-medium ${pathname === item.href
                                ? "text-[#2A0F0F] dark:text-white"
                                : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467]"}`, onClick: () => setIsMenuOpen(false), children: item.name }, item.name))), isAuthenticated && (_jsx(Link, { to: "/dashboard", className: `block py-2 font-serif text-base font-medium ${pathname === "/dashboard"
                                ? "text-[#2A0F0F] dark:text-white"
                                : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467]"}`, onClick: () => setIsMenuOpen(false), children: "Dashboard" })), _jsx("div", { className: "flex flex-col gap-3 pt-4 border-t border-[#C5A467]/20", children: isAuthenticated ? (_jsxs(Button, { type: "button", variant: "outline", className: "w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center justify-center gap-1.5", size: "sm", onClick: handleLogout, children: [_jsx(LogOut, { size: 14 }), "Log out"] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: "block w-full", onClick: () => setIsMenuOpen(false), children: _jsx(Button, { variant: "outline", className: "w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10", size: "sm", children: "Log in" }) }), _jsx(Link, { to: "/register", className: "block w-full", onClick: () => setIsMenuOpen(false), children: _jsx(Button, { className: "w-full bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold", size: "sm", children: "Register" }) })] })) })] }) }))] }));
}
