// httpClient.ts
import type { RequestOptions, HttpResponse } from "./types";

export class HttpClient {
  private baseURL: string;
  private retries: number;

  constructor(baseURL: string, retries = 0) {
    // Валидация количества повторных попыток
    if (retries < 0) {
      throw new Error("Retries cannot be negative");
    }
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

    // Формирование query-параметров для GET
    const queryString = options?.queryParams
      ? "?" + new URLSearchParams(
          Object.entries(options.queryParams).map(([k, v]) => [k, v.toString()])
        ).toString()
      : "";
    const fullUrl = this.baseURL + url + queryString;

    while (attempts <= this.retries) {
      try {
        console.log(`Попытка ${attempts + 1} запроса к ${fullUrl}`);

        const res = await fetch(fullUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: body && method !== "GET" ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();

        // Ошибки 400 и 500 считаем исключением
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
