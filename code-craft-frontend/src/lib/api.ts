'use client';

import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL, API_ENDPOINTS, ERROR_CODES, STORAGE_KEYS } from './constants';

// Store CSRF token in memory
let csrfToken: string | null = null;

/**
 * Clear CSRF token from memory
 */
const clearCsrfToken = () => {
  csrfToken = null;
};

/**
 * Get CSRF token from memory or fetch it
 */
const getCsrfToken = async (): Promise<string | null> => {
  if (csrfToken) {
    return csrfToken;
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CSRF_TOKEN}`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    console.log('CSRF token fetched and stored');
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

/**
 * Create a configured Axios instance for API calls
 */
const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
    withCredentials: true, // Important: Include cookies in requests
  });

  // Request interceptor for logging and CSRF token
  api.interceptors.request.use(
    async (config) => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      
      // Add CSRF token to headers for state-changing requests
      if (!['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase() || '')) {
        // Skip CSRF for the CSRF token endpoint itself
        if (!config.url?.includes('/csrf-token')) {
          const token = await getCsrfToken();
          if (token) {
            config.headers['x-csrf-token'] = token;
            console.log('CSRF token added to request headers');
          } else {
            console.warn('No CSRF token available for request');
          }
        }
      }
      
      // Add Authorization header if token exists in localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response) {
        // Rate limiting
        if (error.response.status === ERROR_CODES.RATE_LIMITED) {
          toast.error('Rate limit exceeded. Please try again later.');
        }
        
        // Authentication errors
        if (error.response.status === ERROR_CODES.UNAUTHORIZED) {
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        // CSRF errors - clear token and retry might be needed
        if (error.response.status === 403 && error.response.data?.error?.message?.includes('CSRF')) {
          clearCsrfToken();
          console.warn('CSRF token error, cleared token for retry');
        }
        
        // Server errors
        if (error.response.status >= 500) {
          toast.error('Server error. Please try again later.');
        }
      } else if (error.request) {
        // Network errors
        toast.error('Network error. Please check your connection.');
      }
      
      return Promise.reject(error);
    }
  );

  return api;
};

// Create a singleton instance lazily to avoid SSR issues
let apiClientInstance: AxiosInstance | null = null;

export const apiClient: AxiosInstance = new Proxy({} as AxiosInstance, {
  get(target, prop, receiver) {
    if (!apiClientInstance) {
      apiClientInstance = createApiClient();
    }
    return Reflect.get(apiClientInstance, prop, receiver);
  },
});

/**
 * Auth API functions
 */
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token, user } = response.data;
    // Store token in localStorage for tests
    if (token) {
      localStorage.setItem('token', token);
    }
    return { token, user };
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { name, email, password });
    const { token, user } = response.data;
    // Store token in localStorage for tests
    if (token) {
      localStorage.setItem('token', token);
    }
    return { token, user };
  },
  
  logout: async () => {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    // Clear CSRF token
    clearCsrfToken();
    // Server will clear the httpOnly cookie
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
  
  getMe: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};

/**
 * User API functions
 */
export const userApi = {
  updateProfile: async (userData: { name?: string; bio?: string }) => {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE, userData);
    return response.data;
  },
};

/**
 * Snippet API functions
 */
export const snippetApi = {
  getSnippets: async (params?: { page?: number; limit?: number; language?: string; search?: string }) => {
    const response = await apiClient.get(API_ENDPOINTS.SNIPPETS.BASE, { params });
    return response.data;
  },
  
  getSnippet: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.SNIPPETS.SINGLE(id));
    return response.data;
  },
  
  createSnippet: async (data: { title: string; language: string; code: string; description?: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.SNIPPETS.BASE, data);
    return response.data;
  },
  
  updateSnippet: async (id: string, data: { title?: string; language?: string; code?: string; description?: string }) => {
    const response = await apiClient.put(API_ENDPOINTS.SNIPPETS.SINGLE(id), data);
    return response.data;
  },
  
  deleteSnippet: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.SNIPPETS.SINGLE(id));
    return response.data;
  },
  
  getStarredSnippets: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(API_ENDPOINTS.SNIPPETS.STARRED, { params });
    return response.data;
  },
};

/**
 * Comment API functions
 */
export const commentApi = {
  getSnippetComments: async (snippetId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(API_ENDPOINTS.COMMENTS.FOR_SNIPPET(snippetId), { params });
    return response.data;
  },
  
  createComment: async (snippetId: string, content: string) => {
    const response = await apiClient.post(API_ENDPOINTS.COMMENTS.FOR_SNIPPET(snippetId), { content });
    return response.data;
  },
  
  updateComment: async (commentId: string, content: string) => {
    const response = await apiClient.put(API_ENDPOINTS.COMMENTS.SINGLE(commentId), { content });
    return response.data;
  },
  
  deleteComment: async (commentId: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.COMMENTS.SINGLE(commentId));
    return response.data;
  },
  
  getMyComments: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(API_ENDPOINTS.COMMENTS.MY_COMMENTS, { params });
    return response.data;
  },
};

/**
 * Star API functions
 */
export const starApi = {
  toggleStar: async (snippetId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.STARS.TOGGLE(snippetId));
    return response.data;
  },
  
  getStarCount: async (snippetId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.STARS.COUNT(snippetId));
    return response.data;
  },
  
  checkIfStarred: async (snippetId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.STARS.CHECK(snippetId));
    return response.data;
  },
  
  getStarList: async (snippetId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.STARS.LIST(snippetId));
    return response.data;
  },
  
  getStarStats: async (snippetId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.STARS.STATS(snippetId));
    return response.data;
  },
};

/**
 * Execution API functions
 */
export const executionApi = {
  executeCode: async (language: string, code: string, input?: string) => {
    const response = await apiClient.post(API_ENDPOINTS.EXECUTIONS.BASE, { language, code, input });
    return response.data;
  },
  
  getLanguages: async () => {
    const response = await apiClient.get(API_ENDPOINTS.EXECUTIONS.LANGUAGES);
    return response.data;
  },
  
  getExecutions: async (params?: { page?: number; limit?: number; language?: string }) => {
    const response = await apiClient.get(API_ENDPOINTS.EXECUTIONS.BASE, { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.EXECUTIONS.STATS);
    return response.data;
  },
}; 