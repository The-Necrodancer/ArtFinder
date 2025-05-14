import { ObjectId } from "mongodb";
import { commissions, users } from "../config/mongoCollection.js";
import { getArtistById } from "./artists.js";
import { getUserById } from "./users.js";
import {
  checkDetails,
  checkPriceValue,
  checkId,
  checkTitle,
} from "../helpers.js";

export const titleMinLength = 5;
export const titleMaxLength = 128;

export const detailsMinLength = 32;
export const detailsMaxLength = 1024;

export const statusValues = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

/**
 * Creates a commission
 * @param {String} aid Id of artist being commissioned
 * @param {String} uid Id of user commissioning
 * @param {String} title Name of work being commissioned
 * @param {String} details Details of commission
 * @param {price} price Price of commission
 * @returns {Object} Commission object added to database
 */
export const createCommission = async (aid, uid, title, details, price) => {
  //validates user inputs
  let artist = await getArtistById(aid);
  let user = await getUserById(uid);
  title = checkTitle(title);
  details = checkDetails(details);
  price = checkPriceValue(price);
  let status = "Pending";
  let dateCreated = new Date().toLocaleDateString();
  let progressUpdates = [];
  let reviewed = false;

  //inserts commission in database
  let commissionCollection = await commissions();
  let insertedCommission = await commissionCollection.insertOne({
    aid,
    uid,
    title,
    details,
    price,
    status,
    dateCreated,
    progressUpdates,
    reviewed,
  });
  if (insertedCommission.acknowledged != true || !insertedCommission.insertedId)
    throw `Error: could not insert commission in database`;

  let cid = insertedCommission.insertedId.toString();
  //modifies the requestedCommission field of the artist
  let userCollection = await users();
  artist.artistProfile.createdCommissions.push(cid);
  const updatedArtist = await userCollection.updateOne(
    { _id: new ObjectId(aid) },
    {
      $set: {
        "artistProfile.createdCommissions":
          artist.artistProfile.createdCommissions,
      },
    }
  );
  if (updatedArtist.matchedCount === 0 || updatedArtist.modifiedCount !== 1) {
    throw `Error: could not add commission to artist.`;
  }
  //modifies the requestedCommission field of the user
  user.requestedCommissions.push(cid);
  const updatedUser = await userCollection.updateOne(
    { _id: new ObjectId(uid) },
    { $set: { requestedCommissions: user.requestedCommissions } }
  );
  if (updatedUser.matchedCount === 0 || updatedUser.modifiedCount !== 1) {
    throw `Error: could not add requested commission to user.`;
  }

  return await getCommissionById(insertedCommission.insertedId.toString());
};
/**
 * Gets the commission with the given ID
 * @param {String} id Id of commission
 * @returns {Object} The commission object in database with id
 */
export const getCommissionById = async (id) => {
  id = checkId(id);
  const commissionCollection = await commissions();
  const commission = await commissionCollection.findOne({
    _id: new ObjectId(id),
  });
  if (!commission) throw `Error: commission not found.`;
  commission._id = commission._id.toString();
  return commission;
};

export const updateCommissionStatus = async (id, status) => {
  id = checkId(id);
  if (!statusValues.includes(status)) {
    throw `Error: ${status} is not a valid status. Must be one of: ${statusValues.join(
      ", "
    )}`;
  }

  const commissionCollection = await commissions();
  const updateInfo = await commissionCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        progressUpdates: {
          $concatArrays: [
            "$progressUpdates",
            [
              {
                status,
                date: new Date().toLocaleDateString(),
                note: `Status updated to ${status}`,
              },
            ],
          ],
        },
      },
    }
  );

  if (!updateInfo.matchedCount) throw "Commission not found";
  // FIX THIS I THINK
  if (!updateInfo.modifiedCount) throw "Status was not updated";

  return await getCommissionById(id);
};

export const addProgressUpdate = async (id, note) => {
  id = checkId(id);
  note = checkString(note, "note");

  const commission = await getCommissionById(id);

  const commissionCollection = await commissions();
  const updateInfo = await commissionCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: {
        progressUpdates: {
          date: new Date().toLocaleDateString(),
          note,
        },
      },
    }
  );

  if (!updateInfo.matchedCount) throw "Commission not found";
  if (!updateInfo.modifiedCount) throw "Progress update was not added";

  return await getCommissionById(id);
};
