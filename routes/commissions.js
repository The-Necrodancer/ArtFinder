import { Router } from "express";
import { createCommission, updateCommissionStatus } from "../data/commissions.js";
const router = Router();

// Middleware to check if user is logged in
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

router.get("/", ensureAuthenticated, async (req, res) => { 

})

// Create a request
// Ensure user is logged in to create a commission.
// Can be either user, artist, or admin.
router.post("/", ensureAuthenticated, async (req, res) => {
    try {
        const { artistId, title, details, price } = req.body;
        const commission = await createCommission(
            artistId, 
            req.session.user._id, // User is requestor 
            title, 
            details, 
            price
        );

        // For testing purposes
        return res.status(400).json(commission);

        // Redirect to the commission page after creation...
        // return res.redirect(`/commissions/${commission._id}`);
    }
    catch (e) {
        return res.status(400).render("createCommission", {
            pageTitle: "Create Commission",
            headerTitle: "Create Commission",
            error: e.toString(),
        });
    }
})

// View a commission
// Ensure user is logged in to view a commission.
// Can only be either the user who made the request or the artist who accepted it.
router.get("/:id", /*ensureAuthenticated,*/ async (req, res) => {
    try {
        const commission = await getCommissionById(req.params.id);
        // Get the user who requested the commission
        const userClient = await getUserById(commission.uid.toString());
        // Get the artist who accepted the commission
        const artistMerchant = await getUserById(commission.aid.toString());

        // Check if the user or artist is logged in
        if (
            commission.uid.toString() !== req.session.user._id.toString() &&
            commission.aid.toString() !== req.session.user._id.toString()
        ) {
            throw "Access denied."
        }
        
        // REMINDER: Render the commission page with the commission details
        return res.render("commission", {
            pageTitle: "Commission Details",
            headerTitle: "Commission Details",
            commission,
            userClient,
            artistMerchant,
            status,
            navLink: [
                { link: "/", text: "home" },
                { link: "/browse", text: "Browse Artists" },
                { link: "/add", text: "Add artist" },
            ],
        });
    }
    catch (e) {

    }
})

// Update commission status
// Ensure user is logged in
// Can only be the artist who accepted the commission (or admin, possibly)
router.post("/:id/status", ensureAuthenticated, async (req, res) => {
    try {
        if (req.session.user.role !== "artist") {
            throw "Only artists can update commission status!";
            /*return res.status(403).render("error", {
                pageTitle: "Forbidden",
                headerTitle: "Forbidden",
                error: "You do not have permission to access this page",
            });*/
        }
        const { status } = req.body;

    }
    catch (e) {
        return res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            error: e.toString(),
        });
    }
    
})