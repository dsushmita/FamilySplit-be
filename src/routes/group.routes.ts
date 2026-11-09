import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createGroup, getGroups } from "../controllers/group.controller";

const router = Router();

router.post("/", authenticate, createGroup);
// Retrieve the authenticated user's groups.
router.get("/", authenticate, getGroups);

export default router;