import express from "express";
import cors from "cors";

const app = express();


const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" })); // it forbideen request coming beside 5173
app.use(express.json()); //to parse the payload js object

app.get("/", (req, res) => { //use get express method that accept req and res and responsed send json for easy understandfing
  res.json({
    message: "FamilySplit backend is running!",
  }); 
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); //we are running server at 3001
});