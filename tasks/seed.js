const bcrypt = require('bcryptjs');
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const usersData = data.users;
const reviewsData = data.reviews;
const listingsData = data.listings;
const conversationsData = data.conversations;

// Generate hashedPasswords for seed users, using 10 salt rounds for efficiency
const genHP = (plainTextPW) => {
    return bcrypt.hashSync(plainTextPW, 10);
}

const main = async () => {
    try {
        let test = await usersData.createUser('test@test.com', 'password');
        console.log(test);
    } catch (e) {
        console.log(e);
    }
    try {
        let test = await usersData.createUser('blah2@blah.com', 'password1');
        console.log(test);
    } catch (e) {
        console.log(e);
    }
    let user1 = await usersData.getUserByEmail('test@test.com');
    let user2 = await usersData.getUserByEmail('blah2@blah.com');
    //await usersData.deleteUserByEmail('teSt@teSt.Com');
    let listing = await listingsData.createListing('test', 'furniture', '3/3/2003', '23.21', 'test', 'good', true, user1._id);
    //await listingsData.deleteListingByID(listing._id);
    let review = await reviewsData.createReview(user1._id, user2._id, listing._id, 'test', 3.9);
    try {
        let review2 = await reviewsData.createReview(user1._id, user2._id, listing._id, 'test', 3.9);
    }
    catch (e) {
        console.log(e);
    }
    await reviewsData.updateReview(user2._id, listing._id, 'new test', 3.1);
    let listing2 = await listingsData.createListing('test', 'textbook', '3/3/2003', '23.21', 'test', 'good', true, user1._id);
    //await listingsData.deleteListingByID(listing2._id);
    let a = await listingsData.getListingsByCategory('furniture');
    console.log(a);

    try {
        let conversation = await conversationsData.createConversation(user2._id, user1._id);
    } catch (e) {
        console.log(e);
    }
    let message = await conversationsData.createMessage(user1._id, 'hello');
    console.log(message);
    await conversationsData.addMessage(message, user2._id, user1._id);
    console.log(await conversationsData.getAllConversations(user1._id));
    console.log('done');
}

main();