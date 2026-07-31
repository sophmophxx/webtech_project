/**
 * Custom error class for expected application errors.
 * Used to attach an HTTP status code and mark the error as operational.
 */
export class AppError extends Error {
    /**
     * Creates an application error that can be handled by the central error handler.
     *
     * @param {string} message - Error message returned to the client.
     * @param {number} [statusCode=500] - HTTP status code for the response.
     */
    constructor(message, statusCode = 500) {
        super(message);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace?.(this, this.constructor);
    }
}
