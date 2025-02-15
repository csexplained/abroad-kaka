import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createUniversity, getAllUniversities, getUniversityById, updateUniversity, deleteUniversity } from "../controllers/university.controller.js";
import { verifyAdminjwt } from "../middlewares/adminAuth.middleware.js";
const router = express.Router();

// Routes for University management
router.post("/", verifyAdminjwt, upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 10 }]), createUniversity);
router.get("/", getAllUniversities);
router.get("/:id", getUniversityById);
router.put("/:id", verifyAdminjwt, upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 10 }]), updateUniversity);
router.delete("/:id", verifyAdminjwt, deleteUniversity);

export default router;
