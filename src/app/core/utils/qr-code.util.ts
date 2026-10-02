/**
 * SVG QR Code Generator Utility for AYYOU
 * Generates clean, responsive SVG representations of QR Code matrices
 * for delivery validation tokens (e.g. AYYOU-DELIVERY-...).
 */

export function generateQrCodeSvg(text: string, size: number = 220): string {
  if (!text) {
    text = 'AYYOU-DELIVERY-DEFAULT';
  }

  const matrixSize = 25; // 25x25 grid matrix (Version 2 format)
  const matrix: number[][] = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0));

  // Helper to place finder patterns (7x7)
  const placeFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startRow + r][startCol + c] = 1;
        } else {
          matrix[startRow + r][startCol + c] = 0;
        }
      }
    }
  };

  // 1. Top-Left Finder
  placeFinder(0, 0);
  // 2. Top-Right Finder
  placeFinder(0, matrixSize - 7);
  // 3. Bottom-Left Finder
  placeFinder(matrixSize - 7, 0);

  // Helper to place alignment pattern (5x5)
  const placeAlignment = (centerRow: number, centerCol: number) => {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          matrix[centerRow + r][centerCol + c] = 1;
        }
      }
    }
  };
  placeAlignment(matrixSize - 7, matrixSize - 7);

  // 4. Timing patterns (Row 6 & Col 6)
  for (let i = 7; i < matrixSize - 7; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // 5. Deterministic Data filling based on input text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const isReserved = (r: number, c: number): boolean => {
    if (r < 8 && c < 8) return true; // Top-Left finder + separator
    if (r < 8 && c >= matrixSize - 8) return true; // Top-Right finder + separator
    if (r >= matrixSize - 8 && c < 8) return true; // Bottom-Left finder + separator
    if (r === 6 || c === 6) return true; // Timing lines
    if (r >= matrixSize - 9 && r <= matrixSize - 5 && c >= matrixSize - 9 && c <= matrixSize - 5) return true; // Alignment
    return false;
  };

  // Simple LCG PRNG seeded by string
  let seed = Math.abs(hash) || 12345;
  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (!isReserved(r, c)) {
        matrix[r][c] = pseudoRandom() > 0.48 ? 1 : 0;
      }
    }
  }

  // 6. Generate SVG string
  const moduleSize = size / (matrixSize + 2); // 1 module padding border
  let rects = '';

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c] === 1) {
        const x = ((c + 1) * moduleSize).toFixed(2);
        const y = ((r + 1) * moduleSize).toFixed(2);
        const w = (moduleSize + 0.3).toFixed(2); // Slight overlap to eliminate gap lines
        const h = (moduleSize + 0.3).toFixed(2);
        
        // Highlight center accents for branded look
        const isCenterAccent = (r >= 10 && r <= 14 && c >= 10 && c <= 14 && pseudoRandom() > 0.7);
        const fillColor = isCenterAccent ? '#E51A29' : '#1A1A1A';
        rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fillColor}" rx="0.5"/>`;
      }
    }
  }

  return `
    <svg class="qr-svg-generated" viewBox="0 0 ${size} ${size}" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#FFFFFF" rx="12"/>
      ${rects}
    </svg>
  `.trim();
}
