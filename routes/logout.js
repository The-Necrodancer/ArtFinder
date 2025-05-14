import { Router } from "express";
import { signoutMiddleware } from "../middleware.js";
const router = Router();

// Signout confirmation page
router.route("/signout").get(signoutMiddleware, async (req, res) => {
  try {
    return res.render("signout", {
      pageTitle: "Sign Out",
      headerTitle: "Sign Out of ArtFinder",
      navLink: [
        { link: "/", text: "Home" },
        { link: `/dashboard/${req.session.user.role}`, text: "Dashboard" },
      ],
    });
  } catch (e) {
    return res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: "Could not load signout page",
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Actual logout route
router.route("/logout").get(signoutMiddleware, async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).render("error", {
          pageTitle: "Error",
          headerTitle: "Error",
          error: "Could not log out. Please try again.",
          navLink: [{ link: "/", text: "Home" }],
        });
      }
      res.clearCookie("AuthenticationState");
      res.redirect("/login");
    });
  } catch (e) {
    return res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: "An error occurred during logout. Please try again.",
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

export default router;
