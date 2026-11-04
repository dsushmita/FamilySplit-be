// A controller typically:
// 1. Receives the HTTP request (req).
// 2. Extracts data from req.body.
// 3. Validates the input.
// 4. Calls the appropriate service function.
// 5. Sends an HTTP response (res)
import type { Request, Response } from "express";
import { registerUser } from "../services/auth.service";
import { Prisma } from "../generated/prisma/client";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    //validation check if name email and password is string if not return error message instead of or operator we use and also
    //         if (
    //     typeof name === "string" && name.trim().length > 0 &&
    //     typeof email === "string" && email.trim().length > 0 &&
    //     typeof password === "string" && password.length > 0   .. first we doing yes and no
    // ) {
    //     // 1. SUCCESS: All data is valid!
    //     const saltRounds = 12;
    //     const hashedPassword = await bcrypt.hash(password, saltRounds);

    //     // Save to your database here...

    //     return res.status(201).json({ message: "User created successfully!" });

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name,  email and password are required",
      });
    }

    //but here we doing no case validation then doing yes cases
    // This removes surrounding spaces and converts the email to lowercase.
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //checking validation for email
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    //after checking email we need to check password for this password must be of 12 characters
    if (password.length < 12 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 12 and 72 characters",
      });
    }

    //now after checking all the validation we finally make request to service

    // The await waits for the service's Promise to resolve  as it has to get back data from database and datbase take a time if it has long records
    
//     1. registerUser() calls the function defined in auth.service.ts.
// 2. It passes three arguments: name, email, and password.
// 3. await waits for the asynchronous function to finish.
// 4. The service returns the newly created user's information.
// 5. The returned information is stored in the controller's user variable.
  //  controller's user variable receives and holds that value. 
    const user = await registerUser(name.trim(), normalizedEmail, password);
    //  The returned information is stored in the controller's user variable.

    //after request in controller it goes to server to create and save data where db operation happened and user got the data
    // After validation, the controller calls the service.
// The service hashes the password and uses Prisma
// to save the user in PostgreSQL.

    //then we return user,,

    //question? here the user variable got values from register user right ,, it hold the informatiuonm right
    //so it goes to that function and that function return value and user hold that vlaue right??

    return res.status(201).json({
      message: "Registration Sucessful",
      user,
    });

    // return res.status(201).json({ user }) in the controller → Sends an HTTP response to the frontend and ends the controller function.
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Registration error:", error);

    //catch should also return the reponse right
    //we use async await function we have to write return??

    // Here, return ends the controller function immediately after calling res.json(). to end the controller othewrwise cosde stills runs
    //we dont require to write return beacuase it is async funcion

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};
