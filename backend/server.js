const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const roles = require("./data/roles");
const interviewQuestions = require("./data/interviewQuestions");

const app = express();
const PORT = process.env.PORT || 5000;

/* =====================================================
   MIDDLEWARE
===================================================== */

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-career-copilot-wheat.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests with no origin
            // (for example Postman/server-to-server)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(express.json());

/* =====================================================
   FILE UPLOAD
===================================================== */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function normalizeText(text = "") {
    if (typeof text === "object" && text !== null) {
        if (text.name) return String(text.name).toLowerCase().trim();
        if (text.skill) return String(text.skill).toLowerCase().trim();
        return "";
    }

    return String(text).toLowerCase().trim();
}

function normalizeExperience(experience = "") {
    const value = normalizeText(experience);

    if (
        value.includes("fresher") ||
        value.includes("beginner") ||
        value.includes("entry")
    ) {
        return "Fresher";
    }

    if (value.includes("intermediate") || value.includes("1-3")) {
        return "Intermediate";
    }

    if (value.includes("experienced") || value.includes("3+")) {
        return "Experienced";
    }

    return experience || "Fresher";
}

function getRoleData(role) {
    if (!roles || !role) return null;

    if (roles[role]) {
        return roles[role];
    }

    if (roles.roles && roles.roles[role]) {
        return roles.roles[role];
    }

    const roleKey = Object.keys(roles).find(
        (key) => key.toLowerCase() === String(role).toLowerCase()
    );

    if (roleKey) {
        return roles[roleKey];
    }

    if (roles.roles) {
        const nestedKey = Object.keys(roles.roles).find(
            (key) => key.toLowerCase() === String(role).toLowerCase()
        );

        if (nestedKey) {
            return roles.roles[nestedKey];
        }
    }

    return null;
}

function getRequiredSkills(role) {
    const roleData = getRoleData(role);

    if (!roleData) {
        return [];
    }

    if (Array.isArray(roleData)) {
        return roleData
            .map((item) => {
                if (typeof item === "string") return item;
                return item?.name || item?.skill || "";
            })
            .filter(Boolean);
    }

    if (Array.isArray(roleData.skills)) {
        return roleData.skills
            .map((item) => {
                if (typeof item === "string") return item;
                return item?.name || item?.skill || "";
            })
            .filter(Boolean);
    }

    if (Array.isArray(roleData.requiredSkills)) {
        return roleData.requiredSkills
            .map((item) => {
                if (typeof item === "string") return item;
                return item?.name || item?.skill || "";
            })
            .filter(Boolean);
    }

    return [];
}

function getPriority(index) {
    if (index < 2) return "High";
    if (index < 5) return "Medium";
    return "Low";
}

function cleanSkills(skills = []) {
    if (!Array.isArray(skills)) return [];

    return skills
        .map((skill) => {
            if (typeof skill === "string") {
                return skill;
            }

            if (skill && typeof skill === "object") {
                return skill.name || skill.skill || "";
            }

            return "";
        })
        .filter(Boolean);
}

/* =====================================================
   HOME / HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
    res.json({
        message: "AI Career Copilot Backend is running 🚀",
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is healthy 🚀",
    });
});

/* =====================================================
   RESUME ANALYSIS
===================================================== */

