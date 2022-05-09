require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
const logger = require("./middleware/logger");
const bcrypt = require('bcryptjs');
const xss = require('xss');
const userData = require("./data/users");

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
const listingsData = data.listings;
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
app.post("/listings/create", async (req, res) => {
  const body = req.body;
  body.sale_status = false;

  const date = new Date();
  let month = date.getMonth() + 1; //0 is january, 11 is december (need 1-12 instead)
  month = month < 10 ? `0${month}` : month.toString();
  let day = date.getDate();
  day = day < 10 ? `0${day}` : day.toString();
  console.log(month, day, date.getFullYear().toString());
  body.postedDate = `${month}/${day}/${date.getFullYear().toString()}`;

  const user = await usersData.getUserByEmail(req.session.email);

  try {
    body.postedDate = validation.VerifyDate(body.postedDate);
  } catch (e) {
    return res.status(500).render('createListings', { layout: 'index', body: body, errorText: e });
  }

  try {
    let listing = await listingsData.createListing(body.name, body.category, body.postedDate, body.price,
      body.description, body.condition, body.sale_status, user._id);
    await usersData.addUserListing(req.session.email, listing._id);
  } catch (e) {
    return res.status(500).render('createListings', { layout: 'index', body: body, errorText: e });
  }
  return res.redirect('/profile');
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

app.get('/chat', async (req, res) => {
  const user = await usersData.getUserByEmail(req.session.email);
  const convos = await conversationsData.getAllConversations(user._id);
  let names = [];
  for (let convo of convos) {
    const seller = await usersData.getUserByID(convo.seller_id);
    const buyer = await usersData.getUserByID(convo.buyer_id);
    if (seller.email.toLowerCase() === req.session.email.toLowerCase()) {
      names.push({ name: `${buyer.firstName} ${buyer.lastName}`, id: buyer._id, type: 'buyer' });
    }
    else {
      names.push({ name: `${seller.firstName} ${seller.lastName}`, id: seller._id, type: 'seller' });
    }
  }
  res.render("personalChat", { layout: "index", names: names });
});

app.post('/chat', async (req, res) => {
  const user = await usersData.getUserByEmail(req.session.email);
  const otherID = req.body.id;
  const otherType = req.body.type;
  const userID = user._id;

  if (otherType === 'buyer') {
    const messages = await conversationsData.getAllMessages(userID, otherID);
    return res.json({ "Messages": messages });
  }
  else {
    const messages = await conversationsData.getAllConversations(otherID, userID);
    return res.json({ "Messages": messages });
  }
});

//Process login route
app.post("/login", async (req, res) => {
  let email = xss(req.body.email);
  let password = xss(req.body.password);
  if (!email) {
    return res.status(400).render('login', { layout: 'index', errorText: 'email must be supplied' });
  }
  if (!password) {
    return res.status(400).render('login', { layout: 'index', errorText: 'password must be supplied' });
  }

  try {
    email = validation.VerifyEmail(email);
    password = validation.VerifyPassword(password);
  } catch (e) {
    return res.status(400).render('login', { layout: 'index', errorText: e });
  }

  try {
    const user = await usersData.checkUser(email, password);
    req.session.isAuthenticated = true;
    req.session.email = email;
    res.redirect("/home");
  } catch (e) {
    return res.status(500).render('login', { layout: 'index', errorText: e });
  }

  let hashedPassword;
  try {
    ({ hashedPassword } = await userData.getUserByEmail(email));
    if (!hashedPassword) throw `No password found for user with email: ${email}.`;
  } catch (e) {
    return res.status(400).render('login', { layout: 'index', errorText: e });
  }

  const match = await bcrypt.compare(password, hashedPassword);
  if (match) {
    req.session.user = { email };
    res.status(200).json({ message: 'success' });
  } else {
    res.status(400).json({ error: 'Invalid username or password.' });
    return;
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
