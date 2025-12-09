import { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import './FlashcardsPage.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

function FlashcardsPage({ fileInfo, flashcardsState, setFlashcardsState }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const flashcards = flashcardsState.flashcards;
    const numCards = flashcardsState.numCards;
    const difficulty = flashcardsState.difficulty;
    const currentIndex = flashcardsState.currentIndex;
    const isFlipped = flashcardsState.isFlipped;

    const setNumCards = (value) => setFlashcardsState({ ...flashcardsState, numCards: value });
    const setDifficulty = (value) => setFlashcardsState({ ...flashcardsState, difficulty: value });
    const setCurrentIndex = (value) => setFlashcardsState({ ...flashcardsState, currentIndex: value });
    const setIsFlipped = (value) => setFlashcardsState({ ...flashcardsState, isFlipped: value });
    const setFlashcards = (value) => setFlashcardsState({ ...flashcardsState, flashcards: value });

    const handleGenerateFlashcards = async () => {
        if (!fileInfo?.fileId) {
            setError("Please upload files first.");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId: fileInfo.fileId,
                    numCards: Number(numCards),
                    difficulty: difficulty
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Generation failed.");
            }

            const data = await response.json();
            setFlashcardsState({
                ...flashcardsState,
                flashcards: data.cards ?? [],
                currentIndex: 0,
                isFlipped: false
            });
        } catch (err) {
            setError(err.message || "Unable to generate flashcards.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setFlashcardsState((prev) => {
            if (prev.currentIndex < prev.flashcards.length - 1) {
                return {
                    ...prev,
                    currentIndex: prev.currentIndex + 1,
                    isFlipped: false
                };
            }
            return prev;
        });
    };

    const handlePrevious = () => {
        setFlashcardsState((prev) => {
            if (prev.currentIndex > 0) {
                return {
                    ...prev,
                    currentIndex: prev.currentIndex - 1,
                    isFlipped: false
                };
            }
            return prev;
        });
    };

    if (!fileInfo) {
        return (
            <div className="page-container">
                <TabNavigation />
                <div className="empty-state">
                    <div className="empty-icon">🎴</div>
                    <h2>No Files Uploaded</h2>
                    <p>Please upload your documents first to generate flashcards.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <TabNavigation />

            <div className="page-content">
                <div className="page-header">
                    <h1>🎴 Flashcards</h1>
                    <p>Create interactive flashcards for effective learning</p>
                {flashcards.length === 0 && (
                    <div className="options-section">
                        <div className="option-group">
                            <label htmlFor="numCards">Number of Flashcards</label>
                            <input
                                id="numCards"
                                type="number"
                                min="1"
                                max="50"
                                value={numCards}
                                onChange={(e) => setNumCards(e.target.value)}
                            />
                        </div>
                        <div className="option-group">
                            <label htmlFor="difficulty">Difficulty Level</label>
                            <select
                                id="difficulty"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>
                )}

                {flashcards.length === 0 && (
                    <div className="action-section">
                        <button
                            onClick={handleGenerateFlashcards}
                            disabled={isGenerating}
                            className="generate-button"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="spinner"></span>
                                    Generating Flashcards...
                                </>
                            ) : (
                                <>
                                    <span>Generate Flashcards</span>
                                    <span className="icon">✨</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {flashcards.length > 0 && (
                    <div className="flashcard-container">
                        <div className="flashcard-counter">
                            Card {currentIndex + 1} of {flashcards.length}
                        </div>
                        <article
                            className={`flashcard ${isFlipped ? "flipped" : ""}`}
                            onClick={handleFlip}
                        >
                            <div className="flashcard-front">
                                <h3>Question</h3>
                                <p className="question">{flashcards[currentIndex].q}</p>
                                <p className="flip-hint">Click to reveal answer</p>
                            </div>
                            <div className="flashcard-back">
                                <h3>Answer</h3>
                                <p className="answer">{flashcards[currentIndex].a}</p>
                                <p className="flip-hint">Click to see question</p>
                            </div>
                        </article>
                        <div className="flashcard-controls">
                            <button
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="nav-button"
                            >
                                ← Previous
                            </button>
                            <button onClick={handleFlip} className="flip-button">
                                {isFlipped ? "Show Question" : "Show Answer"}
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === flashcards.length - 1}
                                className="nav-button"
                            >
                                Next →
                            </button>
                        </div>
                        <div className="action-section">
                            <button
                                onClick={() => {
                                    setFlashcardsState({
                                        ...flashcardsState,
                                        flashcards: [],
                                        currentIndex: 0,
                                        isFlipped: false
                                    });
                                }}
                                className="regenerate-button"
                            >
                                Generate New Set
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}

export default FlashcardsPage;
