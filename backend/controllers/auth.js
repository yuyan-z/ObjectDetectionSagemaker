import User from '../models/User.js';
import { hashPassword, comparePassword } from "../utils/auth.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
  try {
    // console.log("signup", req.body);
    const { email, password } = req.body;
    // validation
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password required and must be at least 6 characters");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email already taken");

    // hash password
    const hashedPassword = await hashPassword(password);

    // signup
    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();
    // console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const login = async (req, res) => {
  try {
    console.log("login", req.body);
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No such user");
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Bad email or password");

    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // return user and token to client, exclude hashed password
    user.password = undefined;
    // send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    // console.log("login", token);
    // res.json({ token, user });
    res.json({ user });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const logout = async (req, res) => {
  try {
    console.log("logout", req.user);
    res.clearCookie("token", {
      httpOnly: true  // same settings as in login
    });
    return res.json({ message: "Signout success" });
  } catch (err) {
    console.log(err);
  }
};
