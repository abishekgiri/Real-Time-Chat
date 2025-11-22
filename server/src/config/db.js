const mongoose = require("mongoose");

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if no DB
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Do not exit process, let the caller handle it
    throw err;
  }
}

module.exports = connectDB;
