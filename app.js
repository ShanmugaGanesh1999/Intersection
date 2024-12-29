const express = require("express");
const swaggerUI = require("swagger-ui-express");

const path = require("path");
require("dotenv").config();
var cors = require("cors");

const swaggerSpec = require("./utilities/swagger");
const uploadRoute = require("./routes/upload-route");
const computeRoute = require("./routes/compute-route");
const downloadRoute = require("./routes/download-route");
const { createAllTablesIfNotExist } = require("./models/database-starter");

const port = process.env.PORT || 8080;

const app = express();

createAllTablesIfNotExist();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cors());

app.use(express.json());

try {
  app.use("/upload", uploadRoute);
  app.use("/compute", computeRoute);
  app.use("/download", downloadRoute);
} catch (error) {
  res.status(400).json({
    message: error.message,
    error: "Error while performing user operations",
  });
}

// Serve Swagger documentation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(express.static("public"));

// app.get(express.static(path.join(__dirname, "../client/build")));

// app.get("/*", (req, res) => {
//   res.sendFile(
//     path.join(__dirname, "../client/build/index.html"),
//     (err) => err ?? res.status(500).send(err)
//   );
// });

app.listen(port, () => {
  console.log(`Intersection server is listening on port ${port} ...`);
});
