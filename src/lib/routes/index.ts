import type { IGenerator, Response } from "../../types/main";
import { apiClient } from "../api/api";

export async function generateResult(data: IGenerator): Promise<Response> {
  const response = await apiClient.post<Response>("/run", data);
  return response.data;
}
