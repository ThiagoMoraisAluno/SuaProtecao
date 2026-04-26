import axios, { type AxiosInstance } from "axios";
import { tokenService } from "@/infrastructure/auth/tokenService";
import { handleAuthFailure } from "./errorInterceptor";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  for (const prom of failedQueue) {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  }
  failedQueue = [];
}

export function applyRefreshInterceptor(api: AxiosInstance): void {
  api.interceptors.response.use(
    (response) => {
      // Desempacota envelope { data, statusCode } retornado pela API
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        "statusCode" in response.data
      ) {
        response.data = response.data.data;
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        handleAuthFailure();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );
        const newToken = data.data.accessToken;
        tokenService.setAccessToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}
