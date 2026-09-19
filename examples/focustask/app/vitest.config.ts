import { defineConfig } from "vitest/config";
import fs from "node:fs";
const env = JSON.parse(
  fs.readFileSync(new URL("./.runtime/test.json", import.meta.url), "utf8"),
);
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    env,
  },
});
