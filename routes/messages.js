import { Router } from "express";
import {
  createMessage,
  getUserMessages,
  getMessageById,
  markMessageRead,
  archiveMessage,
  getUnreadCount,
} from "../data/messages.js";
import { getUserById } from "../data/users.js";

const router = Router();

import { userMiddleware } from "../middleware.js";

// Get messages inbox
router.get("/", userMiddleware, async (req, res) => {
  try {
    const messages = await getUserMessages(req.session.user._id);
    const unreadCount = await getUnreadCount(req.session.user._id);

    // Get user details for each message
    for (let message of messages) {
      message.sender = await getUserById(message.senderId.toString());
      message.recipient = await getUserById(message.recipientId.toString());
    }

    res.render("messages", {
      pageTitle: "Messages",
      headerTitle: "Messages",
      messages,
      unreadCount,
      user: req.session.user,
      navLink: [
        { link: "/", text: "Home" },
        { link: "/dashboard/" + req.session.user.role, text: "Dashboard" },
        { link: "/signout", text: "Sign Out" },
      ],
    });
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Get new message form
router.get("/new/:recipientId", userMiddleware, async (req, res) => {
  try {
    const recipient = await getUserById(req.params.recipientId);
    res.render("newMessage", {
      pageTitle: "New Message",
      headerTitle: "New Message",
      recipient,
      navLink: [
        { link: "/", text: "Home" },
        { link: "/messages", text: "Messages" },
      ],
    });
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Send a new message
router.post("/", userMiddleware, async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    await createMessage(req.session.user._id, recipientId, subject, content);
    res.redirect("/messages");
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// View a specific message
router.get("/:id", userMiddleware, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);

    // Check if user has permission to view this message
    if (
      message.senderId.toString() !== req.session.user._id &&
      message.recipientId.toString() !== req.session.user._id
    ) {
      throw "Access denied";
    }

    // If user is recipient and message is unread, mark as read
    if (
      message.recipientId.toString() === req.session.user._id &&
      !message.read
    ) {
      await markMessageRead(req.params.id);
    }

    // Get user details
    message.sender = await getUserById(message.senderId.toString());
    message.recipient = await getUserById(message.recipientId.toString());

    res.render("messageDetails", {
      pageTitle: "Message Details",
      headerTitle: "Message Details",
      message,
      user: req.session.user,
      navLink: [
        { link: "/", text: "Home" },
        { link: "/messages", text: "Messages" },
      ],
    });
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

// Archive a message
router.post("/:id/archive", userMiddleware, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);

    // Check if user has permission to archive this message
    if (message.recipientId.toString() !== req.session.user._id) {
      throw "Access denied";
    }

    await archiveMessage(req.params.id);
    res.redirect("/messages");
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      error: e.toString(),
    });
  }
});

export default router;
