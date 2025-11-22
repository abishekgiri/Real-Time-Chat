const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

// In-memory store for when DB is missing
const localUsers = [];

// Helper to check DB status
const isDBConnected = () => mongoose.connection.readyState === 1;

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user;

        if (isDBConnected()) {
            // MongoDB Path
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({ message: "Username or Email already taken" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
            });

            user = await newUser.save();
        } else {
            // In-Memory Path
            console.warn("⚠️ Using in-memory storage (no DB connection)");
            const existingUser = localUsers.find(
                (u) => u.username === username || u.email === email
            );
            if (existingUser) {
                return res.status(400).json({ message: "Username or Email already taken" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = {
                _id: Date.now().toString(),
                username,
                email,
                password: hashedPassword,
            };
            localUsers.push(user);
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "User created successfully",
            user: { id: user._id, username: user.username, email: user.email },
            token,
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        let user;

        if (isDBConnected()) {
            user = await User.findOne({ username });
        } else {
            user = localUsers.find((u) => u.username === username);
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            user: { id: user._id, username: user.username, email: user.email },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
