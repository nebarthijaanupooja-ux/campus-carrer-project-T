const express = require("express");
const Application = require("../models/Application");
const User = require("../models/User");
const Job = require("../models/Job");

const router = express.Router();


async function enrichApplications(applications) {
    return Promise.all(applications.map(async app => {
        if (app.studentName && app.cgpa) return app;
        const user = await User.findOne({ email: app.userEmail }).select("name cgpa");
        return {
            ...app.toObject(),
            studentName: user?.name || app.studentName || "Student",
            cgpa: user?.cgpa ?? app.cgpa ?? 0
        };
    }));
}
router.post("/", async (req, res) => {
    try {
        const { userEmail, jobId } = req.body;
        if (!userEmail || !jobId) return res.status(400).json({ success: false, message: "User email and job ID are required" });

        const email = userEmail.toLowerCase().trim();
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Student account not found" });

        const job = await Job.findOne({ jobId });
        if (!job) return res.status(404).json({ success: false, message: "Opportunity not found" });

        const alreadyApplied = await Application.findOne({ userEmail: email, jobId });
        if (alreadyApplied) return res.status(409).json({ success: false, message: "You have already applied for this opportunity" });

        const application = await Application.create({
            userEmail: email,
            studentName: user.name,
            cgpa: user.cgpa,
            jobId: job.jobId,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            status: "Applied"
        });

        res.status(201).json({ success: true, message: "Application submitted successfully", application });
    } catch (error) {
        console.error("Apply error:", error);
        res.status(500).json({ success: false, message: "Failed to submit application", error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const applications = await Application.find().sort({ appliedAt: -1 });
        const enriched = await enrichApplications(applications);
        res.json({ success: true, count: enriched.length, applications: enriched });
    } catch (error) {
        console.error("Get all applications error:", error);
        res.status(500).json({ success: false, message: "Failed to get applications" });
    }
});

router.get("/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        const applications = await Application.find({ userEmail: email }).sort({ appliedAt: -1 });
        const enriched = await enrichApplications(applications);
        res.json({ success: true, count: enriched.length, applications: enriched });
    } catch (error) {
        console.error("Get applications error:", error);
        res.status(500).json({ success: false, message: "Failed to get applications" });
    }
});

router.put("/:id/status", async (req, res) => {
    try {
        const allowed = ["Applied", "Shortlisted", "Test / Interview", "Selected", "Rejected"];
        const { status } = req.body;
        if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid application status" });

        const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        res.json({ success: true, message: "Application status updated", application });
    } catch (error) {
        console.error("Update application error:", error);
        res.status(500).json({ success: false, message: "Failed to update application" });
    }
});

module.exports = router;
