import { Router } from "express";
import { checkBio, checkId, checkImageUrl, checkTos } from "../helpers.js";
import {
  addPhotosToPortfolio,
  getArtistById,
  updateArtistProfile,
} from "../data/artists.js";
const router = Router();
import { roleMiddleware } from "../middleware.js";
import { commissions } from "../config/mongoCollection.js";
import { getUnreadCount, getUserMessages } from "../data/messages.js";
import { getUserById } from "../data/users.js";
import { getCommissionById } from "../data/commissions.js";

router
  .get("/", roleMiddleware(["artist"]), async (req, res) => {
    try {
      const artist = await getArtistById(req.session.user._id);
      console.log("Artist data in dashboard:", JSON.stringify(artist, null, 2));
      const commissionCollection = await commissions();
      const activeCommissions = await commissionCollection
        .find({
          aid: artist._id,
          status: { $in: ["Pending", "In Progress"] },
        })
        .toArray();
        const pastCommissions = await commissionCollection
        .find({
          aid: artist._id,
          status: { $in: ["Completed"] },
        })
        .toArray();

        const cancelledCommissions = await commissionCollection
        .find({
          aid: artist._id,
          status: { $in: ["Cancelled"] },
        })
        .toArray();

        let requestedCommissions = []; 
        for(const cid of artist.requestedCommissions) {
            requestedCommissions.push(await getCommissionById(cid));
        }
        //console.log("REQUESTED COMMISSIONS: ", requestedCommisions);
      // Get recent messages and user details
      const allMessages = await getUserMessages(req.session.user._id);
      const recentMessages = allMessages
        .filter(
          (msg) =>
            !msg.archived && msg.recipientId.toString() === req.session.user._id
        )
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);

      for (let message of recentMessages) {
        const [sender, recipient] = await Promise.all([
          getUserById(message.senderId.toString()),
          getUserById(message.recipientId.toString()),
        ]);
        message.sender = sender;
        message.recipient = recipient;
      }

      const unreadCount = await getUnreadCount(req.session.user._id);

      return res.render("artistDashboard", {
        pageTitle: "Artist Dashboard",
        headerTitle: "Artist Dashboard",
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
          { link: "/messages", text: "Messages" },
          { link: "/signout", text: "Sign Out" },
        ],
        artist: artist,
        commissions: activeCommissions,
        pastCommissions,
        cancelledCommissions,
        recentMessages,
        requestedCommissions,
        unreadCount
      });
    } catch (e) {
      return res.status(500).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        errorMessage: e.toString(),
        navLink: [{ link: "/", text: "Home" }],
      });
    }
  })
  .post("/", async (req, res) => {
    console.log("BODY: ", req.body);

    let aid = req.session.user._id;

    let imageUrls;
    let artistProfile;
    let updatingPortfolio = false;
    let adding;

    try {
      aid = checkId(aid);
      if (req.body.imgUrls) {
        updatingPortfolio = true;
        adding = true;
        imageUrls = req.body.imgUrls;
        for (let i = 0; i < imageUrls.length; i++) {
          imageUrls[i] = checkImageUrl(imageUrls[i]);
        }
      } else if (req.body.imageUrl) {
        updatingPortfolio = true;
        adding = false;
        req.body.imageUrl = checkImageUrl(req.body.imageUrl);
      } else {
        req.body.bio = checkBio(req.body.bio);
        req.body.tos = checkTos(req.body.tos);
        if (req.body.availability) req.body.availability = true;
        else req.body.availability = false;
      }
    } catch (e) {
      return res.status(400).render("error", {
        pageTitle: "Error",
        headerTitle: "Error: ",
        errorMessage: e.toString(),
        navLink: [{ link: "/", text: "Home" }],
      });
    }
    let artist;
    try {
      if (updatingPortfolio && adding) {
        artist = await addPhotosToPortfolio(aid, imageUrls);
        return res.redirect("/dashboard/artist");
      } else if (updatingPortfolio && !adding) {
        artist = await getArtistById(aid);
        let portfolio = artist.artistProfile.portfolio;
        let index = portfolio.indexOf(req.body.imageUrl);
        if (index === -1)
          throw "Error: image being removed does not exist in portfolio";
        portfolio.splice(index, 1);
        console.log("portfolio: ", portfolio);
        await updateArtistProfile(aid, { portfolio });
        return res.redirect("/dashboard/artist");
      } else {
        await updateArtistProfile(aid, {
          bio: req.body.bio,
          tos: req.body.tos,
          availability: req.body.availability,
        });
        return res.redirect("/dashboard/artist");
      }
    } catch (e) {
      return res.status(500).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        errorMessage: e.toString(),
        navLink: [{ link: "/", text: "Home" }],
      });
    }
  });

export default router;
