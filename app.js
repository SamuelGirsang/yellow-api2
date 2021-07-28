'use strict';

const express = require("express");
const { config } = require("./config");
const ApiDataModel = require("./models/api");
const ApiController = require("./controllers/api");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

ApiDataModel.init();

app.get('/', ApiController.fetch);

app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT} 🚀`)
});
