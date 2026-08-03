import UploadBox from "../components/UploadBox";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full">
                <h1 className="text-5xl font-bold text-center mb-3">
                    IntelliPDF
                </h1>

                <p className="text-center text-gray-500 mb-10">
                    AI Powered PDF Assistant
                </p>

                <UploadBox />
            </div>
        </div>
    );
}