app.post("/api/analyze-resume", upload.any(), async (req, res) => {
    try {
        console.log("\n===== RESUME ANALYSIS REQUEST =====");

        console.log("Origin:", req.headers.origin);
        console.log("Body:", req.body);

        const targetRole =
            req.body.targetRole || "AI Product Manager";

        const experience =
            req.body.experience || "Fresher";

        const file = req.files && req.files.length > 0
            ? req.files[0]
            : null;

        if (!file) {
            console.log("❌ No resume file received.");

            return res.status(400).json({
                success: false,
                message: "Please upload a resume file.",
            });
        }

        console.log("File received:", file.originalname);
        console.log("Mimetype:", file.mimetype);

        let resumeText = "";

        /* ---------- PDF ---------- */

        if (
            file.mimetype === "application/pdf" ||
            file.originalname.toLowerCase().endsWith(".pdf")
        ) {
            const pdfData = await pdfParse(file.buffer);

            resumeText = pdfData.text || "";
        } else {
            /*
              Basic support for DOC/DOCX.
              Full DOC/DOCX parsing can be added later.
            */
            resumeText = file.originalname || "";
        }

        const text = normalizeText(resumeText);

        console.log(
            "Resume text extracted:",
            text.substring(0, 300)
        );

        /* ---------- SKILL DETECTION ---------- */

        const technicalKeywords = [
            "javascript",
            "python",
            "react",
            "node",
            "sql",
            "excel",
            "machine learning",
            "ai",
            "data analysis",
            "figma",
            "agile",
            "scrum",
            "product management",
            "product strategy",
            "product roadmap",
            "user research",
            "user stories",
            "acceptance criteria",
            "html",
            "css",
            "mongodb",
            "power bi",
            "tableau",
            "statistics",
            "prompt engineering",
            "generative ai",
            "llm",
            "api",
            "github",
        ];

        const detectedSkills = technicalKeywords.filter((skill) =>
            text.includes(skill.toLowerCase())
        );

        /* ---------- RESUME SECTIONS ---------- */

        const hasProjects =
            text.includes("project") ||
            text.includes("github") ||
            text.includes("portfolio");

        const hasEducation =
            text.includes("education") ||
            text.includes("b.tech") ||
            text.includes("btech") ||
            text.includes("university") ||
            text.includes("college");

        const hasExperience =
            text.includes("experience") ||
            text.includes("internship") ||
            text.includes("intern") ||
            text.includes("freelance");

        /* ---------- SCORE ---------- */

        let score = 55;

        score += Math.min(detectedSkills.length * 5, 25);

        if (hasProjects) score += 8;
        if (hasEducation) score += 5;
        if (hasExperience) score += 7;

        score = Math.min(score, 95);

        /* ---------- STRENGTHS ---------- */

        const strengths = [];

        if (detectedSkills.length > 0) {
            strengths.push(
                "Your resume contains relevant technical and professional skills."
            );
        }

        if (hasProjects) {
            strengths.push(
                "Your resume includes project experience, which demonstrates practical skills."
            );
        }

        if (hasEducation) {
            strengths.push(
                "Your educational background is clearly represented."
            );
        }

        if (hasExperience) {
            strengths.push(
                "Your resume includes experience, internship, or freelance-related information."
            );
        }

        if (strengths.length === 0) {
            strengths.push(
                "Your resume has a basic structure that can be improved further."
            );
        }

        /* ---------- ROLE SKILLS ---------- */

        const roleSkills = getRequiredSkills(targetRole);

        const missingSkills = roleSkills
            .filter(
                (skill) =>
                    !detectedSkills.some(
                        (detectedSkill) =>
                            normalizeText(detectedSkill) ===
                            normalizeText(skill)
                    )
            )
            .slice(0, 6);

        /* ---------- AREAS TO IMPROVE ---------- */

        const areasToImprove = [];

        if (missingSkills.length > 0) {
            areasToImprove.push(
                `For a ${targetRole} role, consider developing: ${missingSkills.join(
                    ", "
                )}.`
            );
        }

        if (!hasProjects) {
            areasToImprove.push(
                "Add relevant projects to demonstrate practical experience."
            );
        }

        if (!hasExperience) {
            areasToImprove.push(
                "Add internships, freelance work, certifications, or practical experience."
            );
        }

        if (detectedSkills.length < 4) {
            areasToImprove.push(
                "Add more relevant technical and role-specific skills."
            );
        }

        /* ---------- RESPONSE ---------- */

        const responseData = {
            success: true,
            score,
            targetRole,
            experience,
            detectedSkills,
            strengths,
            areasToImprove,
            missingSkills,
            message: "Resume analyzed successfully.",
        };

        console.log("✅ Resume analysis completed.");

        res.json(responseData);

    } catch (error) {
        console.error(
            "❌ Resume analysis error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Error while analyzing resume.",
        });
    }
});

/* =====================================================
   SKILL GAP ANALYSIS
===================================================== */

app.post("/api/skill-gap", (req, res) => {
    try {
        console.log("\n===== SKILL GAP REQUEST =====");

        const {
            targetRole,
            currentSkills = [],
        } = req.body;

        if (!targetRole) {
            return res.status(400).json({
                success: false,
                message: "Target role is required.",
            });
        }

        const cleanedCurrentSkills =
            cleanSkills(currentSkills);

        const requiredSkills =
            getRequiredSkills(targetRole);

        if (requiredSkills.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    `No skill data found for ${targetRole}.`,
            });
        }

        const normalizedCurrentSkills =
            cleanedCurrentSkills.map(normalizeText);

        const matchedSkills =
            requiredSkills.filter((skill) =>
                normalizedCurrentSkills.includes(
                    normalizeText(skill)
                )
            );

        const missingSkills =
            requiredSkills.filter(
                (skill) =>
                    !normalizedCurrentSkills.includes(
                        normalizeText(skill)
                    )
            );

        const matchScore =
            requiredSkills.length > 0
                ? Math.round(
                    (matchedSkills.length /
                        requiredSkills.length) *
                    100
                )
                : 0;

        const prioritizedSkills =
            missingSkills.map((skill, index) => ({
                name: skill,
                skill: skill,
                priority: getPriority(index),
                reason:
                    index < 2
                        ? `This is an important skill for becoming a ${targetRole}.`
                        : `This skill will strengthen your profile for the ${targetRole} role.`,
            }));

        const responseData = {
            success: true,
            targetRole,
            matchScore,
            currentSkills: cleanedCurrentSkills,
            matchedSkills,
            missingSkills: prioritizedSkills,
            totalRequiredSkills:
                requiredSkills.length,
            matchedSkillsCount:
                matchedSkills.length,
        };

        console.log("✅ Skill gap completed.");

        res.json(responseData);

    } catch (error) {
        console.error(
            "❌ Skill gap error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Error while analyzing skill gap.",
        });
    }
});

