import { getArtistById } from "../data/artists.js";
import registerRoutes from "./register.js";
import loginRoutes from "./login.js";
import reportRoutes from "./reports.js";
import { commissions } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";

const constructorMethod = (app) => {
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

  // Dashboard routes
  app.get("/dashboard/admin", ensureAuthenticated, async (req, res) => {
    if (req.session.user.role !== "admin") {
      return res.status(403).render("error", {
        pageTitle: "Access Denied",
        headerTitle: "Access Denied",
        error: "You must be an admin to access this page",
      });
    }
    return res.render("adminDashboard", {
      pageTitle: "Admin Dashboard",
      headerTitle: "Admin Dashboard",
      navLink: [
        { link: "/", text: "Home" },
        { link: "/reports", text: "Reports" },
      ],
    });
  });

  app.get("/dashboard/artist", ensureAuthenticated, async (req, res) => {
    if (req.session.user.role !== "artist") {
      return res.status(403).render("error", {
        pageTitle: "Access Denied",
        headerTitle: "Access Denied",
        error: "You must be an artist to access this page",
      });
    }

    try {
      const artist = await getArtistById(req.session.user._id);
      const commissionCollection = await commissions();
      const activeCommissions = await commissionCollection
        .find({
          aid: new ObjectId(artist._id),
          status: { $in: ["Pending", "In Progress"] },
        })
        .toArray();

      return res.render("artistDashboard", {
        pageTitle: "Artist Dashboard",
        headerTitle: "Artist Dashboard",
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
        ],
        artist: artist,
        commissions: activeCommissions,
      });
    } catch (e) {
      return res.status(500).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        error: e.toString(),
      });
    }
  });

  app.get("/dashboard/user", ensureAuthenticated, async (req, res) => {
    try {
      const commissionCollection = await commissions();
      const activeCommissions = await commissionCollection
        .find({
          uid: new ObjectId(req.session.user._id),
          status: { $in: ["Pending", "In Progress", "Completed"] },
        })
        .toArray();

      // For each commission, get the artist details
      for (let commission of activeCommissions) {
        const artist = await getArtistById(commission.aid);
        commission.artist = artist.username;
      }

      return res.render("userDashboard", {
        pageTitle: "My Dashboard",
        headerTitle: "My Dashboard",
        navLink: [
          { link: "/", text: "Home" },
          { link: "/browse", text: "Browse Artists" },
        ],
        user: req.session.user,
        activeCommissions: activeCommissions,
      });
    } catch (e) {
      return res.status(500).render("error", {
        pageTitle: "Error",
        headerTitle: "Error",
        error: e.toString(),
      });
    }
  });

  app.use("/register", registerRoutes);
  app.use("/login", loginRoutes);
  app.use("/reports", reportRoutes);

  app.get("/browse", async (req, res) => {
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
    ensureAuthenticated,
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
