"use strict";
const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./router");
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config();
const { router: usersRouter } = require("./users");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");

const PORT = process.env.PORT || 8000;
mongoose.Promise = global.Promise;

var server;

app.use(morgan("common"));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});

app.use(express.static("public"));
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

const jwtAuth = passport.authenticate("jwt", { session: false });

app.use("/api", jwtAuth, router);

// A protected endpoint which needs a valid JWT to access it
app.get("/api/protected", jwtAuth, (req, res) => {
  return res.json({
    data: "rosebud"
  });
});

app.use("*", (req, res) => {
  return res.status(404).json({ message: "Not Found" });
});

function runServer() {
  return mongoose
    .connect(process.env.DATABASE_URL, { useNewUrlParser: true })
    .then(() => {
      console.log("Connected to db");
      server = app.listen(PORT, () =>
        console.log(`App is listening on port ${PORT}`)
      );
    });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    console.log("Disconnected from db");
    console.log("Closing server...");
    server.close();
  });
}

if (require.main === module) {
  runServer();
}

module.exports = { app, runServer, closeServer };
