const usersData = require('./users');
const listingsData = require('./listings');

async function test() {
    await usersData.createUser('test@test.com', 'password');
    let user = await usersData.getUserByEmail('test@test.com');
    console.log(await listingsData.createListing('furniture', '3/3/2003', '23.21', 'test', 'good', true, user._id.toString()));
    console.log('done');
}
test();