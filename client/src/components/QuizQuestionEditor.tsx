// src/components/QuizQuestionEditor.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button" 
import { Card } from "./ui/card";     // Adjust path if necessary
import { Label as ShadcnLabel } from "./ui/label"; // Adjust path if necessary
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"; // Adjust path
import { X, Plus, Trash2 } from 'lucide-react';
import { TextInput, Textarea, Checkbox as MantineCheckbox, Radio, Tooltip as MantineTooltip, Group } from '@mantine/core';
import { type MantineTheme } from '@mantine/core';

// Assuming these types are defined in a shared types file or passed down correctly
// For now, let's define them here based on your main file.
// Ideally, these would come from your API service types or a shared types definition.
interface ApiQuizQuestionOptionFromApi {
    id: string;
    text: string;
    isCorrect?: boolean;
    feedback?: string | null;
    order?: number;
}

interface ApiQuizQuestionFromApi {
    id: string;
    type: 'multiple_choice' | 'checkbox' | 'short_answer' | 'paragraph' | 'essay'; 
    question: string;
    description?: string | null;
    options?: ApiQuizQuestionOptionFromApi[];
    correctAnswer?: string | string[]; // For short_answer/paragraph or as an alternative way to store correct options
    points?: number;
    required?: boolean;
    feedback?: string | null; // General feedback for the question
    order?: number;
}

// Prop types for QuizQuestionEditor
// Using the more specific names from your main file's type definitions for clarity
export interface ModalQuizQuestionOption extends ApiQuizQuestionOptionFromApi {}
export interface ModalQuizQuestion extends ApiQuizQuestionFromApi {
    options?: ModalQuizQuestionOption[]; // Ensure options are of ModalQuizQuestionOption type
    required: boolean; 
}

// Style constants and functions - these would ideally be imported from a shared util/theme file
// For simplicity here, I'm redefining a few. In a real app, centralize these.
const goldAccentHex = '#C5A467';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const editorDarkBgHex = '#1f2937'; // Example, ensure it matches your main file
const editorLightBgHex = '#ffffff'; // Example
const deepBrownDarkHex = '#FFF8F0'; // Example
const deepBrownLightHex = '#2A0F0F'; // Example
const themedInputBorder = `border-gray-300 dark:border-gray-700`;
const editorCardBgMantine = 'dark:bg-gray-900'; // Example
const outlineButtonClasses = `border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`; // Simplified from main file
const selectTriggerClasses = `h-9 rounded-md px-3 py-2 text-sm w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-[#2A0F0F] dark:text-[#FFF8F0] flex items-center justify-between`; // Simplified
const selectContentClasses = `border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2A0F0F] dark:text-[#FFF8F0] z-[110] shadow-lg`; // Simplified

const mantineInputStyles = (theme: MantineTheme) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return {
        input: {
            backgroundColor: isDarkMode ? editorDarkBgHex : editorLightBgHex,
            borderColor: isDarkMode ? theme.colors.dark[4] : theme.colors.gray[4],
            color: isDarkMode ? deepBrownDarkHex : deepBrownLightHex,
            lineHeight: theme.lineHeights.md,
            '&::placeholder': { color: isDarkMode ? theme.colors.dark[3] : theme.colors.gray[6] },
        },
        label: {
            color: isDarkMode ? deepBrownDarkHex : deepBrownLightHex,
            fontSize: theme.fontSizes.xs, fontWeight: 500, marginBottom: '4px',
        },
    };
};


// --- OptionInput (Also a good candidate for its own file, but included here for now) ---
interface OptionInputProps {
    optionId: string;
    initialText: string;
    placeholder: string;
    onTextChange: (text: string) => void;
    questionType: 'multiple_choice' | 'checkbox';
    isCorrect: boolean;
    onCorrectChange: (isCorrect: boolean) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const OptionInput: React.FC<OptionInputProps> = React.memo(({ optionId, initialText, placeholder, onTextChange, questionType, isCorrect, onCorrectChange, onRemove, canRemove }) => {
    const [localText, setLocalText] = useState(initialText);
    useEffect(() => { if (initialText !== localText) setLocalText(initialText); }, [initialText]); // Removed localText from deps to avoid loop on parent re-render
     const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newText = event.currentTarget.value;
        setLocalText(newText);
        onTextChange(newText);
    };
    return (
        <div key={optionId} className="flex items-center gap-2">
            {questionType === 'multiple_choice' ? (
                <MantineTooltip label="Mark as correct" position="top" withArrow>
                    <Radio checked={isCorrect} onChange={(event) => onCorrectChange(event.currentTarget.checked)} name={`correct-opt-${optionId.substring(0, optionId.lastIndexOf('_'))}`} aria-label={`Mark option as correct`} size="xs" styles={{ radio: { borderColor: goldAccentHex, '&:checked': { backgroundColor: goldAccentHex, borderColor: goldAccentHex } } }}/>
                </MantineTooltip>
            ) : (
                <MantineTooltip label="Mark as correct" position="top" withArrow>
                    <MantineCheckbox checked={isCorrect} onChange={(event) => onCorrectChange(event.currentTarget.checked)} aria-label={`Mark option as correct`} size="xs" styles={{ input: { borderColor: goldAccentHex, '&:checked': { backgroundColor: goldAccentHex, borderColor: goldAccentHex } } }}/>
                </MantineTooltip>
            )}
            <div className="flex-grow">
                <ShadcnLabel htmlFor={`option-input-${optionId}`} className="sr-only">{placeholder}</ShadcnLabel>
                <TextInput id={`option-input-${optionId}`} value={localText} onChange={handleTextChange} placeholder={placeholder} size="xs" className="w-full" styles={mantineInputStyles} />
            </div>
            {canRemove && (
                <Button variant="ghost" size="icon" onClick={onRemove} className={`text-red-500 hover:text-red-600 h-7 w-7 p-0 shrink-0`} aria-label={`Remove option`}>
                    <X className="h-3.5 w-3.5"/>
                </Button>
            )}
        </div>
    );
});
OptionInput.displayName = 'OptionInput';
// --- End of OptionInput ---


