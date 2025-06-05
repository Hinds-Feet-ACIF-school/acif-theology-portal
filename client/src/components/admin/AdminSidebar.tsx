// src/components/AdminSidebar.tsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Users, Settings, BarChart3, Sun, Moon,
    Home, // For Home Page Content
    Info, // For Overview/About Page Content
    Mail, // For Contact Page Content
    LayoutPanelLeft, 
    // Copyright, // No longer needed if Footer is part of Site Branding
    Palette // For Site Branding
    // Columns // Not used in this version, can be removed if not needed elsewhere
} from 'lucide-react';
import { useTheme } from '../theme-provider'; // Ensure this path is correct
import { Button } from '../ui/button'; // Ensure this path is correct

const adminManagementLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    // { name: 'Settings', href: '/admin/settings', icon: Settings }, // This might be for general app settings, Site Branding is separate
];

const userPageContentLinks = [
    { name: 'Home Page', href: '/admin/pages/home', icon: Home },
    { name: 'Overview Page', href: '/admin/pages/overview', icon: Info }, 
    { name: 'About Page', href: '/admin/pages/about', icon: Info },
    { name: 'Contact Page', href: '/admin/pages/contact', icon: Mail },
    { name: 'User Dashboard Page', href: '/admin/pages/user-dashboard', icon: LayoutPanelLeft }, 
    // { name: 'Footer Content', href: '/admin/pages/footer', icon: Copyright }, // REMOVED - Merged into Site Branding
];

const siteSettingsLinks = [
  { name: 'Site Branding', href: '/admin/settings/branding', icon: Palette }, // For Header & Footer, etc.
  { name: 'General Settings', href: '/admin/settings/general', icon: Settings }, // Example for other settings
];

const activeClassName = "bg-gray-200 dark:bg-gray-700 text-[#2A0F0F] dark:text-white";
const inactiveClassName = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white";

const AdminSidebar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [currentClientTheme, setCurrentClientTheme] = useState<string | undefined>(undefined); // Initialize undefined

  useEffect(() => {
    // Set the theme on the client side after mount to ensure consistency
    setCurrentClientTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold font-serif text-[#2A0F0F] dark:text-white">Admin Panel</h2>
        {currentClientTheme !== undefined && ( // Only render button if theme is determined
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full h-8 w-8"
                aria-label={`Switch to ${currentClientTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                {currentClientTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto"> 
        {/* Admin Management Links */}
        {adminManagementLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === '/admin'} 
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClassName : inactiveClassName}`
            }
          >
            <link.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {link.name}
          </NavLink>
        ))}

        {/* Manage Page Content Section */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Manage Page Content
          </h3>
          {userPageContentLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClassName : inactiveClassName}`
              }
            >
              <link.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Site Settings Section - ADDED RENDERING */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Site Settings
          </h3>
          {siteSettingsLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClassName : inactiveClassName}`
              }
            >
              <link.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {link.name}
            </NavLink>
          ))}
        </div>
      </nav>

       <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Admin Controls</p>
        </div>
    </aside>
  );
};

export default AdminSidebar;