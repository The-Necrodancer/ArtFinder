import { Router } from "express";
import {
  createReport,
  getReportById,
  updateReportStatus,
  addReportComment,
  resolveReport,
  getUserReports,
  getAllReports,
  deleteReport,
} from "../data/reports.js";
import { getUserById, getUserByUsername } from "../data/users.js";
import { getCommissionById } from "../data/commissions.js";
import xss from "xss";

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
      navLink: [{ link: "/", text: "Home" }],
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
      const cleanedCommissionId = xss(commissionId); // Sanitize commissionId
      commission = await getCommissionById(cleanedCommissionId);

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
      navLink: [{ link: "/", text: "Home" }],
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

    // Sanitize inputs
    const cleanedReportedUsername = xss(reportedUsername);
    const cleanedSubject = xss(subject);
    const cleanedDescription = xss(description);
    const cleanedCommissionId = commissionId ? xss(commissionId) : null;

    // Get the reported user's ID from their username
    const reportedUser = await getUserByUsername(cleanedReportedUsername);

    const report = await createReport(
      req.session.user._id,
      reportedUser._id,
      cleanedSubject,
      cleanedDescription,
      cleanedCommissionId
    );

    return res.redirect(`/reports/${report._id}`);
  } catch (e) {
    return res.status(400).render("submitReport", {
      pageTitle: "Submit Report",
      headerTitle: "Submit Report",
      hasError: true,
      error: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
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
    } // Create nav links array
    const navLinks = [{ link: "/", text: "Home" }];

    // Add admin dashboard link for admin users
    if (req.session.user.role === "admin") {
      navLinks.push({ link: "/dashboard/admin", text: "Admin Dashboard" });
    } // Log values to verify what we're passing
    console.log("Report creator:", report.reportedBy.toString());
    console.log("Current user:", req.session.user._id.toString());
    console.log(
      "Are they equal?",
      report.reportedBy.toString() === req.session.user._id.toString()
    );

    res.render("reportDetails", {
      pageTitle: "Report Details",
      headerTitle: "Report Details",
      report,
      reportedUser,
      reporter,
      commission,
      isAdmin: req.session.user.role === "admin",
      currentUserId: req.session.user._id.toString(),
      reportCreatorId: report.reportedBy.toString(),
      navLink: navLinks,
    });
  } catch (e) {
    return res.status(404).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
      navLink: [{ link: "/reports", text: "Back to Reports" }],
    });
  }
});

// Add comment to report
router.post("/:id/comment", userMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;

    // Sanitize input
    const cleanedComment = xss(comment);

    await addReportComment(req.params.id, req.session.user._id, cleanedComment);

    if (req.headers["content-type"] === "application/json") {
      return res.json({
        success: true,
        username: req.session.user.username,
      });
    }

    res.redirect(`/reports/${req.params.id}`);
  } catch (e) {
    if (req.headers["content-type"] === "application/json") {
      return res.status(500).json({ error: e.toString() });
    }
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
      navLink: [{ link: `/reports/${req.params.id}`, text: "Back to Report" }],
    });
  }
});

// Update report status (admin only)
router.post("/:id/status", superuserMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    // Sanitize input
    const cleanedStatus = xss(status);

    await updateReportStatus(req.params.id, cleanedStatus);

    // If it's a JSON request (AJAX), send JSON response
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({ success: true });
    }

    // Otherwise redirect to admin dashboard
    res.redirect("/dashboard/admin");
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

    const cleanedResolution = xss(resolution);

    await resolveReport(req.params.id, cleanedResolution);
    res.redirect(`/reports/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Delete report (creator only)
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    await deleteReport(req.params.id, req.session.user._id);

    // If it's a JSON request (AJAX), send JSON response
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({ success: true });
    }

    // Otherwise redirect to reports list
    res.redirect("/reports");
  } catch (e) {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(403).json({ error: e.toString() });
    }
    res.status(403).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

export default router;
