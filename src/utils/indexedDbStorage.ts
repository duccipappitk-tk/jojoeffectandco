/**
 * Robust IndexedDB storage for JoJo Effects & Co.
 * Stores raw image Blobs directly rather than memory-heavy Base64 strings.
 * Preserves batch recovery, individual image retry, and AI result states.
 */

export interface StagedImageRecord {
  id: string; // e.g. "img_173100000_1"
  batchId: string;
  filename: string;
  blob: Blob;
  previewUrl?: string; // transient in-memory URL
  supabaseStorageUrl?: string; // populated after secure upload to product-images
  status: 'pending' | 'uploading_storage' | 'analyzing' | 'analyzed' | 'failed';
  errorReason?: string;
  aiSuggestedGroupId?: string;
  aiResult?: {
    product_name: string;
    product_type: string;
    suggested_category_id: string;
    suggested_new_category?: string;
    description: string;
    visible_specifications: Record<string, string>;
    colors_visible: string[];
    suggested_sku?: string;
  };
}

export interface StagedBatchRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalImages: number;
  completedImages: number;
  status: 'draft' | 'analyzing' | 'ready_for_review' | 'imported';
}

const DB_NAME = 'jojo_bulk_ai_db_v1';
const DB_VERSION = 1;
const STORE_BATCHES = 'batches';
const STORE_IMAGES = 'staged_images';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BATCHES)) {
        db.createObjectStore(STORE_BATCHES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const imageStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        imageStore.createIndex('batchId', 'batchId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const bulkIndexedDb = {
  async saveBatch(batch: StagedBatchRecord): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BATCHES, 'readwrite');
      tx.objectStore(STORE_BATCHES).put(batch);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getLatestBatch(): Promise<{ batch: StagedBatchRecord; images: StagedImageRecord[] } | null> {
    try {
      const db = await openDatabase();
      const batches: StagedBatchRecord[] = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_BATCHES, 'readonly');
        const req = tx.objectStore(STORE_BATCHES).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      if (!batches.length) return null;

      // Find the most recent un-imported batch
      const sorted = batches.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const activeBatch = sorted.find(b => b.status !== 'imported') || sorted[0];

      const images: StagedImageRecord[] = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_IMAGES, 'readonly');
        const index = tx.objectStore(STORE_IMAGES).index('batchId');
        const req = index.getAll(activeBatch.id);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      return { batch: activeBatch, images };
    } catch (e) {
      console.warn('Error reading latest batch from IndexedDB:', e);
      return null;
    }
  },

  async saveImages(images: StagedImageRecord[]): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      for (const img of images) {
        store.put(img);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async updateImage(image: StagedImageRecord): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      tx.objectStore(STORE_IMAGES).put(image);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async deleteImage(id: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      tx.objectStore(STORE_IMAGES).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async clearBatch(batchId: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_BATCHES, STORE_IMAGES], 'readwrite');
      tx.objectStore(STORE_BATCHES).delete(batchId);

      const imgStore = tx.objectStore(STORE_IMAGES);
      const index = imgStore.index('batchId');
      const req = index.getAllKeys(batchId);
      req.onsuccess = () => {
        for (const key of req.result) {
          imgStore.delete(key);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
