/**
 * File handling utilities for Electron and Web environments
 */

export const fileHandlers = {
  isElectron(): boolean {
    return typeof window !== 'undefined' && !!(window as any).electronAPI;
  },

  async openFile(options: {
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  } = {}): Promise<{ content: string; filename: string } | null> {
    if (this.isElectron()) {
      // Electron file dialog
      try {
        const result = await (window as any).electronAPI.openFileDialog({
          title: options.title || 'Select file',
          filters: options.filters || [{ name: 'All files', extensions: ['*'] }]
        });

        if (result?.filePath && !result.canceled) {
          const fileData = await (window as any).electronAPI.readFile(result.filePath);
          if (fileData.error) {
            throw new Error(fileData.error);
          }
          return { content: fileData.content, filename: fileData.filename || 'file.txt' };
        }
        return null;
      } catch (error) {
        console.error('Electron file dialog error:', error);
        throw error;
      }
    } else {
      // Web file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (options.filters?.[0]?.extensions) {
          input.accept = options.filters[0].extensions.map(ext => `.${ext}`).join(',');
        }

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              const content = await file.text();
              resolve({ content, filename: file.name });
            } catch (error) {
              console.error('File read error:', error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };

        input.click();
      });
    }
  }
};
