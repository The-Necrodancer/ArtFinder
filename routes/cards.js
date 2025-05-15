import { Router } from "express";
import {
  createCard,
  getAllCards,
  getCardById,
  getNewestCards,
} from "../data/cards.js";
import { userMiddleware } from "../middleware.js";
import xss from "xss";

const router = Router();

// Get all cards
router.get("/", async (req, res) => {
  try {
    const cards = await getAllCards();
    res.render("cards", {
      pageTitle: "Artist Cards",
      headerTitle: "Artist Cards",
      cards,
      navLink: [{ link: "/", text: "Home" }],
    });
  } catch (e) {
    res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Get newest cards
router.get("/new", async (req, res) => {
  try {
    const cards = await getNewestCards();
    res.render("cards", {
      pageTitle: "Latest Artist Cards",
      headerTitle: "Latest Artist Cards",
      cards,
      navLink: [{ link: "/", text: "Home" }],
    });
  } catch (e) {
    res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Create a new card
// Ensure user is logged in to create a card
// GET - Shows the card creation form.
router.get("/create", /*userMiddleware,*/ async (req, res) => {
  try {
    res.render("cardCreation", {error : null});
  } catch (e) {
    res.status(500).render("error", {error: e.toString()});
  }
})

// Create a new card
// Ensure user is logged in to create a card
// POST - Handles the form submission for creating a new card.
router.post("/create", /*userMiddleware,*/ async (req, res) => {
  try {
    console.log(req.body);

    // Destructure inputs
    // const { name, socials, portfolio, tags } = req.body;
    const { name, socials, tags} = req.body;
    const tagsArray = JSON.parse(tags);
    console.log(tagsArray);
    console.log("tags:", typeof tagsArray);

    const cleanedName = xss(name);

    let cleanedSocials = [];
    if (Array.isArray(socials)) {
      for (let i = 0; i < socials.length; i++) {
        cleanedSocials.push(xss(socials[i]));
      }
    }
    /*
    let cleanedPortfolio = [];
    if (Array.isArray(portfolio)) {
      for (let i = 0; i < portfolio.length; i++) {
        cleanedPortfolio.push(xss(portfolio[i]));
      }
    }
    */
    let cleanedTags = [];
    if (Array.isArray(tags)) {
      for (let i = 0; i < tags.length; i++) {
        cleanedTags.push(xss(tags[i]));
      }
    }

    const socialLinks = Object.entries(cleanedSocials || {})
      .filter(([site, url]) => url.trim() !== "")
      .map(([site, url]) => ({
            site: xss(site), // Sanitize site name
        url: xss(url), // Sanitize URL
      }));

    // Create the card
    const isUserRecommended = true
    const card = await createCard(
      cleanedName,
      socialLinks,
      /*cleanedPortfolio,*/
      cleanedTags,
      isUserRecommended,
      req.session.user._id
    );

    // Redirect to the card details page after creation
    res.redirect(`/cards/${card._id}`);
  } catch (e) {
    console.log("Error creating card:", e);
    res.status(500).render("error", { errorMessage: e.toString() });
  }
})

// Get card by ID
router.get("/:id", async (req, res) => {
  try {
    const card = await getCardById(req.params.id);
    res.render("cardDetails", {
      pageTitle: card.name,
      headerTitle: card.name,
      card,
      navLink: [{ link: "/", text: "Home" }],
    });
  } catch (e) {
    res.status(404).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

export default router;
