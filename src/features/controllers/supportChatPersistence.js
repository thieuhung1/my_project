const STORAGE_KEY_PREFIX = 'foodhub_support_chat';

const getStorageKey = (chatId) => `${STORAGE_KEY_PREFIX}:${String(chatId || '').trim()}`;

const hasStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const clearAllSupportChatState = () => {
  if (!hasStorage()) return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // ignore storage errors
  }
};

if (hasStorage()) {
  window.addEventListener('beforeunload', clearAllSupportChatState);
}

export const persistSupportChatState = (chatId, state) => {
  if (!hasStorage() || !chatId) return;
  try {
    window.sessionStorage.setItem(getStorageKey(chatId), JSON.stringify({
      savedAt: Date.now(),
      state,
    }));
  } catch {
    // ignore storage errors
  }
};

export const readSupportChatState = (chatId, ttlMs = 2 * 60 * 60 * 1000) => {
  if (!hasStorage() || !chatId) return null;
  try {
    const raw = window.sessionStorage.getItem(getStorageKey(chatId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > ttlMs) {
      window.sessionStorage.removeItem(getStorageKey(chatId));
      return null;
    }

    return parsed.state || null;
  } catch {
    return null;
  }
};

export const clearSupportChatState = (chatId) => {
  if (!hasStorage() || !chatId) return;
  try {
    window.sessionStorage.removeItem(getStorageKey(chatId));
  } catch {
    // ignore storage errors
  }
};

export const clearAllSupportChatCache = clearAllSupportChatState;
