const dns = require("dns");
dns.setServers(["8.8.8.8"]);
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// =========================
// MONGODB CONNECTION
// =========================

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:");
        console.log(error.message);
    });

// =========================
// ROUTES
// =========================

const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");
const profileRoutes = require("./routes/profile");
const eligibilityRoutes = require("./routes/eligibility");
const applicationsRoutes = require("./routes/applications");

// =========================
// APP
// =========================

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Career Campus Backend is running!"
    });
});

// =========================
// TEST
// =========================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working!"
    });
});

// =========================
// AUTH
// =========================

app.use(
    "/api/auth",
    authRoutes
);

// =========================
// JOBS / OPPORTUNITIES
// =========================

app.use(
    "/api/jobs",
    jobsRoutes
);

// =========================
// PROFILE
// =========================

app.use(
    "/api/profile",
    profileRoutes
);

// =========================
// SMART ELIGIBILITY
// =========================

app.use(
    "/api/eligibility",
    eligibilityRoutes
);

// =========================
// APPLICATIONS
// =========================

app.use(
    "/api/applications",
    applicationsRoutes
);

// =========================
// 404
// =========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});