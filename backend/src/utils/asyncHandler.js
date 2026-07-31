/**
 * Wraps async Express route handlers and forwards rejected promises to next().
 * This avoids repetitive try/catch blocks in every controller.
 *
 * @param {Function} fn - Async Express handler or middleware.
 * @returns {Function} Express middleware that passes async errors to the error handler.
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
