export interface UploadedDoc {
    doc_id: string;
    filename: string;
    url: string;
    pages: number;
    characters: number;
    words?: number;
    is_scanned?: boolean;
    preview?: string;
    text: string;
    uploaded_at?: number;
}

export interface RecentDocSummary {
    doc_id: string;
    filename: string;
    url: string;
    pages: number;
    characters: number;
    words?: number;
    is_scanned?: boolean;
    uploaded_at: number;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    difficulty?: "Easy" | "Medium" | "Hard";
}

export interface Flashcard {
    id: number;
    category?: string;
    front: string;
    back: string;
}

export interface KeyConcept {
    term: string;
    definition: string;
}

export interface InsightsData {
    reading_time_mins: number;
    key_concepts: KeyConcept[];
}

export type ActiveTab = "chat" | "summary" | "notes" | "quiz" | "flashcards" | "translate";
