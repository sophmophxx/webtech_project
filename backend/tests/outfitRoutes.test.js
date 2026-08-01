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

/**
 * Creates a valid clothing item that can be referenced by an outfit.
 */
async function createClothingItem(overrides = {}) {
    const response = await request(app)
        .post(ITEMS_API)
        .send({
            name: "Black Blazer",
            category: "outerwear",
            ...overrides,
        });

    expect(response.status).toBe(201);

    return response.body;
}

/**
 * Creates a valid outfit for tests that require an existing outfit.
 */
async function createOutfit(itemIds, overrides = {}) {
    const response = await request(app)
        .post(OUTFITS_API)
        .send({
            name: "Gallery Evening",
            items: itemIds,
            ...overrides,
        });

    expect(response.status).toBe(201);

    return response.body;
}

describe("Outfit API", () => {
    describe("GET /api/v1/outfits", () => {
        it("returns an empty array when no outfits exist", async () => {
            const response = await request(app).get(OUTFITS_API);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("returns all outfits with populated clothing items", async () => {
            const blazer = await createClothingItem();
            const trousers = await createClothingItem({
                name: "Wide Leg Trousers",
                category: "bottoms",
            });

            await createOutfit([blazer._id], {
                name: "Minimal Look",
            });

            await createOutfit([blazer._id, trousers._id], {
                name: "Tailored Look",
            });

            const response = await request(app).get(OUTFITS_API);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);

            const outfitNames = response.body.map((outfit) => outfit.name);

            expect(outfitNames).toContain("Minimal Look");
            expect(outfitNames).toContain("Tailored Look");

            for (const outfit of response.body) {
                expect(outfit.items.length).toBeGreaterThan(0);
                expect(outfit.items[0]).toHaveProperty("_id");
                expect(outfit.items[0]).toHaveProperty("name");
                expect(outfit.items[0]).toHaveProperty("category");
            }
        });
    });

    describe("GET /api/v1/outfits/:id", () => {
        it("returns one outfit with populated clothing items", async () => {
            const blazer = await createClothingItem({
                brand: "ARKET",
                color: "black",
                size: "S",
            });

            const outfit = await createOutfit([blazer._id], {
                name: "Evening Look",
                notes: "Black tailoring.",
                favorite: true,
            });

            const response = await request(app).get(
                `${OUTFITS_API}/${outfit._id}`
            );

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(outfit._id);
            expect(response.body.name).toBe("Evening Look");
            expect(response.body.notes).toBe("Black tailoring.");
            expect(response.body.favorite).toBe(true);

            expect(response.body.items).toHaveLength(1);
            expect(response.body.items[0]._id).toBe(blazer._id);
            expect(response.body.items[0].name).toBe("Black Blazer");
            expect(response.body.items[0].brand).toBe("ARKET");
        });

        it("returns 400 for an invalid outfit id", async () => {
            const response = await request(app).get(
                `${OUTFITS_API}/not-a-valid-id`
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Ungültige Outfit-ID");
        });

        it("returns 404 when the outfit does not exist", async () => {
            const missingId = new mongoose.Types.ObjectId().toString();

            const response = await request(app).get(
                `${OUTFITS_API}/${missingId}`
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Outfit nicht gefunden");
        });
    });

    describe("POST /api/v1/outfits", () => {
        it("creates an outfit with populated clothing items", async () => {
            const blazer = await createClothingItem({
                imageUrl: "https://example.com/blazer.jpg",
            });

            const trousers = await createClothingItem({
                name: "Wide Leg Trousers",
                category: "bottoms",
            });

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "  Gallery Evening  ",
                    notes: "  Black tailoring with silver accessories.  ",
                    items: [blazer._id, trousers._id],
                    favorite: true,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("_id");

            expect(response.body.name).toBe("Gallery Evening");
            expect(response.body.notes).toBe(
                "Black tailoring with silver accessories."
            );

            expect(response.body.favorite).toBe(true);
            expect(response.body.items).toHaveLength(2);

            expect(response.body.items[0]).toHaveProperty("name");
            expect(response.body.items[1]).toHaveProperty("name");

            expect(response.body).toHaveProperty("createdAt");
            expect(response.body).toHaveProperty("updatedAt");
            expect(response.body).not.toHaveProperty("__v");
        });

        it("uses false as the default favorite value", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "Minimal Look",
                    items: [blazer._id],
                });

            expect(response.status).toBe(201);
            expect(response.body.favorite).toBe(false);
            expect(response.body).not.toHaveProperty("notes");
        });

        it("returns 400 when the name is missing", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    items: [blazer._id],
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Ungültige Eingabedaten");

            expect(response.body.errors).toHaveProperty("name");
        });

        it("returns 400 when the name is empty", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "   ",
                    items: [blazer._id],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("name");
        });

        it("returns 400 when the name exceeds 100 characters", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "a".repeat(101),
                    items: [blazer._id],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("name");
        });

        it("returns 400 when notes exceed 500 characters", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "Gallery Evening",
                    notes: "a".repeat(501),
                    items: [blazer._id],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("notes");
        });

        it("returns 400 when items are missing", async () => {
            const response = await request(app).post(OUTFITS_API).send({
                name: "Gallery Evening",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Ungültige Eingabedaten");

            expect(response.body.errors).toHaveProperty("items");
        });

        it("returns 400 when the items array is empty", async () => {
            const response = await request(app).post(OUTFITS_API).send({
                name: "Gallery Evening",
                items: [],
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("items");

            expect(response.body.errors.items).toContain(
                "Mindestens ein Kleidungsstück muss ausgewählt werden"
            );
        });

        it("returns 400 when an item id is invalid", async () => {
            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "Gallery Evening",
                    items: ["not-a-valid-id"],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("items");
            expect(response.body.errors.items).toContain("Ungültige Item-ID");
        });

        it("returns 400 when an item is selected more than once", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "Gallery Evening",
                    items: [blazer._id, blazer._id],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("items");

            expect(response.body.errors.items).toContain(
                "Ein Kleidungsstück darf nur einmal ausgewählt werden"
            );
        });

        it("returns 400 when a referenced item does not exist", async () => {
            const missingItemId = new mongoose.Types.ObjectId().toString();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "Gallery Evening",
                    items: [missingItemId],
                });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe(
                "Ein oder mehrere Kleidungsstücke wurden nicht gefunden"
            );
        });

        it("returns 400 when favorite is not a boolean", async () => {
            const blazer = await createClothingItem();

            const response = await request(app)
                .post(OUTFITS_API)
                .send({
                    name: "Gallery Evening",
                    items: [blazer._id],
                    favorite: "yes",
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("favorite");
        });
    });

    describe("PATCH /api/v1/outfits/:id", () => {
        it("partially updates an outfit without changing its items", async () => {
            const blazer = await createClothingItem();

            const outfit = await createOutfit([blazer._id], {
                name: "Old Outfit Name",
                notes: "Old notes",
            });

            const response = await request(app)
                .patch(`${OUTFITS_API}/${outfit._id}`)
                .send({
                    name: "  Updated Outfit  ",
                    favorite: true,
                });

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(outfit._id);
            expect(response.body.name).toBe("Updated Outfit");
            expect(response.body.notes).toBe("Old notes");
            expect(response.body.favorite).toBe(true);

            expect(response.body.items).toHaveLength(1);
            expect(response.body.items[0]._id).toBe(blazer._id);
            expect(response.body.items[0].name).toBe("Black Blazer");
        });

        it("updates the selected clothing items", async () => {
            const blazer = await createClothingItem();

            const trousers = await createClothingItem({
                name: "Wide Leg Trousers",
                category: "bottoms",
            });

            const outfit = await createOutfit([blazer._id]);

            const response = await request(app)
                .patch(`${OUTFITS_API}/${outfit._id}`)
                .send({
                    items: [blazer._id, trousers._id],
                });

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);

            expect(response.body.items.map((item) => item._id)).toEqual(
                expect.arrayContaining([blazer._id, trousers._id])
            );
        });

        it("returns 400 when no update field is provided", async () => {
            const blazer = await createClothingItem();
            const outfit = await createOutfit([blazer._id]);

            const response = await request(app)
                .patch(`${OUTFITS_API}/${outfit._id}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Ungültige Eingabedaten");
        });

        it("returns 400 when the updated items array is empty", async () => {
            const blazer = await createClothingItem();
            const outfit = await createOutfit([blazer._id]);

            const response = await request(app)
                .patch(`${OUTFITS_API}/${outfit._id}`)
                .send({
                    items: [],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("items");
        });

        it("returns 400 when updated items contain duplicates", async () => {
            const blazer = await createClothingItem();
            const outfit = await createOutfit([blazer._id]);

            const response = await request(app)
                .patch(`${OUTFITS_API}/${outfit._id}`)
                .send({
                    items: [blazer._id, blazer._id],
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveProperty("items");

            expect(response.body.errors.items).toContain(
                "Ein Kleidungsstück darf nur einmal ausgewählt werden"
            );
        });

        it("returns 400 when an updated referenced item does not exist", async () => {
            const blazer = await createClothingItem();
            const outfit = await createOutfit([blazer._id]);

            const missingItemId = new mongoose.Types.ObjectId().toString();

            const response = await request(app)
                .patch(`${OUTFITS_API}/${outfit._id}`)
                .send({
                    items: [missingItemId],
                });

            expect(response.status).toBe(400);

            expect(response.body.message).toBe(
                "Ein oder mehrere Kleidungsstücke wurden nicht gefunden"
            );
        });

        it("returns 400 for an invalid outfit id", async () => {
            const response = await request(app)
                .patch(`${OUTFITS_API}/not-a-valid-id`)
                .send({
                    name: "Updated Outfit",
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Ungültige Outfit-ID");
        });

        it("returns 404 when the outfit to update does not exist", async () => {
            const missingId = new mongoose.Types.ObjectId().toString();

            const response = await request(app)
                .patch(`${OUTFITS_API}/${missingId}`)
                .send({
                    name: "Updated Outfit",
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Outfit nicht gefunden");
        });
    });

    describe("DELETE /api/v1/outfits/:id", () => {
        it("deletes an existing outfit", async () => {
            const blazer = await createClothingItem();
            const outfit = await createOutfit([blazer._id]);

            const deleteResponse = await request(app).delete(
                `${OUTFITS_API}/${outfit._id}`
            );

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.message).toBe("Outfit gelöscht");

            const getResponse = await request(app).get(
                `${OUTFITS_API}/${outfit._id}`
            );

            expect(getResponse.status).toBe(404);
            expect(getResponse.body.message).toBe("Outfit nicht gefunden");
        });

        it("returns 400 for an invalid outfit id", async () => {
            const response = await request(app).delete(
                `${OUTFITS_API}/not-a-valid-id`
            );

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Ungültige Outfit-ID");
        });

        it("returns 404 when the outfit to delete does not exist", async () => {
            const missingId = new mongoose.Types.ObjectId().toString();

            const response = await request(app).delete(
                `${OUTFITS_API}/${missingId}`
            );

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Outfit nicht gefunden");
        });
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
