
import type { Request, Response } from "express";
import { createExpense } from "../services/expense.service";

export const addExpense = async (req: Request, res: Response) => {
  try {
    // Get logged-in user ID from JWT middleware
    const currentUserId = res.locals.userId;

    // Get group ID from URL
    const groupId = req.params.groupId;

    // Get expense details from request body
    const { description, amount, paidById } = req.body ?? {};

    // Check authentication
    if (typeof currentUserId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Validate group ID
    if (typeof groupId !== "string" || !groupId.trim()) {
      return res.status(400).json({
        message: "Group ID is required",
      });
    }

    // Validate description
    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    // Validate amount
    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    // Validate payer ID
    if (typeof paidById !== "string" || !paidById.trim()) {
      return res.status(400).json({
        message: "Payer ID is required",
      });
    }

    // Call expense service
    const expense = await createExpense(
      groupId,
      paidById,
      description,
      amount,
      currentUserId
    );

    return res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "GROUP_NOT_FOUND":
          return res.status(404).json({
            message: "Group not found",
          });

        case "NOT_GROUP_MEMBER":
          return res.status(403).json({
            message: "You are not a member of this group",
          });

        case "PAYER_NOT_GROUP_MEMBER":
          return res.status(400).json({
            message: "Payer must belong to this group",
          });

        case "INVALID_DESCRIPTION":
          return res.status(400).json({
            message: "Invalid expense description",
          });

        case "INVALID_AMOUNT":
          return res.status(400).json({
            message: "Invalid expense amount",
          });

        case "NO_GROUP_MEMBERS":
          return res.status(400).json({
            message: "Group has no members",
          });
      }
    }

    console.error("Create expense error:", error);

    return res.status(500).json({
      message: "Failed to create expense",
    });
  }
};
