import { Router } from "express";
import {} from "../data/cards.js";
const router = Router();

// Ensure user is logged in to make a card.
const ensureAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).render("login", {
        pageTitle: "Login Required",
        headerTitle: "Login Required",
        error: "You must be logged in to access this page",
      });
    }
    next();
};

// Get the list of cards (either newest or all)
router.route("/")
.get(async (req, res) => {
    try {
      // const cards = await getAllCards();
      const cards = await getNewestCards();

      // Simple test to see if the cards are being returned correctly
      return res.status(400).json(cards);
      
      /*
      res.render("cards", {
        pageTitle: "Cards",
        headerTitle: "Cards",
        cards,
        navLink: [
          { link: "/", text: "home" },
          { link: "/add", text: "Add artist" },
        ],
      });
      */
    }
    catch (e) {
      // Handles an error in getting the cards (if not possible)

      // JSON for testing purposes
      return res.status(404).json(e);

      /*
      return res.status(400).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        error: e.toString(),
        navLink: [
          { link: "/", text: "home" },
          { link: "/add", text: "Add artist" },
        ],
      });
      */
    }
})

