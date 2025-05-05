import { getArtistById } from "../data/artists.js";
import registerRoutes from "./register.js";
import loginRoutes from "./login.js";
import reportRoutes from "./reports.js";

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    //const featuredArtists = await db.getFeaturedArtists(); // your DB call
    res.render("home", {
      pageTitle: "ArtFinder - Find The Artist For You!",
      headerTitle: "ArtFinder",
      navLink: [
        { link: "/login", text: "Log In" },
        { link: "/register", text: "Register" },
        { link: "/reports", text: "My Reports" },
      ],
    });
  });

  app.use("/register", registerRoutes);
  app.use("/login", loginRoutes);
  app.use("/reports", reportRoutes);

  app.get("/browse", async (req, res) => {
    const { query, style } = req.query;
    //const artists = await db.searchArtists(query, style);
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
      //what status to use here?
      return res.status(400).render('error', {
        pageTitle: 'Error', 
        headerTitle: 'Error', 
        navLink: [
          {link: '/', text: 'home'}, 
          {link: '/add', text: 'Add artist'}
        ]
      });
    }
    let toRender = { 
      pageTitle: `$(artist.username)'s Profile`, 
      headerTitle: `$(artist.username)'s Profile`, 
      navLink: [
        {link: '/', text: 'Home'}, 
        {link: '/browse', text: 'Browse Artists'},
        {link: '/add', text: 'Add artist'}
      ], 
      artist, 
      isArtist: false
    }; 
    if(req.session && req.session.user._id === artist._id) 
      toRender.isArtist = true; 
    return res.render("artistProfile", toRender);
  });
}; 

export default constructorMethod;
