import { Router } from "express";
import { createCommission, getCommissionById, updateCommissionStatus } from "../data/commissions.js";
import { getArtistById } from "../data/artists.js";
const router = Router();

import xss from "xss";

// Middleware to check if user is logged in
/*const ensureAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).render("login", {
        pageTitle: "Login Required",
        headerTitle: "Login Required",
        error: "You must be logged in to access this page",
      });
    }
    next();
};*/

// Request

// GET route to render the commission request form
// Ensure user is logged in to view the form.
router.get("/request/:artistId", /*ensureAuthenticated,*/ async (req, res) => {
    try {
        // console.log("Artist ID:", req.params.artistId);

        const artistId = req.params.artistId;
        const artist = await getArtistById(artistId);
        res.render("commission", { artist });
    } catch (e) {
        console.log("Error rendering commission form:", e);
        res.status(500).render("error", {error: e.toString()});
    }
});

// POST route to handle commission request submission
router.post("/request", async (req, res) => {
    try {
        console.log(req.body);

        // Sanitize inputs
        const cleanedArtistId = xss(req.body.artistId);
        const cleanedTitle = xss(req.body.title);
        const cleanedDetails = xss(req.body.details);
        const cleanedPrice = xss(req.body.price);

        if (!cleanedTitle || !cleanedDetails || !cleanedPrice) {
            throw `All fields are required.`;
        }

        // Convert price to a number
        const priceNum = parseFloat(cleanedPrice);

        // Create a commission request
        const commission = await createCommission(
            cleanedArtistId,
            req.session.user._id,
            cleanedTitle,
            cleanedDetails,
            priceNum
        );

        console.log("Commission id:", commission._id);
        console.log("Commission created:", commission);

        // Redirect to the commission page after creation
        return res.redirect(`/commission/${commission._id}`);
    } catch (e) {
        console.log("Error creating commission:", e);
        res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
        });
    }
})

// GET route to view a commission
// Ensure user is logged in to view a commission.
router.get("/:id", async (req, res) => {
    try {
        const commissionId = req.params.id;
        const commission = await getCommissionById(commissionId);

        if (!commission) {
            throw `Commission not found with id: ${commissionId}`;
        }

        // Render the commission.handlebars view with the commission data
        res.render("commission", {
            commission,
            user: req.session.user, // Pass the logged-in user for conditional rendering
        });
    } catch (e) {
        console.log("Error viewing commission:", e);
        res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
        });
    }
});

// POST route to update commission status!
// Ensure user is logged in to update commission status.
router.post("/update-status", async (req, res) => {
    try {
        // Sanitize
        const cleanedCommissionId = xss(req.body.commissionId);
        const cleanedStatus = xss(req.body.status);

        if (!cleanedCommissionId || !cleanedStatus) {
            throw `All fields are required.`;
        }

        // Update the commission status
        await updateCommissionStatus(cleanedCommissionId, cleanedStatus);

        // Redirect to the commission page after updating status
        res.redirect(`/commission/${cleanedCommissionId}`);
    } catch (e) {
        console.log("Error updating commission status:", e);
        res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
        });
    }
})

export default router;