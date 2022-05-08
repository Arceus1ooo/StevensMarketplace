const mongoCollections = require('../config/mongoCollections');
const conversationsCollection = mongoCollections.conversations;
const validation = require('../validations');
const { ObjectId } = require('mongodb');

function VerifyIDs(sellerID, buyerID) {
    if (!sellerID) throw 'seller ID must be supplied';
    if (!buyerID) throw 'buyer ID must be supplied';
    if (!ObjectId.isValid(sellerID)) throw 'invalid seller ID';
    if (!ObjectId.isValid(buyerID)) throw 'invalid buyer ID';
}

function VerifyMessage(messageObj) {
    if (!ObjectId.isValid(messageObj.sender_id)) throw 'invalid sender ID';
    messageObj.content = validation.VerifyString(messageObj.content);
    messageObj.message_id = validation.VerifyInt(messageObj.message_id);
    return messageObj;
}

module.exports = {
    async createConversation(sellerID, buyerID) {
        VerifyIDs(sellerID, buyerID);
        const conversations = await conversationsCollection();

        let newConversation = {
            messages: [],
            seller_id: ObjectId(sellerID),
            buyer_id: ObjectId(buyerID)
        };
        const conv = await conversations.findOne({ seller_id: newConversation.seller_id, buyer_id: newConversation.buyer_id });
        if (conv) throw 'conversation already exists between these 2 users';

        const insertInfo = await conversations.insertOne(newConversation);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'could not add conversation';
        return await this.getConversation(sellerID, buyerID);
    },

    async getConversation(sellerID, buyerID) {
        VerifyIDs(sellerID, buyerID);
        const conversations = await conversationsCollection();
        const conv = await conversations.findOne({ seller_id: ObjectId(sellerID), buyer_id: ObjectId(buyerID) });
        if (!conv) throw 'could not find conversation';

        conv.seller_id = conv.seller_id.toString();
        conv.buyer_id = conv.buyer_id.toString();
        for (let message of conv.messages) {
            message.sender_id = message.sender_id.toString();
        }
        return conv;
    },

    async getAllMessages(sellerID, buyerID) {
        VerifyIDs(sellerID, buyerID);
        const conversations = await conversationsCollection();
        const messages = await conversations.findOne(
            { seller_id: ObjectId(sellerID), buyer_id: ObjectId(buyerID) },
            { projection: { _id: 0, messages: 1 } }
        );
        return messages['messages'];
    },

    createMessage(senderID, content) {
        if (!senderID) throw 'sender ID must be supplied';
        if (!content) throw 'content must be supplied';
        if (!ObjectId.isValid(senderID)) throw 'invalid sender ID';
        content = validation.VerifyString(content, 'content');

        return {
            sender_id: senderID,
            content: content,
            message_id: -1 // id not yet generated
        }
    },

    async getAllConversations(userID) {
        if (!userID) throw 'user ID must be supplied';
        if (!ObjectId.isValid(userID)) throw 'invalid user ID';

        const conversations = await conversationsCollection();
        const convos = await conversations.find({ $or: [{ seller_id: ObjectId(userID) }, { buyer_id: ObjectId(userID) }] }).toArray();
        //const convos = await conversations.find({ seller_id: ObjectId(userID) }).toArray();
        return convos;
    },

    async addMessage(newMessage, sellerID, buyerID) {
        VerifyIDs(sellerID, buyerID);
        const conv = await this.getConversation(sellerID, buyerID);
        newMessage.message_id = conv.messages.length;
        newMessage = VerifyMessage(newMessage);

        const conversations = await conversationsCollection();
        const updatedInfo = await conversations.updateOne({ seller_id: ObjectId(sellerID), buyer_id: ObjectId(buyerID) }, { $addToSet: { messages: newMessage } });
        if (updatedInfo.modifiedCount === 0) throw 'could not update conversation';
        return true;
    },

    async getMessage(messageID, sellerID, buyerID) {
        if (!messageID) throw 'message ID must be supplied';
        messageID = validation.VerifyInt(messageID);
        VerifyIDs(sellerID, buyerID);

        const conversations = await conversationsCollection();
        const message = await conversations.findOne(
            { seller_id: sellerID, buyer_id: buyerID, messages: { $elemMatch: { message_id: messageID } } },
            { projection: { _id: 0, messages: { $elemMatch: { message_id: messageID } } } }
        );
        if (!message) throw 'message not found';
        message.sender_id = message.sender_id.toString();
        return message;
    }
}