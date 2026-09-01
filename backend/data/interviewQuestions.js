const interviewQuestions = {
    "AI Product Manager": {
        Fresher: [
            {
                id: 1,
                question: "What is an AI Product Manager?",
                category: "AI Product Management",
                difficulty: "Easy",
                expectedKeywords: [
                    "product",
                    "ai",
                    "users",
                    "business",
                    "technology",
                    "strategy",
                ],
            },
            {
                id: 2,
                question:
                    "How is an AI Product Manager different from a traditional Product Manager?",
                category: "AI Strategy",
                difficulty: "Medium",
                expectedKeywords: [
                    "machine learning",
                    "data",
                    "model",
                    "ai",
                    "product",
                    "traditional",
                ],
            },
            {
                id: 3,
                question:
                    "How would you prioritize features for an AI-powered product?",
                category: "Product Prioritization",
                difficulty: "Medium",
                expectedKeywords: [
                    "users",
                    "impact",
                    "business",
                    "rice",
                    "priority",
                    "value",
                ],
            },
            {
                id: 4,
                question:
                    "What metrics would you use to measure the success of an AI product?",
                category: "Product Metrics",
                difficulty: "Medium",
                expectedKeywords: [
                    "accuracy",
                    "users",
                    "engagement",
                    "retention",
                    "business",
                    "performance",
                ],
            },
            {
                id: 5,
                question:
                    "What would you do if an AI model gives incorrect answers to users?",
                category: "AI Safety",
                difficulty: "Hard",
                expectedKeywords: [
                    "feedback",
                    "model",
                    "accuracy",
                    "data",
                    "testing",
                    "monitoring",
                ],
            },
        ],

        Intermediate: [
            {
                id: 1,
                question:
                    "How would you launch an AI feature when the model accuracy is not perfect?",
                category: "AI Product Strategy",
                difficulty: "Medium",
                expectedKeywords: [
                    "accuracy",
                    "testing",
                    "users",
                    "risk",
                    "monitoring",
                    "feedback",
                ],
            },
            {
                id: 2,
                question:
                    "How would you handle hallucinations in a Generative AI product?",
                category: "Generative AI",
                difficulty: "Hard",
                expectedKeywords: [
                    "hallucination",
                    "retrieval",
                    "validation",
                    "monitoring",
                    "feedback",
                    "guardrails",
                ],
            },
        ],
    },

    "Data Analyst": {
        Fresher: [
            {
                id: 1,
                question: "What is the role of a Data Analyst?",
                category: "Data Analysis",
                difficulty: "Easy",
                expectedKeywords: [
                    "data",
                    "insights",
                    "business",
                    "analysis",
                    "decisions",
                ],
            },
            {
                id: 2,
                question: "What is the difference between SQL and Excel?",
                category: "Technical Skills",
                difficulty: "Easy",
                expectedKeywords: [
                    "sql",
                    "database",
                    "excel",
                    "spreadsheet",
                    "data",
                ],
            },
            {
                id: 3,
                question: "How would you clean a messy dataset?",
                category: "Data Cleaning",
                difficulty: "Medium",
                expectedKeywords: [
                    "missing",
                    "duplicates",
                    "errors",
                    "format",
                    "data",
                ],
            },
            {
                id: 4,
                question:
                    "How do you decide which visualization to use for a dataset?",
                category: "Data Visualization",
                difficulty: "Medium",
                expectedKeywords: [
                    "chart",
                    "data",
                    "comparison",
                    "trend",
                    "visualization",
                ],
            },
        ],
    },

    "Frontend Developer": {
        Fresher: [
            {
                id: 1,
                question: "What is React and why is it used?",
                category: "React",
                difficulty: "Easy",
                expectedKeywords: [
                    "javascript",
                    "components",
                    "ui",
                    "react",
                    "interface",
                ],
            },
            {
                id: 2,
                question: "What is the difference between props and state in React?",
                category: "React",
                difficulty: "Medium",
                expectedKeywords: [
                    "props",
                    "state",
                    "component",
                    "data",
                    "update",
                ],
            },
            {
                id: 3,
                question: "What is useState in React?",
                category: "React Hooks",
                difficulty: "Easy",
                expectedKeywords: [
                    "state",
                    "hook",
                    "component",
                    "update",
                    "react",
                ],
            },
        ],
    },
};

module.exports = interviewQuestions;