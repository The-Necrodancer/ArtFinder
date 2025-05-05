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

export default addCustomMiddleareFunctions;
