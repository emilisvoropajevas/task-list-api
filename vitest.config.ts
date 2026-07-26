import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    server: {
      deps: {
        inline: ["graphql"],
      },
    },
  },
  resolve: {
    alias: {
      graphql: "graphql/index.js",
    },
  },
});