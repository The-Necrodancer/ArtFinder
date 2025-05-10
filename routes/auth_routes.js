import { Router } from "express";
import {
  loginRedirectMiddleware,
  registerRedirectMiddleware,
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
