/**
 * TRIVIA QUIZ DASHBOARD TODOs
 * ---------------------------
 * Easy:
 * - [ ] Add difficulty selector (easy/medium/hard)
 * - [ ] Indicate correct answer after selection (current partially does w/ classes; improve UX)
 * - [ ] Add next question button instead of showing all
 * - [ ] Shuffle category list order
 * Medium:
 * - [ ] Timer per question + bonus points for speed
 * - [ ] Show progress bar (questions answered / total)
 * - [x] Local high score persistence
 * - [ ] Review mode (see all answers after completion)
 * Advanced:
 * - [ ] Question set builder (choose amount, difficulty, category)
 * - [ ] Accessibility: better focus states & keyboard answer selection
 * - [ ] Multiplayer / shared score (stub for future)
 * - [ ] Extract quiz logic into hook (useQuiz) for reuse/testing
 */

import { useEffect, useState, useRef } from 'react';

// Mock components for demonstration
const Loading = () => (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <div className="spinner"></div>
    <p style={{ marginTop: '10px', color: '#555' }}>Loading questions...</p>
  </div>
);

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div style={{
      background: '#ffebee',
      color: '#c62828',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #ef5350'
    }}>
      <strong>Error:</strong> {error.message || 'Something went wrong'}
    </div>
  );
};

const Card = ({ title, children }) => (
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  }}>
    {title && <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e4d6b' }}>{title}</h3>}
    {children}
  </div>
);

const HeroSection = ({ image, title, subtitle }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1e4d6b 0%, #2d7a9e 100%)',
    color: 'white',
    padding: '60px 20px',
    textAlign: 'center',
    marginBottom: '30px'
  }}>
    <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>{title}</h1>
    <p style={{ margin: 0, fontSize: '1.2em', opacity: 0.9 }}>{subtitle}</p>
  </div>
);

