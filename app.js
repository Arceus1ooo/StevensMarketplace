require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
const logger = require("./middleware/logger");

//Loads the handlebars module
const { engine } = require("express-handlebars");

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

//Routes
app.get("/private", (req, res) => {
  if (!req.session.isAuthenticated) {
    res.redirect("/login");
  } else {
    res.render("private", { layout: "index", user: req.session.username });
  }
});

//Logout
app.get("/logout", (req, res) => {
  req.session.isAuthenticated = false;
  req.session.username = "";
  res.redirect("/signin");
});

//Login page route
app.get("/signin", (req, res) => {
  res.render("login", {
    layout: "index",
  });
});

//Process login route
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const user =  {};// Handle login;

  if (user) {
    req.session.isAuthenticated = true;
    req.session.username = username;
    res.redirect("/listings");
  } else {
    res.redirect("/signin");
  }
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
app.get("/profile", (req, res) => {
  res.render("profile", { layout: "index" });
});

//Process signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = {}; // Create user here
    if (user.userInserted) {
      res.redirect("/signin");
    } else {
      res.redirect("/signup");
    }
  } catch (error) {
    res.redirect("/signup");
  }
});

//Default route
app.get("/", (req, res) => {
  if (req.session.isAuthenticated) {
    res.redirect("/listings");    // Redirect to listings if authenticated or different 
    } else {
    res.redirect("/home");
  }
});

app.listen(port, () => console.log(`App listening to port ${port}`));
