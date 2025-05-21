// src/components/IntegratedRichTextEditor.tsx

import React, { useRef, useEffect, useCallback } from 'react';
import { RichTextEditor as MantineRTE, Link as TiptapLinkExtension } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { type MantineTheme } from '@mantine/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import ImageTiptapExtension from '@tiptap/extension-image';
import { List, ListOrdered, ImageIcon } from 'lucide-react';
import { createMaterial, type Material as ApiMaterial } from '../services/api'; // Adjust path

const goldAccentHex = '#C5A467';
const deepBrownLightHex = '#2A0F0F';
const editorDarkBgHex = '#1f2937';
const toolbarDarkBgHex = '#111827';
const editorLightBgHex = '#ffffff';
const toolbarLightBgHex = '#f9fafb';
const deepBrownDarkHex = '#FFF8F0';

export interface IntegratedRichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    weekIdForImageUploads: string;
    mutedTextClass?: string;
}

const IntegratedRichTextEditor: React.FC<IntegratedRichTextEditorProps> = React.memo(
  ({ value, onChange, placeholder, weekIdForImageUploads, mutedTextClass = 'text-gray-500' }) => {
    const imageUploadInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
                bulletList: { HTMLAttributes: { class: 'list-disc pl-5' } },
                orderedList: { HTMLAttributes: { class: 'list-decimal pl-5' } },
            }),
            Underline,
            TiptapLinkExtension.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
            Superscript, SubScript, Highlight, TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: placeholder || 'Start writing your text content here...' }),
            ImageTiptapExtension.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: { class: 'max-w-full h-auto rounded-md my-2' },
            }),
        ],
        content: value,
        onUpdate: ({ editor: currentEditor }) => { onChange(currentEditor.getHTML()); },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            const handle = setTimeout(() => { if (editor && !editor.isDestroyed) editor.commands.setContent(value, false); }, 0);
            return () => clearTimeout(handle);
        }
    }, [value, editor]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
         const file = event.target.files?.[0];
        if (!editor || editor.isDestroyed) {
            console.error("RTE Image Upload: Editor not available.");
            alert("Editor not available. Please try again.");
            return;
        }
        if (!file) { return; }
        if (!weekIdForImageUploads) {
            console.error("RTE Image Upload: Week ID for image uploads is not available.");
            alert("Cannot upload image: Parent week context is missing.");
            if (imageUploadInputRef.current) imageUploadInputRef.current.value = "";
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('weekId', weekIdForImageUploads);
            formData.append('title', `RTE Image: ${file.name.substring(0, 50)}`);
            formData.append('type', 'image_asset');

            const uploadedMaterial: ApiMaterial = await createMaterial(formData);
            if (uploadedMaterial && uploadedMaterial.contentUrl) {
                editor.chain().focus().setImage({ src: uploadedMaterial.contentUrl, alt: file.name }).run();
                onChange(editor.getHTML());
            } else {
                throw new Error("Image upload process failed: Server did not return a valid image URL.");
            }
        } catch (uploadError: any) {
            console.error("RTE Image Upload Error:", uploadError);
            alert(`Failed to upload image: ${uploadError.message}`);
        } finally {
            if (imageUploadInputRef.current) imageUploadInputRef.current.value = "";
        }
    };

    const triggerImageUpload = useCallback(() => {
        imageUploadInputRef.current?.click();
    }, []);

    if (!editor) return <div className={`p-3 min-h-[150px] border rounded-lg flex items-center justify-center ${mutedTextClass}`}>Editor loading...</div>;

    return (
        <>
            <input
                type="file"
                ref={imageUploadInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="visually-hidden" // Use CSS class instead of inline style
                aria-label="Upload image file" // Add aria-label for accessibility
                tabIndex={-1} // Make it non-focusable
            />
            <MantineRTE editor={editor} styles={(theme: MantineTheme) => {
                const isDarkMode = document.documentElement.classList.contains('dark');
                return {
                    root: { borderColor: isDarkMode ? '#4b5563' : '#d1d5db', borderRadius: '0.375rem' },
                    content: {
                        backgroundColor: isDarkMode ? editorDarkBgHex : editorLightBgHex,
                        color: isDarkMode ? deepBrownDarkHex : deepBrownLightHex,
                        minHeight: '150px', padding: '0.75rem',
                        '&:focus': { outline: 'none' }, '& .ProseMirror': { outline: 'none' },
                        '& p.is-editor-empty:first-of-type::before': {
                            color: isDarkMode ? theme.colors.dark[3] : theme.colors.gray[5],
                            content: 'attr(data-placeholder)', float: 'left', height: 0, pointerEvents: 'none',
                        },
                        '& ul': { listStyleType: 'disc !important', paddingLeft: '2rem !important', margin: '1em 0 !important' },
                        '& ol': { listStyleType: 'decimal !important', paddingLeft: '2rem !important', margin: '1em 0 !important' },
                        '& li': { display: 'list-item !important', textAlign: 'match-parent !important', margin: '0.5em 0 !important' },
                    },
                    toolbar: { backgroundColor: isDarkMode ? toolbarDarkBgHex : toolbarLightBgHex, borderColor: isDarkMode ? '#4b5563' : '#d1d5db', borderRadius: '0.375rem 0.375rem 0 0', padding: '0.375rem', },
                    control: { backgroundColor: isDarkMode ? toolbarDarkBgHex : toolbarLightBgHex, borderColor: isDarkMode ? '#4b5563' : '#d1d5db', color: isDarkMode ? theme.colors.dark[0] : theme.colors.gray[7], '&[data-active="true"]': { backgroundColor: goldAccentHex, color: deepBrownLightHex, }, '&:hover': { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', } },
                };
            }}>
                <MantineRTE.Toolbar sticky stickyOffset={60}>
                     <MantineRTE.ControlsGroup> <MantineRTE.Bold /> <MantineRTE.Italic /> <MantineRTE.Underline /> <MantineRTE.Strikethrough /> <MantineRTE.ClearFormatting /> <MantineRTE.Highlight /> <MantineRTE.Code /> </MantineRTE.ControlsGroup>
                    <MantineRTE.ControlsGroup> <MantineRTE.H1 /> <MantineRTE.H2 /> <MantineRTE.H3 /> <MantineRTE.H4 /> </MantineRTE.ControlsGroup>
                    <MantineRTE.ControlsGroup> <MantineRTE.Blockquote /> <MantineRTE.Hr />
                        <MantineRTE.Control onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List" active={editor?.isActive('bulletList')}><List size={16}/></MantineRTE.Control>
                        <MantineRTE.Control onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List" active={editor?.isActive('orderedList')}><ListOrdered size={16}/></MantineRTE.Control>
                        <MantineRTE.Subscript /> <MantineRTE.Superscript /> </MantineRTE.ControlsGroup>
                    <MantineRTE.ControlsGroup> <MantineRTE.Link /> <MantineRTE.Unlink /> </MantineRTE.ControlsGroup>
                    <MantineRTE.ControlsGroup> <MantineRTE.Control onClick={triggerImageUpload} aria-label="Insert image" title="Insert image from local"> <ImageIcon size={16} /> </MantineRTE.Control>
                    </MantineRTE.ControlsGroup>
                    <MantineRTE.ControlsGroup> <MantineRTE.AlignLeft /> <MantineRTE.AlignCenter /> <MantineRTE.AlignJustify /> <MantineRTE.AlignRight /> </MantineRTE.ControlsGroup>
                    <MantineRTE.ControlsGroup> <MantineRTE.Undo /> <MantineRTE.Redo /> </MantineRTE.ControlsGroup>
                </MantineRTE.Toolbar>
                <MantineRTE.Content className={`prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-serif prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:my-2 prose-a:text-[${goldAccentHex}] hover:prose-a:underline dark:prose-headings:text-gray-200 dark:prose-p:text-gray-300 dark:prose-strong:text-gray-100 dark:prose-li:text-gray-300 dark:prose-blockquote:text-gray-400`} />
            </MantineRTE>
        </>
    );
  }
);
IntegratedRichTextEditor.displayName = 'IntegratedRichTextEditor';

export default IntegratedRichTextEditor;