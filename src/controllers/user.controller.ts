import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { createNewUser, getAllUsers } from "../services/user.service";

//get all the list of data of the table
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

//step to create the User
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }
    const user = await createNewUser(name.trim(), email.trim().toLowerCase());

    return res.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }
    console.log("error");
    return res.status(500).json({
      message: "Failed to create user",
    });
  }
};
