const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        jobId: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        minCGPA: { type: Number, required: true },
        branches: { type: [String], default: [] },
        maxBacklogs: { type: Number, default: 0 },
        skills: { type: [String], default: [] },
        openings: { type: Number, default: 1 },
        package: { type: String, default: "Not specified" },
        deadline: { type: String, default: "Check application" },
        description: { type: String, default: "" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
