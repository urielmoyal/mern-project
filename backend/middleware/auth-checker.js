const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }
    let token = req.headers.authorization.split(" ")[1]; //req.headers.authorization after split [Bearer,TOKEN]
    if (!token) {
      return next(new HttpError("Authorization Field!!", 403));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Authorization Field!", 403));
  }
};
