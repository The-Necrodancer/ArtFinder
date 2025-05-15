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
router.get("/create", userMiddleware, async (req, res) => {
  try {
    res.render("cardCreation", { error: null });
  } catch (e) {
    res.status(500).render("error", { errorMessage: e.toString() });
  }
});

// Create a new card
// Ensure user is logged in to create a card
// POST - Handles the form submission for creating a new card.
router.post("/create", userMiddleware, async (req, res) => {
  try {
    console.log(req.body);

    const { name, socials, tags } = req.body;
    const tagsArray = JSON.parse(tags);

    const cleanedName = xss(name);
    let cleanedTags = [];
    if (Array.isArray(tagsArray)) {
      for (let i = 0; i < tagsArray.length; i++) {
        cleanedTags.push(xss(tagsArray[i]));
      }
    }

    const socialLinks = Object.entries(socials || {})
      .filter(([site, url]) => url.trim() !== "")
      .map(([site, url]) => ({
        site: xss(site),
        url: xss(url),
      }));

    console.log("socialLinks", socialLinks);
    console.log("Tags", cleanedTags);

    const isUserRecommended = true;
    const card = await createCard(
      cleanedName,
      socialLinks,
      cleanedTags,
      isUserRecommended,
      req.session.user._id
    );

    res.redirect(`/cards/${card}`);
  } catch (e) {
    console.log("Error creating card:", e);
    res.status(500).render("error", { errorMessage: e.toString() });
  }
});

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
