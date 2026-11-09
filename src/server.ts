import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";
import groupRoutes from "./routes/group.routes";


const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
app.use("/api", protectedRoutes);


//after declaring service where db functions works and declaring controller where request things works,
// and after creating routes to defined path
//we finally call in the server page ,, the entry page ,, where we have created express server
app.use("/api/auth", authRoutes);

// Register the Group API.
app.use("/api/groups", groupRoutes);

// Start backend server
app.listen(PORT, () => { 
  console.log(`Server running on http://localhost:${PORT}`);
});
