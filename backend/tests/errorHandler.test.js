import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Loads the middleware with a mocked environment.
 *
 * A dynamic import is necessary because errorHandler.js imports env
 * when the module is first evaluated.
 */
async function loadMiddleware(nodeEnv = "test") {
    vi.resetModules();

    vi.doMock("../src/config/env.js", () => ({
        env: {
            nodeEnv,
        },
    }));

    const middlewareModule = await import("../src/middleware/errorHandler.js");

    const appErrorModule = await import("../src/utils/AppError.js");

    return {
        ...middlewareModule,
        AppError: appErrorModule.AppError,
    };
}

/**
 * Creates a minimal mocked Express response.
 */
function createResponse() {
    const res = {
        status: vi.fn(),
        json: vi.fn(),
    };

    res.status.mockReturnValue(res);

    return res;
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
});

describe("errorHandler", () => {
    it("returns validation details for a Mongoose ValidationError", async () => {
        const { errorHandler } = await loadMiddleware("test");
        const res = createResponse();

        const error = {
            name: "ValidationError",
            errors: {
                name: {
                    message: "Name ist erforderlich",
                },
                category: {
                    message: "Kategorie ist ungültig",
                },
            },
        };

        errorHandler(error, {}, res, undefined);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Ungültige Daten",
            errors: ["Name ist erforderlich", "Kategorie ist ungültig"],
        });
    });

    it("returns 400 for a Mongoose CastError", async () => {
        const { errorHandler } = await loadMiddleware("test");
        const res = createResponse();

        const error = {
            name: "CastError",
            message: "Cast failed",
        };

        errorHandler(error, {}, res, undefined);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Ungültige ID",
        });
    });

    it("returns 409 for a duplicate key error", async () => {
        const { errorHandler } = await loadMiddleware("test");
        const res = createResponse();

        const error = {
            code: 11000,
            message: "Duplicate key",
        };

        errorHandler(error, {}, res, undefined);

        expect(res.status).toHaveBeenCalledWith(409);

        expect(res.json).toHaveBeenCalledWith({
            message: "Ein Eintrag mit diesen Daten existiert bereits",
        });
    });

    it("uses errors attached to a non-Mongoose error", async () => {
        const { errorHandler } = await loadMiddleware("test");
        const res = createResponse();

        const error = {
            statusCode: 400,
            message: "Ungültige Eingabedaten",
            errors: {
                name: ["Name ist erforderlich"],
                items: ["Mindestens ein Item ist erforderlich"],
            },
            isOperational: true,
        };

        errorHandler(error, {}, res, undefined);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: "Ungültige Eingabedaten",
            errors: {
                name: ["Name ist erforderlich"],
                items: ["Mindestens ein Item ist erforderlich"],
            },
        });
    });

    it("includes the stack trace in development", async () => {
        const { errorHandler } = await loadMiddleware("development");

        const res = createResponse();
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const error = new Error("Unexpected development error");

        errorHandler(error, {}, res, undefined);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Unexpected development error",
                stack: expect.any(String),
            })
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it("hides unexpected error messages in production", async () => {
        const { errorHandler } = await loadMiddleware("production");

        const res = createResponse();
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const error = new Error("Sensitive database connection information");

        errorHandler(error, {}, res, undefined);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: "Interner Serverfehler",
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
});

describe("notFoundHandler", () => {
    it("forwards a 404 AppError containing the requested route", async () => {
        const { notFoundHandler, AppError } = await loadMiddleware("test");

        const req = {
            originalUrl: "/api/v1/unknown",
        };

        const next = vi.fn();

        notFoundHandler(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);

        const forwardedError = next.mock.calls[0][0];

        expect(forwardedError).toBeInstanceOf(AppError);
        expect(forwardedError.statusCode).toBe(404);
        expect(forwardedError.message).toBe(
            "Route nicht gefunden: /api/v1/unknown"
        );
    });
});
