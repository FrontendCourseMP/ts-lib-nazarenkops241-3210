// httpClient.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpClient } from "../httpClient.js";
import type { RequestOptions } from "./types";

describe("HttpClient", () => {
  let client: HttpClient;

  beforeEach(() => {
    // Создаём клиент с 2 повторными попытками
    client = new HttpClient("https://example.com", 2);
    // Подменяем глобальный fetch
    vi.stubGlobal("fetch", vi.fn());
  });

  it("должен выбрасывать ошибку при отрицательных retries", () => {
    expect(() => new HttpClient("https://example.com", -1)).toThrow("Retries cannot be negative");
  });

  it("GET формирует правильный URL с queryParams", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const options: RequestOptions = { queryParams: { a: 1, b: 2 } };
    const res = await client.get("/test", options);

    expect(res.data).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/test?a=1&b=2",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("POST отправляет тело запроса и возвращает ответ", async () => {
    const responseData = { id: 1 };
    (fetch as any).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => responseData,
    });

    const body = { name: "John" };
    const res = await client.post("/users", body);

    expect(res.data).toEqual(responseData);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
  });

  it("PUT и PATCH работают корректно", async () => {
    const putData = { id: 1 };
    const patchData = { id: 1, name: "Updated" };

    (fetch as any)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => putData })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => patchData });

    const putRes = await client.put("/users/1", putData);
    const patchRes = await client.patch("/users/1", { name: "Updated" });

    expect(putRes.data).toEqual(putData);
    expect(patchRes.data).toEqual(patchData);
  });

  it("ошибки 400 и 500 выбрасывают исключение", async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(client.get("/fail")).rejects.toThrow("HTTP Error: 500");
  });

  it("повторные попытки работают при ошибках", async () => {
    const mock = fetch as unknown as vi.Mock;
    mock
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"))
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });

    const res = await client.get("/retry");
    expect(res.data).toEqual({ ok: true });
    expect(mock).toHaveBeenCalledTimes(3);
  });

  it("выбрасывает ошибку при превышении retries", async () => {
    const mock = fetch as unknown as vi.Mock;
    mock.mockRejectedValue(new Error("Fail"));

    await expect(client.get("/failAll")).rejects.toThrow("Fail");
    expect(mock).toHaveBeenCalledTimes(3); // retries = 2 + 1 initial
  });
});
