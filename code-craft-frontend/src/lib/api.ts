'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL, API_ENDPOINTS, ERROR_CODES, STORAGE_KEYS } from './constants';

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
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // Add token to headers if it exists
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
          // Clear token and redirect to login if not already there
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
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

// Create a singleton instance
export const apiClient = createApiClient();

/**
 * Auth API functions
 */
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token, user } = response.data;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return { token, user };
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return { token, user };
  },
  
  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
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
};

/**
 * Star API functions
 */
export const starApi = {
  toggleStar: async (snippetId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.STARS.TOGGLE(snippetId));
    return response.data;
  },
};

/**
 * Execution API functions
 */
export const executionApi = {
  executeCode: async (language: string, code: string) => {
    const response = await apiClient.post(API_ENDPOINTS.EXECUTIONS.BASE, { language, code });
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