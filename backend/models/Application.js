const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        userEmail: { type: String, required: true, lowercase: true, trim: true },
        studentName: { type: String, default: "Student" },
        cgpa: { type: Number, default: 0 },
        jobId: { type: String, required: true },
        jobTitle: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, required: true },
        type: { type: String, required: true },
        status: { type: String, enum: ["Applied", "Shortlisted", "Test / Interview", "Selected", "Rejected"], default: "Applied" },
        appliedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

applicationSchema.index({ userEmail: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
