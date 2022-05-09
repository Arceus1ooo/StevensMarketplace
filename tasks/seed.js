const bcrypt = require('bcryptjs');
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;
const reviews = data.reviews;
const listings = data.listings;
const conversations = data.conversations;

// Generate hashedPasswords for seed users, using 10 salt rounds for efficiency
const genHP = (plainTextPW) => {
    return bcrypt.hashSync(plainTextPW, 10);
}

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    // Now we create 5 student users
    let user1;
    try {
        user1 = await users.createUser('test@test.com', 'password');
    } catch (e) {
        console.log(`Error in creation of user 1: ${e}`)
    }
    let user2;
    try {
        user2 = await users.createUser('blah2@blah.com', 'password1');
    } catch (e) {
        console.log(`Error in creation of user 2: ${e}`)
    }
    let user3;
    try {
        user3 = await users.createUser('yoyo@gmail.com', 'password2');
    } catch (e) {
        console.log(`Error in creation of user 3: ${e}`)
    }

    let listings1;
    try {
        listings1 = await listings.createListing('test', 'furniture', '3/3/2003', '23.21', 'test', 'good', true, user1._id);
    } catch (e) {
        console.log(`Error in creation of listing 1: ${e}`);
    }

    let reviews1;
    try {
        reviews1 = await reviews.createReview(user1._id, user2._id, listing._id, 'test', 3.9);
    } catch (e) {
        console.log(`Error in creation of review 1: ${e}`);
    }

    let conversations1;
    try {
        conversations1 = await conversations.createConversation(user3._id, user1._id)
    } catch (e) {
        console.log(`Error in creation of conversation 1: ${e}`);
    }

    let message1;
    try {
        message1 = await conversations.createMessage(user1._id, 'hello');
    } catch (e) {
        console.log(`Error in creation of message 1: ${e}`);
    }

    try {
        await conversations.addMessage(message1, user1._id, user2._id);
    } catch (e) {
        console.log(`Error in adding message 1: ${e}`);
    }

    console.log('\nFinished seeding database!');
    await db.serverConfig.close();
}

main();