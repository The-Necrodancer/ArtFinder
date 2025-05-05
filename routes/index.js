import { getArtistById } from "../data/artists.js";
import registerRoutes from "./register.js";
import loginRoutes from "./login.js";

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    //const featuredArtists = await db.getFeaturedArtists(); // your DB call
    res.render("home", {
      pageTitle: 'ArtFinder - Find The Artist For You!', 
      headerTitle: 'ArtFinder', 
      navLink: [
        {link: "/login", text: 'Log In'}, 
        {lnk: "/register", text: 'Register'}
      ]
    });
  });

  app.use("/register", registerRoutes)

  app.use("/login", loginRoutes);

  app.get("/browse", async (req, res) => {
    const { query, style } = req.query;
    //const artists = await db.searchArtists(query, style);
    res.render("browse", {
      pageTitle: 'Browse Artists', 
      headerTitle: 'Browse Artists', 
      navLink: [
        {link: '/', text: 'home'}, 
        {link: '/add', text: 'Add artist'}
      ]
    });
  });

  app.get("/artist/:id", async (req, res) => {
    const artist = await getArtistById(req.params.id); // example DB query()
    res.render("artistProfile", { 
      artist 
    });
  });
}; 


export default constructorMethod; 