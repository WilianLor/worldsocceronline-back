const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.json");

const User = require("../models/Users");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("No token provided");
    return res.status(401).send({ error: "No token provided" });
  }

  const parts = authHeader.split(" ");

  if (parts.length === !2) {
    console.log("Token error");
    return res.status(401).send({ error: "Token error" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    console.log("Token Malformatted");
    return res.status(401).send({ error: "Token Malformatted" });
  }

  const userId = jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      console.log("Token Invalid");
      return res.status(401).send({ error: "Token Invalid" });
    }

    req.userId = decoded.id;
    return req.userId;
  });

  const user = await User.findOne({ _id: userId });

  if (!user.admin) {
    return res.status(403).send({ error: "You are not an administrator" });
  }

  return next()
};
