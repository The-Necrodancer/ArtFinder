import { comments } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";

export const createComment = async (content, userId, targetId, targetType) => {
  if (!content || !userId || !targetId || !targetType)
    throw "All fields are required";
  if (typeof content !== "string" || content.trim().length === 0)
    throw "Invalid content";
  if (!ObjectId.isValid(userId)) throw "Invalid user ID";
  if (!ObjectId.isValid(targetId)) throw "Invalid target ID";
  if (!["artwork", "profile"].includes(targetType)) throw "Invalid target type";

  const commentCollection = await comments();
  const newComment = {
    content: content.trim(),
    userId: new ObjectId(userId),
    targetId: new ObjectId(targetId),
    targetType,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    replies: [],
  };

  const { insertedId } = await commentCollection.insertOne(newComment);
  return { ...newComment, _id: insertedId };
};

export const getCommentsByTarget = async (targetId, targetType) => {
  if (!targetId || !targetType) throw "Target ID and type are required";
  if (!ObjectId.isValid(targetId)) throw "Invalid target ID";
  if (!["artwork", "profile"].includes(targetType)) throw "Invalid target type";

  const commentCollection = await comments();
  return await commentCollection
    .find({ targetId: new ObjectId(targetId), targetType })
    .sort({ createdAt: -1 })
    .toArray();
};

export const updateComment = async (id, content) => {
  if (!id || !content) throw "All fields are required";
  if (!ObjectId.isValid(id)) throw "Invalid comment ID";
  if (typeof content !== "string" || content.trim().length === 0)
    throw "Invalid content";

  const commentCollection = await comments();
  const updatedComment = {
    content: content.trim(),
    updatedAt: new Date(),
  };

  const result = await commentCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedComment }
  );
  if (result.modifiedCount === 0) throw "Could not update comment";
  return await getCommentById(id);
};

export const deleteComment = async (id) => {
  if (!id || !ObjectId.isValid(id)) throw "Invalid comment ID";
  const commentCollection = await comments();
  const result = await commentCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw "Could not delete comment";
  return true;
};

export const addReply = async (parentId, content, userId) => {
  if (!parentId || !content || !userId) throw "All fields are required";
  if (!ObjectId.isValid(parentId)) throw "Invalid parent comment ID";
  if (!ObjectId.isValid(userId)) throw "Invalid user ID";
  if (typeof content !== "string" || content.trim().length === 0)
    throw "Invalid content";

  const reply = {
    _id: new ObjectId(),
    content: content.trim(),
    userId: new ObjectId(userId),
    createdAt: new Date(),
    likes: 0,
  };

  const commentCollection = await comments();
  const result = await commentCollection.updateOne(
    { _id: new ObjectId(parentId) },
    { $push: { replies: reply } }
  );
  if (result.modifiedCount === 0) throw "Could not add reply";
  return reply;
};

export const likeComment = async (id) => {
  if (!id || !ObjectId.isValid(id)) throw "Invalid comment ID";
  const commentCollection = await comments();
  const result = await commentCollection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { likes: 1 } }
  );
  if (result.modifiedCount === 0) throw "Could not like comment";
  return true;
};
