const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { PORT } = require("./config/env");
const { connectDatabase } = require("./config/db");
const apiRoutes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FARM-TECH backend is running"
  });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`FARM-TECH backend running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
