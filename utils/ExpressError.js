// utils/ExpressError.js
// Custom error class that extends the native Error object.
// Carries an HTTP statusCode so the global error handler can respond correctly.

class ExpressError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;