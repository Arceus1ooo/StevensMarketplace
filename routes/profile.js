const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    return res.render("profile", { layout: "index" });
});

router.get("/:id", (req, res) => {
    return res.render("profile", { layout: "index" });
});

router.get("/create", (req, res) => {
    return res.render("createProfile", { layout: "index" });
});

router.get("/:id/listings", (req, res) => {
    return res.render("userListings", { layout: "index" });
});

module.exports = router;