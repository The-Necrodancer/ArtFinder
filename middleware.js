const addCustomMiddleareFunctions = (app) => {
  printRouteInfo(app);
};

const printRouteInfo = (app) => {
  app.use("/", (req, res, next) => {
    console.log("Current Timestamp: ", new Date().toUTCString());
    console.log("Request Method: ", req.method);
    console.log("Request Path: ", req.path);
    if (req.session && req.session.user) {
      console.log("Role is ", req.session.user.role);
    } else console.log("Not authenticated.");
    next();
  });
};

const loggingMiddleware = (req, res, next) => {
  const currentTime = new Date().toUTCString();
  const method = req.method;
  const path = req.path;
  const isAuthenticated = req.session.isAuthenticated || false;
  const userRole = req.session.user
    ? req.session.user.role
    : "Non-Authenticated";
  const logMessage = `[${currentTime}]: ${method} ${path} (${
    isAuthenticated ? userRole : "Non-Authenticated"
  })`;
  console.log(logMessage);
  next();
};

const registerRedirectMiddleware = (req, res, next) => {
  if (req.session.user) {
    return res.redirect(`/dashboard/${req.session.user.role}`);
  }
  next();
};

const loginRedirectMiddleware = (req, res, next) => {
  if (req.session.user) {
    return res.redirect(`/dashboard/${req.session.user.role}`);
  }
  next();
};

const userMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).render("login", {
      pageTitle: "Login Required",
      headerTitle: "Login Required",
      error: "You must be logged in to access this page",
      navLink: [{ link: "/", text: "Home" }],
    });
  }
  next();
};

const superuserMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", {
      pageTitle: "Access Denied",
      headerTitle: "Access Denied",
      error: "You do not have permission to view this page",
      navLink: [
        { link: "/", text: "Home" },
        { link: `/dashboard/${req.session.user.role}`, text: "Dashboard" },
      ],
    });
  }

  next();
};

const signoutMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).render("login", {
        pageTitle: "Login Required",
        headerTitle: "Login Required",
        error: "You must be logged in to access this page",
        navLink: [{ link: "/", text: "Home" }],
      });
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).render("error", {
        pageTitle: "Access Denied",
        headerTitle: "Access Denied",
        error: "You do not have permission to view this page",
        navLink: [
          { link: "/", text: "Home" },
          { link: `/dashboard/${req.session.user.role}`, text: "Dashboard" },
        ],
      });
    }

    next();
  };
};

export {
  loggingMiddleware,
  registerRedirectMiddleware,
  loginRedirectMiddleware,
  userMiddleware,
  roleMiddleware,
  superuserMiddleware,
  signoutMiddleware,
};

export default addCustomMiddleareFunctions;
