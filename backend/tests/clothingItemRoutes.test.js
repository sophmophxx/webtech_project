import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createTestApp } from "./helpers/createTestApp.js";

let app;
let mongoServer;

const ITEMS_API = "/api/v1/items";

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.CLIENT_URL = "http://localhost:4200";

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    process.env.MONGO_URI = mongoUri;

    await mongoose.connect(mongoUri);

    app = await createTestApp();
});

afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Clothing item API", () => {
    it("returns the health/root route", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.text).toBe("Backend läuft");
    });

    it("returns 404 for unknown routes", async () => {
        const response = await request(app).get("/does-not-exist");

        expect(response.status).toBe(404);
        expect(response.body.message).toContain("Route nicht gefunden");
    });

    it("creates a clothing item", async () => {
        const payload = {
            name: "Black Dress",
            category: "dresses",
            brand: "Rick Owens",
            color: "black",
            size: "S",
            favorite: true,
        };

        const response = await request(app).post(ITEMS_API).send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe(payload.name);
        expect(response.body.category).toBe(payload.category);
        expect(response.body.favorite).toBe(true);
    });

    it("returns all clothing items", async () => {
        await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
        });

        await request(app).post(ITEMS_API).send({
            name: "Silver Bag",
            category: "bags",
        });

        const response = await request(app).get(ITEMS_API);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body.map((item) => item.name)).toContain("Black Dress");
        expect(response.body.map((item) => item.name)).toContain("Silver Bag");
    });

    it("returns one clothing item by id", async () => {
        const createResponse = await request(app).post(ITEMS_API).send({
            name: "Black Boots",
            category: "shoes",
        });

        const itemId = createResponse.body._id;

        const response = await request(app).get(`${ITEMS_API}/${itemId}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(itemId);
        expect(response.body.name).toBe("Black Boots");
    });

    it("updates a clothing item", async () => {
        const createResponse = await request(app).post(ITEMS_API).send({
            name: "Old Dress",
            category: "dresses",
            color: "black",
        });

        const itemId = createResponse.body._id;

        const response = await request(app)
            .patch(`${ITEMS_API}/${itemId}`)
            .send({
                name: "Updated Dress",
                category: "dresses",
                color: "red",
            });

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(itemId);
        expect(response.body.name).toBe("Updated Dress");
        expect(response.body.color).toBe("red");
    });

    it("deletes a clothing item", async () => {
        const createResponse = await request(app).post(ITEMS_API).send({
            name: "Delete Me",
            category: "other",
        });

        const itemId = createResponse.body._id;

        const deleteResponse = await request(app).delete(
            `${ITEMS_API}/${itemId}`
        );

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe("Item gelöscht");

        const getResponse = await request(app).get(`${ITEMS_API}/${itemId}`);

        expect(getResponse.status).toBe(404);
    });

    it("returns 400 for an invalid item id", async () => {
        const response = await request(app).get(`${ITEMS_API}/not-a-valid-id`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Item-ID");
    });

    it("returns 400 when required fields are missing", async () => {
        const response = await request(app).post(ITEMS_API).send({
            category: "dresses",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBeDefined();
    });

    it("returns 400 when name is missing", async () => {
        const response = await request(app).post(ITEMS_API).send({
            category: "dresses",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Eingabedaten");
        expect(response.body.errors).toHaveProperty("name");
    });

    it("returns 400 when category is missing", async () => {
        const response = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Eingabedaten");
        expect(response.body.errors).toHaveProperty("category");
    });

    it("allows partial update with valid data", async () => {
        const createResponse = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
            color: "black",
        });

        const itemId = createResponse.body._id;

        const response = await request(app)
            .patch(`${ITEMS_API}/${itemId}`)
            .send({
                color: "red",
            });

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(itemId);
        expect(response.body.name).toBe("Black Dress");
        expect(response.body.category).toBe("dresses");
        expect(response.body.color).toBe("red");
    });

    it("returns 400 when category is invalid", async () => {
        const response = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "invalid-category",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Eingabedaten");
        expect(response.body.errors).toHaveProperty("category");
    });

    it("returns 400 when imageUrl is invalid", async () => {
        const response = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
            imageUrl: "not-a-url",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Eingabedaten");
        expect(response.body.errors).toHaveProperty("imageUrl");
    });

    it("returns 400 when patch category is invalid", async () => {
        const createResponse = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
        });

        const itemId = createResponse.body._id;

        const response = await request(app)
            .patch(`${ITEMS_API}/${itemId}`)
            .send({
                category: "wrong-category",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Eingabedaten");
        expect(response.body.errors).toHaveProperty("category");
    });

    it("returns 400 when patch imageUrl is invalid", async () => {
        const createResponse = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
        });

        const itemId = createResponse.body._id;

        const response = await request(app)
            .patch(`${ITEMS_API}/${itemId}`)
            .send({
                imageUrl: "invalid-url",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Eingabedaten");
        expect(response.body.errors).toHaveProperty("imageUrl");
    });
});
