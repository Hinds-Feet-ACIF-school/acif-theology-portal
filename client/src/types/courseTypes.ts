// src/types/courseTypes.ts (or a relevant types file)
export interface SectionMaterial { // If sections have materials
    id: string;
    title: string;
    type: 'video' | 'reading' | 'quiz_reference'; // Example types
    url?: string; // For video/reading
    quizId?: string; // For quiz reference
    // ... other material properties
}

export interface Section {
    id: string;
    title: string;
    description?: string;
    order: number;
    weekId: string; // Or courseId if sections are not tied to weeks
    contentUrl?: string; // If section content is a URL (e.g., external article, video)
    textContent?: string; // If section content is rich text stored directly
    materials?: SectionMaterial[];
    content: ContentItem[]; // Updated to match api.ts
    // ... any other properties a section might have
}

// Add ContentItem interface to match api.ts
export interface ContentItem {
    id?: string;
    type: 'text' | 'video' | 'quiz_link' | 'document';
    title: string;
    isRequired: boolean;
    content?: string;
    url?: string;
    richContent: RichContentItemBlock[];
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Add RichContentItemBlock interface to match api.ts
export interface RichContentItemBlock {
    id: string;
    type: 'text' | 'video' | 'quiz' | 'document';
    order?: number;
    content?: string;
    videoContent?: VideoBlockContent;
    quizContent?: QuizBlockContent;
    documentContent?: ApiDocumentBlockContentForSave;
}

// Add supporting interfaces
export interface VideoBlockContent {
    id: string;
    title: string;
    description?: string;
    videoFile?: File;
    videoUrl?: string;
    thumbnail?: File;
    thumbnailUrl?: string;
    duration?: number;
    isRequired: boolean;
    drmEnabled: boolean;
    accessControl: {
        allowDownload: boolean;
        allowSharing: boolean;
        expirationDate?: Date;
    };
}

export interface QuizBlockContent {
    id: string;
    databaseQuizId: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
    settings: {
        shuffleQuestions: boolean;
        timeLimit?: number;
        passingScore?: number;
        showResults: boolean;
        allowRetake: boolean;
        maxAttempts?: number;
        showCorrectAnswers: boolean;
        showPoints: boolean;
        requireLogin: boolean;
        collectEmail: boolean;
    };
}

export interface ApiDocumentBlockContentForSave {
    id: string;
    title: string;
    description?: string;
    documentUrl: string;
    originalFileName?: string;
    fileSize?: number;
    fileType?: string;
}

export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'checkbox' | 'short_answer' | 'paragraph';
    question: string;
    required: boolean;
    description?: string;
    options?: QuizQuestionOption[];
    correctAnswer?: string | string[];
}

export interface QuizQuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}