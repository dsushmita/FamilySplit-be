import { Router } from "express";
import { login, register } from "../controllers/auth.controller";

const router = Router()

// here we are declaring express router 

//npw using express router

//here we are using post method for registering users and that redirect to that register function and post express function have 2 paramater
router.post("/register", register);
router.post("/login", login)

export default router;

