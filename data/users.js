const mongoCollections = require('../config/mongoCollections');
const usersCollection = mongoCollections.users;
const listingsCollection = mongoCollections.listings;
const validation = require('../validations');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const saltRounds = 14;

module.exports = {
    async createUser(email, password) {
        if (!email) throw 'email must be supplied';
        if (!password) throw 'password must be supplied';
        email = validation.VerifyEmail(email).toLowerCase();
        password = validation.VerifyPassword(password);

        const users = await usersCollection();
        const user = await users.findOne({ email: email });
        if (user) throw 'email already exists';
        const hashedPwd = await bcrypt.hash(password, saltRounds);

        let newUser = {
            firstName: '',
            lastName: '',
            email: email,
            hashPassword: hashedPwd,
            userListings: [],
            reviews: [],
            overallRating: 0
        }
        const insertInfo = await users.insertOne(newUser);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add user';
        return await this.getUserByEmail(email);
    },

    async checkUser(email, password) {
        if (!email) throw 'email must be supplied';
        if (!password) throw 'password must be supplied';
        email = validation.VerifyEmail(email);
        password = validation.VerifyPassword(password);

        const users = await usersCollection();
        const user = await users.findOne({ email: email.toLowerCase() });
        if (!user) throw 'Either the email or password is invalid';

        let match = false;
        try {
            match = await bcrypt.compare(password, user.hashPassword);
        } catch (e) { }
        if (!match) throw 'Either the email or password is invalid';

        return true;
    },

    async getUserByID(id) {
        if (!id) throw 'ID must be supplied';
        if (!ObjectId.isValid(id)) throw 'invalid ID';
        const users = await usersCollection();
        const user = await users.findOne({ _id: ObjectId(id) });
        if (!user) throw 'user not found';
        user._id = user._id.toString();
        return user;
    },
    async getUserByEmail(email) {
        if (!email) throw 'email must be supplied';
        email = validation.VerifyEmail(email).toLowerCase();
        const users = await usersCollection();
        const user = await users.findOne({ email: email });
        if (!user) throw 'user not found';
        user._id = user._id.toString();
        return user;
    },

    async updateUserByID(id, first, last) {
        if (!id) throw 'ID must be supplied';
        if (!first) throw 'first name must be supplied';
        if (!last) throw 'last name must be supplied';

        if (!ObjectId.isValid(id)) throw 'invalid ID';
        first = validation.VerifyName(first);
        last = validation.VerifyName(last);

        const user = await this.getUserByID(id);

        let newUser = {
            firstName: first,
            lastName: last,
            email: user.email,
            hashPassword: user.hashedPwd,
            userListings: user.userListings,
            reviews: user.reviews,
            overallRating: user.overallRating
        };

        const users = await usersCollection();
        const updatedInfo = await users.replaceOne({ _id: ObjectId(id) }, newUser);
        if (updatedInfo.modifiedCount === 0) throw 'Error: could not update user';
        return await this.getUserByID(id);
    },

    async addUserListing(userEmail, listingID) {
        if (!userEmail) throw 'user email must be supplied';
        if (!listingID) throw 'listing ID must be supplied';
        userEmail = validation.VerifyEmail(userEmail);
        if (!ObjectId.isValid(listingID)) throw 'invalid listing ID';

        const user = await this.getUserByEmail(userEmail);
        user._id = ObjectId(user._id);
        const users = await usersCollection();
        const listings = await listingsCollection();
        const listing = await listings.findOne({ _id: ObjectId(listingID) });

        user.userListings.push(listing);
        const updatedInfo = await users.replaceOne({ email: userEmail }, user);
        if (updatedInfo.modifiedCount === 0) throw 'could not add listing';
        return await this.getUserByEmail(userEmail);
    },

    async deleteUserByEmail(email) {
        if (!email) throw 'email must be supplied';
        email = validation.VerifyEmail(email).toLowerCase();
        const users = await usersCollection();
        const deletedInfo = await users.deleteOne({ email: email });
        if (deletedInfo.deletedCount === 0) throw 'could not delete user';
        return true;
    }
}