const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

let accessToken: string | null = null;

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(', ')
          : 'Request failed';
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && retryOnUnauthorized && !path.includes('/auth/')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
  }

  return parseJson<T>(response);
}

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    },
    false,
  );

  setAccessToken(data.accessToken);
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );

  setAccessToken(data.accessToken);
  return data;
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      setAccessToken(null);
      return false;
    }

    const data = (await response.json()) as AuthResponse;
    setAccessToken(data.accessToken);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

export async function restoreSession(): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      setAccessToken(null);
      return null;
    }

    const data = (await response.json()) as AuthResponse;
    setAccessToken(data.accessToken);
    return data.user;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export interface MessageAuthor {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  content: string;
  tag: string;
  authorId: string;
  author: MessageAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesListResponse {
  items: Message[];
  nextCursor: string | null;
}

export interface FetchMessagesParams {
  tag?: string;
  userId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export async function fetchMessages(
  params: FetchMessagesParams = {},
): Promise<MessagesListResponse> {
  const searchParams = new URLSearchParams();

  if (params.tag) {
    searchParams.set('tag', params.tag);
  }

  if (params.userId) {
    searchParams.set('userId', params.userId);
  }

  if (params.from) {
    searchParams.set('from', params.from);
  }

  if (params.to) {
    searchParams.set('to', params.to);
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();

  return apiFetch<MessagesListResponse>(
    `/messages${query ? `?${query}` : ''}`,
  );
}

export interface UpdateMessagePayload {
  content?: string;
  tag?: string;
}

export async function updateMessage(
  id: string,
  payload: UpdateMessagePayload,
): Promise<Message> {
  return apiFetch<Message>(`/messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  await apiFetch<void>(`/messages/${id}`, {
    method: 'DELETE',
  });
}
