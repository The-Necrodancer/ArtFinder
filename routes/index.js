import { getArtistById } from "../data/artists.js";
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

  app.get("/dashboard/admin", roleMiddleware(["admin"]), async (req, res) => {
    try {
      const reports = await getAllReports();

      // Create a map of user IDs to usernames
      const usernames = {};
      for (const report of reports) {
        if (!usernames[report.reportedBy]) {
          const user = await getUserById(report.reportedBy.toString());
          usernames[report.reportedBy] = user.username;
        }
        if (!usernames[report.reportedUser]) {
          const user = await getUserById(report.reportedUser.toString());
          usernames[report.reportedUser] = user.username;
        }
      }

      return res.render("adminDashboard", {
        pageTitle: "Admin Dashboard",
        headerTitle: "Admin Dashboard",
        reports,
        usernames,
        navLink: [
          { link: "/", text: "Home" },
          { link: "/reports", text: "Reports" },
          { link: "/signout", text: "Sign Out" },
        ],
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

  app.get("/dashboard/artist", roleMiddleware(["artist"]), async (req, res) => {
    try {
      const artist = await getArtistById(req.session.user._id);
      const commissionCollection = await commissions();
      const activeCommissions = await commissionCollection
        .find({
          aid: artist._id,
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
          { link: "/signout", text: "Sign Out" },
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

  // Admin routes for user management
  app.get("/admin/users", roleMiddleware(["admin"]), async (req, res) => {
    try {
      const usersList = await getAllUsers();
      return res.render("adminDashboard", {
        pageTitle: "Admin Dashboard",
        headerTitle: "Admin Dashboard",
        users: usersList,
        navLink: [
          { link: "/", text: "Home" },
          { link: "/reports", text: "Reports" },
          { link: "/signout", text: "Sign Out" },
        ],
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

  // Update user status
  app.post(
    "/admin/user/:id/status",
    roleMiddleware(["admin"]),
    async (req, res) => {
      try {
        const { status } = req.body;
        const userId = req.params.id;
        await updateUserStatus(userId, status);

        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.json({ success: true });
        }
        return res.redirect("/admin/users");
      } catch (e) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({ error: e.toString() });
        }
        return res.status(400).render("error", {
          pageTitle: "Error",
          headerTitle: "Error",
          error: e.toString(),
        });
      }
    }
  );

  // Update user role
  app.post(
    "/admin/user/:id/role",
    roleMiddleware(["admin"]),
    async (req, res) => {
      try {
        const { role } = req.body;
        const userId = req.params.id;
        await updateUserRole(userId, role);

        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.json({ success: true });
        }
        return res.redirect("/admin/users");
      } catch (e) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({ error: e.toString() });
        }
        return res.status(400).render("error", {
          pageTitle: "Error",
          headerTitle: "Error",
          error: e.toString(),
        });
      }
    }
  );

  app.use("/register", registerRoutes);
  app.use("/login", loginRoutes);
  app.use("/reports", reportRoutes);

  // Commission, Card, and Review routes
  app.use("/commission", commissionRoutes);
  app.use("/cards", cardRoutes);
  //app.use("/reviews", reviewRoutes);

  app.use("/blogs", blogRoutes);
  app.use("/comments", commentRoutes);

  app.use("/", authRoutes); // This will handle both /signout and /logout routes
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
        { link: "/signout", text: "Sign Out" },
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
