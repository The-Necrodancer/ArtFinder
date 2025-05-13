// Our node.js file :D
import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
import addMiddleware from "./middleware.js";
import messageRoutes from "./routes/messages.js";

const app = express();
import {
  loggingMiddleware,
  registerRedirectMiddleware,
  loginRedirectMiddleware,
  userMiddleware,
  superuserMiddleware,
  signoutMiddleware,
} from "./middleware.js";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "AuthenticationState",

    secret: "some secret string!",

    resave: false,

    saveUninitialized: false,
  })
);
app.use(rewriteUnsupportedBrowserMethods);

// Apply logging middleware to all routes
app.use(loggingMiddleware);

// Apply authentication redirects for register and login routes
app.use("/register", registerRedirectMiddleware);
app.use("/login", loginRedirectMiddleware);

// Protect user routes
app.use("/dashboard/user", userMiddleware);
app.use("/dashboard/artist", userMiddleware);
app.use("/commission", userMiddleware);
app.use("/messages", userMiddleware);
app.use("/reports", userMiddleware);

// Protect admin routes
app.use("/dashboard/admin", superuserMiddleware);

// Add signout middleware
app.use("/logout", signoutMiddleware);

<<<<<<< HEAD
// Configure Handlebars
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".handlebars",
  helpers: {
    eq: (arg1, arg2) => arg1 === arg2,
    equals: (arg1, arg2) => arg1 === arg2,
    toLowerCase: (str) => str && str.toLowerCase(),
    truncate: (str, len) =>
      str && (str.length > len ? str.substring(0, len) + "..." : str),
    formatDate: (date) => (date ? new Date(date).toLocaleDateString() : ""),
  },
  // Configure the layouts and partials directories
  layoutsDir: "./views/layouts",
  partialsDir: "./views/partials",
});

app.engine("handlebars", hbs.engine);
=======
app.engine(
  "handlebars",
  exphbs.engine({
    helpers: {
      times: function (n, block) {
        var accum = "";
        for (var i = 0; i < n; ++i) accum += block.fn(i);
        return accum;
      },
      eq: function (a, b) {
        return a === b;
      },
      truncate: function (str, len) {
        if (str.length > len) {
          return str.substring(0, len) + "...";
        }
        return str;
      },
      toLowerCase: function (str) {
        return str.toLowerCase();
      },
      formatDate: function (date) {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
      toString: function (obj) {
        if (!obj) return "";
        return obj.toString();
      },
    },
    defaultLayout: "main",
  })
);
>>>>>>> 1b55f2f5f63e934984a6515b119a67763928092a
app.set("view engine", "handlebars");

app.use("/messages", messageRoutes);

addMiddleware(app);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
