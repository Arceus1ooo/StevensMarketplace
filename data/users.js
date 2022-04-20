const mongoCollections = require('../config/mongoCollections');
const usersCollection = mongoCollections.users;
const validation = require('../validations');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const saltRounds = 15;

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
            overallRating: -1 // -1 means no rating yet
        }
        await users.insertOne(newUser);
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
            match = await bcrypt.compare(password, user.password);
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

    async deleteUserByEmail(email) {
        if (!email) throw 'email must be supplied';
        email = validation.VerifyEmail(email).toLowerCase();
        const users = await usersCollection();
        const deletedInfo = await users.deleteOne({ email: email });
        if (deletedInfo.deletedCount === 0) throw 'could not delete user';
        return true;
    }
}