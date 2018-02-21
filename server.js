const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { API_KEY, BASE_URL, EXAMPLE_SEARCH } = require("./config/keys");

const app = express();

app.use(cors());

app.use("/js", express.static(__dirname + "/js"));
app.use(express.static(__dirname + "/views"));
app.set("view engine", "pug");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async ({ body: { term, latitude, longitude } }, res) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${API_KEY}`;

  const { data } = await axios.get(
    `${BASE_URL}?term=${term}&latitude=${latitude}&longitude=${longitude}`
  );

  res.send(data);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
