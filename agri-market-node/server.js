import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/ProductRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.set("io", io);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

app.use("/auth", authRoutes);

app.use("/products", productRoutes);

mongoose.connect("mongodb://localhost:27017/agri-market", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));


