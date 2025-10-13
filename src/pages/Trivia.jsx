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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => { fetchQuestions(); }, [category]);

  async function fetchQuestions() {
    try {
      setLoading(true); setError(null); setScore(0);
      const res = await fetch(`https://opentdb.com/api.php?amount=5&category=${category}&type=multiple`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      const qs = json.results.map(q => ({
        ...q,
        answers: shuffle([q.correct_answer, ...q.incorrect_answers]),
        picked: null
      }));
      setQuestions(qs);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

  function pick(qIndex, answer) {
    setQuestions(qs => qs.map((q,i) => i===qIndex ? { ...q, picked: answer } : q));
    if (questions[qIndex].correct_answer === answer) setScore(s => s+1);
  }

  return (
    <div>
      <h2>Trivia Quiz</h2>
      <label>Category: 
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="18">Science: Computers</option>
          <option value="21">Sports</option>
          <option value="23">History</option>
        </select>
      </label>
      {loading && <Loading />}
      <ErrorMessage error={error} />
      <p>Score: {score}</p>
      {questions.map((q, idx) => (
        <Card key={idx} title={`Q${idx+1}: ${decodeHtml(q.question)}`}>
          <ul>
            {q.answers.map(a => (
              <li key={a}>
                <button disabled={q.picked} className={a===q.correct_answer ? (q.picked && a===q.picked ? 'correct' : '') : (q.picked===a ? 'wrong':'')} onClick={() => pick(idx, a)}>{decodeHtml(a)}</button>
              </li>
            ))}
          </ul>
        </Card>
      ))}
      {/* TODO: Add scoreboard persistence */}
    </div>
  );
}

function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
