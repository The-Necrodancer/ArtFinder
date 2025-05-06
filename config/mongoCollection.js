import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

//TODO: Add your collection names here
export const users = getCollectionFn("users");
export const commissions = getCollectionFn("commissions");
export const reviews = getCollectionFn("reviews");
export const reports = getCollectionFn("reports");
export const posts = getCollectionFn("posts");
export const cards = getCollectionFn("cards");