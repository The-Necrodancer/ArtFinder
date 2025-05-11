import { Router } from "express";
import { signoutMiddleware } from "../middleware.js";
const router = Router();

router.route("/").get(signoutMiddleware, async (req, res) => {
  try {
    if (req.session) {
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
    } else {
      res.redirect("/login");
    }
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
