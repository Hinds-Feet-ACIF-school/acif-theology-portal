import React, { useState } from 'react';
import { Button, ButtonProps } from "../ui/button.js"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { X, Loader2, AlertTriangle } from 'lucide-react';

const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const destructiveButtonClasses = `bg-red-600 hover:bg-red-700 text-white font-semibold`;
const destructiveOutlineButtonClasses = `border-red-500 text-red-500 hover:bg-red-500/10 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-600/15`;

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void; 
  title: string;
  message: React.ReactNode; 
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonProps['variant'] | 'destructive';
  isConfirming?: boolean; 
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default", 
  isConfirming: externalIsConfirming,
}) => {
  const [internalIsConfirming, setInternalIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalIsConfirming !== undefined ? externalIsConfirming : internalIsConfirming;

  const handleConfirmClick = async () => {
    setError(null);
    if (externalIsConfirming === undefined) {
        setInternalIsConfirming(true);
    }
    try {
      await onConfirm();
     
    } catch (err: any) {
        console.error("Error during confirmation:", err);
        setError(err.message || "An error occurred during confirmation.");
    } finally {
      if (externalIsConfirming === undefined) {
        setInternalIsConfirming(false);
      }
    }
  };

  const handleClose = () => {
      if (!isLoading) {
          setError(null); 
          onClose();
      }
  }

  if (!isOpen) {
    return null;
  }

  let confirmButtonClasses = '';
  if (confirmVariant === 'destructive') {
    confirmButtonClasses = destructiveButtonClasses;
  } else if (confirmVariant === 'outline') {
    confirmButtonClasses = outlineButtonClasses;
  } else {
      confirmButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`; 
  }


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"> {/* Higher z-index */}
      <Card className={`w-full max-w-md ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl animate-scaleIn`}>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
             {confirmVariant === 'destructive' && <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />}
             <CardTitle className={`${deepBrown} text-lg`}>{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close modal" disabled={isLoading}>
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
           {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> {error}</div>}
          <div className={`text-sm ${midBrown}`}>
            {message}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" className={outlineButtonClasses} onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant !== 'destructive' ? confirmVariant : undefined}
            className={confirmButtonClasses} 
            onClick={handleConfirmClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmationModal;