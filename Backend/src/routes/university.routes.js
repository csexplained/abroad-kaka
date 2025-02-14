import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createUniversity, getAllUniversities, getUniversityById, updateUniversity, deleteUniversity } from "../controllers/university.controller.js";

const router = express.Router();

// Routes for University management
router.post("/", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 10 }]), createUniversity);
router.get("/", getAllUniversities);
router.get("/:id", getUniversityById);
router.put("/:id", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 10 }]), updateUniversity);
router.delete("/:id", deleteUniversity);

export default router;
