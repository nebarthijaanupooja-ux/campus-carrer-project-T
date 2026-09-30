const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs.map(job => ({
                id: job.jobId,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                category: job.category,
                minCGPA: job.minCGPA,
                branches: job.branches,
                maxBacklogs: job.maxBacklogs,
                skills: job.skills,
                openings: job.openings,
                package: job.package,
                deadline: job.deadline,
                description: job.description
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to load opportunities"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            type,
            category,
            minCGPA,
            branches,
            maxBacklogs,
            skills,
            openings,
            package: packageValue,
            deadline,
            description
        } = req.body;

        if (!title || !company || !location || minCGPA === undefined || !branches || !skills) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required opportunity details."
            });
        }

        const newJob = await Job.create({
            jobId: "JOB" + Date.now(),
            title: title.trim(),
            company: company.trim(),
            location: location.trim(),
            type: type || "Internship",
            category: category || "General",
            minCGPA: Number(minCGPA),
            branches: Array.isArray(branches)
                ? branches
                : String(branches).split(",").map(x => x.trim()).filter(Boolean),
            maxBacklogs: Number(maxBacklogs || 0),
            skills: Array.isArray(skills)
                ? skills
                : String(skills).split(",").map(x => x.trim()).filter(Boolean),
            openings: Number(openings || 1),
            package: packageValue || "Not specified",
            deadline: deadline || "Check application",
            description: description || ""
        });

        console.log("Opportunity added:", newJob.jobId);

        res.status(201).json({
            success: true,
            message: "Opportunity published successfully!",
            job: newJob
        });

    } catch (error) {
        console.error("ADD OPPORTUNITY ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.delete("/:jobId", async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({
            jobId: req.params.jobId
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found"
            });
        }

        res.json({
            success: true,
            message: "Opportunity deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;