/**
 * Gera o grid de caça-palavras estilo Murd Search.
 * As letras não usadas pelas palavras formam a resposta secreta.
 */

const DIRECTIONS = [
  { dr: 0, dc: 1 },   // →
  { dr: 0, dc: -1 },  // ←
  { dr: 1, dc: 0 },   // ↓
  { dr: -1, dc: 0 },  // ↑
  { dr: 1, dc: 1 },   // ↘
  { dr: -1, dc: -1 }, // ↖
  { dr: 1, dc: -1 },  // ↙
  { dr: -1, dc: 1 },  // ↗
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canPlace(grid, word, row, col, dr, dc, rows, cols) {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(grid, word, row, col, dr, dc) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    grid[r][c] = word[i];
    cells.push({ row: r, col: c });
  }
  return cells;
}

/**
 * Gera o grid com palavras posicionadas.
 * As células vazias serão preenchidas com as letras da resposta secreta (em ordem de leitura),
 * e o restante com letras aleatórias.
 *
 * @param {string[]} words - Palavras para esconder no grid
 * @param {number} rows - Número de linhas
 * @param {number} cols - Número de colunas
 * @param {string} secretAnswer - Resposta secreta (letras sobram preenchem nesta ordem)
 * @returns {{ grid: string[][], placements: Object }}
 */
export function generateGrid(words, rows = 8, cols = 8, secretAnswer = '') {
  // Try multiple times to get a valid grid where secret answer fits exactly
  for (let attempt = 0; attempt < 5000; attempt++) {
    const result = tryGenerateGrid(words, rows, cols, secretAnswer);
    if (result) return result;
  }
  // Fallback: generate without strict secret answer constraint
  return tryGenerateGrid(words, rows, cols, '') || {
    grid: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 'X')
    ),
    placements: {},
  };
}

function tryGenerateGrid(words, rows, cols, secretAnswer) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
  const placements = {};
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const upperWord = word.toUpperCase();
    let placed = false;
    const shuffledDirs = shuffle(DIRECTIONS);

    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = shuffledDirs[attempt % shuffledDirs.length];
      const startRow = Math.floor(Math.random() * rows);
      const startCol = Math.floor(Math.random() * cols);

      if (canPlace(grid, upperWord, startRow, startCol, dir.dr, dir.dc, rows, cols)) {
        const cells = placeWord(grid, upperWord, startRow, startCol, dir.dr, dir.dc);
        placements[upperWord] = cells;
        placed = true;
      }
    }

    if (!placed) {
      return null; // Failed — retry
    }
  }

  // Collect empty cells in reading order
  const emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '') {
        emptyCells.push({ row: r, col: c });
      }
    }
  }

  // Verify secret answer fits exactly
  const secretLetters = secretAnswer.toUpperCase().replace(/\s/g, '');
  if (secretLetters.length > 0 && emptyCells.length !== secretLetters.length) {
    return null; // Not an exact match
  }

  // Place secret letters in reading order (left→right, top→bottom)
  for (let i = 0; i < emptyCells.length; i++) {
    const { row, col } = emptyCells[i];
    grid[row][col] = secretLetters[i];
  }

  return { grid, placements };
}

/**
 * Retorna as células entre dois pontos se formarem uma linha reta (H, V ou D).
 */
export function getCellsBetween(startRow, startCol, endRow, endCol) {
  const dr = Math.sign(endRow - startRow);
  const dc = Math.sign(endCol - startCol);
  const rowDist = Math.abs(endRow - startRow);
  const colDist = Math.abs(endCol - startCol);

  // Must be horizontal, vertical, or 45° diagonal
  if (rowDist !== colDist && rowDist !== 0 && colDist !== 0) {
    return null;
  }

  const steps = Math.max(rowDist, colDist);
  const cells = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: startRow + i * dr, col: startCol + i * dc });
  }
  return cells;
}
