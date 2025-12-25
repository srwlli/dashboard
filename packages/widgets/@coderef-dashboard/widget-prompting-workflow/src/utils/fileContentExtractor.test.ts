/**
 * Unit tests for fileContentExtractor utility
 * Tests file content reading, language detection, and metadata extraction
 */

import { readFileContent } from './fileContentExtractor';

describe('fileContentExtractor', () => {
  describe('readFileContent', () => {
    it('should extract text file content', async () => {
      const content = 'console.log("hello");';
      const file = new File([content], 'test.js', { type: 'text/javascript' });
      const attachment = await readFileContent(file);

      expect(attachment.filename).toBe('test.js');
      expect(attachment.extension).toBe('.js');
      expect(attachment.content).toBe(content);
      expect(attachment.language).toBe('javascript');
      expect(attachment.isText).toBe(true);
      expect(attachment.isBinary).toBe(false);
    });

    it('should detect TypeScript language', async () => {
      const file = new File(['interface User {}'], 'User.ts', { type: 'text/typescript' });
      const attachment = await readFileContent(file);

      expect(attachment.language).toBe('typescript');
      expect(attachment.extension).toBe('.ts');
    });

    it('should detect TSX language', async () => {
      const file = new File(['<Component />', ''], 'Component.tsx', { type: 'text/typescript' });
      const attachment = await readFileContent(file);

      expect(attachment.language).toBe('typescript');
      expect(attachment.extension).toBe('.tsx');
    });

    it('should detect Python language', async () => {
      const file = new File(['def hello():', '    pass'], 'script.py', { type: 'text/x-python' });
      const attachment = await readFileContent(file);

      expect(attachment.language).toBe('python');
      expect(attachment.extension).toBe('.py');
    });

    it('should detect JSON language', async () => {
      const file = new File(['{"key": "value"}'], 'config.json', { type: 'application/json' });
      const attachment = await readFileContent(file);

      expect(attachment.language).toBe('json');
      expect(attachment.extension).toBe('.json');
    });

    it('should handle Markdown files', async () => {
      const file = new File(['# Title\n\nContent'], 'README.md', { type: 'text/markdown' });
      const attachment = await readFileContent(file);

      expect(attachment.language).toBe('markdown');
      expect(attachment.extension).toBe('.md');
    });

    it('should handle plain text files', async () => {
      const file = new File(['plain text content'], 'notes.txt', { type: 'text/plain' });
      const attachment = await readFileContent(file);

      expect(attachment.language).toBe('text');
      expect(attachment.extension).toBe('.txt');
    });

    it('should mark binary files correctly', async () => {
      const file = new File(
        [new Uint8Array([137, 80, 78, 71])],
        'image.png',
        { type: 'image/png' }
      );
      const attachment = await readFileContent(file);

      expect(attachment.extension).toBe('.png');
      expect(attachment.isBinary).toBe(true);
      expect(attachment.isText).toBe(false);
    });

    it('should generate preview for text files', async () => {
      const content = 'This is a long text file that should be previewed...'.repeat(10);
      const file = new File([content], 'long.txt', { type: 'text/plain' });
      const attachment = await readFileContent(file);

      expect(attachment.preview).toBeDefined();
      expect(attachment.preview?.length).toBeLessThanOrEqual(200);
    });

    it('should calculate file size correctly', async () => {
      const content = 'Hello';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const attachment = await readFileContent(file);

      expect(attachment.size).toBe(5);
    });

    it('should generate unique ID for each file', async () => {
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

      const attachment1 = await readFileContent(file1);
      const attachment2 = await readFileContent(file2);

      expect(attachment1.id).not.toBe(attachment2.id);
    });

    it('should detect multiple supported languages', async () => {
      const testCases = [
        { file: 'app.go', expectedLang: 'go' },
        { file: 'Main.java', expectedLang: 'java' },
        { file: 'script.rb', expectedLang: 'ruby' },
        { file: 'app.php', expectedLang: 'php' },
        { file: 'query.sql', expectedLang: 'sql' },
      ];

      for (const testCase of testCases) {
        const file = new File(['code'], testCase.file, { type: 'text/plain' });
        const attachment = await readFileContent(file);
        expect(attachment.language).toBe(testCase.expectedLang);
      }
    });

    it('should set correct MIME type', async () => {
      const testCases = [
        { filename: 'test.json', expectedMime: 'application/json' },
        { filename: 'test.md', expectedMime: 'text/markdown' },
        { filename: 'test.html', expectedMime: 'text/html' },
      ];

      for (const testCase of testCases) {
        const file = new File(['content'], testCase.filename, { type: 'text/plain' });
        const attachment = await readFileContent(file);
        expect(attachment.mimeType).toBe(testCase.expectedMime);
      }
    });
  });
});