export default function Trivia() {
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState('18');
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const abortControllerRef = useRef(null);

  // Load high score only once on mount
  useEffect(() => {
    const stored = window.triviaHighScore || 0;
    setHighScore(stored);
  }, []);

  // Initial fetch only once on mount
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchQuestions();
    }
  }, [initialized]);

  async function fetchQuestions() {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setShowResults(false);
      setCurrentQuestionIndex(0);

      const res = await fetch(
        `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`,
        { 
          signal: abortControllerRef.current.signal
        }
      );
      
      if (!res.ok) throw new Error('Failed to fetch questions');
      const json = await res.json();

      if (json.response_code === 1) {
        throw new Error('No questions available for this category/difficulty combination');
      } else if (json.response_code === 2) {
        throw new Error('Invalid parameter');
      } else if (json.response_code === 5) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      const qs = json.results.map((q) => ({
        ...q,
        answers: shuffle([q.correct_answer, ...q.incorrect_answers]),
        picked: null,
      }));
      setQuestions(qs);
      setFadeIn(true);
    } catch (e) {
      if (e.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      } else if (e.name === 'TimeoutError') {
        setError(new Error('Request timed out. Please try again.'));
      } else {
        setError(e);
      }
    } finally {
      setLoading(false);
    }
  }

  function shuffle(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  function pick(answer) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === currentQuestionIndex ? { ...q, picked: answer } : q))
    );
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestionIndex((i) => i + 1);
        setFadeIn(true);
      }, 300);
    } else {
      setShowResults(true);
      updateHighScore();
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestionIndex((i) => i - 1);
        setFadeIn(true);
      }, 300);
    }
  }

  function calculateScore() {
    return questions.filter(q => q.picked === q.correct_answer).length;
  }

  function updateHighScore() {
    const score = calculateScore();
    if (score > highScore) {
      window.triviaHighScore = score;
      setHighScore(score);
    }
  }

  function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  function resetHighScore() {
    window.triviaHighScore = 0;
    setHighScore(0);
  }

  function handleCategoryChange(e) {
    setCategory(e.target.value);
  }

  function handleDifficultyChange(e) {
    setDifficulty(e.target.value);
  }

  function startNewQuiz() {
    fetchQuestions();
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;
  
  const score = calculateScore();
  const canGoNext = currentQuestion && currentQuestion.picked !== null;

  return (
    <>
      <style>{`
        .spinner {
          border: 4px solid #e0e0e0;
          border-top: 4px solid #17a2b8;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fade-in {
          animation: fadeIn 0.4s ease-in;
        }

        .fade-out {
          animation: fadeOut 0.3s ease-out;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .answer-button {
          width: 100%;
          padding: 16px 20px;
          margin: 10px 0;
          border-radius: 10px;
          border: 2px solid #ddd;
          background: #fff;
          color: #333;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .answer-button:hover {
          border-color: #17a2b8;
          background: #f0f9fa;
          transform: translateX(5px);
        }

        .answer-button.selected {
          border-color: #17a2b8;
          background: #d1ecf1;
        }

        .result-correct {
          border-color: #28a745;
          background: #d4edda;
          color: #155724;
        }

        .result-wrong {
          border-color: #dc3545;
          background: #f8d7da;
          color: #721c24;
        }

        .result-neutral {
          opacity: 1;
          color: #6c757d;
          background: #f8f9fa;
        }

        .btn-primary {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: #138496;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-2px);
        }

        .btn-small {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-small:hover {
          background: #5a6268;
        }

        .btn-primary:disabled, .btn-secondary:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .quiz-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .progress-bar-container {
          height: 12px;
          width: 100%;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          margin: 20px 0;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #17a2b8 0%, #20c997 100%);
          transition: width 0.4s ease;
          border-radius: 10px;
        }

        .stats-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #e8f5f7 0%, #d1ecf1 100%);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          border: 2px solid #bee5eb;
        }

        .difficulty-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .difficulty-easy {
          background: #28a745;
        }

        .difficulty-medium {
          background: #ffc107;
        }

        .difficulty-hard {
          background: #dc3545;
        }

        .controls-section {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .controls-section label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          /* --- FIX: Made bolder and darker --- */
          font-weight: 700;
          color: light-white;
          font-size: 15px;
        }

        .controls-section select {
          padding: 8px 12px;
          border: 2px solid #17a2b8;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          color: #333;
        }

        .results-container {
          text-align: center;
          padding: 40px 20px;
        }

        .results-score {
          font-size: 3em;
          color: #17a2b8;
          font-weight: bold;
          margin: 20px 0;
        }

        .navigation-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }

        .review-question {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #17a2b8;
        }

        .review-question h4 {
          color: #1e4d6b;
          margin-bottom: 15px;
        }

        .review-answer {
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          border: 2px solid #ddd;
          color: #333;
        }
      `}</style>

      <HeroSection
        image=""
        title={
          <>
            Think Fast, <span style={{ color: '#17a2b8' }}>Learn Faster</span>
          </>
        }
        subtitle="A trivia playground for curious minds, quick thinkers, and casual know-it-alls"
      />

      <div className="quiz-container">
        <div className="stats-card">
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#1e4d6b' }}>Trivia Quiz</h2>
            <span className={`difficulty-badge difficulty-${difficulty}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e4d6b' }}>
              Current: {score}/{questions.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Best: {highScore}
            </div>
          </div>
        </div>

        <div className="controls-section">
          <label>
            Category
            <select
              value={category}
              onChange={handleCategoryChange}
              disabled={loading}
            >
              <option value="18">Science: Computers</option>
              <option value="21">Sports</option>
              <option value="23">History</option>
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={handleDifficultyChange}
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button 
            onClick={startNewQuiz}
            className="btn-primary"
            style={{ marginTop: 'auto' }}
            disabled={loading}
          >
            {questions.length > 0 && !showResults ? 'Restart Quiz' : 'Start Quiz'}
          </button>
          <button 
            onClick={resetHighScore}
            className="btn-small"
            style={{ marginTop: 'auto' }}
          >
            Reset High Score
          </button>
        </div>

        {loading && <Loading />}
        <ErrorMessage error={error} />

        {!loading && !error && questions.length > 0 && !showResults && (
          <div className={fadeIn ? 'fade-in' : 'fade-out'}>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '20px' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>

            <Card title={decodeHtml(currentQuestion.question)}>
              <div style={{ marginTop: '20px' }}>
                {currentQuestion.answers.map((answer) => {
                  const isPicked = currentQuestion.picked === answer;

                  return (
                    <button
                      key={answer}
                      className={`answer-button ${isPicked ? 'selected' : ''}`}
                      onClick={() => pick(answer)}
                    >
                      {decodeHtml(answer)}
                    </button>
                  );
                })}
              </div>

              <div className="navigation-buttons">
                <button 
                  onClick={previousQuestion}
                  className="btn-secondary"
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </button>
                <button 
                  onClick={nextQuestion}
                  className="btn-primary"
                  disabled={!canGoNext}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next →' : 'Finish Quiz'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {showResults && (
          <div className={`results-container ${fadeIn ? 'fade-in' : ''}`}>
            <Card>
              <h2 style={{ color: '#1e4d6b', marginBottom: '10px' }}>🎯 Quiz Complete!</h2>
              <div className="results-score">
                {score} / {questions.length}
              </div>
              <p style={{ fontSize: '18px', color: '#6c757d', marginBottom: '10px' }}>
                {score === questions.length 
                  ? '🌟 Perfect score! You\'re a trivia master!' 
                  : score >= questions.length * 0.7 
                  ? '🎉 Great job! Well done!' 
                  : score >= questions.length * 0.5
                  ? '👍 Good effort! Keep practicing!'
                  : '💪 Keep learning and try again!'}
              </p>
              {score > highScore && (
                <p style={{ fontSize: '16px', color: '#28a745', fontWeight: 'bold' }}>
                  🏆 New High Score!
                </p>
              )}
              <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '30px' }}>
                Best Score: {highScore}
              </p>
              <button 
                onClick={startNewQuiz}
                className="btn-primary"
              >
                Play Again
              </button>
            </Card>

            <Card title="Review Your Answers">
              {questions.map((q, idx) => {
                const isCorrect = q.picked === q.correct_answer;
                return (
                  <div key={idx} className="review-question">
                    <h4>
                      Question {idx + 1}: {decodeHtml(q.question)}
                    </h4>
                    <div style={{ marginTop: '15px' }}>
                      {q.answers.map((answer) => {
                        const isPicked = q.picked === answer;
                        const isCorrectAnswer = answer === q.correct_answer;
                        let className = 'review-answer';
                        
                        if (isCorrectAnswer) {
                          className += ' result-correct';
                        } else if (isPicked) {
                          className += ' result-wrong';
                        } else {
                          className += ' result-neutral';
                        }

                        return (
                          <div key={answer} className={className}>
                            {decodeHtml(answer)}
                            {isCorrectAnswer && ' ✓ (Correct Answer)'}
                            {isPicked && !isCorrectAnswer && ' ✗ (Your Answer)'}
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ marginTop: '10px', fontWeight: 'bold', color: isCorrect ? '#28a745' : '#dc3545' }}>
                      {isCorrect ? '✓ You got this right!' : '✗ You got this wrong'}
                    </p>
                  </div>
                );
              })}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}