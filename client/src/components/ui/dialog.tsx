import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ className = '', children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => (
  <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>
);

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => (
  <div className="mt-6 flex justify-end gap-2">{children}</div>
); 