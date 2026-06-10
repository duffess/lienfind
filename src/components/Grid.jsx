import { useState, useCallback, useMemo } from 'react';
import { getCellsBetween } from '../utils/gridGenerator';
import './Grid.css';

export default function Grid({ grid, foundWords, placements, onWordFound }) {
  const [startCell, setStartCell] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Cells already found (permanent highlight)
  const foundCells = useMemo(() => {
    const set = new Set();
    for (const word of foundWords) {
      const cells = placements[word];
      if (cells) {
        cells.forEach(c => set.add(`${c.row}-${c.col}`));
      }
    }
    return set;
  }, [foundWords, placements]);

  // Preview cells (current drag)
  const previewCells = useMemo(() => {
    if (!startCell || !currentCell) return new Set();
    const cells = getCellsBetween(startCell.row, startCell.col, currentCell.row, currentCell.col);
    if (!cells) return new Set();
    return new Set(cells.map(c => `${c.row}-${c.col}`));
  }, [startCell, currentCell]);

  const handlePointerDown = useCallback((row, col) => {
    setStartCell({ row, col });
    setCurrentCell({ row, col });
    setIsDragging(true);
  }, []);

  const handlePointerEnter = useCallback((row, col) => {
    if (isDragging) {
      setCurrentCell({ row, col });
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (startCell && currentCell) {
      const cells = getCellsBetween(startCell.row, startCell.col, currentCell.row, currentCell.col);
      if (cells && cells.length > 1) {
        const selectedWord = cells.map(c => grid[c.row][c.col]).join('');
        if (placements[selectedWord]) {
          onWordFound(selectedWord);
        }
        const reversed = selectedWord.split('').reverse().join('');
        if (placements[reversed]) {
          onWordFound(reversed);
        }
      }
    }
    setStartCell(null);
    setCurrentCell(null);
    setIsDragging(false);
  }, [startCell, currentCell, grid, placements, onWordFound]);

  return (
    <div
      className="grid-container"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((letter, colIdx) => {
            const key = `${rowIdx}-${colIdx}`;
            const isFound = foundCells.has(key);
            const isPreview = previewCells.has(key);
            const isStart = startCell?.row === rowIdx && startCell?.col === colIdx;

            return (
              <div
                key={key}
                className={`cell ${isFound ? 'found' : ''} ${isPreview ? 'preview' : ''} ${isStart ? 'start' : ''}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(rowIdx, colIdx);
                }}
                onPointerEnter={() => handlePointerEnter(rowIdx, colIdx)}
              >
                <span className="letter">{letter}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
