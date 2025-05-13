import { Router } from "express";
import { createCommission, getCommissionById, updateCommissionStatus } from "../data/commissions.js";
import { getArtistById } from "../data/artists.js";
const router = Router();

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

        const { artistId, title, details, price } = req.body;
        //console.log("Artist ID:", artistId);
        //console.log("Title:", title);
        //console.log("Details:", details);
        //console.log("Price:", price);
        // Validate input
        if (!title || !details || !price) {
            throw new Error("All fields are required.");
        }

        // Note: price should be a number. This is a temporary fix.
        const priceNum = parseFloat(price);

        // Create a commission request
        const commission = await createCommission(artistId, req.session.user._id, title, details, priceNum);
        console.log("Commission id:", commission._id);
        console.log("Commission created:", commission);
        
        // Redirect to the commission page after creation...
        return res.redirect(`/commission/${commission._id}`);
    } catch (e) {
        // Idk if this is the right error
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

        if (!commission) { throw `Commission not found with id: ${commissionId}`; }

        res.render("commission", { commission, user: req.session.user });
    }
    catch (e) {
        console.log("Error viewing commission:", e);
        res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
        });
    }
});
export default router;