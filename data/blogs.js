import { blogs } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";

export const createBlog = async (title, content, authorId) => {
  if (!title || !content || !authorId) throw "All fields are required";
  if (typeof title !== "string" || title.trim().length === 0)
    throw "Invalid title";
  if (typeof content !== "string" || content.trim().length === 0)
    throw "Invalid content";
  if (!ObjectId.isValid(authorId)) throw "Invalid author ID";

  const blogCollection = await blogs();
  const newBlog = {
    title: title.trim(),
    content: content.trim(),
    authorId: new ObjectId(authorId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { insertedId } = await blogCollection.insertOne(newBlog);
  console.log(insertedId);
  return { ...newBlog, _id: insertedId };
};

export const getAllBlogs = async () => {
  const blogCollection = await blogs();
  return await blogCollection.find({}).sort({ createdAt: -1 }).toArray();
};

export const getBlogById = async (id) => {
  if (!id || !ObjectId.isValid(id)) throw "Invalid blog ID";
  const blogCollection = await blogs();
  const blog = await blogCollection.findOne({ _id: new ObjectId(id) });
  if (!blog) throw "Blog not found";
  return blog;
};

export const updateBlog = async (id, title, content) => {
  if (!id || !title || !content) throw "All fields are required";
  if (!ObjectId.isValid(id)) throw "Invalid blog ID";
  if (typeof title !== "string" || title.trim().length === 0)
    throw "Invalid title";
  if (typeof content !== "string" || content.trim().length === 0)
    throw "Invalid content";

  const blogCollection = await blogs();
  const updatedBlog = {
    title: title.trim(),
    content: content.trim(),
    updatedAt: new Date(),
  };

  const result = await blogCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedBlog }
  );
  if (result.modifiedCount === 0) throw "Could not update blog";
  return await getBlogById(id);
};

export const deleteBlog = async (id) => {
  if (!id || !ObjectId.isValid(id)) throw "Invalid blog ID";
  const blogCollection = await blogs();
  const result = await blogCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw "Could not delete blog";
  return true;
};
