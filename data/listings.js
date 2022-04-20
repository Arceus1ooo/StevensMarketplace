const mongoCollections = require('../config/mongoCollections');
const listingsCollection = mongoCollections.listings;
const validation = require('../validations');
const usersData = require('./users');

module.exports = {
    async createListing(category, postDate, askPrice, desc, cond, status, sellerID) {
        if (!category) throw 'category must be supplied';
        if (!postDate) throw 'posted date must be supplied';
        if (!askPrice) throw 'asking price must be supplied';
        if (!desc) throw 'description must be supplied';
        if (!cond) throw 'condition must be supplied';
        if (!status) throw 'status must be supplied';
        if (!sellerID) throw 'seller ID must be supplied';

        category = validation.VerifyCategory(category);
        postDate = validation.VerifyDate(postDate);
        askPrice = validation.VerifyPrice(askPrice);
        desc = validation.VerifyString(desc);
        cond = validation.VerifyCondition(cond);
        validation.VerifyBool(status);
        const seller = await usersData.getUserByID(sellerID);

        let listing = {
            category: category,
            postedDate: postDate,
            askingPrice: askPrice,
            description: desc,
            condition: cond,
            sale_status: status,
            seller_id: seller._id.toString()
        };

        const listings = await listingsCollection();
        await listings.insertOne(listing);
        return true;
    }
}