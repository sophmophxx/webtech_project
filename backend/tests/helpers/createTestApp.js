export async function createTestApp() {
    process.env.NODE_ENV = "test";
    process.env.CLIENT_URL = "http://localhost:4200";

    process.env.MONGO_URI ??= "mongodb://127.0.0.1:27017/test";

    const { default: app } = await import("../../src/app.js");

    return app;
}
