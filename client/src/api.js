import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(request, attempts = 3) {
  let lastError;
  for (let tryNumber = 1; tryNumber <= attempts; tryNumber += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (tryNumber < attempts) {
        await sleep(400 * tryNumber);
      }
    }
  }
  throw lastError;
}

export const login = (email, password) => api.post('/auth/login', { email, password });

export const fetchCampaigns = () => withRetry(() => api.get('/campaigns'));

export const addCampaign = (campaign) => api.post('/campaigns', campaign);

export const updateCampaign = (id, campaign) => api.put(`/campaigns/${id}`, campaign);

export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`);

export function getErrorMessage(error) {
  return error?.response?.data?.error || error?.message || 'Ошибка запроса';
}
