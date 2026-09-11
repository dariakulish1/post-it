const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export type Post = {
  id: string;
  post_id: number;
  title: string;
  anons: string;
  full_text?: string;
  image_url?: string;
  image_path?: string;
  author_id?: string;
  author_name?: string;
  created_at?: string;
};

async function parseJsonResponse(response: Response, fallbackError: string) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(fallbackError);
  }
}

async function getApiError(response: Response, fallback: string) {
  try {
    const error = await response.json();
    const message = error.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  } catch {
    // Use the operation-specific fallback when the response is not JSON.
  }

  return fallback;
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Registration failed'));
  }

  return parseJsonResponse(response, 'Registration failed: invalid server response');
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Login failed'));
  }

  return parseJsonResponse(response, 'Login failed: invalid server response');
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return parseJsonResponse(response, 'Logout failed: invalid server response');
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await parseJsonResponse(response, 'Failed to parse user data');
  } catch {
    return null;
  }
}

export async function getPosts() {
  const response = await fetch(`${API_URL}/posts`);

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return parseJsonResponse(response, 'Failed to fetch posts: invalid server response');
}

export async function createPost(post: {
  title: string;
  anons: string;
  full_text: string;
  image_url?: string;
  image_path?: string;
}) {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Failed to create post'));
  }

  return parseJsonResponse(response, 'Failed to create post: invalid server response');
}

export async function getPostById(postId: string) {
  const response = await fetch(`${API_URL}/posts/${postId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  return parseJsonResponse(response, 'Failed to fetch post: invalid server response');
}

export async function getMyPosts() {
  const response = await fetch(`${API_URL}/posts/mine`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Failed to fetch your posts'));
  }

  return parseJsonResponse(response, 'Failed to fetch your posts: invalid server response');
}

export async function deletePost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Failed to delete post'));
  }

  return parseJsonResponse(response, 'Failed to delete post: invalid server response');
}