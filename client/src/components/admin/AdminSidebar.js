import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, FileText, Settings, BarChart3 } from 'lucide-react';
const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Quizzes', href: '/admin/quizzes', icon: FileText },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];
const activeClassName = "bg-gray-200 dark:bg-gray-700 text-[#2A0F0F] dark:text-white";
const inactiveClassName = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white";
const AdminSidebar = () => {
    return (_jsxs("aside", { className: "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0", children: [_jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h2", { className: "text-xl font-semibold font-serif text-[#2A0F0F] dark:text-white", children: "Admin Panel" }) }), _jsx("nav", { className: "flex-1 p-4 space-y-2 overflow-y-auto", children: adminLinks.map((link) => (_jsxs(NavLink, { to: link.href, end: true, className: ({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClassName : inactiveClassName}`, children: [_jsx(link.icon, { className: "mr-3 h-5 w-5", "aria-hidden": "true" }), link.name] }, link.name))) }), _jsx("div", { className: "p-4 mt-auto border-t border-gray-200 dark:border-gray-700", children: _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Admin Controls" }) })] }));
};
export default AdminSidebar;
