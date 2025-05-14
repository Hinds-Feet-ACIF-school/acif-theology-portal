import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { X, Save, Loader2, AlertCircle, UploadCloud } from 'lucide-react';
import { Material } from '../../services/api'; 
// --- Constants (keep as is) ---
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown} z-[60]`;
// ---

// --- Define allowed file types ---
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const ALLOWED_FILE_TYPES_STRING = ALLOWED_FILE_EXTENSIONS.join(',');
// ---

interface CreateEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  weekId: string | undefined;
  onSave: (materialData: FormData | (Material | Omit<Material, 'id'>)) => Promise<void>;
}

const CreateEditMaterialModal: React.FC<CreateEditMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
  weekId,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'reading' | 'resource'>('reading');
  const [details, setDetails] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!material;
  const isInitialMount = useRef(true); // Ref to track initial mount

  // Effect to reset form when modal opens or material changes
  useEffect(() => {
    if (isOpen) {
      isInitialMount.current = true; // Reset mount tracking when modal opens
      setError(null);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (isEditing && material) {
        setTitle(material.title || '');
        // Set type directly without triggering side effect logic here
        const currentType = material.type === 'video' || material.type === 'reading' || material.type === 'resource' ? material.type : 'reading';
        setType(currentType);
        setDetails(material.details || '');
        // Only set contentUrl if it's relevant for the initial type
        setContentUrl(currentType === 'video' || currentType === 'resource' ? material.contentUrl || '' : '');
      } else {
        setTitle('');
        setType('reading'); // Set default type
        setDetails('');
        setContentUrl(''); // Reset URL
      }
       // Mark initial mount as done after setup
       requestAnimationFrame(() => { isInitialMount.current = false; });
    } else {
        isInitialMount.current = true; // Reset when closed
    }
  }, [isOpen, material, isEditing]);


  // --- NEW Effect to handle side effects when 'type' changes ---
  useEffect(() => {
    // Don't run the side effect on the very first render after opening/editing
    if (isInitialMount.current) {
      return;
    }

    // Reset the *other* input field based on the new type
    if (type === 'reading') {
      setContentUrl('');
    } else { // type is 'video' or 'resource'
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the actual file input display
      }
    }
  }, [type]); // Only run when 'type' state changes
  // --- End NEW Effect ---

  const handleTypeChange = (value: 'video' | 'reading' | 'resource') => {
    console.log("handleTypeChange called with:", value);
    setType(value);
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { // (implementation unchanged)
    if (event.target.files && event.target.files[0]) {
       const selectedFile = event.target.files[0];
       const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
       if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
           setError(`Invalid file type. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`);
           setFile(null);
           if (fileInputRef.current) fileInputRef.current.value = "";
           return;
       }
       setError(null);
       setFile(selectedFile);
    } else {
       setFile(null);
    }
  };

  const handleSaveClick = async () => { // (implementation unchanged)
    setError(null);
    if (!title || !type) {
      setError("Material Title and Type are required.");
      return;
    }
     if (type === 'reading' && !isEditing && !file) {
        setError(`A file (${ALLOWED_FILE_EXTENSIONS.join('/')}) is required for 'Reading/Document' type when creating.`);
        return;
    }
     if ((type === 'video' || type === 'resource') && !contentUrl) {
         setError(`A URL is required for ${type === 'video' ? 'Video' : 'Resource'} types.`);
         return;
     }
    if (!weekId && !isEditing) {
        setError("Internal Error: Week ID is missing. Cannot create material.");
        console.error("Attempted to save material without weekId");
        return;
    }

    setIsSaving(true);

    const useFormData = type === 'reading' && file !== null;
    let dataToSend: FormData | (Material | Omit<Material, 'id'>);

    if (useFormData && file) {
        console.log("Using FormData to save material");
        dataToSend = new FormData();
        dataToSend.append('title', title);
        dataToSend.append('type', type);
        dataToSend.append('details', details);
        dataToSend.append('file', file);
        if (weekId) {
             dataToSend.append('weekId', weekId);
        }
        if (isEditing && material) {
            console.warn("Handling ID for FormData update might need specific API logic.");
        }
    } else {
        console.log("Using JSON to save material");
        dataToSend = {
            title,
            type,
            details,
            contentUrl: (type === 'video' || type === 'resource')
                ? contentUrl
                : (isEditing && type === 'reading' && !file ? material?.contentUrl : undefined),
            weekId: isEditing && material ? material.weekId : weekId!,
        };
         if (type === 'reading' && !dataToSend.contentUrl) {
             delete (dataToSend as Material | Omit<Material, 'id'>).contentUrl;
         }
    }

    try {
        console.log("Data being sent to onSave:", dataToSend);
        if (isEditing && material) {
            await onSave(useFormData ? dataToSend as FormData : { ...(dataToSend as Omit<Material, 'id'>), id: material.id });
        } else {
            await onSave(dataToSend as FormData | Omit<Material, 'id'>);
        }
        onClose();
    } catch (err: any) {
      console.error("Error during onSave call:", err);
      setError(err.message || "An unexpected error occurred while saving the material.");
    } finally {
      setIsSaving(false);
    }
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <Card className={`w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl animate-scaleIn`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className={deepBrown}>{isEditing ? "Edit Material" : "Add New Material"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for ${material?.title}` : "Add a new learning material."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal" disabled={isSaving}>
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {error && <div role="alert" className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}

          <div className="space-y-2">
            <Label htmlFor="material-title" className={deepBrown}>Material Title</Label>
            <Input
              id="material-title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., Week 1 Slides, Chapter 2 Notes"
              className={inputClasses}
              disabled={isSaving}
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-type" className={deepBrown}>Material Type</Label>
             <Select
                value={type}
                onValueChange={handleTypeChange}
                disabled={isSaving}
                required
                aria-required="true"
             >
                <SelectTrigger id="material-type" className={selectTriggerClasses}>
                    <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                     <SelectItem value="reading">Reading / Document</SelectItem>
                     <SelectItem value="video">Video (Link)</SelectItem>
                     <SelectItem value="resource">Resource (Link)</SelectItem>
                </SelectContent>
             </Select>
          </div>

           {type === 'reading' && (
                <div className="space-y-2">
                    <Label htmlFor="material-file" className={deepBrown}>Upload File {isEditing ? '(Optional: Replace existing)' : '(Required)'}</Label>
                    <div className={`flex items-center p-2 border rounded-md ${inputBorder}`}>
                        <span className={`flex-1 mr-2 text-sm truncate ${file ? deepBrown : mutedText}`}>
                            {file ? file.name : (isEditing && material?.contentUrl ? 'Current file stored' : 'No file selected')}
                        </span>
                        <Input
                        id="material-file"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept={ALLOWED_FILE_TYPES_STRING}
                        disabled={isSaving}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={outlineButtonClasses}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                            >
                            <UploadCloud className="mr-2 h-4 w-4"/> Choose File
                        </Button>
                     </div>
                     <p className={`text-xs ${mutedText}`}>Allowed types: pdf, doc(x), ppt(x)</p>
                </div>
            )}

           {(type === 'video' || type === 'resource') && (
                <div className="space-y-2">
                    <Label htmlFor="material-url" className={deepBrown}>{type === 'video' ? 'Video URL' : 'Resource URL'} (Required)</Label>
                    <Input
                        id="material-url"
                        value={contentUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentUrl(e.target.value)}
                        placeholder="Paste URL here (e.g., YouTube, external site)"
                        className={inputClasses}
                        disabled={isSaving}
                        required
                        aria-required="true"
                        type="url"
                    />
                </div>
           )}

          <div className="space-y-2">
            <Label htmlFor="material-details" className={deepBrown}>Details (Optional)</Label>
            <Input
              id="material-details"
              value={details}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetails(e.target.value)}
              placeholder="e.g., Est. Reading Time: 45 mins, Video Duration: 15:30"
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" className={outlineButtonClasses} onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className={primaryButtonClasses} onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> {isEditing ? "Save Changes" : "Add Material"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEditMaterialModal;