import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Dialog = ({ open, onOpenChange, children }) => {
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "fixed inset-0 bg-black/50", onClick: () => onOpenChange(false) }), _jsx("div", { className: "relative z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg", children: children })] }));
};
export const DialogContent = ({ className = '', children }) => (_jsx("div", { className: `p-6 ${className}`, children: children }));
export const DialogHeader = ({ children }) => (_jsx("div", { className: "mb-4", children: children }));
export const DialogTitle = ({ children }) => (_jsx("h2", { className: "text-lg font-semibold", children: children }));
export const DialogDescription = ({ children }) => (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: children }));
export const DialogFooter = ({ children }) => (_jsx("div", { className: "mt-6 flex justify-end gap-2", children: children }));
