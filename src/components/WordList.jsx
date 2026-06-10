import './WordList.css';

export default function WordList({ words, foundWords }) {
  return (
    <div className="wordlist-container">
      <div className="wordlist-grid">
        {words.map((word) => {
          const upperWord = word.toUpperCase();
          const isFound = foundWords.includes(upperWord);
          return (
            <div
              key={word}
              className={`word-item ${isFound ? 'found' : ''}`}
            >
              {word}
            </div>
          );
        })}
      </div>
    </div>
  );
}
