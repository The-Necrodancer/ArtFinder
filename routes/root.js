import { Router } from "express";
const router = Router();

app.get("/", async (req, res) => {
  const featuredArtists = await db.getFeaturedArtists(); // your DB call
  res.render("home", { featuredArtists });
});

app.get("/browse", async (req, res) => {
  const { query, style } = req.query;
  const artists = await db.searchArtists(query, style);
  res.render("browse", { artists });
});

app.get("/artist/:id", async (req, res) => {
  const artist = await db.getArtistById(req.params.id); // example DB query
  res.render("artistProfile", { artist });
});
