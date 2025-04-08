import express from "express";
import multer from 'multer';
import { requireSignin } from "../middlewares/index.js";
import {signup, login, logout} from "../controllers/auth.js";
import {uploadImage} from "../controllers/upload.js";
// import {getInference} from "../controllers/inference";

const router = express.Router();

// multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/upload", requireSignin, upload.array('images'), uploadImage);
// router.post("/inference", requireSignin, getInference);

export default router;