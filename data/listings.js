const mongoCollections = require('../config/mongoCollections');
const listingsCollection = mongoCollections.listings;
const validation = require('../validations');
const usersData = require('./users');
const { ObjectId } = require('mongodb');

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
        const insertInfo = await listings.insertOne(listing);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add listing';
        const newID = insertInfo.insertedId.toString();

        return await this.getListingByID(newID);
    },

    async getListingByID(id) {
        if (!id) throw 'ID must be supplied';
        if (!ObjectId.isValid(id)) throw 'invalid ID';
        const listings = await listingsCollection();
        const listing = await listings.findOne({ _id: ObjectId(id) });
        if (!listing) throw 'could not find listing';
        listing._id = listing._id.toString();
        return listing;
    },

    async deleteListingByID(id) {
        if (!id) throw 'ID must be supplied';
        if (!ObjectId.isValid(id)) throw 'invalid ID';
        const listings = await listingsCollection();
        const deletedInfo = await listings.deleteOne({ _id: ObjectId(id) });
        if (deletedInfo.deletedCount === 0) throw 'could not delete listing';
        return true;
    }
}