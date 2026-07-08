import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT tokens into headers if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Prefix requests correctly by removing duplicate "/api" or formatting relative paths
    if (config.url) {
      let url = config.url;
      if (url.startsWith('/api/')) {
        url = url.substring(4); // Remove "/api" prefix (keep leading slash)
      } else if (url.startsWith('api/')) {
        url = '/' + url.substring(4); // Convert "api/..." to "/..."
      } else if (!url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = '/' + url;
      }
      config.url = url;
    }

    // Log final URL
    console.log(
      'API Request:',
      `${api.defaults.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 1. Handle 401 Unauthorized / Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRequest = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh');
      if (!isAuthRequest) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('Unauthorized: Session expired.'));
        }

        try {
          const refreshUrl = `${import.meta.env.VITE_API_URL}/auth/refresh`;
          const res = await axios.post(refreshUrl, { refreshToken });
          if (res.data.status === 'success') {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            isRefreshing = false;
            return api(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('Unauthorized: Session expired.'));
        }
      }
    }

    // 2. Handle Network errors / 404 / 5xx errors
    if (!error.response) {
      console.error('[API Error] Network error / Server unreachable:', error.message);
      return Promise.reject(new Error('Network Error: Please check your connection.'));
    }

    const { status } = error.response;
    if (status === 404) {
      console.error('[API Error] 404 Not Found:', originalRequest.url);
      return Promise.reject(new Error('Resource not found (404).'));
    }

    if (status >= 500) {
      console.error(`[API Error] ${status} Server Error:`, error.response.data);
      return Promise.reject(new Error('Backend Unavailable (500). Please try again later.'));
    }

    return Promise.reject(error);
  }
);

export default api;
