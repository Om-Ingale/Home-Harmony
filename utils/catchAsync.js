// utils/catchAsync.js
// Wraps async route handlers to forward errors to Express error handler.
// Eliminates repetitive try/catch blocks in every controller.

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};