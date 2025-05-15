import { Router } from "express";
import { createCommission, getCommissionById, updateCommissionStatus } from "../data/commissions.js";
import { getArtistById } from "../data/artists.js";
const router = Router();

import xss from "xss";
import { checkId } from "../helpers.js";

const statusValues = [
    "Pending", 
    "In Progress", 
    "Completed", 
    "Cancelled"
];

// Middleware to check if user is logged in
/*const ensureAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).render("login", {
        pageTitle: "Login Required",
        headerTitle: "Login Required",
        errorMessage: "You must be logged in to access this page",
      });
    }
    next();
};*/

// Request
    

// GET route to render the commission request form
// Ensure user is logged in to view the form.
router.get("/request/:artistId", /*ensureAuthenticated,*/ async (req, res) => {
    let artistId; 
    let artist; 
    
    try {
        artistId = req.params.artistId; 
        artist = await getArtistById(artistId); 
    } catch (e) {
        if(typeof e === 'string' && (e == "Error: user is not an artist" || e == "Error: user not found."))
            return res.status(404).render("error", {
                pageTitle: "Error",
                headerTitle: "Error",
                errorMessage: e
            });
        if(typeof e === 'string' && e == "Error: invalid object ID") 
            return res.status(400).render("error", {
                pageTitle: "Error",
                headerTitle: "Error",
                errorMessage: e
            });
        return res.status(500).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            errorMessage: String(e)
        });
    }

    try {
        // console.log("Artist ID:", req.params.artistId);
        if(req.session.user._id === artistId) {
            return res.status(403).render("error", {errorMessage: "You cannot request a commmission for yourself."});
        }
        res.render("commission", { 
            pageTitle: "Request Commission",
            headerTitle: "Request Commission",
            navLink: [
                { link: "/", text: "Home" },
                { link: "/browse", text: "Browse" },
                { link: "/blogs", text: "DevLog" },
            ],
            artist 
        });
    } catch (e) {
        console.log("Error rendering commission form:", e);
        return res.status(500).render("error", {errorMessage: e.toString()});
    }
});

// POST route to handle commission request submission
router.post("/request", async (req, res) => {
    let cleanedArtistId; 
    let cleanedTitle; 
    let cleanedDetails; 
    let cleanedPrice; 
    let artist; 

    try {
        console.log("A")
        cleanedArtistId = xss(req.body.artistId);
        cleanedTitle = xss(req.body.title);
        cleanedDetails = xss(req.body.details);
        cleanedPrice = xss(req.body.price);
        if (!cleanedTitle || !cleanedDetails || !cleanedPrice) {
            console.log("A");
            throw `All fields are required.`;
        }
    } catch (e) {
        console.log(e);
        return res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            navLink: [
                { link: "/", text: "Home" },
                { link: "/browse", text: "Browse" },
                { link: "/blogs", text: "DevLog" },
            ],
            errorMessage: String(e)
        });
    }
    

    try {
        console.log("B")
        artist = await getArtistById(cleanedArtistId);
    } catch (e) {
        console.log(cleanedArtistId);
        if(typeof e === 'string' && (e == "Error: user is not an artist" || e == "Error: user not found."))
            return res.status(404).render("error", {
                pageTitle: "Error",
                headerTitle: "Error",
                errorMessage: e
            });
        if(typeof e === 'string' && e == "Error: invalid object ID") 
            return res.status(400).render("error", {
                pageTitle: "Error",
                headerTitle: "Error",
                errorMessage: e
            });
        return res.status(500).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            errorMessage: String(e)
        });
    }
    let priceNum;
    try {
        console.log("C")
        cleanedTitle = cleanedTitle.trim(); 
        console.log("C1")
        cleanedDetails = cleanedDetails.trim(); 
        console.log("C2")
        if(cleanedTitle.length < 5 || cleanedTitle.length > 128) throw "Error: title must be between 5 and 128 characters"; 
        console.log("C3")
        if(cleanedDetails.length < 32 || cleanedDetails.length > 1024) throw "Error: details must be between 32 and 1024 characters"; 
        console.log("C4")
        priceNum = parseFloat(cleanedPrice);
        if(isNaN(priceNum)) throw "Error: price must be a number.";
        if(priceNum<3 || priceNum > 150) throw "Error: price must be between 3 and 150 dollars";
    } catch (e) {
        return res.render("commission", { 
            pageTitle: "Request Commission",
            headerTitle: "Request Commission",
            navLink: [
                { link: "/", text: "Home" },
                { link: "/browse", text: "Browse" },
                { link: "/blogs", text: "DevLog" },
            ],
            artist, 
            hasError: true,
            errorMessage: e.toString()
        });
    }

    try {
        console.log("F")
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
        console.log("Z")
        return res.redirect(`/commission/${commission._id}`);
    } catch (e) {
        console.log("Error creating commission:", e);
        return res.status(500).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            errorMessage: String(e),
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
        let isArtist = req.session.user.role === 'artist';
        //aid, uid
        if(!((isArtist && req.session.user._id === commission.aid) || (req.session.user._id === commission.uid)))
            return res.status(401).render("login", {
                pageTitle: "Login Required",
                headerTitle: "Login Required",
                errorMessage: "You must be logged in to access this page",
                navLink: [{ link: "/", text: "Home" }],
            });

        // Render the commission.handlebars view with the commission data
        return res.render("commission", {
            commission,
            isArtist, 
            pageTitle: "View Commission",
            headerTitle: "View Commission",
            navLink: [
                { link: "/", text: "Home" },
                { link: "/browse", text: "Browse" },
                { link: "/blogs", text: "DevLog" },
            ],
            user: req.session.user, // Pass the logged-in user for conditional rendering
        });
    } catch (e) {
        console.log("Error viewing commission:", e);
        return res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            errorMessage: e.toString(),
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
        console.log("L")
        if (!cleanedCommissionId || !cleanedStatus) {
            throw `All fields are required.`;
        }
        if(!statusValues.includes(cleanedStatus))
            throw `${cleanedStatus} is not a valid status.`;
        console.log("M")
        let commission = await getCommissionById(cleanedCommissionId); 
        if(req.session.user._id === commission.uid) {
            if(cleanedStatus !== 'Cancelled') throw "Error: users can only cancel commissions."; 
        console.log("N")
        } else if (req.session.user._id !== commission.aid) {
            return res.status(403).render("error", {
                pageTitle: "Access Denied",
                headerTitle: "Access Denied",
                errorMessage: "You do not have permission to view this page",
                navLink: [
                { link: "/", text: "Home" },
                { link: `/dashboard/${req.session.user.role}`, text: "Dashboard" },
                ],
            });
        }
        console.log("O")
        // Update the commission status
        await updateCommissionStatus(cleanedCommissionId, cleanedStatus);

        // Redirect to the commission page after updating status
        res.redirect(`/commission/${cleanedCommissionId}`);
    } catch (e) {
        console.log("Error updating commission status:", e);
        return res.status(400).render("error", {
            pageTitle: "Error",
            headerTitle: "Error",
            errorMessage: e.toString(),
        });
    }
})

export default router;