import { Router } from "express";
import {
  createReport,
  getReportById,
  updateReportStatus,
  addReportComment,
  resolveReport,
  getUserReports,
} from "../data/reports.js";
import { getUserById, getUserByUsername } from "../data/users.js";
import { getCommissionById } from "../data/commissions.js";

const router = Router();

import { userMiddleware, superuserMiddleware } from "../middleware.js";

// List reports for current user
router.get("/", userMiddleware, async (req, res) => {
  try {
    const reports = await getUserReports(req.session.user._id);
    return res.render("reports", {
      pageTitle: "My Reports",
      headerTitle: "My Reports",
      reports,
      navLink: [{ link: "/", text: "home" }],
    });
  } catch (e) {
    return res.status(400).render("reports", {
      pageTitle: "My Reports",
      headerTitle: "My Reports",
      error: e.toString(),
    });
  }
});

// Show report/dispute creation form
router.get("/new", userMiddleware, async (req, res) => {
  const { commissionId } = req.query;
  try {
    let commission = null;
    let reportedUser = null;

    if (commissionId) {
      commission = await getCommissionById(commissionId);
      // Set the reported user as the other party in the commission
      reportedUser =
        commission.uid.toString() === req.session.user._id
          ? await getUserById(commission.aid)
          : await getUserById(commission.uid);
    }

    return res.render("submitReport", {
      pageTitle: commissionId ? "Submit Commission Dispute" : "Submit Report",
      headerTitle: commissionId ? "Submit Commission Dispute" : "Submit Report",
      commission,
      reportedUser,
      navLink: [{ link: "/", text: "home" }],
    });
  } catch (e) {
    return res.status(400).render("submitReport", {
      pageTitle: "Submit Report",
      headerTitle: "Submit Report",
      error: e.toString(),
    });
  }
});

// Create new report/dispute
router.post("/", userMiddleware, async (req, res) => {
  try {
    const { reportedUsername, subject, description, commissionId } = req.body;

    // Get the reported user's ID from their username
    const reportedUser = await getUserByUsername(reportedUsername);

    const report = await createReport(
      req.session.user._id,
      reportedUser._id,
      subject,
      description,
      commissionId
    );

    return res.redirect(`/reports/${report._id}`);
  } catch (e) {
    return res.status(400).render("submitReport", {
      pageTitle: "Submit Report",
      headerTitle: "Submit Report",
      hasError: true,
      error: e.toString(),
      navLink: [{ link: "/", text: "home" }],
    });
  }
});

// View report details
router.get("/:id", userMiddleware, async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    const reportedUser = await getUserById(report.reportedUser.toString());
    const reporter = await getUserById(report.reportedBy.toString());

    // Check if user is involved in the report or is an admin
    if (
      report.reportedBy.toString() !== req.session.user._id &&
      report.reportedUser.toString() !== req.session.user._id &&
      req.session.user.role !== "admin"
    ) {
      throw "Access denied";
    }

    let commission = null;
    if (report.commissionId) {
      commission = await getCommissionById(report.commissionId.toString());
    }

    res.render("reportDetails", {
      pageTitle: "Report Details",
      headerTitle: "Report Details",
      report,
      reportedUser,
      reporter,
      commission,
      isAdmin: req.session.user.role === "admin",
      navLink: [{ link: "/", text: "home" }],
    });
  } catch (e) {
    res.status(404).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Add comment to report
router.post("/:id/comment", userMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    await addReportComment(req.params.id, req.session.user._id, comment);
    res.redirect(`/reports/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Update report status (admin only)
router.post("/:id/status", superuserMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await updateReportStatus(req.params.id, status);
    res.redirect(`/reports/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Resolve report (admin only)
router.post("/:id/resolve", userMiddleware, async (req, res) => {
  try {
    if (req.session.user.role !== "admin") {
      throw "Only administrators can resolve reports";
    }
    const { resolution } = req.body;
    await resolveReport(req.params.id, resolution);
    res.redirect(`/reports/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

export default router;
