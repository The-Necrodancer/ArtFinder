import { Router } from "express";
import { getCardsByRating } from "../data/cards.js";
import { userMiddleware } from "../middleware.js";
import { checkCardList } from "../helpers.js";
const router = Router(); 

router
.get("/", userMiddleware, async (req, res) => {
    let featuredCards; 
    if(req.body.cardList) 
        featuredCards = checkCardList(req.body.cardList);
     else 
        featuredCards = await getCardsByRating();
    featuredCards = featuredCards.slice(0, 50);
    featuredCards.forEach((elem) => {
        if (Array.isArray(elem.socialsLinks)) {
        elem.socialsLinks = elem.socialsLinks.map((linkObj) => linkObj.url || linkObj);
        }
        res.render("browse", {
            pageTitle: "Browse Artists",
            headerTitle: "Browse Artists",
            navLink: [
            { link: "/", text: "Home" },
            { link: "/cards/create", text: "Add Artist" },
            ],
            cards: featuredCards,
            possibleTagsList: possibleTagsList
        });
    });   
})
.post("/", userMiddleware, async(req, res) => {
    console.log(req.body)
});

export default router; 