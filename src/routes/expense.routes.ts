
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { addExpense } from "../controllers/expense.controller";


const router = Router();

// Create an expense in a group
router.post("/:groupId/expenses", authenticate, addExpense);

export default router;
