import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { addExpense, getBalances, getRecent } from "../controllers/expense.controller";


const router = Router();

// Create an expense in a group  ->  POST /api/groups/:groupId/expenses
router.post("/:groupId/expenses", authenticate, addExpense);

export default router;

// Routes under /api/expenses
export const expenseListRouter = Router();

// Latest expenses from all my groups  ->  GET /api/expenses/recent
expenseListRouter.get("/recent", authenticate, getRecent);

// My balances in all groups  ->  GET /api/expenses/balances
expenseListRouter.get("/balances", authenticate, getBalances);
