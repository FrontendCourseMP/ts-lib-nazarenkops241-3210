export interface RequestOptions {
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number>;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}
