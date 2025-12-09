import { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import './NotesPage.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

function NotesPage({ fileInfo, notesState, setNotesState }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const notes = notesState;

    const handleGenerateNotes = async () => {
        if (!fileInfo?.fileId) {
            setError("Please upload files first.");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/generate-notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileId: fileInfo.fileId }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Notes generation failed.");
            }

            const data = await response.json();
            setNotesState(data);
        } catch (err) {
            setError(err.message || "Unable to generate notes.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadDocx = async () => {
        if (!fileInfo?.fileId) {
            setError("Please generate notes first.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/download-notes/${fileInfo.fileId}`);

            if (!response.ok) {
                throw new Error("Failed to download notes.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${notes?.title || 'notes'}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err.message || "Unable to download notes.");
        }
    };

    if (!fileInfo) {
        return (
            <div className="page-container">
                <TabNavigation />
                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h2>No Files Uploaded</h2>
                    <p>Please upload your documents first to generate notes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <TabNavigation />

            <div className="page-content">
                <div className="page-header">
                    <h1>📝 Consolidated Notes</h1>
                    <p>Generate comprehensive notes from your uploaded documents</p>
                </div>

                {!notes && (
                    <div className="action-section">
                        <button
                            onClick={handleGenerateNotes}
                            disabled={isGenerating}
                            className="generate-button"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="spinner"></span>
                                    Generating Notes...
                                </>
                            ) : (
                                <>
                                    <span>Generate Notes</span>
                                    <span className="icon">✨</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {notes && (
                    <div className="notes-container">
                        <div className="notes-header-section">
                            <h2 className="notes-title">{notes.title}</h2>
                            <button onClick={handleDownloadDocx} className="download-button">
                                <span>Download as DOCX</span>
                                <span className="icon">⬇️</span>
                            </button>
                        </div>

                        <div className="notes-content">
                            <div className="notes-section">
                                <h3>Summary</h3>
                                <p className="summary-text">{notes.summary}</p>
                            </div>

                            <div className="notes-section">
                                <h3>Key Points</h3>
                                <ul className="key-points">
                                    {notes.keyPoints.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="notes-section">
                                <h3>Detailed Notes</h3>
                                <p className="detailed-notes">{notes.detailedNotes}</p>
                            </div>
                        </div>

                        <div className="action-section">
                            <button
                                onClick={handleGenerateNotes}
                                className="regenerate-button"
                            >
                                Regenerate Notes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotesPage;
