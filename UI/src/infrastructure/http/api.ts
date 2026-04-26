import axios from "axios";
import { applyAuthInterceptor } from "./interceptors/authInterceptor";
import { applyRefreshInterceptor } from "./interceptors/refreshInterceptor";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

applyAuthInterceptor(api);
applyRefreshInterceptor(api);

export default api;
