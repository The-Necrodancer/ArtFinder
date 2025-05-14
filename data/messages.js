import { ObjectId } from "mongodb";
import { messages } from "../config/mongoCollection.js";
import { getUserById } from "./users.js";
import { checkId, checkString } from "../helpers.js";
import xss from "xss";

export const messageMinLength = 1;
export const messageMaxLength = 1000;
export const subjectMinLength = 3;
export const subjectMaxLength = 100;

/**
 * Message rate limiting configuration
 */
const rateLimitConfig = {
  maxMessages: 50, // Maximum messages per timeWindow
  timeWindow: 3600000, // Time window in milliseconds (1 hour)
  userMessageCounts: new Map(), // Tracks message counts per user
};

/**
 * Checks if a user has exceeded their message rate limit
 * @param {String} userId The user's ID
 * @returns {Boolean} True if user can send more messages, false if rate limited
 */
export const checkRateLimit = async (userId) => {
  userId = checkId(userId);
  const now = Date.now();

  if (!rateLimitConfig.userMessageCounts.has(userId)) {
    rateLimitConfig.userMessageCounts.set(userId, {
      count: 0,
      resetTime: now + rateLimitConfig.timeWindow,
    });
  }

  const userLimit = rateLimitConfig.userMessageCounts.get(userId);

  // Reset count if time window has passed
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + rateLimitConfig.timeWindow;
  }

  // Check if user has exceeded limit
  if (userLimit.count >= rateLimitConfig.maxMessages) {
    throw `Rate limit exceeded. You can send more messages after ${new Date(
      userLimit.resetTime
    ).toLocaleString()}`;
  }

  userLimit.count++;
  return true;
};

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

  // Check rate limit
  await checkRateLimit(senderId);

  // Sanitize user input
  const sanitizedSubject = xss(subject);
  const sanitizedContent = xss(content);

  if (
    sanitizedSubject.length < subjectMinLength ||
    sanitizedSubject.length > subjectMaxLength
  ) {
    throw `Subject must be between ${subjectMinLength} and ${subjectMaxLength} characters`;
  }

  if (
    sanitizedContent.length < messageMinLength ||
    sanitizedContent.length > messageMaxLength
  ) {
    throw `Message must be between ${messageMinLength} and ${messageMaxLength} characters`;
  }

  // Verify users exist
  await getUserById(senderId);
  await getUserById(recipientId);

  const message = {
    senderId: new ObjectId(senderId),
    recipientId: new ObjectId(recipientId),
    subject: sanitizedSubject,
    content: sanitizedContent,
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
 * Gets all messages for a user with pagination
 * @param {String} userId User ID
 * @param {Number} page Page number (1-based)
 * @param {Number} limit Messages per page
 * @returns {Object} Messages and pagination info
 */
export const getPaginatedUserMessages = async (
  userId,
  page = 1,
  limit = 20
) => {
  userId = checkId(userId);

  if (page < 1) throw "Page must be greater than 0";
  if (limit < 1) throw "Limit must be greater than 0";

  const messageCollection = await messages();
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { senderId: new ObjectId(userId) },
      { recipientId: new ObjectId(userId) },
    ],
  };

  const [messageList, totalCount] = await Promise.all([
    messageCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    messageCollection.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    messages: messageList,
    pagination: {
      currentPage: page,
      totalPages,
      totalMessages: totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
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
 * Deletes a message permanently
 * @param {String} id Message ID
 * @param {String} userId User ID requesting deletion (must be sender or recipient)
 * @returns {Boolean} True if deletion was successful
 */
export const deleteMessage = async (id, userId) => {
  id = checkId(id);
  userId = checkId(userId);

  const messageCollection = await messages();
  const message = await getMessageById(id);

  // Verify user has permission to delete
  if (
    message.senderId.toString() !== userId &&
    message.recipientId.toString() !== userId
  ) {
    throw "Access denied. You don't have permission to delete this message.";
  }

  const deleteInfo = await messageCollection.deleteOne({
    _id: new ObjectId(id),
  });
  if (!deleteInfo.acknowledged || deleteInfo.deletedCount === 0) {
    throw "Could not delete message";
  }

  return true;
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
