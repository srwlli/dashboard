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
  },

  async saveFile(options: {
    content: string;
    filename?: string;
    suggestedName?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<{ success: boolean; filePath?: string } | null> {
    if (this.isElectron()) {
      // Electron save dialog
      try {
        const result = await (window as any).electronAPI.saveFileDialog({
          title: 'Save file',
          defaultPath: options.suggestedName || options.filename || 'untitled.txt',
          filters: options.filters || [{ name: 'All files', extensions: ['*'] }]
        });

        if (result?.filePath && !result.canceled) {
          const writeResult = await (window as any).electronAPI.writeFile({
            filePath: result.filePath,
            content: options.content
          });

          if (writeResult.error) {
            throw new Error(writeResult.error);
          }

          return { success: true, filePath: result.filePath };
        }
        return null;
      } catch (error) {
        console.error('Electron save dialog error:', error);
        throw error;
      }
    } else {
      // Web File System Access API (if available)
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: options.suggestedName || options.filename || 'untitled.txt',
            types: options.filters?.map(filter => ({
              description: filter.name,
              accept: {
                'text/plain': filter.extensions.map(ext => `.${ext}`)
              }
            }))
          });

          const writable = await fileHandle.createWritable();
          await writable.write(options.content);
          await writable.close();

          return { success: true, filePath: fileHandle.name };
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            return null; // User cancelled
          }
          console.error('File System Access API error:', error);
          throw error;
        }
      } else {
        // Fallback: Download file
        const blob = new Blob([options.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = options.suggestedName || options.filename || 'untitled.txt';
        a.click();
        URL.revokeObjectURL(url);

        return { success: true }; // Can't get file path in fallback mode
      }
    }
  }
};
