/**
 * Adds an artificial delay to responses so that frontend loading states
 * are visible during local development with mock data.
 *
 * The assignment requires the frontend to "show loading state" on several
 * pages. With mock data (no real DB, no network round-trip), responses
 * are instant and the loading UI never renders. This delay simulates the
 * timing of a real API call so the loading state is visible and testable.
 */

const DELAY_MS = 400;

const simulateDelay = (req, res, next) => {
    setTimeout(next, DELAY_MS);
};

module.exports = simulateDelay;