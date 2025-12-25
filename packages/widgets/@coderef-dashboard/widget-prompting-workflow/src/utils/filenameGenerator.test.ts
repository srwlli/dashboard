/**
 * Unit tests for filenameGenerator utility
 * Tests auto-incrementing clipboard filenames and conflict resolution
 */

import { generateClipboardFilename, generateUniqueFilename, getNextClipboardNumber } from './filenameGenerator';

describe('filenameGenerator', () => {
  describe('generateClipboardFilename', () => {
    it('should generate clipboard_001.txt for empty list', () => {
      expect(generateClipboardFilename([])).toBe('clipboard_001.txt');
    });

    it('should auto-increment filenames', () => {
      expect(generateClipboardFilename(['clipboard_001.txt'])).toBe('clipboard_002.txt');
      expect(generateClipboardFilename(['clipboard_001.txt', 'clipboard_002.txt'])).toBe(
        'clipboard_003.txt'
      );
    });

    it('should fill gaps in sequence', () => {
      const existing = ['clipboard_001.txt', 'clipboard_003.txt'];
      expect(generateClipboardFilename(existing)).toBe('clipboard_002.txt');
    });

    it('should handle non-clipboard files in list', () => {
      const existing = ['UserAuth.tsx', 'clipboard_001.txt', 'requirements.txt'];
      expect(generateClipboardFilename(existing)).toBe('clipboard_002.txt');
    });

    it('should handle large numbers', () => {
      const existing = ['clipboard_999.txt'];
      expect(generateClipboardFilename(existing)).toBe('clipboard_1000.txt');
    });

    it('should handle up to 1000 pastes without issues', () => {
      const existing = Array.from({ length: 100 }, (_, i) =>
        `clipboard_${String(i + 1).padStart(3, '0')}.txt`
      );
      const next = generateClipboardFilename(existing);
      expect(next).toBe('clipboard_101.txt');
    });
  });

  describe('generateUniqueFilename', () => {
    it('should return original name if no conflict', () => {
      expect(generateUniqueFilename('UserAuth.tsx', [])).toBe('UserAuth.tsx');
      expect(generateUniqueFilename('UserAuth.tsx', ['OtherFile.tsx'])).toBe('UserAuth.tsx');
    });

    it('should append _1 for first conflict', () => {
      const existing = ['UserAuth.tsx'];
      expect(generateUniqueFilename('UserAuth.tsx', existing)).toBe('UserAuth_1.tsx');
    });

    it('should increment number for multiple conflicts', () => {
      const existing = ['UserAuth.tsx', 'UserAuth_1.tsx', 'UserAuth_2.tsx'];
      expect(generateUniqueFilename('UserAuth.tsx', existing)).toBe('UserAuth_3.tsx');
    });

    it('should handle files without extension', () => {
      const existing = ['Dockerfile'];
      expect(generateUniqueFilename('Dockerfile', existing)).toBe('Dockerfile_1');
    });

    it('should preserve extension in conflict case', () => {
      const existing = ['requirements.txt'];
      expect(generateUniqueFilename('requirements.txt', existing)).toBe('requirements_1.txt');
    });
  });

  describe('getNextClipboardNumber', () => {
    it('should return 1 for empty list', () => {
      expect(getNextClipboardNumber([])).toBe(1);
    });

    it('should return next number after highest', () => {
      const existing = ['clipboard_001.txt', 'clipboard_003.txt', 'clipboard_002.txt'];
      expect(getNextClipboardNumber(existing)).toBe(4);
    });

    it('should ignore non-clipboard files', () => {
      const existing = ['UserAuth.tsx', 'clipboard_005.txt', 'requirements.txt'];
      expect(getNextClipboardNumber(existing)).toBe(6);
    });

    it('should handle single file', () => {
      expect(getNextClipboardNumber(['clipboard_001.txt'])).toBe(2);
    });
  });
});
