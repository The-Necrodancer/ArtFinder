import { Router } from "express";
import { createReview } from "../data/reviews.js";

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

// Lists all reviews for a certain artist
router.get("/", async (req, res) => {

});

// Create a new review
router.post("/", /*ensureAuthenticated,*/ async (req, res) => { 
    try {
        const { commissionId, rating, comment } = req.body;

        const review = await createReview(commissionId, rating, comment);

        // For testing purposes
        return res.status(400).json(review);

        // Redirect to the review page after creation
    } catch (e) {
        // Throw for testing purposes
        return res.status(404).json(e);
        /*
        return res.status(400).render("createReview", {
            pageTitle: "Create Review",
            headerTitle: "Create Review",
            error: e.toString(),
        });
        */
    }
});