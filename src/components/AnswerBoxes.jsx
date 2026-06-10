import { useState, useRef, useCallback } from 'react';
import './AnswerBoxes.css';

/**
 * Caixas de resposta onde o jogador digita manualmente a resposta secreta.
 * Não revela automaticamente — o jogador precisa descobrir pelas letras restantes no grid.
 */
export default function AnswerBoxes({ answerWords, onAllCorrect }) {
  // Create a flat structure of all boxes with word/index info
  const totalLetters = answerWords.reduce((sum, w) => sum + w.length, 0);
  const [letters, setLetters] = useState(() => Array(totalLetters).fill(''));
  const inputRefs = useRef([]);
  const hasNotifiedRef = useRef(false);

  const setRef = useCallback((el, idx) => {
    inputRefs.current[idx] = el;
  }, []);

  const handleInput = useCallback((flatIdx, value) => {
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z]$/.test(char)) return;

    setLetters(prev => {
      const next = [...prev];
      next[flatIdx] = char;
      return next;
    });

    // Auto-advance to next box
    if (char && flatIdx < totalLetters - 1) {
      inputRefs.current[flatIdx + 1]?.focus();
    }
  }, [totalLetters]);

  const handleKeyDown = useCallback((flatIdx, e) => {
    if (e.key === 'Backspace') {
      if (letters[flatIdx] === '' && flatIdx > 0) {
        // Move back if current is empty
        e.preventDefault();
        inputRefs.current[flatIdx - 1]?.focus();
        setLetters(prev => {
          const next = [...prev];
          next[flatIdx - 1] = '';
          return next;
        });
      } else {
        // Clear current
        setLetters(prev => {
          const next = [...prev];
          next[flatIdx] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && flatIdx > 0) {
      e.preventDefault();
      inputRefs.current[flatIdx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && flatIdx < totalLetters - 1) {
      e.preventDefault();
      inputRefs.current[flatIdx + 1]?.focus();
    }
  }, [letters, totalLetters]);

  const isAllCorrect = letters.join('') === answerWords.join('').toUpperCase();

  if (isAllCorrect && !hasNotifiedRef.current) {
    hasNotifiedRef.current = true;
    if (onAllCorrect) onAllCorrect(true);
  } else if (!isAllCorrect && hasNotifiedRef.current) {
    hasNotifiedRef.current = false;
    if (onAllCorrect) onAllCorrect(false);
  }

  // Build rows from answer words
  let flatIdx = 0;
  const rows = answerWords.map((word, wordIdx) => {
    const startIdx = flatIdx;
    const boxes = [];
    for (let i = 0; i < word.length; i++) {
      const idx = flatIdx;
      boxes.push(
        <input
          key={idx}
          ref={(el) => setRef(el, idx)}
          className={`answer-box ${letters[idx] ? 'filled' : ''}`}
          type="text"
          maxLength={1}
          value={letters[idx]}
          onChange={(e) => handleInput(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          autoComplete="off"
        />
      );
      flatIdx++;
    }

    // Check if all boxes in this row are filled
    const rowLetters = letters.slice(startIdx, startIdx + word.length);
    const allFilled = rowLetters.every(l => l !== '');
    const typedWord = rowLetters.join('');
    const isCorrect = typedWord === word.toUpperCase();

    return (
      <div key={wordIdx} className="answer-row">
        {boxes}
        {allFilled && (
          <span className={`answer-status ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
        )}
      </div>
    );
  });

  return (
    <div className="answer-rows">
      {rows}
    </div>
  );
}
