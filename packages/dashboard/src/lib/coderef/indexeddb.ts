/**
 * IndexedDB Utilities for CodeRef Explorer
 *
 * Stores FileSystemDirectoryHandle objects for persistent access
 */

const DB_NAME = 'CodeRefExplorer';
const DB_VERSION = 1;
const STORE_NAME = 'directoryHandles';

/**
 * Open IndexedDB database
 */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'projectId' });
      }
    };
  });
}

/**
 * Save directory handle to IndexedDB
 */
export async function saveDirectoryHandle(
  projectId: string,
  dirHandle: FileSystemDirectoryHandle
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      projectId,
      handle: dirHandle,
      savedAt: new Date().toISOString(),
    };

    const request = store.put(record);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Retrieve directory handle from IndexedDB
 */
export async function getDirectoryHandle(
  projectId: string
): Promise<FileSystemDirectoryHandle | undefined> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(projectId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result;
      resolve(record?.handle);
    };

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Delete directory handle from IndexedDB
 */
export async function deleteDirectoryHandle(projectId: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(projectId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
  });
}

/**
 * List all stored project IDs
 */
export async function listStoredProjects(): Promise<string[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string[]);

    transaction.oncomplete = () => db.close();
  });
}
