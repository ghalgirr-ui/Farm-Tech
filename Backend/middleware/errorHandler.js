const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

const errorHandler = (error, req, res, next) => {
  console.error("Unhandled server error:", error.message);

  const statusCode =
    error.statusCode ||
    (error.name === "ValidationError" || error.name === "CastError" ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong on the server."
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
