import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaFilePdf } from "react-icons/fa";
import api from "../services/api";

export default function UploadBox() {
    const [filename, setFilename] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [text, setText] = useState("");

    const [summary, setSummary] = useState("");
    const [notes, setNotes] = useState("");

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles.length) return;

        const formData = new FormData();
        formData.append("file", acceptedFiles[0]);

        try {
            const response = await api.post("/upload/", formData);

            setFilename(response.data.filename);
            setPdfUrl(response.data.url);
            setText(response.data.text);

            setSummary("");
            setNotes("");
            setAnswer("");
            setQuestion("");
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        }
    }, []);

    const generateSummary = async () => {
        setLoading(true);

        const response = await api.post("/ai/summary", {
            text,
        });

        setSummary(response.data.summary);

        setLoading(false);
    };

    const generateNotes = async () => {
        setLoading(true);

        const response = await api.post("/ai/notes", {
            text,
        });

        setNotes(response.data.notes);

        setLoading(false);
    };

    const askQuestion = async () => {
        if (!question.trim()) return;

        setLoading(true);

        const response = await api.post("/ai/chat", {
            text,
            question,
        });

        setAnswer(response.data.answer);

        setLoading(false);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        multiple: false,
    });

    return (
        <div className="max-w-5xl mx-auto">

            <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-xl bg-white p-12 text-center shadow cursor-pointer"
            >
                <input {...getInputProps()} />

                <FaCloudUploadAlt
                    size={70}
                    className="mx-auto text-blue-600 mb-5"
                />

                <h2 className="text-2xl font-bold">
                    Drag & Drop PDF Here
                </h2>

                <p className="text-gray-500 mt-2">
                    or click to browse
                </p>

            </div>

            {filename && (

                <div className="mt-6 bg-green-100 rounded-xl p-5">

                    <FaFilePdf className="inline mr-2 text-red-600"/>

                    <strong>{filename}</strong>

                    <div className="flex flex-wrap gap-3 mt-5">

                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            View PDF
                        </a>

                        <button
                            onClick={generateSummary}
                            className="bg-purple-600 text-white px-4 py-2 rounded"
                        >
                            Summary
                        </button>

                        <button
                            onClick={generateNotes}
                            className="bg-orange-600 text-white px-4 py-2 rounded"
                        >
                            Notes
                        </button>

                    </div>

                </div>

            )}

            {loading && (

                <div className="mt-6 text-lg font-semibold">
                    AI is working...
                </div>

            )}

            {summary && (

                <div className="mt-6 bg-white rounded-xl shadow p-6">

                    <h2 className="text-2xl font-bold mb-4">
                        AI Summary
                    </h2>

                    <pre className="whitespace-pre-wrap">
                        {summary}
                    </pre>

                </div>

            )}

            {notes && (

                <div className="mt-6 bg-white rounded-xl shadow p-6">

                    <h2 className="text-2xl font-bold mb-4">
                        AI Notes
                    </h2>

                    <pre className="whitespace-pre-wrap">
                        {notes}
                    </pre>

                </div>

            )}

            {filename && (

                <div className="mt-6 bg-white rounded-xl shadow p-6">

                    <h2 className="text-2xl font-bold mb-4">
                        Ask AI
                    </h2>

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Ask anything from this PDF..."
                        value={question}
                        onChange={(e)=>setQuestion(e.target.value)}
                    />

                    <button
                        onClick={askQuestion}
                        className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
                    >
                        Ask
                    </button>

                    {answer && (

                        <div className="mt-6">

                            <h3 className="font-bold text-xl mb-3">
                                Answer
                            </h3>

                            <pre className="whitespace-pre-wrap">
                                {answer}
                            </pre>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}