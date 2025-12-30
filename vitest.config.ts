import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.spec.ts"], // только исходники TS
    exclude: ["dist/**"],                // игнорировать dist
    globals: true,                       // чтобы можно было использовать describe, it, expect без импорта
  },
});