import { getArtistById, possibleTagsList } from "../data/artists.js";
import registerRoutes from "./register.js";
import loginRoutes from "./login.js";
import reportRoutes from "./reports.js";
import { commissions } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";
import authRoutes from "./auth_routes.js";
import { userMiddleware, roleMiddleware } from "../middleware.js";
import { getUserMessages, getUnreadCount } from "../data/messages.js";
import { getAllReports } from "../data/reports.js";
import { getUserById } from "../data/users.js";
import cardRoutes from "./cards.js";
import blogRoutes from "./blogs.js";
import commentRoutes from "./comments.js";
import commissionRoutes from "./commissions.js";
import reviewRoutes from "./reviews.js";
import adminActionsRouter from "./admin_actions.js";
import apiRoutes from './api.js';
import artistDashboardRoutes from "./artistDashboard.js"
import browseRoutes from './browse.js'
import { getCardsByRating, getNewestCards } from "../data/cards.js";


const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    let renderObj = {
      pageTitle: "ArtFinder - Find The Artist For You!",
      headerTitle: "ArtFinder",
      navLink: [
        { link: "/login", text: "Log In" },
        { link: "/register", text: "Register" },
        { link: "/blogs", text: "DevLog" },
      ],
    };
    if (req.session && req.session.user) {
      renderObj.navLink = [
        { link: "/", text: "Home" },
        { link: "/browse", text: "Browse Artists" },
        { link: "/blogs", text: "DevLog" },
        { link: "/signout", text: "Sign Out" },
      ];
      if (req.session.user.role === "admin") {
        renderObj.navLink.push({
          link: "/dashboard/admin",
          text: "Admin Dashboard",
        });
      } else if (req.session.user.role === "artist") {
        renderObj.navLink.push({
          link: "/dashboard/artist",
          text: "Artist Dashboard",
        });
      } else {
        renderObj.navLink.push({
          link: "/dashboard/user",
          text: "My Dashboard",
        });
      }
      renderObj.navLink.push({ link: "/reports", text: "My Reports" });
    }
    res.render("home", renderObj);
  });

  
  app.use("/api", apiRoutes);
  app.use("/dashboard/artist", artistDashboardRoutes); 

  app.get("/dashboard/user", roleMiddleware(["user"]), async (req, res) => {
    try {
      const commissionCollection = await commissions();

      // NOTE: The uid is stored as a string on our database within commissions
      // MAKE SURE THAT THE UID IS A STRING
      const activeCommissions = await commissionCollection
        .find({
          // uid: new ObjectId(req.session.user._id),
          uid: req.session.user._id, // UID is stored as a string on our database within commissions
          status: { $in: ["Pending", "In Progress", "Completed"] },
        })
        .toArray();
      console.log("Active commissions:", activeCommissions);

      for (let commission of activeCommissions) {
        const artist = await getArtistById(commission.aid);
        commission.artist = artist.username;
      }

      const allMessages = await getUserMessages(req.session.user._id);
      const recentMessages = allMessages
        .filter((msg) => !msg.archived)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);

      for (let message of recentMessages) {
        message.sender = await getUserById(message.senderId.toString());
        message.recipient = await getUserById(message.recipientId.toString());
      }

      const unreadCount = await getUnreadCount(req.session.user._id);

      return res.render("userDashboard", {
        pageTitle: "My Dashboard",
        headerTitle: "My Dashboard",
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
          { link: "/messages", text: "Messages" },
          { link: "/signout", text: "Sign Out" },
        ],
        user: req.session.user,
        activeCommissions: activeCommissions,
        recentMessages,
        unreadCount,
      });
    } catch (e) {
      return res.status(500).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        error: e.toString(),
        navLink: [{ link: "/", text: "Home" }],
      });
    }
  });

  app.use("/dashboard/admin", adminActionsRouter);
  app.use("/register", registerRoutes);
  app.use("/login", loginRoutes);
  app.use("/reports", reportRoutes);

  // Commission, Card, and Review routes
  app.use("/commission", commissionRoutes);
  app.use("/cards", cardRoutes);
  app.use("/reviews", reviewRoutes);

  app.use("/blogs", blogRoutes);
  app.use("/comments", commentRoutes);

  //app.use("/", authRoutes); // This will handle both /signout and /logout routes
  app.use("/browse", browseRoutes);

  app.get("/search", userMiddleware, async (req, res) => {
    // Parse query parameters
    const {
      query = "",
      style = "",
      minPrice = 0,
      maxPrice = 1000,
      minRating = 0,
      maxRating = 5,
      available = ""
    } = req.query;

    // Build filters object for filterCards
    const filters = {};

    // Artist name search (if implemented in filterCards)
    if (query.trim()) {
      filters.name = query.trim();
    }

    // Style/tag filter
    if (style) {
      filters.tags = [style];
    }

    // Price range filter
    filters.priceRange = {
      min: Number(minPrice),
      max: Number(maxPrice)
    };

    // Rating filter
    filters.rating = {
      min: Number(minRating),
      max: Number(maxRating)
    };

    // Availability filter
    if (available === "true") filters.availability = true;
    else if (available === "false") filters.availability = false;

    // Get filtered cards
    let cards = [];
    try {
      cards = await filterCards(filters);
    } catch (e) {
      // handle error if needed
    }

    res.render("search", {
      pageTitle: "Search Artists",
      headerTitle: "Search Artists",
      navLink: [
        { link: "/", text: "Home" },
        { link: "/browse", text: "Browse Artists" }
      ],
      filters: {
        artist: query,
        style,
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        available
      },
      cards
    });
  });
  app.get("/artist/:id", async (req, res) => {
    let artist;
    try {
      artist = await getArtistById(req.params.id);
      if (!artist) {
        throw new Error("Artist not found");
      }
      console.log("Artist data:", JSON.stringify(artist, null, 2));
      let newPricingInfo = []; 
      for(const [key, value] of Object.entries(artist.artistProfile.pricingInfo)) {
        newPricingInfo.push({type: key, price: value});
      }
      artist.artistProfile.pricingInfo = newPricingInfo;
      console.log("NEW PRICING: " , newPricingInfo);
      let toRender = {
        pageTitle: `${artist.username}'s Profile`,
        headerTitle: `${artist.username}'s Profile`,
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
        ],
        artist: artist,
        user: req.session.user,
      };

      if (req.session && req.session.user) {
        toRender.navLink.push({ link: "/signout", text: "Sign Out" });
        if (req.session.user._id === artist._id) {
          toRender.isArtist = true;
        }
      }
      return res.render("artistprofile", toRender);
    } catch (e) {
      return res.status(404).render("error", {
        pageTitle: "Artist Not Found",
        headerTitle: "Artist Not Found",
        error: e.toString(),
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
        ],
      });
    }
  });
  app.post(
    "/commission/update-status",
    roleMiddleware(["artist"]),
    async (req, res) => {
      try {
        const { commissionId, status } = req.body;
        const commission = await getCommissionById(commissionId);

        // Only allow the artist of the commission to update status
        if (commission.aid.toString() !== req.session.user._id) {
          throw "Only the artist can update commission status";
        }

        await updateCommissionStatus(commissionId, status);

        res.redirect("/dashboard/artist");
      } catch (e) {
        res.status(400).render("error", {
          pageTitle: "Error",
          headerTitle: "Error",
          error: e.toString(),
        });
      }
    }
  );

  // Catch-all route for invalid paths
  app.use((req, res) => {
    res.status(404).render("error", {
      pageTitle: "404 - Page Not Found",
      headerTitle: "Page Not Found",
      error: "The page you are looking for does not exist.",
      navLink: [
        { link: "/", text: "Home" },
        { link: "/browse", text: "Browse Artists" },
      ],
    });
  });
};

export default constructorMethod;
