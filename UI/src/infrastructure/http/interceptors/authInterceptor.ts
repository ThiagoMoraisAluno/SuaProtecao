import type { AxiosInstance } from "axios";
import { tokenService } from "@/infrastructure/auth/tokenService";

export function applyAuthInterceptor(api: AxiosInstance): void {
  api.interceptors.request.use((config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
