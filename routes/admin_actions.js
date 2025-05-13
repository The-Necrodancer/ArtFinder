import { Router } from "express";
import { getAllUsers, getUserById, updateUsername, updateUserRole, deleteUser } from "../data/users.js";
import { updateArtistProfile } from "../data/artists.js";
import { roleMiddleware } from "../middleware.js";
import { getAllReports } from "../data/reports.js";

const router = Router();

router.get("/", roleMiddleware(["admin"]), async (req, res) => {
  try {
    // User search logic
    let users = await getAllUsers();
    const { search = "" } = req.query;
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      users = users.filter(u => u.username.toLowerCase().includes(searchLower));
    }

    // Fetch reports and usernames for the reports section
    const reports = await getAllReports();
    const usernames = {};
    for (const report of reports) {
      if (!usernames[report.reportedBy]) {
        const user = await getUserById(report.reportedBy.toString());
        usernames[report.reportedBy] = user.username;
      }
      if (!usernames[report.reportedUser]) {
        const user = await getUserById(report.reportedUser.toString());
        usernames[report.reportedUser] = user.username;
      }
    }

    res.render("adminDashboard", {
      pageTitle: "Admin Dashboard",
      headerTitle: "Admin Dashboard",
      users,
      reports,
      usernames,
      search,
      user: req.session.user,
      navLink: [
        { link: "/", text: "Home" },
        { link: "/dashboard/admin", text: "Admin Dashboard" },
        { link: "/signout", text: "Sign Out" },
      ],
    });
  } catch (e) {
    res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Show update username form
router.get("/user/:id/edit-username", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.render("editUsername", { user });
  } catch (e) {
    res.status(404).render("error", { error: e.toString() });
  }
});

// Update username
router.post("/user/:id/edit-username", roleMiddleware(["admin"]), async (req, res) => {
  try {
    await updateUsername(req.params.id, req.body.newUsername);
    res.redirect("/dashboard/admin?search=" + encodeURIComponent(req.body.newUsername));
  } catch (e) {
    res.status(400).render("editUsername", { error: e.toString(), user: { _id: req.params.id, username: req.body.newUsername } });
  }
});

// Show update role form
router.get("/user/:id/edit-role", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.render("editUserRole", { user });
  } catch (e) {
    res.status(404).render("error", { error: e.toString() });
  }
});

// Update role
router.post("/user/:id/edit-role", roleMiddleware(["admin"]), async (req, res) => {
  try {
    await updateUserRole(req.params.id, req.body.newRole);
    res.redirect("/dashboard/admin?search=" + encodeURIComponent(req.body.newRole));
  } catch (e) {
    res.status(400).render("editUserRole", { error: e.toString(), user: { _id: req.params.id, role: req.body.newRole } });
  }
});

// Show update artist profile form
router.get("/user/:id/edit-artist", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (user.role !== "artist") throw "User is not an artist";
    res.render("editArtistProfile", { user });
  } catch (e) {
    res.status(404).render("error", { error: e.toString() });
  }
});

// Update artist profile
router.post("/user/:id/edit-artist", roleMiddleware(["admin"]), async (req, res) => {
  try {
    // Convert checkbox value to boolean
    req.body.availability = req.body.availability === "true";
    await updateArtistProfile(req.params.id, req.body);
    res.redirect("/dashboard/admin");
  } catch (e) {
    res.status(400).render("editArtistProfile", { error: e.toString(), user: { _id: req.params.id, ...req.body } });
  }
});

// Delete user
router.post("/user/:id/delete", roleMiddleware(["admin"]), async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.redirect("/dashboard/admin");
  } catch (e) {
    res.status(400).render("error", { error: e.toString() });
  }
});

export default router;