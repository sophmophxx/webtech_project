import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "coverage",
            include: ["src/**/*.js"],
            exclude: ["src/server.js", "src/config/env.js", "src/config/db.js"],
        },
    },
});
