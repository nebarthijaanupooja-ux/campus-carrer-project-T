const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true
        },

        branch: {
            type: String,
            required: true
        },

        cgpa: {
            type: Number,
            required: true
        },

        graduationYear: {
            type: Number,
            required: true
        },

        backlogs: {
            type: Number,
            default: 0
        },

        skills: {
            type: [String],
            default: []
        },

        certifications: {
            type: [String],
            default: []
        },

        careerGoal: {
            type: String,
            default: ""
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);