import jwt from "jsonwebtoken";

export const requireSignin = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("No token provided.");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Error getting token.");
  }
};
