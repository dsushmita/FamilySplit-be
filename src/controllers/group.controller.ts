import type { Request, Response } from "express";
import { createNewGroup, getUserGroups } from "../services/group.service";

// Validate the group name and create a group for the authenticated user.
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name } = req.body ?? {};
    const userId = res.locals.userId;

    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Group name must be 100 characters or fewer",
      });
    }

    const group = await createNewGroup(name.trim(), userId);

    return res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    return res.status(500).json({
      message: "Failed to create group",
    });
  }
};

// Retrieve the authenticated user's groups.
export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const groups = await getUserGroups(userId);

    return res.status(200).json({
      message: "Groups retrieved successfully",
      groups,
    });
  } catch (error) {
    console.error("Get groups error:", error);

    return res.status(500).json({
      message: "Failed to retrieve groups",
    });
  }
};