const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "campuscareer_secret_key";

// =========================
// REGISTER
// =========================

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            branch,
            cgpa,
            graduationYear,
            skills,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !branch ||
            cgpa === undefined ||
            !graduationYear ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check MongoDB for existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            branch,
            cgpa: Number(cgpa),
            graduationYear: Number(graduationYear),

            backlogs: 0,

            skills: Array.isArray(skills)
                ? skills
                : typeof skills === "string"
                    ? skills
                        .split(",")
                        .map(s => s.trim())
                        .filter(Boolean)
                    : [],

            certifications: [],

            careerGoal: "",

            password: hashedPassword
        });

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                branch: user.branch,
                cgpa: user.cgpa,
                graduationYear: user.graduationYear,
                backlogs: user.backlogs,
                skills: user.skills,
                certifications: user.certifications,
                careerGoal: user.careerGoal
            }
        });

    } catch (error) {

        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });
    }
});


// =========================
// LOGIN
// =========================

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user in MongoDB
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                branch: user.branch,
                cgpa: user.cgpa,
                graduationYear: user.graduationYear,
                backlogs: user.backlogs,
                skills: user.skills,
                certifications: user.certifications,
                careerGoal: user.careerGoal
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
});


// =========================
// GET ALL USERS
// TEMPORARY TEST ROUTE
// =========================

router.get("/users", async (req, res) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
});


module.exports = router;