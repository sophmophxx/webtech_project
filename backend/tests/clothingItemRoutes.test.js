import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { createTestApp } from "./helpers/createTestApp.js";

let app;
let mongoServer;

const ITEMS_API = "/api/v1/items";
const OUTFITS_API = "/api/v1/outfits";

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

    it("returns 400 when updating with an invalid item id", async () => {
        const response = await request(app)
            .patch(`${ITEMS_API}/not-a-valid-id`)
            .send({
                name: "Updated Item",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Item-ID");
    });

    it("returns 404 when the item to update does not exist", async () => {
        const missingId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .patch(`${ITEMS_API}/${missingId}`)
            .send({
                name: "Updated Item",
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Item nicht gefunden");
    });

    it("returns 400 when deleting with an invalid item id", async () => {
        const response = await request(app).delete(
            `${ITEMS_API}/not-a-valid-id`
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Ungültige Item-ID");
    });

    it("returns 404 when the item to delete does not exist", async () => {
        const missingId = new mongoose.Types.ObjectId().toString();

        const response = await request(app).delete(`${ITEMS_API}/${missingId}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Item nicht gefunden");
    });

    it("removes a deleted item from outfits with remaining items", async () => {
        const blazerResponse = await request(app).post(ITEMS_API).send({
            name: "Black Blazer",
            category: "outerwear",
        });

        const trousersResponse = await request(app).post(ITEMS_API).send({
            name: "Wide Leg Trousers",
            category: "bottoms",
        });

        const outfitResponse = await request(app)
            .post(OUTFITS_API)
            .send({
                name: "Tailored Look",
                items: [blazerResponse.body._id, trousersResponse.body._id],
            });

        expect(outfitResponse.status).toBe(201);

        const deleteResponse = await request(app).delete(
            `${ITEMS_API}/${blazerResponse.body._id}`
        );

        expect(deleteResponse.status).toBe(200);

        const response = await request(app).get(
            `${OUTFITS_API}/${outfitResponse.body._id}`
        );

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0]._id).toBe(trousersResponse.body._id);
    });

    it("deletes an outfit when its last item is deleted", async () => {
        const itemResponse = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
        });

        const outfitResponse = await request(app)
            .post(OUTFITS_API)
            .send({
                name: "Minimal Look",
                items: [itemResponse.body._id],
            });

        expect(outfitResponse.status).toBe(201);

        const deleteResponse = await request(app).delete(
            `${ITEMS_API}/${itemResponse.body._id}`
        );

        expect(deleteResponse.status).toBe(200);

        const response = await request(app).get(
            `${OUTFITS_API}/${outfitResponse.body._id}`
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Outfit nicht gefunden");
    });
    it("allows requests from the configured frontend origin", async () => {
        const response = await request(app)
            .get("/")
            .set("Origin", "http://localhost:4200");

        expect(response.status).toBe(200);
        expect(response.text).toBe("Backend läuft");

        expect(response.headers["access-control-allow-origin"]).toBe(
            "http://localhost:4200"
        );
    });

    it("blocks requests from an unconfigured origin", async () => {
        const response = await request(app)
            .get("/")
            .set("Origin", "https://not-allowed.example");

        expect(response.status).toBe(500);
        expect(response.body.message).toBe(
            "CORS blocked for origin: https://not-allowed.example"
        );
    });
    it("accepts a relative image path", async () => {
        const response = await request(app).post(ITEMS_API).send({
            name: "Black Dress",
            category: "dresses",
            imageUrl: "/uploads/black-dress.jpg",
        });

        expect(response.status).toBe(201);
        expect(response.body.imageUrl).toBe("/uploads/black-dress.jpg");
    });
});
