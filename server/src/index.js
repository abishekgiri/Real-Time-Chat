require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const registerChatHandlers = require("./sockets/chatSocket");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// ===== MIDDLEWARE =====
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(cookieParser());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);

// ===== SIMPLE TEST ROUTE =====
app.get("/", (req, res) => {
  res.json({ message: "Real-time chat API is running ✅" });
});

// ===== SOCKET.IO SETUP =====
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Register handlers in separate file
registerChatHandlers(io);

// ===== START SERVER (NO DB FOR NOW) =====
async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.warn("⚠️  MongoDB connection failed (running without DB)");
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