interface QuizQuestionEditorProps {
    question: ModalQuizQuestion;
    onUpdate: (updatedQuestion: ModalQuizQuestion) => void;
    onRemove: () => void;
    generateId: () => string; // Pass generateId as a prop
}

const QuizQuestionEditor: React.FC<QuizQuestionEditorProps> = React.memo(({ question, onUpdate, onRemove, generateId }) => {
    const [localQuestionText, setLocalQuestionText] = useState(question.question);
    const [localDescription, setLocalDescription] = useState(question.description || '');
    const cardRef = useRef<HTMLDivElement>(null);
    const prevOptionsLength = useRef<number | undefined>(question.options?.length);

    useEffect(() => {
        if (question.question !== localQuestionText) setLocalQuestionText(question.question);
        const desc = question.description || '';
        if (desc !== localDescription) setLocalDescription(desc);
    }, [question.question, question.description]);  // localQuestionText, localDescription removed from deps

    useEffect(() => {
        const currentLength = question.options?.length ?? 0;
        const previousLength = prevOptionsLength.current ?? 0;
        if (currentLength > previousLength && cardRef.current) {
            setTimeout(() => { cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 0);
        }
        prevOptionsLength.current = currentLength;
    }, [question.options?.length]);

    const handleQuestionBlur = () => { if (localQuestionText.trim() !== question.question) onUpdate({ ...question, question: localQuestionText.trim() }); };
    const handleDescriptionBlur = () => { const currentDesc = question.description || ''; if (localDescription.trim() !== currentDesc) { const updatedDesc = localDescription.trim() ? localDescription.trim() : undefined; onUpdate({ ...question, description: updatedDesc }); } };

    const handleOptionTextChange = (optIndex: number, newText: string) => {
        const newOptions = [...(question.options || [])];
        if (newOptions[optIndex]) {
            newOptions[optIndex] = { ...newOptions[optIndex], text: newText };
            onUpdate({ ...question, options: newOptions });
        }
    };

    const handleOptionCorrectChange = (optIndex: number, isCorrectFlag: boolean) => {
        const newOptions = [...(question.options || [])];
        if (!newOptions[optIndex]) return;

        let updatedOptions = newOptions.map((opt, i) => {
            if (i === optIndex) {
                return { ...opt, isCorrect: isCorrectFlag };
            }
            if (question.type === 'multiple_choice' && isCorrectFlag) {
                // If multiple choice and marking this one correct, unmark others
                return { ...opt, isCorrect: false };
            }
            return opt;
        });
        onUpdate({ ...question, options: updatedOptions });
    };

    const addOption = () => {
        const newOption: ModalQuizQuestionOption = { id: generateId(), text: '', isCorrect: false };
        onUpdate({ ...question, options: [...(question.options || []), newOption] });
    };

    const removeOption = (optIndex: number) => {
        onUpdate({ ...question, options: question.options?.filter((_, i) => i !== optIndex) });
    };

    const questionTypes: { value: ApiQuizQuestionFromApi['type']; label: string }[] = [
        { value: 'multiple_choice', label: 'Multiple Choice (Single Answer)' },
        { value: 'checkbox', label: 'Checkboxes (Multiple Answers)' },
    ];

    return (
        <Card ref={cardRef} className={`p-3 space-y-3 ${editorCardBgMantine} border ${themedInputBorder}`}>
            <div className="flex justify-between items-start gap-2">
                <div className="flex-grow space-y-1">
                    <TextInput
                        label={<span className={`${midBrown} text-xs font-medium`}>Question Text <span className="text-red-500">*</span></span>}
                        id={`question-${question.id}`}
                        value={localQuestionText}
                        onChange={(event) => setLocalQuestionText(event.currentTarget.value)}
                        onBlur={handleQuestionBlur}
                        placeholder="Enter question text"
                        required
                        size="sm"
                        className="font-medium w-full"
                        styles={mantineInputStyles}
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={onRemove} className={`text-red-500 hover:text-red-600 h-8 w-8 p-0 shrink-0 mt-5`} aria-label="Remove question">
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
            <div className="space-y-1">
                <Textarea
                    label={<span className={`${midBrown} text-xs font-medium`}>Description (Optional)</span>}
                    id={`description-${question.id}`}
                    value={localDescription}
                    onChange={(event) => setLocalDescription(event.currentTarget.value)}
                    onBlur={handleDescriptionBlur}
                    placeholder="Optional: Add more details or instructions"
                    autosize
                    minRows={2}
                    size="sm"
                    className="text-xs"
                    styles={mantineInputStyles}
                />
            </div>
            <Select
                value={question.type}
                onValueChange={(typeValue: string) => { // Shadcn Select usually returns string
                    const type = typeValue as ApiQuizQuestionFromApi['type'];
                    const needsOptions = type === 'multiple_choice' || type === 'checkbox';
                    const currentOptions = question.options;
                    let newOptionsState: ModalQuizQuestionOption[] | undefined;

                    if (!needsOptions) {
                        newOptionsState = undefined;
                    } else {
                        // If switching to a type that needs options from one that didn't, or from scratch
                        if (!currentOptions || currentOptions.length === 0) {
                             newOptionsState = [{ id: generateId(), text: '', isCorrect: false }];
                        } else {
                            // If switching from checkbox to multiple_choice, ensure only one is correct
                            if (type === 'multiple_choice' && question.type === 'checkbox') {
                                let foundFirstCorrect = false;
                                newOptionsState = currentOptions.map(opt => {
                                    if (opt.isCorrect && !foundFirstCorrect) {
                                        foundFirstCorrect = true;
                                        return opt;
                                    }
                                    return {...opt, isCorrect: false};
                                });
                                // If no correct option was found (e.g., all were false), mark the first one
                                if (!foundFirstCorrect && newOptionsState.length > 0) {
                                    // This part is tricky; for now, let's not auto-mark. User should pick.
                                    // Or, if you prefer, newOptionsState[0].isCorrect = true;
                                }
                            } else {
                                newOptionsState = currentOptions; // Keep existing options for checkbox->checkbox or mc->checkbox
                            }
                        }
                    }
                    onUpdate({...question, type, options: newOptionsState });
                }}
            >
                <SelectTrigger className={selectTriggerClasses}><SelectValue placeholder="Select Question Type" /></SelectTrigger>
                <SelectContent className={selectContentClasses}>
                    {questionTypes.map(qt => <SelectItem key={qt.value} value={qt.value} className="text-sm">{qt.label}</SelectItem>)}
                </SelectContent>
            </Select>

            {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                <div className="space-y-2 pl-1">
                    <ShadcnLabel className={`${midBrown} text-xs font-medium`}>
                        Options {question.type === 'multiple_choice' ? '(select one correct)' : '(select one or more correct)'}: <span className="text-red-500">*</span>
                    </ShadcnLabel>
                    {question.options?.map((opt, optIndex) => (
                        <OptionInput
                            key={opt.id}
                            optionId={opt.id}
                            initialText={opt.text}
                            placeholder={`Option ${optIndex + 1}`}
                            onTextChange={(newText) => handleOptionTextChange(optIndex, newText)}
                            questionType={question.type as 'multiple_choice' | 'checkbox'}
                            isCorrect={opt.isCorrect ?? false}
                            onCorrectChange={(isCorrectVal) => handleOptionCorrectChange(optIndex, isCorrectVal)}
                            onRemove={() => removeOption(optIndex)}
                            canRemove={(question.options?.length ?? 0) > 1}
                        />
                    ))}
                    <Button variant="outline" size="sm" onClick={addOption} className={`${outlineButtonClasses} text-xs mt-1 h-8`}>
                        <Plus className="h-3.5 w-3.5 mr-1"/>Add Option
                    </Button>
                </div>
            )}
            <Group mt="xs">
                <MantineCheckbox
                    id={`q-req-${question.id}`}
                    checked={question.required ?? false} // Ensure it has a default
                    onChange={(event) => onUpdate({...question, required: event.currentTarget.checked})}
                    label={<span className={`${midBrown} text-xs font-normal cursor-pointer`}>Required Question</span>}
                    size="xs"
                />
            </Group>
        </Card>
    );
});
QuizQuestionEditor.displayName = 'QuizQuestionEditor';

export default QuizQuestionEditor;