const STORAGE_KEYS = {
  ACTIVE_CLIENT: 'bf_active_client',
  PREFERENCES: 'bf_preferences',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export function getStorageValue<T>(key: StorageKey): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

export function setStorageValue<T>(key: StorageKey, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    
    // Dispara evento para sincronizar entre abas
    window.dispatchEvent(new CustomEvent('bf-storage-change', { detail: { key, value } }));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export function removeStorageValue(key: StorageKey): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('bf-storage-change', { detail: { key } }));
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

export { STORAGE_KEYS };
