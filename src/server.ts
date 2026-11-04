import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// GET API - Check backend status
app.get("/api/health", (req, res) => {
  res.json({
    message: "FamilySplit backend is running!",
  });
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create user",
    });
  }
});

// POST API - Test registration
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  return res.status(200).json({
    message: "Registration request received successfully",
    user: {
      name,
      email,
    },
  });
});

// Start backend server
app.listen(PORT, () => { 
  console.log(`Server running on http://localhost:${PORT}`);
});
