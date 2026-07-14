import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

function handleMongooseError(error) {
    if (error.name === "ValidationError") {
        return {
            statusCode: 400,
            message: "Ungültige Daten",
            errors: Object.values(error.errors).map((err) => err.message),
        };
    }

    if (error.name === "CastError") {
        return {
            statusCode: 400,
            message: "Ungültige ID",
        };
    }

    if (error.code === 11000) {
        return {
            statusCode: 409,
            message: "Ein Eintrag mit diesen Daten existiert bereits",
        };
    }
    return null;
}

export function notFoundHandler(req, res, next) {
    next(new AppError(`Route nicht gefunden: ${req.originalUrl}`, 404));
}

export function errorHandler(error, req, res, _next) {
    const mongooseError = handleMongooseError(error);

    const statusCode = mongooseError?.statusCode || error.statusCode || 500;

    const isOperational =
        error instanceof AppError ||
        error.isOperational === true ||
        Boolean(mongooseError);

    const message =
        mongooseError?.message ||
        (env.nodeEnv === "production" && !isOperational
            ? "Interner Serverfehler"
            : error.message || "Interner Serverfehler");

    const response = {
        message,
    };

    if (mongooseError?.errors) {
        response.errors = mongooseError.errors;
    } else if (error.errors) {
        response.errors = error.errors;
    }

    if (env.nodeEnv !== "production" && env.nodeEnv !== "test") {
        response.stack = error.stack;
    }

    if (env.nodeEnv !== "test" && !isOperational) {
        console.error(error);
    }

    res.status(statusCode).json(response);
}
