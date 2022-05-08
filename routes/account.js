const express = require('express');
const router = express.Router();
const validation = require('../validations');
const usersData = require('../data').users;

router.get("/logout", (req, res) => {
    req.session.isAuthenticated = false;
    req.session.email = "";
    res.redirect("/login");
});

router.get("/login", (req, res) => {
    res.render("login", {
        layout: "index",
    });
});

router.post("/login", async (req, res) => {
    const body = req.body;
    if (!body.email) {
        return res.render("login", { layout: "index", errorText: "email must be supplied" });
    }
    if (!body.password) {
        return res.render("login", { layout: "index", errorText: "password must be supplied" });
    }

    try {
        body.email = validation.VerifyEmail(body.email);
        body.password = validation.VerifyPassword(body.password);
    } catch (error) {
        return res.render("login", { layout: "index", errorText: error });
    }

    try {
        const user = await usersData.checkUser(body.email, body.password);
        req.session.isAuthenticated = true;
        req.session.email = body.email;
        return res.redirect('/home');
    } catch (error) {
        return res.render("login", { layout: "index", errorText: error });
    }
});

router.get("/logout", (req, res) => {
    req.session.isAuthenticated = false;
    req.session.username = "";
    res.redirect("/login");
});

router.get("/signup", (req, res) => {
    res.render("signup", { layout: "index" });
});

router.post("/signup", async (req, res) => {
    const body = req.body;

    if (!body.email) {
        return res.render("signup", { layout: "index", errorText: 'email must be supplied' });
    }
    if (!body.password) {
        return res.render("signup", { layout: "index", errorText: 'password must be supplied' });
    }

    try {
        body.email = validation.VerifyEmail(body.email);
        body.password = validation.VerifyPassword(body.password);
    } catch (error) {
        return res.render("signup", { layout: "index", errorText: error });
    }

    try {
        const user = await usersData.createUser(body.email, body.password);
        return res.redirect("/account/login");
    } catch (error) {
        res.render("signup", { layout: "index", errorText: error });
    }
});

module.exports = router;