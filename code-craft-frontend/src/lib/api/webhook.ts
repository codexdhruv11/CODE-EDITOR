import { apiClient } from '../api';
import { API_ENDPOINTS } from '../constants';

/**
 * Webhook API functions
 */
export const webhookApi = {
  /**
   * Check webhook health status
   */
  checkHealth: async () => {
    const response = await apiClient.get(API_ENDPOINTS.WEBHOOKS.HEALTH);
    return response.data;
  },
};
