import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Grid from './components/Grid';
import WordList from './components/WordList';
import AnswerBoxes from './components/AnswerBoxes';
import NameInput from './components/NameInput';
import Leaderboard from './components/Leaderboard';
import { generateGrid } from './utils/gridGenerator';
import './App.css';

// ─── Puzzle configuration ───
const PUZZLE_TITLE = 'CAÇA-PALAVRAS HIPOTECA';
const WORDS = ['GARANTIA', 'IMOVEL', 'CREDOR', 'HIPOTECA', 'UTIL', 'DIVIDA', 'CASA'];
const GRID_ROWS = 8;
const GRID_COLS = 8;

// Secret answer: the leftover letters spell this out
const SECRET_ANSWER_WORDS = ['CONVENCIONAL', 'JUDICIAL', 'LEGAL'];
const SECRET_ANSWER = SECRET_ANSWER_WORDS.join('');
const ANSWER_HINT = '*Tipos de hipoteca';

const API_URL = `http://${window.location.hostname}:3001/api/scores`;

function App() {
  const [username, setUsername] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [isSecretCorrect, setIsSecretCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lbRefreshKey, setLbRefreshKey] = useState(0);
  const savedRef = useRef(false);

  const { grid, placements } = useMemo(() => {
    return generateGrid(WORDS, GRID_ROWS, GRID_COLS, SECRET_ANSWER);
  }, []);

  const handleWordFound = useCallback((word) => {
    setFoundWords(prev => {
      if (prev.includes(word)) return prev;
      return [...prev, word];
    });
  }, []);

  const allFound = foundWords.length === WORDS.length;
  const isGameComplete = allFound && isSecretCorrect;

  // Timer effect (100ms precision for tiebreaking)
  useEffect(() => {
    if (!username || isGameComplete) return;
    const interval = setInterval(() => {
      setElapsedMs(prev => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, [username, isGameComplete]);

  // Score calculation: 10000 base, minus 1 per 100ms (= 10 per second)
  const currentScore = Math.max(0, 10000 - Math.floor(elapsedMs / 100));

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Save score when game is complete
  useEffect(() => {
    if (isGameComplete && username && !savedRef.current) {
      savedRef.current = true;
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score: currentScore }),
      })
        .then(() => setLbRefreshKey(k => k + 1))
        .catch(err => console.error('Erro ao salvar pontuação:', err));
    }
  }, [isGameComplete, username, currentScore]);

  // Show name input if no username yet
  if (!username) {
    return (
      <div className="page-layout">
        <NameInput onSubmit={setUsername} />
        <div className="leaderboard-wrapper">
          <Leaderboard refreshKey={lbRefreshKey} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="app">
        {/* Title bar */}
        <div className="title-bar">
          <h1 className="title">{PUZZLE_TITLE}</h1>
          <div className="stats-bar">
            <span className="player-name">👤 {username}</span>
            <span className="timer">Tempo: {formatTime(elapsedMs)}</span>
            <span className="score">Pontos: {currentScore}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="content">
          <Grid
            grid={grid}
            foundWords={foundWords}
            placements={placements}
            onWordFound={handleWordFound}
          />

          <WordList words={WORDS} foundWords={foundWords} />
        </div>

        {/* Answer section */}
        <div className="answer-section">
          <p className="answer-label">{ANSWER_HINT}</p>
          <AnswerBoxes
            answerWords={SECRET_ANSWER_WORDS}
            onAllCorrect={setIsSecretCorrect}
          />

          {isGameComplete && (
            <div className="complete-msg">
              <p className="success-text">✓ Caso resolvido!</p>
              <p className="final-score">Pontuação Final: <strong>{currentScore}</strong></p>
            </div>
          )}
        </div>

        <footer className="footer">
          made by Duffes 🧡
        </footer>
      </div>

      <div className="leaderboard-wrapper">
        <Leaderboard refreshKey={lbRefreshKey} />
      </div>
    </div>
  );
}

export default App;
