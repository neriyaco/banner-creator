import { useEffect, useState, useCallback } from 'react';
import type { BannerConfig } from '../types';

const DB_NAME = 'banner-presets-db';
const STORE = 'presets';

export type Preset = {
  id: string;
  name: string;
  createdAt: number;
  config: BannerConfig;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbGetAll(db: IDBDatabase): Promise<Preset[]> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as Preset[]);
    req.onerror = () => reject(req.error);
  });
}

function dbPut(db: IDBDatabase, preset: Preset): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(preset);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function dbDelete(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function usePresets() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    openDb()
      .then(async (database) => {
        setDb(database);
        const all = await dbGetAll(database);
        setPresets(all.sort((a, b) => b.createdAt - a.createdAt));
      })
      .catch(console.error);
  }, []);

  const savePreset = useCallback(
    async (name: string, config: BannerConfig): Promise<void> => {
      const preset: Preset = {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        createdAt: Date.now(),
        config,
      };
      if (db) await dbPut(db, preset);
      setPresets((prev) => [preset, ...prev]);
    },
    [db],
  );

  const deletePreset = useCallback(
    async (id: string): Promise<void> => {
      if (db) await dbDelete(db, id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    },
    [db],
  );

  return { presets, savePreset, deletePreset };
}
