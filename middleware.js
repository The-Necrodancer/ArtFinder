const addCustomMiddleareFunctions = (app) => {
  app.use(loggingMiddleware);
};

const loggingMiddleware = (req, res, next) => {
  const currentTime = new Date().toUTCString();
  const method = req.method;
  const path = req.path;
  const userRole = req.session.user
    ? req.session.user.role
    : "Non-Authenticated";
  console.log(`[${currentTime}]: ${method} ${path} (${userRole})`);
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
    return res.status(401).render("login", {
      pageTitle: "Login Required",
      headerTitle: "Login Required",
      error: "You must be logged in to access this page",
      navLink: [{ link: "/", text: "Home" }],
    });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", {
      pageTitle: "Access Denied",
      headerTitle: "Access Denied",
      error: "Only administrators can access this page",
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
    // If not logged in, redirect to login page
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
