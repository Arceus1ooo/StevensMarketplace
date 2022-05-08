const mongoCollections = require('../config/mongoCollections');
const listingsCollection = mongoCollections.listings;
const validation = require('../validations');
const usersData = require('./users');
const { ObjectId } = require('mongodb');

async function VerifyListingObject(name, category, postDate, askPrice, desc, cond, status, sellerID) {
    if (!name) throw 'name must be supplied';
    if (!category) throw 'category must be supplied';
    if (!postDate) throw 'posted date must be supplied';
    if (!askPrice) throw 'asking price must be supplied';
    if (!desc) throw 'description must be supplied';
    if (!cond) throw 'condition must be supplied';
    if (!status) throw 'status must be supplied';
    if (!sellerID) throw 'seller ID must be supplied';

    name = validation.VerifyString(name, 'listing name');
    category = validation.VerifyCategory(category);
    postDate = validation.VerifyDate(postDate);
    askPrice = validation.VerifyFloat(String(askPrice));
    desc = validation.VerifyString(desc);
    cond = validation.VerifyCondition(cond);
    validation.VerifyBool(status);
    if (!ObjectId.isValid(sellerID)) throw 'invalid seller ID';
    const seller = await usersData.getUserByID(sellerID);

    let listing = {
        name: name,
        category: category,
        postedDate: postDate,
        askingPrice: askPrice,
        description: desc,
        condition: cond,
        sale_status: status,
        seller_id: seller._id.toString()
    };

    return listing;
}

module.exports = {
    async createListing(name, category, postDate, askPrice, desc, cond, status, sellerID) {
        let listing = await VerifyListingObject(name, category, postDate, askPrice, desc, cond, status, sellerID);
        const listings = await listingsCollection();
        const insertInfo = await listings.insertOne(listing);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add listing';
        const newID = insertInfo.insertedId.toString();
        const newListing = await this.getListingByID(newID);
        return newListing;
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

    async getListingsByCategory(category) {
        if (!category) throw 'category must be supplied';
        category = validation.VerifyCategory(category);
        const listings = await listingsCollection();
        const result = await listings.find({ category: category }).toArray();
        return result;
    },

    async updateListing(id, name, category, postDate, askPrice, desc, cond, status, sellerID) {
        if (!id) throw 'ID must be supplied';
        if (!ObjectId.isValid(id)) throw 'invalid ID';
        let newListing = await VerifyListingObject(name, category, postDate, askPrice, desc, cond, status, sellerID);

        const listings = await listingsCollection();
        const updatedInfo = await listings.replaceOne({ _id: ObjectId(id) }, newListing);
        if (updatedInfo.modifiedCount === 0) throw 'Error: could not update listing';
        return await this.getListingByID(id);
    },

    async deleteListingByID(id) {
        // do we need this?
        if (!id) throw 'ID must be supplied';
        if (!ObjectId.isValid(id)) throw 'invalid ID';
        const listings = await listingsCollection();
        const deletedInfo = await listings.deleteOne({ _id: ObjectId(id) });
        if (deletedInfo.deletedCount === 0) throw 'could not delete listing';
        return true;
    }
}