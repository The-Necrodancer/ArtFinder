import { ObjectId } from "mongodb";
import { getUserByID} from "./users.js";
import { checkId, checkPost } from "../helpers.js";

export const postMinLength = 1;
// Set the max length to the length of an Instagram post, we can change this later of course.
export const postMaxLength = 2200;

// Allows the user (user, artist, admin) to create a post.
export const createPost = async (postBody, posterID) => {
    postBody = checkPost(body, postMinLength, postMaxLength);
    posterID = checkId(posterID);


    // Checks if the user exists
    try {
        const doesPosterExist = await getUserByID(posterID);
    } catch (e) {
        throw `User with ID ${posterID} does not exist!`;
    }

    const posterThatPosted = await getUserByID(posterID);
    const newPost = {
        _id: new ObjectId(),
        poster: {
            posterID: posterID,
            username: posterThatPosted.username,
            profilePicture: posterThatPosted.profilePicture,
        },
        body: postBody,
        postDate: new Date(),
    };
    const postsCollection = await posts();
    const insertInfo = await postsCollection.insertOne(newPost);
    if(updatedUser.matchedCount ===0 || updatedUser.modifiedCount !== 1) {
        throw `Error: could not add requested commission to user.`; 
    }


}

// If the user wants to delete THEIR OWN POST
// Admins have functionality to delete any post as well.
export const deletePost = async (postID) => {
    postID = checkId(postID);

    const postsCollection = await posts();
    const deletionInfo = await postsCollection.deleteOne({ _id: new ObjectId(postID) });
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete post with id of ${postID}`;
    }
    return true;
}
