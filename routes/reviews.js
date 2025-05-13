import { Router } from "express";
import { createReview, getReviewsByArtistId } from "../data/reviews.js";
// import { get } from "lodash";
import { checkRating } from "../helpers.js"
import { getCommissionById } from "../data/commissions.js";
import { getArtistById } from "../data/artists.js";

const router = Router();

// Ensure user is logged in to post a review
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

// Get all reviews
// User does not need to be logged in to view reviews
/*
router.get("/", async (req, res) => {
    try {
        const reviews = await getAllReviews();
        res.render("reviews", {
            pageTitle: "All Reviews",
            headerTitle: "All Reviews",
            reviews,
            navLink: [{ link: "/", text: "Home" }],
        });
    }
    catch (e) {
        res.status(500).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
            navLink: [{ link: "/", text: "Home" }],
          });
    }
})
*/
/*
router.get("/artist/:artistId", async (req, res) => {
    try {
        const artistId = req.params.artistId;
        const artist = await getArtistById(artistId);
        const reviews = await getReviewsByArtistId(artistId);

        if (!reviews) {
            throw new Error("No reviews found for this artist.");
        }

        res.render("reviews", {
            pageTitle: `Reviews for ${artist.username}`,
            headerTitle: `Reviews for ${artist.username}`,
            artist,
            reviews,
        });
    } catch (e) {
        console.log("Error fetching artist reviews:", e);
        res.status(500).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
            navLink: [{ link: "/", text: "Home" }],
        });
    }
});
*/

router.post("/create", async (req, res) => {
    try {
        const { commissionId, rating, comment } = req.body;

        if (!commissionId || !rating || !comment) {
            throw new Error("All fields are required.");
        }

        // Validate and parse rating
        const checkedRating = checkRating(parseFloat(rating));

        // Create the review
        const review = await createReview(commissionId, checkedRating, comment);
        if (!review) {
            throw new Error("Review creation failed.");
        }

        // Get the artist ID from the commission
        const commission = await getCommissionById(commissionId);
        if (!commission) {
            throw new Error("Commission not found.");
        }

        // Redirect to the artist's reviews page
        res.redirect(`/artist/${commission.aid}`);
    } catch (e) {
        console.log("Error creating review:", e);
        res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
        });
    }
});


export default router;