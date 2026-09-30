const express = require("express");
const User = require("../models/User");
const Job = require("../models/Job");

const router = express.Router();


// Convert skill into comparable format
function normalizeSkill(skill) {
    return String(skill)
        .trim()
        .toLowerCase();
}


// =========================
// SMART OPPORTUNITY MATCHING
// =========================

router.post("/check", async (req, res) => {

    try {

        const {
            email,
            cgpa,
            branch,
            backlogs,
            skills
        } = req.body;


        // =========================
        // GET STUDENT FROM MONGODB
        // =========================

        let student;

        if (email) {

            student = await User.findOne({
                email: email.toLowerCase().trim()
            });

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message: "Student account not found"
                });

            }

        }


        const studentCGPA =
            student
                ? Number(student.cgpa)
                : Number(cgpa);

        const studentBranch =
            student
                ? student.branch
                : branch;

        const studentBacklogs =
            student
                ? Number(student.backlogs || 0)
                : Number(backlogs || 0);

        const studentSkills =
            student
                ? student.skills.map(normalizeSkill)
                : (
                    Array.isArray(skills)
                        ? skills.map(normalizeSkill)
                        : String(skills || "")
                            .split(",")
                            .map(normalizeSkill)
                            .filter(Boolean)
                );


        if (
            isNaN(studentCGPA) ||
            !studentBranch
        ) {

            return res.status(400).json({
                success: false,
                message: "Valid student profile details are required"
            });

        }


        // =========================
        // GET JOBS FROM MONGODB
        // =========================

        const jobs = await Job.find();


        // =========================
        // MATCH JOBS
        // =========================

        const recommendations = jobs.map(job => {

            const jobSkills =
                job.skills.map(normalizeSkill);


            const matchedSkills =
                job.skills.filter(skill =>
                    studentSkills.includes(
                        normalizeSkill(skill)
                    )
                );


            const missingSkills =
                job.skills.filter(skill =>
                    !studentSkills.includes(
                        normalizeSkill(skill)
                    )
                );


            // =========================
            // BASIC ELIGIBILITY
            // =========================

            const cgpaEligible =
                studentCGPA >= job.minCGPA;


            const branchEligible =
                job.branches.some(
                    b =>
                        normalizeSkill(b) === "any" ||
                        normalizeSkill(b) ===
                        normalizeSkill(studentBranch)
                );


            const backlogEligible =
                studentBacklogs <= job.maxBacklogs;


            const eligible =
                cgpaEligible &&
                branchEligible &&
                backlogEligible;


            // =========================
            // SKILL MATCH
            // =========================

            const skillMatchPercentage =
                jobSkills.length === 0
                    ? 0
                    : Math.round(
                        (
                            matchedSkills.length /
                            jobSkills.length
                        ) * 100
                    );


            // =========================
            // ELIGIBILITY SCORE
            // =========================

            let eligibilityScore = 0;


            if (cgpaEligible) {
                eligibilityScore += 20;
            }


            if (branchEligible) {
                eligibilityScore += 20;
            }


            if (backlogEligible) {
                eligibilityScore += 20;
            }


            // Skills carry 40%
            const skillScore =
                Math.round(
                    skillMatchPercentage * 0.4
                );


            const matchPercentage =
                Math.min(
                    100,
                    eligibilityScore + skillScore
                );


            // =========================
            // EXPLANATION
            // =========================

            const reasons = [];


            if (cgpaEligible) {

                reasons.push(
                    `Your CGPA ${studentCGPA} meets the required ${job.minCGPA}`
                );

            } else {

                reasons.push(
                    `Required CGPA is ${job.minCGPA}`
                );

            }


            if (branchEligible) {

                reasons.push(
                    `Your ${studentBranch} branch is accepted`
                );

            } else {

                reasons.push(
                    `Your branch is not listed for this opportunity`
                );

            }


            if (backlogEligible) {

                reasons.push(
                    "Backlog requirement is satisfied"
                );

            } else {

                reasons.push(
                    `Maximum allowed backlogs: ${job.maxBacklogs}`
                );

            }


            if (matchedSkills.length > 0) {

                reasons.push(
                    `${matchedSkills.length} required skill(s) matched`
                );

            }


            return {

                job: {
                    id: job.jobId,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    category: job.category,
                    skills: job.skills,
                    openings: job.openings
                },

                eligible,

                matchPercentage,

                matchedSkills,

                missingSkills,

                reasons

            };

        });


        // =========================
        // SORT BY MATCH
        // =========================

        recommendations.sort(
            (a, b) =>
                b.matchPercentage -
                a.matchPercentage
        );


        // =========================
        // RESPONSE
        // =========================

        res.json({

            success: true,

            student: {
                cgpa: studentCGPA,
                branch: studentBranch,
                backlogs: studentBacklogs,
                skills: studentSkills
            },

            totalOpportunities:
                recommendations.length,

            eligibleCount:
                recommendations.filter(
                    item => item.eligible
                ).length,

            recommendations

        });


    } catch (error) {

        console.error(
            "Smart matching error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Smart matching failed",

            error: error.message

        });

    }

});


module.exports = router;