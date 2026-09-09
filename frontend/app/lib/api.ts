const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  return response.json();
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

  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getPosts() {
  const response = await fetch(`${API_URL}/posts`);

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
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

  return response.json();
}

export async function getPostById(postId: string) {
  const response = await fetch(`${API_URL}/posts/${postId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  return response.json();
}

export async function getMyPosts() {
  const response = await fetch(`${API_URL}/posts/mine`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Failed to fetch your posts'));
  }

  return response.json();
}

export async function deletePost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response, 'Failed to delete post'));
  }

  return response.json();
}