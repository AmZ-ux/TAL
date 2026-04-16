import axios, { type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken } from "./token-storage";

type AuthCallbacks = {
  onTokensReceived: (accessToken: string, refreshToken: string) => void;
  onUnauthorized: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

let authCallbacks: AuthCallbacks | null = null;
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

export function configureApiAuth(callbacks: AuthCallbacks) {
  authCallbacks = callbacks;
}

function processQueue(error: unknown, token?: string) {
  pendingQueue.forEach((request) => {
    if (error) {
      request.reject(error);
      return;
    }
    request.resolve(token ?? "");
  });
  pendingQueue = [];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      authCallbacks?.onUnauthorized();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available.");
      }

      const refreshResponse = await refreshClient.post<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/refresh", { refreshToken });

      authCallbacks?.onTokensReceived(
        refreshResponse.data.accessToken,
        refreshResponse.data.refreshToken,
      );

      processQueue(null, refreshResponse.data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      authCallbacks?.onUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { api };
