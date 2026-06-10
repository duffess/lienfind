import { useState, useEffect } from 'react';
import './Leaderboard.css';

const API_URL = `http://${window.location.hostname}:3001/api/scores`;

export default function Leaderboard({ refreshKey }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="leaderboard">
      <div className="lb-header">
        <h2 className="lb-title">🏆 RANKING</h2>
      </div>

      <div className="lb-list">
        {loading && <p className="lb-loading">Carregando...</p>}

        {!loading && scores.length === 0 && (
          <p className="lb-empty">Nenhuma pontuação ainda</p>
        )}

        {!loading && scores.map((entry, idx) => (
          <div key={idx} className={`lb-row ${idx < 3 ? `lb-top-${idx + 1}` : ''}`}>
            <span className="lb-rank">{idx + 1}º</span>
            <span className="lb-name">{entry.username}</span>
            <span className="lb-score">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
