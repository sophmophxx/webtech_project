import { AppError } from "../utils/AppError.js";

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
