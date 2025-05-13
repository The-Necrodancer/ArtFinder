import { ObjectId } from "mongodb";
import { reports } from "../config/mongoCollection.js";
import { getCommissionById } from "./commissions.js";
import { getUserById } from "./users.js";
import { checkId, checkString } from "../helpers.js";

export const reportStatusValues = [
  "Pending",
  "Under Review",
  "Resolved",
  "Dismissed",
];
export const subjectMinLength = 10;
export const subjectMaxLength = 100;
export const descriptionMinLength = 20;
export const descriptionMaxLength = 1000;

export const createReport = async (
  reportedBy,
  reportedUser,
  subject,
  description,
  commissionId = null
) => {
  reportedBy = checkId(reportedBy);
  reportedUser = checkId(reportedUser);
  subject = checkString(subject, "subject");
  description = checkString(description, "description");

  if (subject.length < subjectMinLength || subject.length > subjectMaxLength) {
    throw `Subject must be between ${subjectMinLength} and ${subjectMaxLength} characters`;
  }

  if (
    description.length < descriptionMinLength ||
    description.length > descriptionMaxLength
  ) {
    throw `Description must be between ${descriptionMinLength} and ${descriptionMaxLength} characters`;
  }

  // Verify users exist
  await getUserById(reportedBy);
  await getUserById(reportedUser);

  // If this is a commission dispute, verify the commission exists and involves both users
  if (commissionId) {
    commissionId = checkId(commissionId);
    const commission = await getCommissionById(commissionId);
    if (
      commission.uid.toString() !== reportedBy &&
      commission.aid.toString() !== reportedBy
    ) {
      throw "User must be involved in the commission to report it";
    }
  }
  const report = {
    reportedBy: new ObjectId(reportedBy),
    reportedUser: new ObjectId(reportedUser),
    subject,
    description,
    status: "Pending",
    createdAt: new Date(),
    comments: [],
    resolution: null,
    deleted: false,
    commissionId: commissionId ? new ObjectId(commissionId) : null,
  };

  const reportCollection = await reports();
  const insertInfo = await reportCollection.insertOne(report);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Could not create report";
  }

  return { ...report, _id: insertInfo.insertedId };
};

export const getReportById = async (id) => {
  id = checkId(id);
  const reportCollection = await reports();
  const report = await reportCollection.findOne({ _id: new ObjectId(id) });
  if (!report) throw "Report not found";
  return report;
};

export const getUserReports = async (userId) => {
  userId = checkId(userId);
  const reportCollection = await reports();
  return await reportCollection
    .find({
      $and: [
        {
          $or: [
            { reportedBy: new ObjectId(userId) },
            { reportedUser: new ObjectId(userId) },
          ],
        },
        { deleted: { $ne: true } },
      ],
    })
    .toArray();
};

export const updateReportStatus = async (id, status) => {
  id = checkId(id);
  if (!reportStatusValues.includes(status)) {
    throw `Status must be one of: ${reportStatusValues.join(", ")}`;
  }
  const reportCollection = await reports();

  // First check if the report exists and get its current status
  const currentReport = await getReportById(id);
  if (currentReport.status === status) {
    return currentReport; // Return existing report if status hasn't changed
  }

  const updateInfo = await reportCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );

  if (!updateInfo.matchedCount) throw "Report not found";
  if (!updateInfo.modifiedCount) throw "Status was not updated";

  return await getReportById(id);
};

export const addReportComment = async (id, userId, comment) => {
  id = checkId(id);
  userId = checkId(userId);
  comment = checkString(comment, "comment");

  const reportComment = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    comment,
    createdAt: new Date(),
  };

  const reportCollection = await reports();
  const updateInfo = await reportCollection.updateOne(
    { _id: new ObjectId(id) },
    { $push: { comments: reportComment } }
  );

  if (!updateInfo.matchedCount) throw "Report not found";
  if (!updateInfo.modifiedCount) throw "Comment was not added";

  return await getReportById(id);
};

export const resolveReport = async (id, resolution) => {
  id = checkId(id);
  resolution = checkString(resolution, "resolution");

  const reportCollection = await reports();
  const updateInfo = await reportCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "Resolved",
        resolution,
        resolvedAt: new Date(),
      },
    }
  );

  if (!updateInfo.matchedCount) throw "Report not found";
  if (!updateInfo.modifiedCount) throw "Resolution was not updated";

  return await getReportById(id);
};

export const getAllPendingReports = async () => {
  const reportCollection = await reports();
  return await reportCollection.find({ status: "Pending" }).toArray();
};

export const getAllReports = async () => {
  const reportCollection = await reports();
  return await reportCollection.find({}).sort({ createdAt: -1 }).toArray();
};
<<<<<<< HEAD
=======

/**
 * Delete a report from the database
 * @param {string} id The ID of the report to delete
 * @param {string} userId The ID of the user attempting to delete the report
 * @returns {boolean} True if deletion was successful
 */
export const deleteReport = async (id, userId) => {
  id = checkId(id);
  userId = checkId(userId);

  // First get the report to verify permissions
  const report = await getReportById(id);
  // Only the report creator can delete the report
  if (report.reportedBy.toString() !== userId) {
    throw "Access denied: Only the creator of the report can delete it";
  }
  const reportCollection = await reports();
  const updateInfo = await reportCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { deleted: true } }
  );

  if (!updateInfo.matchedCount) throw "Report not found";
  if (!updateInfo.modifiedCount) throw "Could not mark report as deleted";

  return true;
};
>>>>>>> 1b55f2f5f63e934984a6515b119a67763928092a
