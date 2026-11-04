import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";


const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());


app.get("/api/health", (req, res) => {
  res.json({
    message: "FamilySplit backend is running!",
  });
});

app.use("/api/users", userRoutes);

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
