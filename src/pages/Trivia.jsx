/**
 * TRIVIA QUIZ DASHBOARD TODOs
 * ---------------------------
 * Easy:
 *  - [ ] Add difficulty selector (easy/medium/hard)
 *  - [ ] Indicate correct answer after selection (current partially does w/ classes; improve UX)
 *  - [ ] Add next question button instead of showing all
 *  - [ ] Shuffle category list order
 * Medium:
 *  - [ ] Timer per question + bonus points for speed
 *  - [ ] Show progress bar (questions answered / total)
 *  - [ ] Local high score persistence
 *  - [ ] Review mode (see all answers after completion)
 * Advanced:
 *  - [ ] Question set builder (choose amount, difficulty, category)
 *  - [ ] Accessibility: better focus states & keyboard answer selection
 *  - [ ] Multiplayer / shared score (stub for future)
 *  - [ ] Extract quiz logic into hook (useQuiz) for reuse/testing
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function Trivia() {
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState('18'); // Science: Computers
  const [difficulty, setDifficulty] = useState('easy'); // Default to easy
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [category, difficulty]);

  async function fetchQuestions() {
    try {
      setLoading(true);
      setError(null);
      setScore(0);
      setShowReview(false);

      const res = await fetch(
        `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();

      const qs = json.results.map((q) => ({
        ...q,
        answers: shuffle([q.correct_answer, ...q.incorrect_answers]),
        picked: null,
      }));
      setQuestions(qs);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function pick(qIndex, answer) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIndex ? { ...q, picked: answer } : q))
    );
    if (questions[qIndex].correct_answer === answer) {
      setScore((s) => s + 1);
    }
  }

  function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  const answeredCount = questions.filter((q) => q.picked !== null).length;
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Trivia Quiz</h2>
        <span style={{ 
          backgroundColor: difficulty === 'easy' ? '#4caf50' : difficulty === 'medium' ? '#ff9800' : '#f44336',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.9em'
        }}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </div>

      {/* Category Selector */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <label>
          Category:{' '}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={showReview}
          >
            <option value="18">Science: Computers</option>
            <option value="21">Sports</option>
            <option value="23">History</option>
          </select>
        </label>
        {/* Difficulty Selector */}
        <label>
          Difficulty:{' '}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={showReview}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      {/* Loading / Error */}
      {loading && <Loading />}
      <ErrorMessage error={error} />

      {/* Progress Bar */}
      {totalQuestions > 0 && (
        <div style={{ margin: '15px 0' }}>
          <p>
            Progress: {answeredCount} / {totalQuestions} answered
          </p>
          <div
            style={{
              height: '10px',
              width: '100%',
              background: '#ddd',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#4caf50',
                transition: 'width 0.3s ease',
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Score + Review Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>Score: {score}</p>
        <button
          onClick={() => setShowReview(true)}
          disabled={!allAnswered || showReview}
          style={{
            background: allAnswered ? '#007bff' : '#ccc',
            color: '#fff',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            cursor: allAnswered && !showReview ? 'pointer' : 'not-allowed',
          }}
        >
          Review Answers
        </button>
      </div>

      {/* Quiz Cards */}
      {questions.map((q, idx) => (
        <Card key={idx} title={`Q${idx + 1}: ${decodeHtml(q.question)}`}>
          <ul>
            {q.answers.map((a) => {
              const isPicked = q.picked === a;
              const isCorrect = a === q.correct_answer;
              let btnClass = '';

              if (showReview) {
                btnClass = isCorrect
                  ? 'correct'
                  : isPicked
                  ? 'wrong'
                  : 'neutral';
              } else if (isPicked) {
                btnClass = isCorrect ? 'correct' : 'wrong';
              }

              return (
                <li key={a}>
                  <button
                    disabled={!!q.picked || showReview}
                    onClick={() => pick(idx, a)}
                    style={{
                      margin: '5px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: q.picked || showReview ? 'default' : 'pointer',
                      border:
                        btnClass === 'correct'
                          ? '2px solid green'
                          : btnClass === 'wrong'
                          ? '2px solid red'
                          : '1px solid #ccc',
                      background:
                        btnClass === 'correct'
                          ? '#c8e6c9'
                          : btnClass === 'wrong'
                          ? '#ffcdd2'
                          : '#fff',
                      color: 'black', // Always black text
                      fontWeight: '500',
                    }}
                  >
                    {decodeHtml(a)}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      {/* Review Section */}
      {showReview && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h3>🎯 Quiz Complete!</h3>
          <p>
            Final Score: {score} / {totalQuestions}
          </p>
          <button
            onClick={fetchQuestions}
            style={{
              background: '#007bff',
              color: '#fff',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

