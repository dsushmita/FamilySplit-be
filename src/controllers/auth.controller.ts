import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { Prisma } from "../generated/prisma/client";

//so upto register we need to have bcrypt for password hasing
//jwt as well as bcrypt is required for logging
// so we will jwt for logging now
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
    const user = await registerUser(name.trim(), normalizedEmail, password);

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

//after creatinng loging service we are here to create container that validate logins detail;s and return
//return authenticates user and jwt

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email.trim().toLowerCase(), password);

    if (!result) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({ message: "Login successful", ...result });
  } catch (error) {
    console.log("login failed", error);
    return res.status(500).json({ message: "login failed" });
  }
};

// {
//     "message": "Login successful",
//     "result": {
//         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODhmOWJkOC01OWExLTRkYjYtYjBiMC1lYjYxYzQxZDE4YzkiLCJpYXQiOjE3OTM4NTE1MTEsImV4cCI6MTc5Mzg1NTExMX0.6FKZrNSZ1s5ls937K1kXzbdpglEY0IdcCqIB2eYDZN8",
//         "user": {
//             "id": "288f9bd8-59a1-4db6-b0b0-eb61c41d18c9",
//             "name": "Registration Test",
//             "email": "registration-test@example.com"
//         }
//     }
// }


// {
//     "message": "Login successful",
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyODhmOWJkOC01OWExLTRkYjYtYjBiMC1lYjYxYzQxZDE4YzkiLCJpYXQiOjE3OTM4NTE1NDMsImV4cCI6MTc5Mzg1NTE0M30.tiD30oJ24RldR5_0R_ChjcDXibZrHr8IFuhefMwitqY",
//     "user": {
//         "id": "288f9bd8-59a1-4db6-b0b0-eb61c41d18c9",
//         "name": "Registration Test",
//         "email": "registration-test@example.com"
//     }
// }