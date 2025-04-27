import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.js';
const AdminLayout = () => {
    return (_jsxs("div", { className: "flex h-screen bg-gray-100 dark:bg-gray-900", children: [_jsx(AdminSidebar, {}), _jsx("div", { className: "flex-1 flex flex-col overflow-hidden", children: _jsx("main", { className: "flex-1 overflow-x-hidden overflow-y-auto p-6", children: _jsx(Outlet, {}) }) })] }));
};
export default AdminLayout;
