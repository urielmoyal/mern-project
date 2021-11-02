const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const placesRoute = require("./routes/places");
const userRoute = require("./routes/users");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use("/api/places", placesRoute);

app.use("/api/users", userRoute);

//Execute only if all routes do not match the URL
app.use((req, res) => {
  const err = new HttpError("Route not found", 404);
  throw err;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknow error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2vyho.mongodb.net/${process.env.COLLECTION_NAME}?retryWrites=true&w=majority`
  )
  .then(app.listen(5000))
  .catch((err) => {
    console.log(err, process.env);
  });
