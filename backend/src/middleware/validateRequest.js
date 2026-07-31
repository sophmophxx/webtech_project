import { AppError } from "../utils/AppError.js";

/**
 * Creates an Express middleware that validates the request body against a Zod schema.
 * If validation fails, a 400 AppError with field-specific errors is forwarded.
 * If validation succeeds, the parsed data replaces req.body.
 *
 * @param {import("zod").ZodTypeAny} schema - Zod schema used to validate the request body.
 * @returns {Function} Express middleware for request validation.
 */
export function validateRequest(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const error = new AppError("Ungültige Eingabedaten", 400);
            error.errors = result.error.flatten().fieldErrors;

            return next(error);
        }

        req.body = result.data;
        next();
    };
}
