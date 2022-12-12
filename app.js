const express = require("express");
const app = express();
const {
  models: { User, Note },
} = require("./db");
const path = require("path");
const { user } = require("pg/lib/defaults");
require("dotenv").config();

// middleware
app.use(express.json());

const requireToken = async (req, res, next) => {
  if (req.headers.authorization) {
    req.user = await User.byToken(req.headers.authorization);
    next();
  }
};

// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    // console.log("req.body", req.body);
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/notes", requireToken, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { include: Note });
    const loginUser = req.user;
    if (Number(req.params.id) === loginUser.id) res.send(user.notes);
  } catch (ex) {
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
