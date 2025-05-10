import { getArtistById } from "../data/artists.js";
import registerRoutes from "./register.js";
import loginRoutes from "./login.js";
import reportRoutes from "./reports.js";
import { commissions } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";
import {
  userMiddleware,
  superuserMiddleware,
  roleMiddleware,
} from "../middleware.js";
import { getUserMessages, getUnreadCount } from "../data/messages.js";
import { getUserById } from "../data/users.js";

import commissionRoutes from "./commissions.js";
import cardRoutes from "./cards.js";
import reviewRoutes from "./reviews.js";

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    let renderObj = {
      pageTitle: "ArtFinder - Find The Artist For You!",
      headerTitle: "ArtFinder",
      navLink: [
        { link: "/login", text: "Log In" },
        { link: "/register", text: "Register" },
      ],
    };
    if (req.session && req.session.user) {
      renderObj.navLink = [
        { link: "/", text: "Home" },
        { link: "/browse", text: "Browse Artists" },
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
  // Dashboard routes with role-based middleware
  app.get("/dashboard/admin", roleMiddleware(["admin"]), async (req, res) => {
    return res.render("adminDashboard", {
      pageTitle: "Admin Dashboard",
      headerTitle: "Admin Dashboard",
      navLink: [
        { link: "/", text: "Home" },
        { link: "/reports", text: "Reports" },
      ],
    });
  });

  app.get("/dashboard/artist", roleMiddleware(["artist"]), async (req, res) => {
    try {
      const artist = await getArtistById(req.session.user._id);
      const commissionCollection = await commissions();
      const activeCommissions = await commissionCollection
        .find({
          aid: new ObjectId(artist._id),
          status: { $in: ["Pending", "In Progress"] },
        })
        .toArray();

      // Get recent messages and user details
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

      return res.render("artistDashboard", {
        pageTitle: "Artist Dashboard",
        headerTitle: "Artist Dashboard",
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
          { link: "/messages", text: "Messages" },
        ],
        artist: artist,
        commissions: activeCommissions,
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

  app.get("/dashboard/user", roleMiddleware(["user"]), async (req, res) => {
    try {
      const commissionCollection = await commissions();
      const activeCommissions = await commissionCollection
        .find({
          uid: new ObjectId(req.session.user._id),
          status: { $in: ["Pending", "In Progress", "Completed"] },
        })
        .toArray();

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

  app.use("/register", registerRoutes);
  app.use("/login", loginRoutes);
  app.use("/reports", reportRoutes);

  // Commission, Card, and Review routes
  //app.use("/commissions", commissionRoutes);
  //app.use("/cards", cardRoutes);
  //app.use("/reviews", reviewRoutes);

app.get("/browse", userMiddleware, async (req, res) => {
    const { query, style } = req.query;
    res.render("browse", {
      pageTitle: "Browse Artists",
      headerTitle: "Browse Artists",
      navLink: [
        { link: "/", text: "home" },
        { link: "/add", text: "Add artist" },
      ],
    });
  });

  app.get("/artist/:id", async (req, res) => {
    let artist;
    try {
      artist = await getArtistById(req.params.id);
    } catch (e) {
      return res.status(400).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        navLink: [
          { link: "/", text: "home" },
          { link: "/add", text: "Add artist" },
        ],
      });
    }
    let toRender = {
      pageTitle: `${artist.username}'s Profile`,
      headerTitle: `${artist.username}'s Profile`,
      navLink: [
        { link: "/", text: "Home" },
        { link: "/browse", text: "Browse Artists" },
        { link: "/add", text: "Add artist" },
      ],
      artist,
      isArtist: false,
    };
    if (req.session && req.session.user._id === artist._id)
      toRender.isArtist = true;
    return res.render("artistProfile", toRender);
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
};

export default constructorMethod;
