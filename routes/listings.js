const express = require('express');
const router = express.Router();
const listingsData = require('../data').listings;
const usersData = require('../data').users;
const validation = require('../validations');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const listings = await listingsData.getAllListings();
        if (listings.length === 0) {
            //?
        }

    } catch (e) {

    }
});

router.get('/:id', async (req, res) => {
    try {
        req.params.id = validation.VerifyString(req.params.id, 'listing id');
    } catch (e) {

    }
    if (!ObjectId.isValid(req.params.id)) {

    }

    try {
        const listing = await listingsData.getListingByID(req.params.id);

    } catch (e) {

    }
});

router.get("/create", async (req, res) => {
    return res.render("createListings", { layout: "index" });
});

router.post('/create', async (req, res) => {
    const data = req.body;

    //verify info
    if (!data.category) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: 'category must be supplied' });
    }
    try {
        data.category = validation.VerifyCategory(data.category);
    } catch (e) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: e });
    }

    if (!data.askingPrice) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: 'price must be supplied' });
    }
    try {
        data.askingPrice = validation.VerifyFloat(data.askingPrice);
    } catch (e) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: e });
    }

    if (!data.description) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: 'description must be supplied' });
    }
    try {
        data.description = validation.VerifyString(data.description, 'listing description');
    } catch (e) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: e });
    }

    if (!data.condition) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: 'condition must be supplied' });
    }
    try {
        data.condition = validation.VerifyCondition(data.condition);
    } catch (e) {
        return res.status(400).render('createListings', { layout: 'index', body: data, errorText: e });
    }

    const currentUser = await usersData.getUserByEmail(req.session.email);
    data.seller_id = currentUser._id;
    try {
        data.seller_id = validation.VerifyString(data.seller_id, 'seller ID');
    } catch (e) {
        return res.status(500).render('createListings', { layout: 'index', body: data, errorText: e });
    }
    if (!ObjectId.isValid(data.seller_id)) {
        return res.status(500).render('createListings', { layout: 'index', body: data, errorText: 'invalid user ID' });
    }

    data.sale_status = false;

    const date = new Date();
    let month = date.getMonth() + 1; //0 is january, 11 is december (need 1-12 instead)
    month = month < 10 ? `0${month}` : month.toString();
    let day = date.getDate();
    day = day < 10 ? `0${day}` : day.toString();
    console.log(month, day, date.getFullYear().toString());
    data.postedDate = `${month}/${day}/${date.getFullYear().toString()}`;

    try {
        data.postedDate = validation.VerifyDate(data.postedDate);
    } catch (e) {
        return res.status(500).render('createListings', { layout: 'index', body: data, errorText: e });
    }

    //apply info
    try {
        await listingsData.createListing(data.category, data.postedDate, data.askingPrice,
            data.description, data.condition, data.sale_status, data.seller_id);
    } catch (e) {
        return res.render('home');
    }
});

router.get("/saved", (req, res) => {
    res.render("savedListings", { layout: "index" });
});

module.exports = router;