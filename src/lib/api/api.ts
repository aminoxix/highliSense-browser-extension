import axios, { type AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL as string;

// Create separate instances for each service
export const apiClient = createApiClient(BASE_URL);

function createApiClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return instance;
}
