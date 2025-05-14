import { Router } from "express";
import { getCardsByRating } from "../data/cards.js";
import { userMiddleware } from "../middleware.js";
import { checkCardList, getMinMaxPriceString } from "../helpers.js";
import { getAllArtists, possibleTagsList } from "../data/artists.js";
import { getUserById } from "../data/users.js";
import { ObjectId } from "mongodb";
const router = Router(); 

router
.get("/", userMiddleware, async (req, res) => {
    console.log(await getAllArtists());
    //console.log("TEST: ", await getUserById('68251032fcba73f9d09823df')); 
    let featuredCards; 
    if(req.body && req.body.cardList) 
        featuredCards = checkCardList(req.body.cardList);
     else 
        featuredCards = await getCardsByRating();
        featuredCards = featuredCards.slice(0, 50);
        featuredCards.forEach((elem) => {
        if (Array.isArray(elem.socialsLinks)) {
            elem.socialsLinks = elem.socialsLinks.map((linkObj) => linkObj.url || linkObj);
        }
        elem.priceRange = getMinMaxPriceString(elem);
    });  
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
})
.post("/", userMiddleware, async(req, res) => {

});

export default router; 