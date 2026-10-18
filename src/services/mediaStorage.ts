/**
 * Pure client-side IndexedDB media storage.
 * Safely persists video and audio Blobs without overflowing localStorage quota.
 */

const DB_NAME = 'myraah_media_db'
const DB_VERSION = 1
const STORE_NAME = 'lesson_blobs'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const mediaStorage = {
  async saveMediaBlob(key: string, blob: Blob): Promise<void> {
    try {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(blob, key)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        tx.oncomplete = () => db.close()
      })
    } catch (e) {
      console.warn('Could not save media blob to IndexedDB:', e)
    }
  },

  async getMediaBlob(key: string): Promise<Blob | null> {
    try {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(key)

        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
        tx.oncomplete = () => db.close()
      })
    } catch (e) {
      console.warn('Could not read media blob from IndexedDB:', e)
      return null
    }
  },

  async deleteMediaBlob(key: string): Promise<void> {
    try {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(key)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        tx.oncomplete = () => db.close()
      })
    } catch (e) {
      console.warn('Could not delete media blob from IndexedDB:', e)
    }
  },

  async hasMediaBlob(key: string): Promise<boolean> {
    const blob = await this.getMediaBlob(key)
    return blob !== null
  },
}
