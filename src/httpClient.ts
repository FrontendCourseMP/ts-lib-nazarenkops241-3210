import type { RequestOptions, HttpResponse } from "./types";

export class HttpClient {
  private baseURL: string;
  private retries: number;

  constructor(baseURL: string, retries = 0) {
    this.baseURL = baseURL;
    this.retries = retries;
  }

  async get<T>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T>(url: string, body: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, body, options);
  }

  async put<T>(url: string, body: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, body, options);
  }

  async patch<T>(url: string, body: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", url, body, options);
  }

  private async request<T>(
    method: string,
    url: string,
    body?: any,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    let attempts = 0;
    const fullUrl = this.baseURL + url;

    while (attempts <= this.retries) {
      try {
        const res = await fetch(fullUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }

        return { data, status: res.status, ok: res.ok };
      } catch (err) {
        attempts++;
        if (attempts > this.retries) throw err;
      }
    }

    throw new Error("Retry limit exceeded");
  }
}
