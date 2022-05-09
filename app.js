require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
const logger = require("./middleware/logger");

//Loads the handlebars module
const { engine, ExpressHandlebars } = require("express-handlebars");

//Enable body and query params parsing
app.use(express.urlencoded({ extended: true }));

//Setup express session
app.use(
  session({
    name: "AuthCookie",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

//Bind logging middleware before routes mount
app.use(logger);

//Sets our app to use the handlebars engine
app.use(express.static(path.join(__dirname, "/public/")));
app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "hbs");

const data = require('./data');
const usersData = data.users;
const validation = require('./validations');
const conversationsData = data.conversations;

//Routes
app.get("/private", (req, res) => {
  if (!req.session.isAuthenticated) {
    res.redirect("/login");
  } else {
    res.render("private", { layout: "index", user: req.session.email });
  }
});

//Logout
app.get("/logout", (req, res) => {
  req.session.isAuthenticated = false;
  req.session.email = "";
  res.redirect("/landing");
});

//Login page route
app.get("/login", (req, res) => {
  res.render("login", {
    layout: "index",
  });
});

//Create listings page route
app.get("/listings/create", (req, res) => {
  res.render("createListings", {
    layout: "index",
  });
});

//Create listings page route
app.get("/profile/:id/listings", (req, res) => {
  res.render("userListings", {
    layout: "index",
  });
});

//Create listings page route
app.get("/listings/saved", (req, res) => {
  res.render("savedListings", {
    layout: "index",
  });
});

//Create listings page route
app.get("/profile/create", (req, res) => {
  res.render("createProfile", { layout: "index" });
});

app.post('/profile/create', async (req, res) => {
  const body = req.body;
  const user = await usersData.getUserByEmail(req.session.email);
  const updatedUser = await usersData.updateUserByID(user._id, body.first, body.last);
  res.redirect('/profile');
});

//Home page route
app.get("/profile", async (req, res) => {
  const user = await usersData.getUserByEmail(req.session.email);
  res.render("profile", { layout: "index", user: user });
});

//Home page route
app.get("/profile/:id", (req, res) => {
  res.render("profile", { layout: "index" });
});

//Home page route
app.get("/chat", (req, res) => {
  res.render("personalChat", { layout: "index" });
});

//Signup page route
app.get("/signup", (req, res) => {
  res.render("signup", { layout: "index" });
});

//Home page route
app.get("/home", (req, res) => {
  res.render("home", { layout: "index" });
});

//Home page route
app.get("/landing", (req, res) => {
  res.render("landing", { layout: "index" });
});

app.get('/personalChat', async (req, res) => {
  const user = await usersData.getUserByEmail(req.session.email);
  const convos = await conversationsData.getAllConversations(user._id);
  return res.json(convos);
});

//Process login route
app.post("/login", async (req, res) => {
  const body = req.body;
  if (!body.email) {
    return res.status(400).render('login', { layout: 'index', errorText: 'email must be supplied' });
  }
  if (!body.password) {
    return res.status(400).render('login', { layout: 'index', errorText: 'email must be supplied' });
  }

  try {
    body.email = validation.VerifyEmail(body.email);
    body.password = validation.VerifyPassword(body.password);
  } catch (e) {
    return res.status(400).render('login', { layout: 'index', errorText: e });
  }

  try {
    const user = await usersData.checkUser(body.email, body.password);
    req.session.isAuthenticated = true;
    req.session.email = body.email;
    res.redirect("/home");
  } catch (e) {
    return res.status(500).render('login', { layout: 'index', errorText: e });
  }
});

//Process signup route
app.post("/signup", async (req, res) => {
  const body = req.body;
  if (!body.email) {
    return res.status(400).render('signup', { layout: 'index', errorText: 'email must be supplied' });
  }
  if (!body.password) {
    return res.status(400).render('signup', { layout: 'index', errorText: 'email must be supplied' });
  }

  try {
    body.email = validation.VerifyEmail(body.email);
    body.password = validation.VerifyPassword(body.password);
  } catch (e) {
    return res.status(400).render('signup', { layout: 'index', errorText: e });
  }

  try {
    const user = await usersData.createUser(body.email, body.password);
    req.session.isAuthenticated = true;
    req.session.email = body.email;
    res.redirect("/home");
  } catch (e) {
    return res.status(500).render('signup', { layout: 'index', errorText: e });
  }
});

//Default route
app.get("/", (req, res) => {
  if (req.session.isAuthenticated) {
    res.redirect("/home");
  } else {
    res.redirect("/landing");
  }
});

app.listen(port, () => console.log(`App listening to port ${port}`));