/* =====================================================
   LEARNING ROADMAP
===================================================== */

app.post("/api/roadmap", (req, res) => {
    try {
        const {
            targetRole,
            currentSkills = [],
            missingSkills = [],
        } = req.body;

        if (!targetRole) {
            return res.status(400).json({
                success: false,
                message: "Target role is required.",
            });
        }

        const cleanedCurrentSkills =
            cleanSkills(currentSkills);

        const cleanedMissingSkills =
            cleanSkills(missingSkills);

        let skillsToLearn = [];

        if (cleanedMissingSkills.length > 0) {
            skillsToLearn = cleanedMissingSkills;
        } else {
            const requiredSkills =
                getRequiredSkills(targetRole);

            const normalizedCurrentSkills =
                cleanedCurrentSkills.map(normalizeText);

            skillsToLearn =
                requiredSkills.filter(
                    (skill) =>
                        !normalizedCurrentSkills.includes(
                            normalizeText(skill)
                        )
                );
        }

        const phase1Skills =
            skillsToLearn.slice(0, 2);

        const phase2Skills =
            skillsToLearn.slice(2, 5);

        const phase3Skills =
            skillsToLearn.slice(5);

        const createSkill = (skill, index) => ({
            name: skill,
            priority: getPriority(index),

            description:
                `Learn the fundamentals of ${skill} and understand how it is used in a ${targetRole} role.`,

            duration:
                index < 2
                    ? "2-3 Weeks"
                    : index < 5
                        ? "3-4 Weeks"
                        : "2 Weeks",

            resources: [
                "Official Documentation",
                "Online Tutorials",
                "Build a Practical Project",
            ],
        });

        const phases = [];

        if (phase1Skills.length > 0) {
            phases.push({
                phase: 1,
                title:
                    "Build Your Core Foundation",
                description:
                    `Start with the most important skills required for becoming a ${targetRole}.`,
                skills:
                    phase1Skills.map(
                        (skill, index) =>
                            createSkill(skill, index)
                    ),
            });
        }

        if (phase2Skills.length > 0) {
            phases.push({
                phase: 2,
                title:
                    "Build Practical Skills",
                description:
                    "Strengthen your skills through hands-on learning and practical exercises.",
                skills:
                    phase2Skills.map(
                        (skill, index) =>
                            createSkill(
                                skill,
                                index + 2
                            )
                    ),
            });
        }

        if (phase3Skills.length > 0) {
            phases.push({
                phase: 3,
                title:
                    "Become Job Ready",
                description:
                    "Focus on advanced skills, projects, portfolio building, and interview preparation.",
                skills:
                    phase3Skills.map(
                        (skill, index) =>
                            createSkill(
                                skill,
                                index + 5
                            )
                    ),
            });
        }

        if (phases.length === 0) {
            phases.push({
                phase: 1,
                title:
                    "Maintain and Improve Your Skills",
                description:
                    "You already have the major skills required. Focus on projects, real-world experience, and interview preparation.",
                skills: [],
            });
        }

        res.json({
            success: true,
            targetRole,
            totalPhases: phases.length,
            totalSkillsToLearn:
                skillsToLearn.length,
            phases,
        });

    } catch (error) {
        console.error(
            "❌ Roadmap error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Error while generating roadmap.",
        });
    }
});

/* =====================================================
   INTERVIEW QUESTIONS
===================================================== */

