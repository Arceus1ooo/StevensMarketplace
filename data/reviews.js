const validation = require('../validations');
const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const usersCollection = mongoCollections.users;
const usersData = require('./users');

function RecalculateRating(user) {
    //at this point seller has been verified
    if (user.reviews.length === 0) return Number(Number('0').toFixed(2));
    let sum = 0;
    for (let review of user.reviews) {
        sum += Number(review.rating);
    }
    sum /= Number(user.reviews.length);
    return Number(sum.toFixed(2));
}

async function UpdateOverallRating(sellerID) {
    if (!sellerID) throw 'seller ID must be supplied';
    if (!ObjectId.isValid(sellerID)) throw 'invalid seller ID';

    const users = await usersCollection();
    let newUser = await usersData.getUserByID(sellerID);
    await users.updateOne({ _id: ObjectId(sellerID) }, { $set: { overallRating: RecalculateRating(newUser) } });
}

module.exports = {
    async createReview(sellerID, buyerID, listingID, comment, rating) {
        //seller id is the id for the user object that the review is being attached to
        if (!sellerID) throw 'user ID must be supplied';
        if (!buyerID) throw 'buyer ID must be supplied';
        if (!listingID) throw 'listing ID must be supplied';
        if (!comment) throw 'comment must be supplied';
        if (!rating) throw 'rating must be supplied';

        if (!ObjectId.isValid(sellerID)) throw 'invalid user ID';
        if (!ObjectId.isValid(buyerID)) throw 'invalid buyer ID';
        if (!ObjectId.isValid(listingID)) throw 'invalid listing ID';
        comment = validation.VerifyString(comment, 'comment');
        rating = validation.VerifyRating(String(rating));
        const users = await usersCollection();

        const newReview = {
            buyer_id: ObjectId(buyerID),
            listing_id: ObjectId(listingID),
            comment: comment,
            rating: rating
        };
        const user = await users.findOne({ _id: ObjectId(sellerID) });
        if (!user) throw 'user not found';
        const foundListing = await users.findOne(
            { reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } }
        );
        if (foundListing) throw 'review already posted for this listing and this buyer';

        const updatedInfo = await users.updateOne({ _id: ObjectId(sellerID) }, { $addToSet: { reviews: newReview } });
        if (updatedInfo.modifiedCount === 0) throw 'could not create review';
        await UpdateOverallRating(sellerID);

        return newReview;
    },

    async getReview(buyerID, listingID) {
        //(buyer id, listing_id) is unique identifier because buyer-listing is 1:1
        //edge case: seller has 2 items in one listing, buyer buys them both across 2 transactions
        //solution: buyer cannot leave a second review, they can only edit the first one
        if (!buyerID) throw 'buyer ID must be supplied';
        if (!listingID) throw 'listing ID must be supplied';
        if (!ObjectId.isValid(buyerID)) throw 'invalid buyer ID';
        if (!ObjectId.isValid(listingID)) throw 'invalid listing ID';

        const users = await usersCollection();
        let review = await users.findOne(
            { reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } },
            { projection: { _id: 0, reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } } }
        );
        if (!review) throw 'review not found';

        review = review.reviews[0]; //get the singular review
        review.buyer_id = review.buyer_id.toString();
        review.listing_id = review.listing_id.toString();

        return review;
    },

    async updateReview(buyerID, listingID, comment, rating) {
        if (!buyerID) throw 'buyer ID must be supplied';
        if (!listingID) throw 'listingID must be supplied';
        if (!comment) throw 'comment must be supplied';
        if (!rating) throw 'rating must be supplied';

        if (!ObjectId.isValid(buyerID)) throw 'invalid user ID';
        if (!ObjectId.isValid(listingID)) throw 'invalid listing ID';
        comment = validation.VerifyString(comment, 'comment');
        rating = validation.VerifyRating(String(rating));

        const users = await usersCollection();
        //query adapted from https://www.tutorialspoint.com/how-to-update-array-of-subdocuments-in-mongodb
        const updatedInfo = users.updateOne(
            { reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } }, //selects specific review
            { $set: { "reviews.$.comment": comment, "reviews.$.rating": rating } } //sets new values
        );
        if (updatedInfo.modifiedCount === 0) throw 'could not update review';

        const user = await users.findOne(
            { reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } }
        );
        await UpdateOverallRating(user._id.toString());

        return await this.getReview(buyerID, listingID);
    },

    async deleteReview(buyerID, listingID) {
        if (!buyerID) throw 'user ID must be supplied';
        if (!listingID) throw 'listing ID must be supplied';
        if (!ObjectId.isValid(buyerID)) throw 'invalid user ID';
        if (!ObjectId.isValid(listingID)) throw 'invalid listing ID';

        const reviewToRemove = await this.getReview(buyerID, listingID);
        reviewToRemove.listing_id = new ObjectId(reviewToRemove.listing_id);
        reviewToRemove.buyer_id = new ObjectId(reviewToRemove.buyer_id);
        const users = await usersCollection();

        const updatedInfo = await users.updateOne(
            { reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } },
            { $pull: { reviews: reviewToRemove } });
        if (updatedInfo.modifiedCount === 0) throw 'could not delete review';

        const user = await users.findOne(
            { reviews: { $elemMatch: { buyer_id: ObjectId(buyerID), listing_id: ObjectId(listingID) } } }
        );
        await UpdateOverallRating(user._id.toString());

        return true;
    }
}