const SAVED_POSTS_KEY = 'savedPosts';
const SAVED_POSTS_EVENT = 'saved-posts-changed';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SAVED_POSTS_EVENT));
  }
}

export function subscribeToSavedPosts(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(SAVED_POSTS_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(SAVED_POSTS_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function getSavedPostIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(SAVED_POSTS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

export function isPostSaved(postId: string): boolean {
  return getSavedPostIds().includes(String(postId));
}

export function addSavedPostId(postId: string): string[] {
  const id = String(postId);
  const ids = getSavedPostIds();
  const updated = ids.includes(id) ? ids : [...ids, id];
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updated));
  notifyChange();
  return updated;
}

export function removeSavedPostId(postId: string): string[] {
  const id = String(postId);
  const updated = getSavedPostIds().filter((savedId) => savedId !== id);
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updated));
  notifyChange();
  return updated;
}

