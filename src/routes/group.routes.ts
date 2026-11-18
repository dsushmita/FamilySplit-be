import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { addMemberToGroup, createGroup, getGroups, getMembers } from "../controllers/group.controller";

const router = Router();

router.post("/", authenticate, createGroup);
// Retrieve the authenticated user's groups.
router.get("/", authenticate, getGroups);
router.post("/:groupId/members", authenticate, addMemberToGroup);
//get member
router.get("/:groupId/members", authenticate, getMembers);

export default router;
