const SAVED_POSTS_KEY = 'savedPosts';

export function getSavedPostIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(SAVED_POSTS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function isPostSaved(postId: string): boolean {
  return getSavedPostIds().includes(postId);
}

export function addSavedPostId(postId: string): string[] {
  const ids = getSavedPostIds();
  const updated = ids.includes(postId) ? ids : [...ids, postId];
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updated));
  return updated;
}

export function removeSavedPostId(postId: string): string[] {
  const updated = getSavedPostIds().filter((id) => id !== postId);
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(updated));
  return updated;
}
