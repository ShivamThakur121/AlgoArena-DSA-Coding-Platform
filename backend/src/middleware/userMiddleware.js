const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
  try {

    let token = null;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new Error("Token is not present");
    }

    const payload = jwt.verify(token, process.env.JWT_KEY);

    const { _id } = payload;

    if (!_id) {
      throw new Error("Invalid token");
    }

    const result = await User.findById(_id);

    if (!result) {
      throw new Error("User Doesn't Exist");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);

    if (isBlocked) {
      throw new Error("Invalid Token");
    }

    req.result = result;

    next();

  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

module.exports = userMiddleware;
