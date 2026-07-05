import { Router } from "express";
import { downloadMp3 } from "../controllers/download.controller.js";

const router = Router();

router.post("/audio", downloadMp3);

export default router;