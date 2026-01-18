/**
 * fuzzyMatch Utility Tests
 *
 * Tests cover:
 * 1. Exact string matching
 * 2. Case-insensitive matching
 * 3. Substring matching
 * 4. Non-matches (return false)
 * 5. Empty query handling (matches all)
 * 6. File path matching
 * 7. Special characters
 * 8. Edge cases (null, undefined, empty strings)
 */

import { fuzzyMatch, matchesFilePath } from '../fuzzyMatch';

describe('fuzzyMatch', () => {
  describe('Exact Matches', () => {
    it('matches identical strings', () => {
      expect(fuzzyMatch('test', 'test')).toBe(true);
      expect(fuzzyMatch('Button.tsx', 'Button.tsx')).toBe(true);
      expect(fuzzyMatch('README.md', 'README.md')).toBe(true);
    });

    it('matches single characters', () => {
      expect(fuzzyMatch('a', 'a')).toBe(true);
      expect(fuzzyMatch('x', 'x')).toBe(true);
    });
  });

  describe('Case-Insensitive Matching', () => {
    it('matches different cases', () => {
      expect(fuzzyMatch('Test', 'test')).toBe(true);
      expect(fuzzyMatch('test', 'TEST')).toBe(true);
      expect(fuzzyMatch('TeSt', 'tEsT')).toBe(true);
    });

    it('matches mixed case filenames', () => {
      expect(fuzzyMatch('Button.tsx', 'button')).toBe(true);
      expect(fuzzyMatch('README.md', 'readme')).toBe(true);
      expect(fuzzyMatch('UserProfile.tsx', 'userprofile')).toBe(true);
    });

    it('matches all uppercase', () => {
      expect(fuzzyMatch('README', 'readme')).toBe(true);
      expect(fuzzyMatch('LICENSE', 'license')).toBe(true);
    });

    it('matches all lowercase', () => {
      expect(fuzzyMatch('button', 'BUTTON')).toBe(true);
      expect(fuzzyMatch('index', 'INDEX')).toBe(true);
    });
  });

  describe('Substring Matching', () => {
    it('matches substrings at start', () => {
      expect(fuzzyMatch('testfile.tsx', 'test')).toBe(true);
      expect(fuzzyMatch('Button.tsx', 'but')).toBe(true);
    });

    it('matches substrings in middle', () => {
      expect(fuzzyMatch('testfile.tsx', 'file')).toBe(true);
      expect(fuzzyMatch('UserProfile.tsx', 'prof')).toBe(true);
    });

    it('matches substrings at end', () => {
      expect(fuzzyMatch('testfile.tsx', 'tsx')).toBe(true);
      expect(fuzzyMatch('README.md', 'md')).toBe(true);
    });

    it('matches partial words', () => {
      expect(fuzzyMatch('ComponentName', 'comp')).toBe(true);
      expect(fuzzyMatch('useHookExample', 'hook')).toBe(true);
    });
  });

  describe('Non-Matches', () => {
    it('returns false for non-matching strings', () => {
      expect(fuzzyMatch('test', 'xyz')).toBe(false);
      expect(fuzzyMatch('Button.tsx', 'input')).toBe(false);
      expect(fuzzyMatch('README.md', 'package')).toBe(false);
    });

    it('returns false when query is longer than target', () => {
      expect(fuzzyMatch('ab', 'abcdef')).toBe(true); // substring match
      expect(fuzzyMatch('xyz', 'xy')).toBe(false); // query too long
    });

    it('returns false for completely different strings', () => {
      expect(fuzzyMatch('apple', 'orange')).toBe(false);
      expect(fuzzyMatch('dog', 'cat')).toBe(false);
    });
  });

  describe('Empty Query Handling', () => {
    it('matches all when query is empty', () => {
      expect(fuzzyMatch('anything', '')).toBe(true);
      expect(fuzzyMatch('test.tsx', '')).toBe(true);
      expect(fuzzyMatch('', '')).toBe(true);
    });

    it('returns false when target is empty but query is not', () => {
      expect(fuzzyMatch('', 'query')).toBe(false);
    });

    it('handles whitespace-only queries', () => {
      expect(fuzzyMatch('test file', '   ')).toBe(false);
      expect(fuzzyMatch('test', ' ')).toBe(false);
    });
  });

  describe('Special Characters', () => {
    it('matches queries with dots', () => {
      expect(fuzzyMatch('file.test.tsx', '.test')).toBe(true);
      expect(fuzzyMatch('package.json', '.json')).toBe(true);
    });

    it('matches queries with hyphens', () => {
      expect(fuzzyMatch('my-component.tsx', 'my-')).toBe(true);
      expect(fuzzyMatch('user-profile', 'user')).toBe(true);
    });

    it('matches queries with underscores', () => {
      expect(fuzzyMatch('use_state_hook', 'use_')).toBe(true);
      expect(fuzzyMatch('test_file', '_file')).toBe(true);
    });

    it('matches queries with slashes', () => {
      expect(fuzzyMatch('src/components/Button', 'src/')).toBe(true);
      expect(fuzzyMatch('path/to/file', '/to/')).toBe(true);
    });

    it('handles special regex characters safely', () => {
      expect(fuzzyMatch('test[bracket]', 'bracket')).toBe(true);
      expect(fuzzyMatch('file(parens)', 'parens')).toBe(true);
      expect(fuzzyMatch('special$chars', '$chars')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles very long strings', () => {
      const longTarget = 'a'.repeat(1000);
      const longQuery = 'a'.repeat(500);
      expect(fuzzyMatch(longTarget, longQuery)).toBe(true);
    });

    it('handles single character searches', () => {
      expect(fuzzyMatch('test', 't')).toBe(true);
      expect(fuzzyMatch('button', 'b')).toBe(true);
      expect(fuzzyMatch('xyz', 'a')).toBe(false);
    });

    it('handles unicode characters', () => {
      expect(fuzzyMatch('café', 'café')).toBe(true);
      expect(fuzzyMatch('日本語', '本語')).toBe(true);
    });

    it('handles numbers in filenames', () => {
      expect(fuzzyMatch('file123.tsx', '123')).toBe(true);
      expect(fuzzyMatch('v2.0.1', '2.0')).toBe(true);
    });

    it('trims whitespace', () => {
      expect(fuzzyMatch('  test  ', 'test')).toBe(true);
      expect(fuzzyMatch('test', '  test  ')).toBe(true);
    });
  });
});

describe('matchesFilePath', () => {
  describe('Full Path Matching', () => {
    it('matches against full file path', () => {
      expect(matchesFilePath('src/components/Button.tsx', 'button')).toBe(true);
      expect(matchesFilePath('/path/to/file.ts', 'file')).toBe(true);
    });

    it('matches against directory names', () => {
      expect(matchesFilePath('src/components/Button.tsx', 'components')).toBe(true);
      expect(matchesFilePath('lib/utils/helper.ts', 'utils')).toBe(true);
    });

    it('matches against path segments', () => {
      expect(matchesFilePath('src/components/Button.tsx', 'src/comp')).toBe(true);
      expect(matchesFilePath('lib/coderef/index.ts', 'coderef/')).toBe(true);
    });
  });

  describe('Filename Only Matching', () => {
    it('matches just the filename', () => {
      expect(matchesFilePath('src/components/Button.tsx', 'Button')).toBe(true);
      expect(matchesFilePath('/long/path/to/README.md', 'readme')).toBe(true);
    });

    it('matches file extension', () => {
      expect(matchesFilePath('components/Button.tsx', 'tsx')).toBe(true);
      expect(matchesFilePath('docs/README.md', 'md')).toBe(true);
    });
  });

  describe('Case-Insensitive Path Matching', () => {
    it('matches paths case-insensitively', () => {
      expect(matchesFilePath('Src/Components/Button.tsx', 'src/comp')).toBe(true);
      expect(matchesFilePath('LIB/UTILS/helper.ts', 'lib/utils')).toBe(true);
    });
  });

  describe('Non-Matching Paths', () => {
    it('returns false for non-matching paths', () => {
      expect(matchesFilePath('src/components/Button.tsx', 'input')).toBe(false);
      expect(matchesFilePath('lib/utils/helper.ts', 'service')).toBe(false);
    });

    it('returns false when query not in path', () => {
      expect(matchesFilePath('src/components/Button.tsx', 'models')).toBe(false);
      expect(matchesFilePath('lib/utils/helper.ts', 'api')).toBe(false);
    });
  });

  describe('Empty Query Handling', () => {
    it('matches all paths when query is empty', () => {
      expect(matchesFilePath('src/components/Button.tsx', '')).toBe(true);
      expect(matchesFilePath('any/path/here', '')).toBe(true);
    });
  });

  describe('Windows vs Unix Paths', () => {
    it('handles Windows-style paths', () => {
      expect(matchesFilePath('C:\\Users\\name\\file.txt', 'users')).toBe(true);
      expect(matchesFilePath('D:\\projects\\app\\src\\index.ts', 'src')).toBe(true);
    });

    it('handles Unix-style paths', () => {
      expect(matchesFilePath('/home/user/file.txt', 'user')).toBe(true);
      expect(matchesFilePath('/var/www/html/index.html', 'www')).toBe(true);
    });

    it('handles mixed path separators', () => {
      expect(matchesFilePath('src/components\\Button.tsx', 'button')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles deep nested paths', () => {
      const deepPath = 'a/b/c/d/e/f/g/h/i/j/file.ts';
      expect(matchesFilePath(deepPath, 'file')).toBe(true);
      expect(matchesFilePath(deepPath, 'e/f/g')).toBe(true);
    });

    it('handles paths with dots', () => {
      expect(matchesFilePath('src/.config/settings.json', 'config')).toBe(true);
      expect(matchesFilePath('.github/workflows/ci.yml', 'github')).toBe(true);
    });

    it('handles paths with spaces', () => {
      expect(matchesFilePath('My Documents/file.txt', 'documents')).toBe(true);
      expect(matchesFilePath('Program Files/app/index.js', 'program')).toBe(true);
    });
  });
});
