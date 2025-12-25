/**
 * Generate unique clipboard filenames with auto-increment
 * Supports multiple pastes without conflicts:
 * clipboard_001.txt, clipboard_002.txt, clipboard_003.txt, etc
 */
export function generateClipboardFilename(existingFiles: string[]): string {
  const clipboardPattern = /^clipboard_(\d+)\.txt$/;
  const usedNumbers = new Set<number>();

  // Extract all used numbers from existing clipboard files
  for (const file of existingFiles) {
    const match = file.match(clipboardPattern);
    if (match) {
      usedNumbers.add(parseInt(match[1], 10));
    }
  }

  // Find the next available number (fills gaps)
  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber++;
  }

  return `clipboard_${String(nextNumber).padStart(3, '0')}.txt`;
}

/**
 * Generate unique filename by appending number if conflict exists
 */
export function generateUniqueFilename(originalName: string, existingFiles: string[]): string {
  // If no conflict, use original name
  if (!existingFiles.includes(originalName)) {
    return originalName;
  }

  // Extract base name and extension
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;
  const extension = lastDot > 0 ? originalName.substring(lastDot) : '';

  // Try appending numbers until we find an available name
  for (let i = 1; i <= 1000; i++) {
    const newName = `${baseName}_${i}${extension}`;
    if (!existingFiles.includes(newName)) {
      return newName;
    }
  }

  // Fallback: append timestamp
  const timestamp = Date.now();
  return `${baseName}_${timestamp}${extension}`;
}

/**
 * Get next clipboard file number
 */
export function getNextClipboardNumber(existingFiles: string[]): number {
  const clipboardPattern = /^clipboard_(\d+)\.txt$/;
  let maxNumber = 0;

  for (const file of existingFiles) {
    const match = file.match(clipboardPattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  return maxNumber + 1;
}
