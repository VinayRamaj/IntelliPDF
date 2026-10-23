import axios from "axios";
import type { UploadedDoc, RecentDocSummary, QuizQuestion, Flashcard, InsightsData } from "../types";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    timeout: 60000,
});

// Helper to extract clean error message
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
            return error.response.data.detail;
        }
        if (error.message) {
            return error.message;
        }
    }
    return "An unexpected error occurred. Please check your connection.";
};

// Document Management Endpoints
export const uploadPdfFile = async (file: File): Promise<UploadedDoc> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<UploadedDoc>("/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const fetchRecentDocuments = async (): Promise<RecentDocSummary[]> => {
    const res = await api.get<RecentDocSummary[]>("/upload/documents");
    return res.data;
};

export const fetchDocumentById = async (docId: string): Promise<UploadedDoc> => {
    const res = await api.get<UploadedDoc>(`/upload/documents/${docId}`);
    return res.data;
};

export const deleteDocumentById = async (docId: string): Promise<void> => {
    await api.delete(`/upload/documents/${docId}`);
};

// AI Assistant Endpoints
export const generateSummaryApi = async (docId?: string, text?: string): Promise<string> => {
    const res = await api.post<{ summary: string }>("/ai/summary", { doc_id: docId, text });
    return res.data.summary;
};

export const generateNotesApi = async (docId?: string, text?: string): Promise<string> => {
    const res = await api.post<{ notes: string }>("/ai/notes", { doc_id: docId, text });
    return res.data.notes;
};

export const askPdfApi = async (
    question: string,
    history?: { role: string; content: string }[],
    docId?: string,
    text?: string
): Promise<string> => {
    const res = await api.post<{ answer: string }>("/ai/chat", {
        question,
        history,
        doc_id: docId,
        text,
    });
    return res.data.answer;
};

export const generateQuizApi = async (count: number = 5, docId?: string, text?: string): Promise<QuizQuestion[]> => {
    const res = await api.post<{ quiz: QuizQuestion[] }>("/ai/quiz", {
        count,
        doc_id: docId,
        text,
    });
    return res.data.quiz;
};

export const generateFlashcardsApi = async (count: number = 8, docId?: string, text?: string): Promise<Flashcard[]> => {
    const res = await api.post<{ flashcards: Flashcard[] }>("/ai/flashcards", {
        count,
        doc_id: docId,
        text,
    });
    return res.data.flashcards;
};

export const translatePdfApi = async (language: string, docId?: string, text?: string): Promise<string> => {
    const res = await api.post<{ translation: string }>("/ai/translate", {
        language,
        doc_id: docId,
        text,
    });
    return res.data.translation;
};

export const fetchInsightsApi = async (docId?: string, text?: string): Promise<InsightsData> => {
    const res = await api.post<InsightsData>("/ai/insights", { doc_id: docId, text });
    return res.data;
};

export default api;