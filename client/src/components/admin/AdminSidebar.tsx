import React from 'react';
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

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold font-serif text-[#2A0F0F] dark:text-white">Admin Panel</h2>

      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {adminLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClassName : inactiveClassName}`
            }
          >
            <link.icon className="mr-3 h-5 w-5" aria-hidden="true" />
            {link.name}
          </NavLink>
        ))}
      </nav>

       <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">

          <p className="text-xs text-gray-500 dark:text-gray-400">Admin Controls</p>
        </div>
    </aside>
  );
};

export default AdminSidebar;