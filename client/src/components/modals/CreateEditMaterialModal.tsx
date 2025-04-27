import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card.js";
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
import { Label } from "../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { X, Save, Loader2, AlertCircle, UploadCloud, File, Video, BookOpen } from 'lucide-react';
import { Material } from '../../pages/admin/CourseManagementPage.js';


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
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
const fileInputClasses = `file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 ${inputClasses}`;
const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;


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
  const [type, setType] = useState<'video' | 'reading' | 'resource' | 'quiz'>('reading');
  const [details, setDetails] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!material;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (isEditing && material) {
        setTitle(material.title || '');
        setType(material.type || 'reading');
        setDetails(material.details || '');
        setContentUrl(material.contentUrl || '');
      } else {
        setTitle('');
        setType('reading');
        setDetails('');
        setContentUrl('');
      }
    }
  }, [isOpen, material, isEditing]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
       const selectedFile = event.target.files[0];
       if (selectedFile.type !== "application/pdf") {
           setError("Invalid file type. Please upload a PDF.");
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

  const handleSaveClick = async () => {
    setError(null);
    if (!title || !type) {
      setError("Material Title and Type are required.");
      return;
    }
     if (type === 'reading' && !isEditing && !file) {
        setError("A PDF file is required for 'Reading' type when creating.");
        return;
    }
     if (type !== 'reading' && !contentUrl) {
         setError("A URL is required for Video, Resource, or Quiz types.");
         return;
     }
    if (!weekId && !isEditing) {
        setError("Internal Error: Week ID is missing. Cannot create material.");
        return;
    }

    setIsSaving(true);

    const useFormData = type === 'reading' && (!isEditing || (isEditing && file));
    let dataToSend: FormData | (Material | Omit<Material, 'id'>);

    if (useFormData && file) {
        dataToSend = new FormData();
        dataToSend.append('title', title);
        dataToSend.append('type', type);
        dataToSend.append('details', details);
        dataToSend.append('file', file);
        if (isEditing && material){

        } else if (weekId) {
             dataToSend.append('weekId', weekId);
        }
    } else {
        dataToSend = {
            title,
            type,
            details,
            contentUrl: type !== 'reading' ? contentUrl : (isEditing ? material?.contentUrl : ''),
            weekId: isEditing && material ? material.weekId : weekId!,
        };
    }


    try {
        if (isEditing && material) {


            await onSave(useFormData ? dataToSend as FormData : { ...(dataToSend as Omit<Material, 'id'>), id: material.id });
        } else {

            await onSave(dataToSend as FormData | Omit<Material, 'id'>);
        }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving the material.");

    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className={`w-full max-w-lg ${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-xl`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className={deepBrown}>{isEditing ? "Edit Material" : "Add New Material"}</CardTitle>
            <CardDescription className={midBrown}>
              {isEditing ? `Modify details for ${material?.title}` : "Add a new learning material."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className={`h-5 w-5 ${midBrown}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-xs flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}

          <div className="space-y-2">
            <Label htmlFor="material-title" className={deepBrown}>Material Title</Label>
            <Input
              id="material-title"
              value={title}
              // *** FIX LINE 186 ***
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., Week 1 Reading: The Trinity"
              className={inputClasses}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-type" className={deepBrown}>Material Type</Label>
             <Select
                value={type}
                onValueChange={(value: 'video' | 'reading' | 'resource' | 'quiz') => {
                    setType(value);

                    if(value === 'reading') setContentUrl(''); else setFile(null);
                }}
                disabled={isSaving}
             >
                <SelectTrigger id="material-type" className={selectTriggerClasses}>
                    <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                     <SelectItem value="reading">Reading (PDF)</SelectItem>
                     <SelectItem value="video">Video (Link)</SelectItem>
                     <SelectItem value="resource">Resource (Link)</SelectItem>
                     <SelectItem value="quiz">Quiz (Link/External)</SelectItem>
                </SelectContent>
             </Select>
          </div>

           {type === 'reading' && (
                <div className="space-y-2">
                    <Label htmlFor="material-file" className={deepBrown}>PDF File</Label>
                    <div className={`flex items-center p-2 border rounded-md ${inputBorder}`}>
                        <span className={`flex-1 mr-2 text-sm truncate ${file ? deepBrown : mutedText}`}>
                            {file ? file.name : (isEditing && material?.contentUrl ? 'Current file stored (upload new to replace)' : 'No file selected')}
                        </span>
                        <Input
                        id="material-file"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf"
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
                            <UploadCloud className="mr-2 h-4 w-4"/> Choose PDF
                        </Button>
                     </div>
                     {isEditing && material?.contentUrl && !file && (
                         <p className={`text-xs ${mutedText}`}>Leave empty to keep the current file.</p>
                     )}
                </div>
            )}

           {(type === 'video' || type === 'resource' || type === 'quiz') && (
                <div className="space-y-2">
                    <Label htmlFor="material-url" className={deepBrown}>{type === 'video' ? 'Video URL' : type === 'quiz' ? 'Quiz URL' : 'Resource URL'}</Label>
                    <Input
                        id="material-url"
                        value={contentUrl}
                        // *** FIX LINE 255 ***
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContentUrl(e.target.value)}
                        placeholder="Paste URL here (e.g., YouTube, Vimeo, external site)"
                        className={inputClasses}
                        disabled={isSaving}
                    />
                </div>
           )}

          <div className="space-y-2">
            <Label htmlFor="material-details" className={deepBrown}>Details (Optional)</Label>
            <Input
              id="material-details"
              value={details}
              // *** FIX LINE 268 ***
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