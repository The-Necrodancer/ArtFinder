import { Router } from "express";
import {
  createMessage,
  getPaginatedUserMessages,
  getMessageById,
  markMessageRead,
  archiveMessage,
  getUnreadCount,
  deleteMessage,
} from "../data/messages.js";
import { getUserById } from "../data/users.js";
import xss from "xss";

const router = Router();
import { userMiddleware } from "../middleware.js";

// Get messages inbox with pagination
router.get("/", userMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { messages: messageList, pagination } =
      await getPaginatedUserMessages(req.session.user._id, page, limit);
    const unreadCount = await getUnreadCount(req.session.user._id);

    // Get user details for displayed messages only
    const userDetailsPromises = messageList.map(async (message) => {
      const [sender, recipient] = await Promise.all([
        getUserById(message.senderId.toString()),
        getUserById(message.recipientId.toString()),
      ]);
      message.sender = sender;
      message.recipient = recipient;
      return message;
    });

    const messages = await Promise.all(userDetailsPromises);

    res.render("messages", {
      pageTitle: "Messages",
      headerTitle: "Messages",
      messages,
      unreadCount,
      pagination,
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
      errorMessage: e.toString(),
    });
  }
});

// Get new message form
router.get("/new/:recipientId", userMiddleware, async (req, res) => {
  try {
    // Prevent sending messages to self
    if (req.params.recipientId === req.session.user._id.toString()) {
      return res.status(400).render("error", {
        pageTitle: "Cannot Send Message",
        headerTitle: "Cannot Send Message",
        errorMessage:
          "You cannot send messages to yourself. Please select a different recipient.",
        navLink: [
          { link: "/messages", text: "Back to Messages" },
          { link: "/browse", text: "Browse Artists" },
        ],
      });
    }
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
      errorMessage: e.toString(),
    });
  }
});

// Send a new message
router.post("/", userMiddleware, async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    const cleanedRecipientId = xss(recipientId);
    const cleanedSubject = xss(subject);
    const cleanedContent = xss(content); // Prevent sending messages to self by comparing string versions of IDs
    if (
      new ObjectId(cleanedRecipientId).toString() ===
      req.session.user._id.toString()
    ) {
      return res.status(400).render("error", {
        pageTitle: "Cannot Send Message",
        headerTitle: "Cannot Send Message",
        errorMessage:
          "You cannot send messages to yourself. Please select a different recipient.",
        navLink: [
          { link: "/messages", text: "Back to Messages" },
          { link: "/browse", text: "Browse Artists" },
        ],
      });
    }
    await createMessage(
      req.session.user._id,
      cleanedRecipientId,
      cleanedSubject,
      cleanedContent
    );
    res.redirect("/messages");
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
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
      errorMessage: e.toString(),
    });
  }
});

// Archive a message
router.post("/:id/archive", userMiddleware, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);

    // Check if user has permission to archive this message
    if (message.recipientId.toString() !== req.session.user._id.toString()) {
      throw "Access denied";
    }

    await archiveMessage(req.params.id);
    res.redirect("/messages");
  } catch (e) {
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
    });
  }
});

// Delete a message
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    await deleteMessage(req.params.id, req.session.user._id);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({ success: true });
    }
    res.redirect("/messages");
  } catch (e) {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(400).json({ error: e.toString() });
    }
    res.status(400).render("error", {
      pageTitle: "Error",
      headerTitle: "Error",
      errorMessage: e.toString(),
    });
  }
});

export default router;
