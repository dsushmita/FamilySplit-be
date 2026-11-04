import type { Request, Response } from "express";
import { registerUser } from "../services/auth.service";
import { Prisma } from "../generated/prisma/client";

// Validate registration details, create the user through the service, and return a response.
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    // Reject missing, empty, or invalid input.
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Normalize and validate the email address.
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // Ensure the password meets the required length.
    if (password.length < 12 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 12 and 72 characters",
      });
    }

    // Register the user and store the returned information.
    const user = await registerUser(
      name.trim(),
      normalizedEmail,
      password
    );

    // Return the newly created user.
    return res.status(201).json({
      message: "Registration Successful",
      user,
    });
  } catch (error) {
    // Return a conflict response if the email already exists.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Log unexpected errors and return a server error.
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};