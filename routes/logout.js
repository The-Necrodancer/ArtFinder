import { Router } from "express";
import { signoutMiddleware } from "../middleware.js";
const router = Router();

// Signout confirmation page
router.get("/signout", signoutMiddleware, async (req, res) => {
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

// Actual signout/logout route
router.get("/signout/confirm", signoutMiddleware, async (req, res) => {
  try {
    // First destroy the session
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Then clear the authentication cookie
    res.clearCookie("AuthenticationState");

    // Redirect to login page
    res.redirect("/login");
  } catch (e) {
    return res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: "An error occurred during sign out. Please try again.",
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Redirect /logout to /signout for consistency
router.get("/logout", (req, res) => {
  res.redirect("/signout");
});

export default router;
