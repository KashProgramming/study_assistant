import { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import './QuizPage.css';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:8000');

function QuizPage({ fileInfo, quizState, setQuizState }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const quiz = quizState.quiz;
  const numQuestions = quizState.numQuestions;
  const difficulty = quizState.difficulty;
  const currentQuestionIndex = quizState.currentQuestionIndex;
  const userAnswers = quizState.userAnswers;
  const selectedAnswer = quizState.selectedAnswer;
  const showResults = quizState.showResults;

  const setNumQuestions = (value) =>
    setQuizState((prev) => ({ ...prev, numQuestions: value }));

  const setDifficulty = (value) =>
    setQuizState((prev) => ({ ...prev, difficulty: value }));

  const setQuiz = (value) =>
    setQuizState((prev) => ({ ...prev, quiz: value }));

  const setCurrentQuestionIndex = (value) =>
    setQuizState((prev) => ({ ...prev, currentQuestionIndex: value }));

  const setUserAnswers = (value) =>
    setQuizState((prev) => ({ ...prev, userAnswers: value }));

  const setSelectedAnswer = (value) =>
    setQuizState((prev) => ({ ...prev, selectedAnswer: value }));

  const setShowResults = (value) =>
    setQuizState((prev) => ({ ...prev, showResults: value }));

  const handleGenerateQuiz = async () => {
    if (!fileInfo?.fileId) {
      setError('Please upload files first.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileInfo.fileId,
          numQuestions: Number(numQuestions),
          difficulty: difficulty,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Quiz generation failed.');
      }

      const data = await response.json();

      setQuizState((prev) => ({
        ...prev,
        quiz: data.questions,
        currentQuestionIndex: 0,
        userAnswers: [],
        selectedAnswer: null,
        showResults: false,
      }));
    } catch (err) {
      setError(err.message || 'Unable to generate quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    setQuizState((prev) => {
      const newAnswers = [...prev.userAnswers, prev.selectedAnswer];
      const isLastQuestion =
        prev.currentQuestionIndex >= prev.quiz.length - 1;

      return {
        ...prev,
        userAnswers: newAnswers,
        currentQuestionIndex: isLastQuestion
          ? prev.currentQuestionIndex
          : prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showResults: isLastQuestion,
      };
    });
  };

  const calculateScore = () => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quiz[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setQuizState((prev) => ({
      ...prev,
      quiz: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      selectedAnswer: null,
      showResults: false,
    }));
  };

  if (!fileInfo) {
    return (
      <div className="page-container">
        <TabNavigation />
        <div className="empty-state">
          <div className="empty-icon">❓</div>
          <h2>No Files Uploaded</h2>
          <p>Please upload your documents first to generate a quiz.</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className="page-container">
        <TabNavigation />

        <div className="page-content">
          <div className="results-container">
            <div className="results-header">
              <h1>Quiz Complete!</h1>
            </div>

            <div className="score-display">
              <div className="score-circle">
                <div className="score-number">{percentage}%</div>
                <div className="score-text">
                  {score} / {quiz.length}
                </div>
              </div>
            </div>

            <div className="results-breakdown">
              <h3>Review Your Answers</h3>
              {quiz.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div
                    key={index}
                    className={`result-item ${
                      isCorrect ? 'correct' : 'incorrect'
                    }`}
                  >
                    <div className="result-header">
                      <span className="result-icon">
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <span className="result-label">
                        Question {index + 1}
                      </span>
                    </div>
                    <p className="result-question">{question.question}</p>
                    <div className="result-answers">
                      <p className="user-answer">
                        <strong>Your answer:</strong> {userAnswer}
                      </p>
                      {!isCorrect && (
                        <p className="correct-answer">
                          <strong>Correct answer:</strong>{' '}
                          {question.correctAnswer}
                        </p>
                      )}
                      <p className="explanation">
                        <strong>Explanation:</strong>{' '}
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="action-section">
              <button onClick={resetQuiz} className="retake-button">
                Take Another Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TabNavigation />

      <div className="page-content">
        <div className="page-header">
          <h1>❓ Quiz</h1>
          <p>Test your knowledge</p>
        </div>

        {!quiz && (
          <>
            <div className="options-section">
              <div className="option-group">
                <label htmlFor="numQuestions">
                  Number of Questions
                </label>
                <input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(e.target.value)
                  }
                />
              </div>
              <div className="option-group">
                <label htmlFor="difficulty">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value)
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="action-section">
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating}
                className="generate-button"
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <span>Start Quiz</span>
                    <span className="icon">🚀</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}

        {quiz && !showResults && (
          <div className="quiz-container">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) /
                        quiz.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="progress-text">
                Question {currentQuestionIndex + 1} of {quiz.length}
              </p>
            </div>

            <div className="question-container">
              <h2 className="question-text">
                {quiz[currentQuestionIndex].question}
              </h2>

              <div className="options-list">
                {quiz[currentQuestionIndex].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      className={`option-button ${
                        selectedAnswer === option
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleAnswerSelect(option)
                      }
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">
                        {option}
                      </span>
                    </button>
                  )
                )}
              </div>

              <div className="quiz-controls">
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="next-button"
                >
                  {currentQuestionIndex ===
                  quiz.length - 1
                    ? 'Finish Quiz'
                    : 'Next Question'}{' '}
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;