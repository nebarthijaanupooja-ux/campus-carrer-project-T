const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Job = require("./models/Job");
const jobs = require("./data/jobs");

dotenv.config();

async function seedJobs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected!");

        await Job.deleteMany({});

        const formattedJobs = jobs.map(job => ({
            jobId: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            category: job.category,
            minCGPA: job.minCGPA,
            branches: job.branches,
            maxBacklogs: job.maxBacklogs,
            skills: job.skills,
            openings: job.openings
        }));

        await Job.insertMany(formattedJobs);

        console.log("Jobs seeded successfully!");
        console.log(`${formattedJobs.length} jobs added to MongoDB.`);

        await mongoose.disconnect();

    } catch (error) {
        console.error("Seeding failed:");
        console.error(error.message);
    }
}

seedJobs();