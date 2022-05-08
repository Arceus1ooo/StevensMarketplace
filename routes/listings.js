const express = require('express');
const router = express.Router();
const listingsData = require('../data').listings;
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

router.post('/create', async (req, res) => {
    const data = req.body;

    //verify info
    if (!data.category) {
        return;
    }
    try {
        data.category = validation.VerifyCategory(data.category);
    } catch (e) {
        return;
    }

    if (!data.postedDate) {
        return;
    }
    try {
        data.postedDate = validation.VerifyDate(data.postedDate);
    } catch (e) {
        return;
    }

    if (!data.askingPrice) {
        return;
    }
    try {
        data.askingPrice = validation.VerifyFloat(data.askingPrice);
    } catch (e) {
        return;
    }

    if (!data.description) {
        return;
    }
    try {
        data.description = validation.VerifyString(data.description, 'listing description');
    } catch (e) {
        return;
    }

    if (!data.condition) {
        return;
    }
    try {
        data.condition = validation.VerifyCondition(data.condition);
    } catch (e) {
        return;
    }

    if (!data.sale_status) {
        return;
    }
    try {
        data.sale_status = validation.VerifyBool(data.sale_status);
    } catch (e) {

    }

    if (!data.seller_id) {
        return;
    }
    try {
        data.seller_id = validation.VerifyString(data.seller_id, 'seller ID');
    } catch (e) {
        return;
    }
    if (!ObjectId.isValid(data.seller_id)) {
        return;
    }

    //apply info
    try {
        await listingsData.createListing(data.category, data.postedDate, data.askingPrice,
            data.description, data.condition, data.sale_status, data.seller_id);
    } catch (e) {
        return;
    }
});

module.exports = router;