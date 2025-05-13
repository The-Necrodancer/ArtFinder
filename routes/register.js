import { Router } from "express";
import { validateReigsterForm } from "../public/js/form_validate.js";
import { createUser } from "../data/users.js";
const router = Router();
import { registerRedirectMiddleware } from "../middleware.js";

const pageTitle = "Create an ArtFinder Account";
const headerTitle = "Create an Account";
const navLink = [{ link: "/", text: "Home" }];

router
  .route("/")
  .get(registerRedirectMiddleware, async (req, res) => {
    return res.render("register", {
      pageTitle,
      headerTitle,
      navLink,
    });
  })
  .post(registerRedirectMiddleware, async (req, res) => {
    let registerRetVal;
    let role;
    try {
      validateReigsterForm(
        req.body.username_input,
        req.body.email_input,
        req.body.password_input,
        req.body.confirm_password_input,
        req.body.is_artist_input
      );
      role = req.body.is_artist_input === "Yes" ? "artist" : "user";
      registerRetVal = await createUser(
        role,
        req.body.username_input,
        req.body.email_input,
        req.body.password_input
      );
    } catch (e) {
      return res.status(400).render("register", {
        pageTitle,
        headerTitle,
        navLink,
        hasError: true,
        loginError: e || e.message,
      });
    }

    if (registerRetVal) {
      return res.redirect("/login");
    }
    return res.status(500).render("register", {
      pageTitle,
      headerTitle,
      navLink,
      hasError: true,
      loginError: e || e.message,
    });
  });

export default router;
