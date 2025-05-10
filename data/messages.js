import { ObjectId } from "mongodb";
import { messages } from "../config/mongoCollection.js";
import { getUserById } from "./users.js";
import { checkId, checkString } from "../helpers.js";

export const messageMinLength = 1;
export const messageMaxLength = 1000;
export const subjectMinLength = 3;
export const subjectMaxLength = 100;

/**
 * Creates a new message
 * @param {String} senderId ID of the user sending the message
 * @param {String} recipientId ID of the user receiving the message
 * @param {String} subject Subject of the message
 * @param {String} content Content of the message
 * @returns {Object} The created message
 */
export const createMessage = async (
  senderId,
  recipientId,
  subject,
  content
) => {
  senderId = checkId(senderId);
  recipientId = checkId(recipientId);
  subject = checkString(subject, "subject");
  content = checkString(content, "content");

  if (subject.length < subjectMinLength || subject.length > subjectMaxLength) {
    throw `Subject must be between ${subjectMinLength} and ${subjectMaxLength} characters`;
  }

  if (content.length < messageMinLength || content.length > messageMaxLength) {
    throw `Message must be between ${messageMinLength} and ${messageMaxLength} characters`;
  }

  // Verify users exist
  await getUserById(senderId);
  await getUserById(recipientId);

  const message = {
    senderId: new ObjectId(senderId),
    recipientId: new ObjectId(recipientId),
    subject,
    content,
    createdAt: new Date(),
    read: false,
    archived: false,
  };

  const messageCollection = await messages();
  const insertInfo = await messageCollection.insertOne(message);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Could not create message";
  }

  return { ...message, _id: insertInfo.insertedId };
};

/**
 * Gets all messages for a user (both sent and received)
 */
export const getUserMessages = async (userId) => {
  userId = checkId(userId);
  const messageCollection = await messages();
  return await messageCollection
    .find({
      $or: [
        { senderId: new ObjectId(userId) },
        { recipientId: new ObjectId(userId) },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();
};

/**
 * Gets a specific message by ID
 */
export const getMessageById = async (id) => {
  id = checkId(id);
  const messageCollection = await messages();
  const message = await messageCollection.findOne({ _id: new ObjectId(id) });
  if (!message) throw "Message not found";
  return message;
};

/**
 * Marks a message as read
 */
export const markMessageRead = async (id) => {
  id = checkId(id);
  const messageCollection = await messages();
  const updateInfo = await messageCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { read: true } }
  );

  if (!updateInfo.matchedCount) throw "Message not found";
  if (!updateInfo.modifiedCount) throw "Message was not updated";

  return await getMessageById(id);
};

/**
 * Archives a message
 */
export const archiveMessage = async (id) => {
  id = checkId(id);
  const messageCollection = await messages();
  const updateInfo = await messageCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { archived: true } }
  );

  if (!updateInfo.matchedCount) throw "Message not found";
  if (!updateInfo.modifiedCount) throw "Message was not updated";

  return await getMessageById(id);
};

/**
 * Gets unread message count for a user
 */
export const getUnreadCount = async (userId) => {
  userId = checkId(userId);
  const messageCollection = await messages();
  return await messageCollection.countDocuments({
    recipientId: new ObjectId(userId),
    read: false,
    archived: false,
  });
};
