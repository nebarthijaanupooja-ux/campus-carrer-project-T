const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET PROFILE
router.get("/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();

        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get profile",
            error: error.message
        });
    }
});


// UPDATE PROFILE
router.put("/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();

        const {
            name,
            phone,
            branch,
            cgpa,
            graduationYear,
            backlogs,
            skills,
            certifications,
            careerGoal
        } = req.body;

        const user = await User.findOneAndUpdate(
            { email },
            {
                name,
                phone,
                branch,
                cgpa: Number(cgpa),
                graduationYear: Number(graduationYear),
                backlogs: Number(backlogs || 0),
                skills: Array.isArray(skills) ? skills : [],
                certifications: Array.isArray(certifications)
                    ? certifications
                    : [],
                careerGoal: careerGoal || ""
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully!",
            user
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
});


module.exports = router;