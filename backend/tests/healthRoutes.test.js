import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp } from "./helpers/createTestApp.js";

let app;

beforeAll(async () => {
    app = await createTestApp();
});

describe("Health API", () => {
    it("returns health status", async () => {
        const response = await request(app).get("/api/v1/health");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
        expect(response.body.environment).toBe("test");
        expect(response.body.uptime).toEqual(expect.any(Number));
        expect(response.body.timestamp).toBeDefined();
    });
});
