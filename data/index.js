const usersData = require('./users');
const listingsData = require('./listings');
const reviewsData = require('./reviews');
const conversationsData = require('./conversations');

async function test() {
    //console.log(await listingsData.getAllListings());
    try {
        let test = await usersData.createUser('test@test.com', 'password');
        console.log(test);
    } catch (e) {
        console.log(e);
    }
    try {
        let test = await usersData.createUser('blah@blah.com', 'password1');
        console.log(test);
    } catch (e) {
        console.log(e);
    }
    let user1 = await usersData.getUserByEmail('test@test.com');
    let user2 = await usersData.getUserByEmail('blah@blah.com');
    //await usersData.deleteUserByEmail('teSt@teSt.Com');
    let listing = await listingsData.createListing('furniture', '3/3/2003', '23.21', 'test', 'good', true, user1._id);
    //await listingsData.deleteListingByID(listing._id);
    let review = await reviewsData.createReview(user1._id, user2._id, listing._id, 'test', 3.9);
    try {
        let review2 = await reviewsData.createReview(user1._id, user2._id, listing._id, 'test', 3.9);
    }
    catch (e) {
        console.log(e);
    }
    await reviewsData.updateReview(user2._id, listing._id, 'new test', 3.1);
    let listing2 = await listingsData.createListing('furniture', '3/3/2003', '23.21', 'test', 'good', true, user1._id);
    await listingsData.deleteListingByID(listing2._id);

    try {
        let conversation = await conversationsData.createConversation(user1._id, user2._id);
    } catch (e) {
        console.log(e);
    }
    let message = await conversationsData.createMessage(user1._id, 'hello');
    //console.log(message);
    await conversationsData.addMessage(message, user1._id, user2._id);
    //console.log(await conversationsData.getAllMessages(user1._id, user2._id));
    console.log('done');
}
//test();

module.exports = {
    users: usersData,
    listings: listingsData,
    reviews: reviewsData,
    conversations: conversationsData
}