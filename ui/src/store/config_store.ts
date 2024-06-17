import axios, { AxiosInstance } from "axios";

export class ConfigStore {
  public get apiBaseUrl(): string {
    return `http://localhost:5001`;
  }

  public get apiClient(): AxiosInstance {
    return axios.create({
      baseURL: this.apiBaseUrl,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
