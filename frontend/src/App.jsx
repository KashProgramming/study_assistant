import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import UploadPage from "./pages/UploadPage";
import NotesPage from "./pages/NotesPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import ChatbotPage from "./pages/ChatbotPage";

function App() {
  const [showHomePage, setShowHomePage] = useState(true);
  const [fileInfo, setFileInfo] = useState(null);

  // State persistence for each feature
  const [notesState, setNotesState] = useState(null);
  const [flashcardsState, setFlashcardsState] = useState({
    flashcards: [],
    numCards: 10,
    difficulty: "medium",
    currentIndex: 0,
    isFlipped: false
  });
  const [quizState, setQuizState] = useState({
    quiz: null,
    numQuestions: 5,
    difficulty: "medium",
    currentQuestionIndex: 0,
    userAnswers: [],
    selectedAnswer: null,
    showResults: false
  });
  const [chatState, setChatState] = useState({
    messages: []
  });

  const handleUploadSuccess = (data) => {
    setFileInfo(data);
  };

  const handleBackToHome = () => {
    setShowHomePage(true);
    setFileInfo(null);
    // Reset all feature states
    setNotesState(null);
    setFlashcardsState({
      flashcards: [],
      numCards: 10,
      difficulty: "medium",
      currentIndex: 0,
      isFlipped: false
    });
    setQuizState({
      quiz: null,
      numQuestions: 5,
      difficulty: "medium",
      currentQuestionIndex: 0,
      userAnswers: [],
      selectedAnswer: null,
      showResults: false
    });
    setChatState({
      messages: []
    });
  };

  // Home Page Component
  if (showHomePage) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="logo-container">
            <div className="logo-icon">📚</div>
            <h1 className="home-title">StudyBuddy</h1>
          </div>
          <p className="home-subtitle">
            Transform your documents into interactive learning tools with AI
          </p>
          
          <div className="home-features">
            <div className="feature">
              <div className="feature-icon">📄</div>
              <p>Multi-Format Upload</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📝</div>
              <p>Smart Consolidated Notes</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎴</div>
              <p>Interactive Flashcards</p>
            </div>
            <div className="feature">
              <div className="feature-icon">❓</div>
              <p>Automated Quizzes</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💬</div>
              <p>Chat with Documents</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <p>Customizable Difficulty</p>
            </div>
          </div>

          <button
            className="home-cta-button"
            onClick={() => setShowHomePage(false)}
          >
            Get Started
          </button>
          
          <div className="home-footer">
            <p>No signup required • Free to use • Powered by AI</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/upload"
            element={<UploadPage onUploadSuccess={handleUploadSuccess} />}
          />
          <Route
            path="/notes"
            element={
              <NotesPage
                fileInfo={fileInfo}
                notesState={notesState}
                setNotesState={setNotesState}
              />
            }
          />
          <Route
            path="/flashcards"
            element={
              <FlashcardsPage
                fileInfo={fileInfo}
                flashcardsState={flashcardsState}
                setFlashcardsState={setFlashcardsState}
              />
            }
          />
          <Route
            path="/quiz"
            element={
              <QuizPage
                fileInfo={fileInfo}
                quizState={quizState}
                setQuizState={setQuizState}
              />
            }
          />
          <Route
            path="/chatbot"
            element={
              <ChatbotPage
                fileInfo={fileInfo}
                chatState={chatState}
                setChatState={setChatState}
              />
            }
          />
          <Route
            path="*"
            element={<Navigate to="/upload" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;