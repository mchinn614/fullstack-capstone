"use strict";
const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./router");

const PORT = process.env.PORT || 8000;

var server;

app.use(morgan("combined"));
app.use(express.static("public"));
app.use("/", router);

function runServer() {
  server = app.listen(PORT, () =>
    console.log(`App is listening on port ${PORT}`)
  );
}

function closeServer() {
  console.log("Closing server...");
  server.close();
}

if (require.main === module) {
  runServer();
}

module.exports = { app, runServer, closeServer };
