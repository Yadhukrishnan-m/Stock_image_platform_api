import express from "express";
import morgan from "morgan";
import userRoutes from "./routes/user.route";
// import adminRoutes from "./routes/admin.route";
// import { ErrorHandler } from "./middlewares/error-handle.middleware";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cookieParser());
import cors from "cors";
import { ErrorHandler } from "./middleware/errorhandler";


app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
); 


app.use(morgan("dev"));
app.use(express.json());

app.use("/", userRoutes);

// global error handlint middleware
app.use(ErrorHandler.handleError);

export default app;
