import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../data/blogs.js";
import { roleMiddleware } from "../middleware.js";
import xss from "xss";

const router = Router();

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await getAllBlogs();
    res.render("devlog", {
      pageTitle: "DevLog - ArtFinder Updates",
      headerTitle: "DevLog",
      blogs,
      isAdmin: req.session?.user?.role === "admin",
      navLink: [{ link: "/", text: "Home" }],
    });
  } catch (e) {
    res.status(500).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Get single blog post
router.get("/:id", async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id);
    res.render("blogPost", {
      pageTitle: blog.title,
      headerTitle: blog.title,
      blog,
      isAdmin: req.session?.user?.role === "admin",
      navLink: [
        { link: "/", text: "Home" },
        { link: "/blogs", text: "Back to DevLog" },
      ],
    });
  } catch (e) {
    res.status(404).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Create new blog post (admin only)
router.post("/", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { title, content } = req.body;

    // Sanitizing...
    const cleanedTitle = xss(title);
    const cleanedContent = xss(content);

    await createBlog(cleanedTitle, cleanedContent, req.session.user._id);
    res.redirect("/blogs");
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Update blog post (admin only)
router.post("/update/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      throw "Title and content are required";
    }

    // Sanitize inputs
    const cleanedBlogId = xss(req.params.id); // Sanitize blog ID
    const cleanedTitle = xss(title);
    const cleanedContent = xss(content);

    await updateBlog(cleanedBlogId, cleanedTitle, cleanedContent);
    return res.redirect("/blogs");
  } catch (e) {
    return res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

// Delete blog post (admin only)
router.post("/delete/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    await deleteBlog(req.params.id);
    return res.redirect("/blogs");
  } catch (e) {
    return res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
      navLink: [{ link: "/", text: "Home" }],
    });
  }
});

export default router;
