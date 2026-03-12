import { useEffect, useState, useCallback } from 'react';

const DB_NAME = 'banner-creator-db';
const STORE = 'custom-icons';

export type CustomIcon = { id: string; dataUrl: string; name: string };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbGetAll(db: IDBDatabase): Promise<CustomIcon[]> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as CustomIcon[]);
    req.onerror = () => reject(req.error);
  });
}

function dbPut(db: IDBDatabase, icon: CustomIcon): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(icon);
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

export function useCustomIcons() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [icons, setIcons] = useState<CustomIcon[]>([]);

  useEffect(() => {
    openDb()
      .then(async (database) => {
        setDb(database);
        setIcons(await dbGetAll(database));
      })
      .catch(console.error);
  }, []);

  const addIcon = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const dataUrl = reader.result as string;
            const icon: CustomIcon = {
              id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              dataUrl,
              name: file.name,
            };
            if (db) await dbPut(db, icon);
            setIcons((prev) => [icon, ...prev]);
            resolve(dataUrl);
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },
    [db]
  );

  const removeIcon = useCallback(
    async (id: string) => {
      if (db) await dbDelete(db, id);
      setIcons((prev) => prev.filter((i) => i.id !== id));
    },
    [db]
  );

  return { icons, addIcon, removeIcon };
}
