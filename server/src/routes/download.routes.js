import { Router } from "express";
import {
  downloadMp3,
  downloadMp4,
} from "../controllers/download.controller.js";

const router = Router();

router.post("/audio", downloadMp3);
router.post("/video", downloadMp4);

export default router;