app.get(
    "/api/interview/questions",
    (req, res) => {
        try {
            const {
                targetRole,
                experience = "Fresher",
            } = req.query;

            if (!targetRole) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Target role is required.",
                });
            }

            const experienceLevel =
                normalizeExperience(experience);

            const roleKey =
                Object.keys(interviewQuestions).find(
                    (key) =>
                        key.toLowerCase() ===
                        targetRole.toLowerCase()
                );

            const roleData =
                interviewQuestions[targetRole] ||
                (roleKey
                    ? interviewQuestions[roleKey]
                    : null);

            if (!roleData) {
                return res.status(404).json({
                    success: false,
                    message:
                        `Interview questions are not available for ${targetRole}.`,
                });
            }

            let questions =
                roleData[experienceLevel];

            if (!questions) {
                questions =
                    roleData.Fresher || [];
            }

            res.json({
                success: true,
                targetRole,
                experience:
                    experienceLevel,
                totalQuestions:
                    questions.length,
                questions,
            });

        } catch (error) {
            console.error(
                "❌ Interview questions error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error while generating interview questions.",
            });
        }
    }
);

/* =====================================================
   INTERVIEW ANSWER EVALUATION
===================================================== */

app.post(
    "/api/interview/evaluate",
    (req, res) => {
        try {
            const {
                targetRole,
                questionId,
                answer,
            } = req.body;

            if (
                !targetRole ||
                !questionId ||
                !answer
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Target role, question ID, and answer are required.",
                });
            }

            const roleKey =
                Object.keys(interviewQuestions).find(
                    (key) =>
                        key.toLowerCase() ===
                        targetRole.toLowerCase()
                );

            const roleData =
                interviewQuestions[targetRole] ||
                (roleKey
                    ? interviewQuestions[roleKey]
                    : null);

            if (!roleData) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Interview role not found.",
                });
            }

            const allQuestions =
                Object.values(roleData).flat();

            const question =
                allQuestions.find(
                    (item) =>
                        Number(item.id) ===
                        Number(questionId)
                );

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Question not found.",
                });
            }

            const answerText =
                normalizeText(answer);

            const expectedKeywords =
                question.expectedKeywords ||
                [];

            const matchedKeywords =
                expectedKeywords.filter(
                    (keyword) =>
                        answerText.includes(
                            normalizeText(keyword)
                        )
                );

            const missingKeywords =
                expectedKeywords.filter(
                    (keyword) =>
                        !answerText.includes(
                            normalizeText(keyword)
                        )
                );

            let score = 30;

            if (expectedKeywords.length > 0) {
                score += Math.round(
                    (matchedKeywords.length /
                        expectedKeywords.length) *
                    50
                );
            }

            const wordCount =
                String(answer)
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .length;

            if (wordCount >= 30) {
                score += 10;
            }

            if (wordCount >= 60) {
                score += 10;
            }

            score = Math.min(score, 100);

            let feedback = "";

            if (score >= 80) {
                feedback =
                    "Strong answer. You covered many important concepts. Try adding a real-world example to make your answer even stronger.";
            } else if (score >= 60) {
                feedback =
                    "Good attempt. Your answer covers some important points, but you can improve it by explaining the concept in more detail.";
            } else {
                feedback =
                    "Your answer needs more detail. Try structuring your answer clearly and include more role-specific concepts.";
            }

            const strengths = [];

            if (matchedKeywords.length > 0) {
                strengths.push(
                    `You included relevant concepts such as: ${matchedKeywords.join(
                        ", "
                    )}.`
                );
            }

            if (wordCount >= 30) {
                strengths.push(
                    "Your answer contains a reasonable level of explanation."
                );
            }

            if (strengths.length === 0) {
                strengths.push(
                    "You attempted to answer the question, which is the first step toward improving."
                );
            }

            const improvements = [];

            if (missingKeywords.length > 0) {
                improvements.push(
                    `Consider including these concepts: ${missingKeywords.join(
                        ", "
                    )}.`
                );
            }

            if (wordCount < 30) {
                improvements.push(
                    "Try giving a more detailed and structured answer."
                );
            }

            improvements.push(
                "Use an example or real-world scenario when possible."
            );

            res.json({
                success: true,
                question: question.question,
                category: question.category,
                difficulty: question.difficulty,
                score,
                matchedKeywords,
                missingKeywords,
                strengths,
                improvements,
                feedback,
                wordCount,
            });

        } catch (error) {
            console.error(
                "❌ Answer evaluation error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error while evaluating answer.",
            });
        }
    }
);

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use((error, req, res, next) => {
    console.error("GLOBAL ERROR:", error);

    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message:
                error.code === "LIMIT_FILE_SIZE"
                    ? "File is too large. Maximum size is 5 MB."
                    : error.message,
        });
    }

    res.status(500).json({
        success: false,
        message:
            error.message ||
            "Something went wrong on the server.",
    });
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `\n🚀 Backend running on port ${PORT}`
    );

    console.log(
        `❤️ Health check: /api/health`
    );
});