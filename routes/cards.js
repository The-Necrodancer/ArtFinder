import { Router } from "express";
import {
  createCard,
  getAllCards,
  getCardById,
  getNewestCards,
} from "../data/cards.js";
import { userMiddleware } from "../middleware.js";

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
      error: e.toString(),
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
      error: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Create new card
router.post("/", userMiddleware, async (req, res) => {
  try {
    const { name, socialsLinks, portfolio, tags, isUserRecommended } = req.body;
    const card = await createCard(
      name,
      socialsLinks,
      portfolio,
      tags,
      isUserRecommended,
      req.session.user._id
    );
    res.redirect(`/cards/${card._id}`);
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
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
      error: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

<<<<<<< HEAD
// Create a new card
router.post("/", /*ensureAuthenticated,*/ async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;

        // Create the card
        const card = await createCard(title, description, imageUrl);

        // For testing purposes
        return res.status(400).json(card);

        // Redirect to the card page after creation
    } catch (e) {
        // Throw for testing purposes
        return res.status(404).json(e);
    }
});

export default router;


=======
export default router;
>>>>>>> 7aa9146e55ffd2a5ad1233b91996883784987e10
