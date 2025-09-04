import express from "express";
import { loginAdmin } from "../controllers/authController.js";
import { verifyAdmin } from "../middleware/auth.js";

const route = express.Router();

route.post('/login', loginAdmin)
// route.get('/', verifyAdmin, )

export default route;