import express from "express";
import { submitContact, getAllContacts } from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();
router.post("/about/contact", submitContact);

// Admin xem danh sách
router.get("/admin/about/contact", adminAuth, getAllContacts);

export default router;
