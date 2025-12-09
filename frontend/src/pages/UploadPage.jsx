import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

function UploadPage({ onUploadSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        if (event.target.files?.length) {
            setSelectedFiles(Array.from(event.target.files));
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles.length) {
            setError("Please select at least one supported file first.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append("files", file);
            });

            const response = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Upload failed.");
            }

            const data = await response.json();
            onUploadSuccess(data);
            navigate('/notes');
        } catch (err) {
            setError(err.message || "Unable to upload files.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="upload-page">
            <div className="upload-container">
                <div className="upload-header">
                    <h1>Upload Your Documents</h1>
                    <p>Select one or more files to get started</p>
                </div>

                <div className="upload-area">
                    <label className="file-upload-label">
                        <div className="upload-icon">📁</div>
                        <span className="upload-text">
                            {selectedFiles.length > 0
                                ? `${selectedFiles.length} file(s) selected`
                                : 'Click to select files or drag and drop'}
                        </span>
                        <span className="upload-hint">Supports PDF, DOCX and TXT</span>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            accept=".pdf,.docx,.txt"
                            className="file-input"
                        />
                    </label>

                    {selectedFiles.length > 0 && (
                        <div className="selected-files">
                            <p className="files-header">Selected files:</p>
                            <ul className="file-list">
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="file-item">
                                        <span className="file-icon">📄</span>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <button
                        onClick={handleUpload}
                        disabled={isUploading || selectedFiles.length === 0}
                        className="upload-button"
                    >
                        {isUploading ? (
                            <>
                                <span className="spinner"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <span>Upload & Continue</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="upload-features">
                    <div className="feature-item">
                        <span className="feature-icon">📝</span>
                        <span>Generate Notes</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🎴</span>
                        <span>Create Flashcards</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">❓</span>
                        <span>Take Quizzes</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">💬</span>
                        <span>Ask Questions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadPage;
