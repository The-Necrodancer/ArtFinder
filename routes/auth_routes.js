import { Router } from "express";
import {
  loginRedirectMiddleware,
  registerRedirectMiddleware,
  signoutMiddleware,
} from "../middleware.js";
const router = Router();

router.route("/").get(async (req, res) => {
  res.redirect("/login");
});

router
  .route("/register")
  .get(registerRedirectMiddleware, async (req, res) => {
    res.render("register", {
      pageTitle: "Register",
      headerTitle: "Register",
      navLink: [{ link: "/", text: "Home" }],
    });
  })
  .post(registerRedirectMiddleware, async (req, res) => {
    // code here for POST
  });

router
  .route("/login")
  .get(loginRedirectMiddleware, async (req, res) => {
    res.render("login", {
      pageTitle: "Login",
      headerTitle: "Login",
      navLink: [{ link: "/", text: "Home" }],
    });
  })
  .post(async (req, res) => {
    // code here for POST
  });

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

// Export the router
export default router;
