import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/DataBase";

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = createServer(app);

   
    server.listen(port, () => {
      console.log(` Server started successfully on port ${port}`);
    });
  } catch (error) {
    console.error(" Server failed to start:", error);
  
  }
};

startServer();
