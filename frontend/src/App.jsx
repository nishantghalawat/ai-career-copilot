import { useState } from "react";
import "./App.css";

const API_URL = "https://ai-career-copilot-lrxf.onrender.com";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  // =========================
  // RESUME
  // =========================

  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("AI Product Manager");
  const [experience, setExperience] = useState("Fresher");
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // =========================
  // SKILL GAP
  // =========================

  const [currentSkills, setCurrentSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillGapRole, setSkillGapRole] =
    useState("AI Product Manager");
  const [skillGapResult, setSkillGapResult] = useState(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);

  // =========================
  // ROADMAP
  // =========================

  const [roadmapResult, setRoadmapResult] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // =========================
  // INTERVIEW
  // =========================

  const [interviewRole, setInterviewRole] =
    useState("AI Product Manager");

  const [interviewExperience, setInterviewExperience] =
    useState("Fresher");

  const [interviewQuestions, setInterviewQuestions] =
    useState([]);

  const [interviewLoading, setInterviewLoading] =
    useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [userAnswer, setUserAnswer] = useState("");

  const [evaluationResult, setEvaluationResult] =
    useState(null);

  const [evaluationLoading, setEvaluationLoading] =
    useState(false);

  const [interviewScores, setInterviewScores] = useState([]);

  // =========================
  // PROGRESS
  // =========================

  const [skillProgress, setSkillProgress] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "careerCopilotProgress"
        ) || "{}"
      );
    } catch {
      return {};
    }
  });

  // =========================
  // PROFILE
  // =========================

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "careerCopilotProfile"
        ) ||
        '{"name":"","role":"AI Product Manager","experience":"Fresher"}'
      );
    } catch {
      return {
        name: "",
        role: "AI Product Manager",
        experience: "Fresher",
      };
    }
  });

  // =========================
  // DASHBOARD
  // =========================

  const features = [
    {
      icon: "📄",
      title: "Resume Analyzer",
      description:
        "Upload your resume and get AI-powered feedback.",
      page: "resume",
    },
    {
      icon: "🎯",
      title: "Skill Gap Analysis",
      description:
        "Compare your current skills with your dream role.",
      page: "skills",
    },
    {
      icon: "🗺️",
      title: "Learning Roadmap",
      description:
        "Get a personalized roadmap for your career.",
      page: "roadmap",
    },
    {
      icon: "🎤",
      title: "Interview Prep",
      description:
        "Practice interview questions and get AI-powered feedback.",
      page: "interview",
    },
  ];

  // =========================
  // SAFE HELPERS
  // =========================

  const getText = (value) => {
    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }

    if (value && typeof value === "object") {
      return (
        value.text ||
        value.name ||
        value.title ||
        value.skill ||
        value.label ||
        value.description ||
        value.reason ||
        value.question ||
        ""
      );
    }

    return "";
  };

  const getSkillName = (skill) => {
    if (
      typeof skill === "string" ||
      typeof skill === "number"
    ) {
      return String(skill);
    }

    if (skill && typeof skill === "object") {
      return (
        skill.name ||
        skill.skill ||
        skill.title ||
        skill.label ||
        ""
      );
    }

    return "";
  };

  const getPriority = (item) => {
    if (item && typeof item === "object") {
      return item.priority || "Medium";
    }

    return "Medium";
  };

  const getReason = (item) => {
    if (item && typeof item === "object") {
      return (
        item.reason ||
        item.description ||
        item.details ||
        "Important skill for this role."
      );
    }

    return "Important skill for this role.";
  };

  const getQuestionText = (question) => {
    if (typeof question === "string") {
      return question;
    }

    if (question && typeof question === "object") {
      return (
        question.question ||
        question.text ||
        question.title ||
        ""
      );
    }

    return "";
  };

  // =========================
  // RESUME ANALYSIS
  // =========================

  const analyzeResume = async () => {
    if (!resumeFile) {
      alert("Please upload your resume first.");
      return;
    }

    try {
      setResumeLoading(true);

      const formData = new FormData();

      formData.append("resume", resumeFile);
      formData.append("targetRole", targetRole);
      formData.append("experience", experience);

      const response = await fetch(
        `${API_URL}/api/analyze-resume`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to analyze resume."
        );
      }

      setResumeResult(data);

      setSkillGapResult(null);
      setRoadmapResult(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setResumeLoading(false);
    }
  };

  const resetResumeAnalysis = () => {
    setResumeFile(null);
    setResumeResult(null);
  };

  // =========================
  // RESUME → SKILL GAP
  // =========================

  const goToSkillGapFromResume = () => {
    if (!resumeResult) return;

    const detectedSkills = Array.isArray(
      resumeResult.detectedSkills
    )
      ? resumeResult.detectedSkills
        .map((skill) => getSkillName(skill))
        .filter(Boolean)
      : [];

    setCurrentSkills(detectedSkills);

    setSkillGapRole(
      typeof resumeResult.targetRole === "string"
        ? resumeResult.targetRole
        : targetRole || "AI Product Manager"
    );

    setSkillGapResult(null);
    setRoadmapResult(null);

    setActivePage("skills");
  };

  // =========================
  // SKILL GAP
  // =========================

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    const exists = currentSkills.some(
      (item) =>
        getSkillName(item).toLowerCase() ===
        skill.toLowerCase()
    );

    if (exists) {
      setNewSkill("");
      return;
    }

    setCurrentSkills((previous) => [
      ...previous,
      skill,
    ]);

    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    const name = getSkillName(skillToRemove);

    setCurrentSkills((previous) =>
      previous.filter(
        (skill) =>
          getSkillName(skill) !== name
      )
    );
  };

  const analyzeSkillGap = async () => {
    if (currentSkills.length === 0) {
      alert(
        "Please add at least one current skill."
      );
      return;
    }

    try {
      setSkillGapLoading(true);

      const cleanSkills = currentSkills
        .map((skill) => getSkillName(skill))
        .filter(Boolean);

      const response = await fetch(
        `${API_URL}/api/skill-gap`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            targetRole: skillGapRole,
            currentSkills: cleanSkills,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to analyze skill gap."
        );
      }

      setSkillGapResult(data);
      setRoadmapResult(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSkillGapLoading(false);
    }
  };

  const resetSkillGap = () => {
    setSkillGapResult(null);
    setRoadmapResult(null);
  };

  // =========================
  // ROADMAP
  // =========================

  const generateRoadmap = async () => {
    if (!skillGapResult) {
      setActivePage("skills");
      return;
    }

    try {
      setRoadmapLoading(true);

      const missingSkills = Array.isArray(
        skillGapResult.missingSkills
      )
        ? skillGapResult.missingSkills
          .map((skill) =>
            getSkillName(skill)
          )
          .filter(Boolean)
        : [];

      const cleanCurrentSkills =
        currentSkills
          .map((skill) =>
            getSkillName(skill)
          )
          .filter(Boolean);

      const response = await fetch(
        `${API_URL}/api/roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            targetRole:
              typeof skillGapResult.targetRole ===
                "string"
                ? skillGapResult.targetRole
                : skillGapRole,

            currentSkills:
              cleanCurrentSkills,

            missingSkills:
              missingSkills,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to generate roadmap."
        );
      }

      setRoadmapResult(data);
      setActivePage("roadmap");
    } catch (error) {
      alert(error.message);
    } finally {
      setRoadmapLoading(false);
    }
  };

  // =========================
  // PROGRESS TRACKING
  // =========================

  const updateSkillProgress = (
    skillName,
    value
  ) => {
    const cleanName =
      getSkillName(skillName);

    if (!cleanName) return;

    setSkillProgress((previous) => {
      const updated = {
        ...previous,
        [cleanName]: Math.min(
          100,
          Math.max(0, Number(value))
        ),
      };

      localStorage.setItem(
        "careerCopilotProgress",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const getRoadmapProgress = () => {
    const values = Object.values(
      skillProgress
    );

    if (values.length === 0) {
      return 0;
    }

    return Math.round(
      values.reduce(
        (sum, value) =>
          sum + Number(value),
        0
      ) / values.length
    );
  };

  // =========================
  // INTERVIEW
  // =========================

  const generateInterviewQuestions =
    async () => {
      try {
        setInterviewLoading(true);

        setInterviewQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswer("");
        setEvaluationResult(null);
        setInterviewScores([]);

        const response = await fetch(
          `${API_URL}/api/interview/questions?targetRole=${encodeURIComponent(
            interviewRole
          )}&experience=${encodeURIComponent(
            interviewExperience
          )}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to generate interview questions."
          );
        }

        setInterviewQuestions(
          Array.isArray(data.questions)
            ? data.questions
            : []
        );
      } catch (error) {
        alert(error.message);
      } finally {
        setInterviewLoading(false);
      }
    };

  // =========================
  // EVALUATE ANSWER
  // =========================

  const evaluateAnswer = async () => {
    if (!userAnswer.trim()) {
      alert(
        "Please write your answer first."
      );
      return;
    }

    const currentQuestion =
      interviewQuestions[
      currentQuestionIndex
      ];

    if (!currentQuestion) return;

    try {
      setEvaluationLoading(true);

      const questionId =
        currentQuestion &&
          typeof currentQuestion ===
          "object"
          ? currentQuestion.id ||
          currentQuestionIndex + 1
          : currentQuestionIndex + 1;

      const response = await fetch(
        `${API_URL}/api/interview/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            targetRole:
              interviewRole,
            questionId,
            answer: userAnswer,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to evaluate answer."
        );
      }

      setEvaluationResult(data);

      if (
        typeof data.score ===
        "number"
      ) {
        setInterviewScores(
          (previous) => [
            ...previous,
            data.score,
          ]
        );
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setEvaluationLoading(false);
    }
  };

  const nextQuestion = () => {
    if (
      currentQuestionIndex <
      interviewQuestions.length - 1
    ) {
      setCurrentQuestionIndex(
        (previous) =>
          previous + 1
      );

      setUserAnswer("");
      setEvaluationResult(null);
    }
  };

  const previousQuestion = () => {
    if (
      currentQuestionIndex > 0
    ) {
      setCurrentQuestionIndex(
        (previous) =>
          previous - 1
      );

      setUserAnswer("");
      setEvaluationResult(null);
    }
  };

  const restartInterview = () => {
    setInterviewQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setEvaluationResult(null);
    setInterviewScores([]);
  };

  const getInterviewAverage = () => {
    if (
      interviewScores.length === 0
    ) {
      return 0;
    }

    return Math.round(
      interviewScores.reduce(
        (sum, score) =>
          sum + Number(score),
        0
      ) /
      interviewScores.length
    );
  };

  // =========================
  // CAREER READINESS
  // =========================

  const getResumeScore = () => {
    return Number(
      resumeResult?.score || 0
    );
  };

  const getSkillMatchScore = () => {
    return Number(
      skillGapResult?.matchScore || 0
    );
  };

  const getCareerReadiness = () => {
    const resumeScore =
      getResumeScore();

    const skillScore =
      getSkillMatchScore();

    const roadmapScore =
      getRoadmapProgress();

    const interviewScore =
      getInterviewAverage();

    const activeScores = [];

    if (resumeResult) {
      activeScores.push({
        score: resumeScore,
        weight: 0.3,
      });
    }

    if (skillGapResult) {
      activeScores.push({
        score: skillScore,
        weight: 0.25,
      });
    }

    if (
      roadmapResult &&
      Object.keys(skillProgress)
        .length > 0
    ) {
      activeScores.push({
        score: roadmapScore,
        weight: 0.2,
      });
    }

    if (
      interviewScores.length > 0
    ) {
      activeScores.push({
        score: interviewScore,
        weight: 0.25,
      });
    }

    if (activeScores.length === 0) {
      return 0;
    }

    const totalWeight =
      activeScores.reduce(
        (sum, item) =>
          sum + item.weight,
        0
      );

    const weightedScore =
      activeScores.reduce(
        (sum, item) =>
          sum +
          item.score *
          item.weight,
        0
      );

    return Math.round(
      weightedScore /
      totalWeight
    );
  };

  // =========================
  // PROFILE
  // =========================

  const updateProfile = (
    field,
    value
  ) => {
    setProfile((previous) => {
      const updated = {
        ...previous,
        [field]: value,
      };

      localStorage.setItem(
        "careerCopilotProfile",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // =========================
  // PAGE TITLE
  // =========================

  const titles = {
    dashboard: {
      small: "Welcome back 👋",
      title:
        "Build your career with AI",
    },

    resume: {
      small:
        "AI-Powered Resume Review",
      title: "Resume Analysis",
    },

    skills: {
      small:
        "Discover What You Need to Learn",
      title: "Skill Gap Analysis",
    },

    roadmap: {
      small:
        "Your Personalized Career Plan",
      title: "Learning Roadmap",
    },

    interview: {
      small:
        "Practice With AI",
      title:
        "Interview Preparation",
    },

    profile: {
      small:
        "Manage Your Career Profile",
      title: "My Profile",
    },
  };

  const pageTitle =
    titles[activePage] ||
    titles.dashboard;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">
            AI
          </div>

          <div>
            <h2>
              Career Copilot
            </h2>

            <p>
              Your AI Career Guide
            </p>
          </div>
        </div>

        <nav>

          <button
            className={
              activePage ===
                "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage(
                "dashboard"
              )
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={
              activePage ===
                "resume"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage(
                "resume"
              )
            }
          >
            📄 Resume Analysis
          </button>

          <button
            className={
              activePage ===
                "skills"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage(
                "skills"
              )
            }
          >
            🎯 Skill Gap
          </button>

          <button
            className={
              activePage ===
                "roadmap"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage(
                "roadmap"
              )
            }
          >
            🗺️ Roadmap
          </button>

          <button
            className={
              activePage ===
                "interview"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage(
                "interview"
              )
            }
          >
            🎤 Interview Prep
          </button>

          <button
            className={
              activePage ===
                "profile"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage(
                "profile"
              )
            }
          >
            👤 Profile
          </button>

        </nav>

        <div className="sidebar-bottom">
          <p>
            AI PM Portfolio Project
          </p>
        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">

        <header>

          <div>
            <p className="welcome">
              {pageTitle.small}
            </p>

            <h1>
              {pageTitle.title}
            </h1>
          </div>

          <button
            className="profile"
            onClick={() =>
              setActivePage(
                "profile"
              )
            }
          >
            {profile.name
              ? profile.name
                .charAt(0)
                .toUpperCase()
              : "N"}
          </button>

        </header>

        {/* ================= DASHBOARD ================= */}

        {activePage ===
          "dashboard" && (
            <>

              <section className="hero">

                <div>

                  <span className="badge">
                    ✨ AI POWERED
                  </span>

                  <h2>
                    Your personal career
                    intelligence platform.
                  </h2>

                  <p>
                    Analyze your skills,
                    discover career gaps,
                    and get a personalized
                    roadmap to achieve your
                    career goals.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setActivePage(
                        "resume"
                      )
                    }
                  >
                    Analyze My Resume →
                  </button>

                </div>

                <div className="hero-icon">
                  🚀
                </div>

              </section>

              {/* CAREER SCORE */}

              <section className="career-score-card">

                <div className="career-score-info">

                  <span className="mini-badge">
                    CAREER INTELLIGENCE
                  </span>

                  <h2>
                    Career Readiness
                  </h2>

                  <p>
                    Your overall career
                    readiness based on
                    resume, skills, roadmap
                    and interview performance.
                  </p>

                  <div className="score-components">

                    <div>
                      <span>
                        Resume
                      </span>
                      <strong>
                        {getResumeScore()}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Skills
                      </span>
                      <strong>
                        {getSkillMatchScore()}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Roadmap
                      </span>
                      <strong>
                        {getRoadmapProgress()}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Interview
                      </span>
                      <strong>
                        {getInterviewAverage()}%
                      </strong>
                    </div>

                  </div>

                </div>

                <div className="readiness-score">

                  <div
                    className="readiness-circle"
                    style={{
                      "--score":
                        `${getCareerReadiness()}%`,
                    }}
                  >
                    <strong>
                      {getCareerReadiness()}%
                    </strong>

                    <span>
                      Ready
                    </span>
                  </div>

                </div>

              </section>

              {/* CAREER TOOLS */}

              <section className="section-header">

                <div>
                  <h2>
                    Your Career Tools
                  </h2>

                  <p>
                    Everything you need
                    to move forward.
                  </p>
                </div>

              </section>

              <section className="feature-grid">

                {features.map(
                  (feature) => (
                    <div
                      className="feature-card"
                      key={feature.title}
                    >

                      <div className="feature-icon">
                        {feature.icon}
                      </div>

                      <h3>
                        {feature.title}
                      </h3>

                      <p>
                        {feature.description}
                      </p>

                      <button
                        onClick={() =>
                          setActivePage(
                            feature.page
                          )
                        }
                      >
                        Explore →
                      </button>

                    </div>
                  )
                )}

              </section>

            </>
          )}

        {/* ================= RESUME ================= */}

        {activePage ===
          "resume" && (
            <>

              {!resumeResult ? (
                <section className="resume-layout">

                  <div className="resume-upload-card">

                    <div className="page-title">

                      <div className="page-icon">
                        📄
                      </div>

                      <div>
                        <h2>
                          Upload Your Resume
                        </h2>

                        <p>
                          Upload your resume
                          and get AI-powered
                          feedback.
                        </p>
                      </div>

                    </div>

                    <label className="upload-box">

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) =>
                          setResumeFile(
                            event.target
                              .files?.[0] ||
                            null
                          )
                        }
                      />

                      <div className="upload-icon">
                        📄
                      </div>

                      <h3>
                        Click to upload
                        your resume
                      </h3>

                      <p>
                        PDF, DOC or DOCX
                        supported
                      </p>

                      {resumeFile && (
                        <p className="selected-file-name">
                          Selected:{" "}
                          {resumeFile.name}
                        </p>
                      )}

                    </label>

                    <div className="form-group">

                      <label>
                        Target Career Role
                      </label>

                      <select
                        value={targetRole}
                        onChange={(event) =>
                          setTargetRole(
                            event.target.value
                          )
                        }
                      >
                        <option>
                          AI Product Manager
                        </option>

                        <option>
                          Data Analyst
                        </option>

                        <option>
                          Frontend Developer
                        </option>
                      </select>

                    </div>

                    <div className="form-group">

                      <label>
                        Experience Level
                      </label>

                      <select
                        value={experience}
                        onChange={(event) =>
                          setExperience(
                            event.target.value
                          )
                        }
                      >
                        <option>
                          Fresher
                        </option>

                        <option>
                          Intermediate
                        </option>
                      </select>

                    </div>

                    <button
                      className="analyze-btn"
                      onClick={
                        analyzeResume
                      }
                      disabled={
                        resumeLoading
                      }
                    >
                      {resumeLoading
                        ? "Analyzing Resume..."
                        : "✨ Analyze Resume"}
                    </button>

                  </div>

                  <div className="analysis-info-card">

                    <h3>
                      What will AI analyze?
                    </h3>

                    <div className="analysis-info-item">
                      <span>🎯</span>
                      <div>
                        <h4>
                          Role Match
                        </h4>
                        <p>
                          Compare your profile
                          with your target role.
                        </p>
                      </div>
                    </div>

                    <div className="analysis-info-item">
                      <span>💪</span>
                      <div>
                        <h4>
                          Strengths
                        </h4>
                        <p>
                          Discover your strongest
                          skills.
                        </p>
                      </div>
                    </div>

                    <div className="analysis-info-item">
                      <span>📈</span>
                      <div>
                        <h4>
                          Skill Gaps
                        </h4>
                        <p>
                          Find skills you need
                          to learn.
                        </p>
                      </div>
                    </div>

                    <div className="analysis-info-item">
                      <span>🗺️</span>
                      <div>
                        <h4>
                          Roadmap
                        </h4>
                        <p>
                          Build your personalized
                          learning journey.
                        </p>
                      </div>
                    </div>

                  </div>

                </section>
              ) : (

                <section className="analysis-results">

                  <div className="result-top">

                    <div>
                      <p>
                        Analysis Complete ✨
                      </p>

                      <h2>
                        Your Resume Report
                      </h2>

                      <p>
                        Target Role:{" "}
                        <strong>
                          {getText(
                            resumeResult.targetRole
                          ) ||
                            targetRole}
                        </strong>
                      </p>
                    </div>

                    <button
                      className="secondary-btn"
                      onClick={
                        resetResumeAnalysis
                      }
                    >
                      Analyze Another Resume
                    </button>

                  </div>

                  <div className="score-card">

                    <div className="score-circle">

                      <span>
                        {Number(
                          resumeResult.score ||
                          0
                        )}
                      </span>

                      <small>
                        /100
                      </small>

                    </div>

                    <div>
                      <h2>
                        Resume Match Score
                      </h2>

                      <p>
                        Your resume has been
                        analyzed based on your
                        skills and target career.
                      </p>
                    </div>

                  </div>

                  <div className="result-grid">

                    <div className="result-card">

                      <h3>
                        💪 Strengths
                      </h3>

                      <ul>
                        {Array.isArray(
                          resumeResult.strengths
                        ) &&
                          resumeResult
                            .strengths
                            .length > 0 ? (
                          resumeResult.strengths.map(
                            (item, index) => (
                              <li
                                key={`strength-${index}`}
                              >
                                {getText(
                                  item
                                )}
                              </li>
                            )
                          )
                        ) : (
                          <li>
                            No strengths
                            data available.
                          </li>
                        )}
                      </ul>

                    </div>

                    <div className="result-card">

                      <h3>
                        📈 Areas to Improve
                      </h3>

                      <ul>
                        {Array.isArray(
                          resumeResult.areasToImprove
                        ) &&
                          resumeResult
                            .areasToImprove
                            .length > 0 ? (
                          resumeResult
                            .areasToImprove
                            .map(
                              (
                                item,
                                index
                              ) => (
                                <li
                                  key={`improve-${index}`}
                                >
                                  {getText(
                                    item
                                  )}
                                </li>
                              )
                            )
                        ) : (
                          <li>
                            No improvement
                            suggestions
                            available.
                          </li>
                        )}
                      </ul>

                    </div>

                    <div className="result-card full-width-card">

                      <h3>
                        🧠 Detected Skills
                      </h3>

                      <div className="skills-list">

                        {Array.isArray(
                          resumeResult.detectedSkills
                        ) &&
                          resumeResult
                            .detectedSkills
                            .length > 0 ? (
                          resumeResult
                            .detectedSkills
                            .map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={`${getSkillName(
                                    skill
                                  )}-${index}`}
                                >
                                  {getSkillName(
                                    skill
                                  )}
                                </span>
                              )
                            )
                        ) : (
                          <p>
                            No specific skills
                            detected.
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                  <div className="next-step-card">

                    <div>
                      <h2>
                        🎯 Ready to Find
                        Your Skill Gap?
                      </h2>

                      <p>
                        We'll automatically
                        use the skills detected
                        from your resume.
                      </p>
                    </div>

                    <button
                      className="analyze-btn"
                      onClick={
                        goToSkillGapFromResume
                      }
                    >
                      Analyze My Skill Gap →
                    </button>

                  </div>

                </section>
              )}

            </>
          )}

        {/* ================= SKILL GAP ================= */}

        {activePage ===
          "skills" && (
            <>

              {!skillGapResult ? (
                <section className="skill-gap-page">

                  <div className="page-title">

                    <div className="page-icon">
                      🎯
                    </div>

                    <div>
                      <h2>
                        Discover Your Skill Gap
                      </h2>

                      <p>
                        Compare your current
                        skills with your target
                        career role.
                      </p>
                    </div>

                  </div>

                  <div className="skill-gap-form-card">

                    <div className="form-group">

                      <label>
                        Your Target Role
                      </label>

                      <select
                        value={skillGapRole}
                        onChange={(event) =>
                          setSkillGapRole(
                            event.target.value
                          )
                        }
                      >
                        <option>
                          AI Product Manager
                        </option>

                        <option>
                          Data Analyst
                        </option>

                        <option>
                          Frontend Developer
                        </option>
                      </select>

                    </div>

                    <div className="user-skills-section">

                      <label>
                        Your Current Skills
                      </label>

                      <div className="add-skill-row">

                        <input
                          type="text"
                          placeholder="Example: Python, React, Figma..."
                          value={newSkill}
                          onChange={(event) =>
                            setNewSkill(
                              event.target.value
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              event.preventDefault();
                              addSkill();
                            }
                          }}
                        />

                        <button
                          className="add-skill-btn"
                          onClick={addSkill}
                        >
                          Add
                        </button>

                      </div>

                    </div>

                    <div className="editable-skills-list">

                      {currentSkills.length >
                        0 ? (
                        currentSkills.map(
                          (
                            skill,
                            index
                          ) => {

                            const skillName =
                              getSkillName(
                                skill
                              ) ||
                              "Unknown Skill";

                            return (
                              <div
                                className="editable-skill"
                                key={`${skillName}-${index}`}
                              >

                                {skillName}

                                <button
                                  onClick={() =>
                                    removeSkill(
                                      skill
                                    )
                                  }
                                >
                                  ×
                                </button>

                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="empty-skills">
                          <p>
                            No skills added yet.
                          </p>
                        </div>
                      )}

                    </div>

                    <button
                      className="analyze-btn"
                      onClick={
                        analyzeSkillGap
                      }
                      disabled={
                        skillGapLoading
                      }
                    >
                      {skillGapLoading
                        ? "Analyzing Skill Gap..."
                        : "🎯 Analyze Skill Gap"}
                    </button>

                  </div>

                </section>
              ) : (

                <section className="skill-gap-results">

                  <div className="result-top">

                    <div>
                      <p>
                        Skill Analysis
                        Complete ✨
                      </p>

                      <h2>
                        Your Skill Gap Report
                      </h2>

                      <p>
                        Target Role:{" "}
                        <strong>
                          {getText(
                            skillGapResult.targetRole
                          ) ||
                            skillGapRole}
                        </strong>
                      </p>
                    </div>

                    <button
                      className="secondary-btn"
                      onClick={
                        resetSkillGap
                      }
                    >
                      Analyze Again
                    </button>

                  </div>

                  <div className="skill-match-card">

                    <div className="match-circle">

                      <span>
                        {Number(
                          skillGapResult.matchScore ||
                          0
                        )}
                        %
                      </span>

                      <small>
                        Match
                      </small>

                    </div>

                    <div>
                      <h2>
                        Your Current Skill Match
                      </h2>

                      <p>
                        You currently match{" "}
                        {Number(
                          skillGapResult
                            .matchedSkillsCount ??
                          (
                            Array.isArray(
                              skillGapResult
                                .matchedSkills
                            )
                              ? skillGapResult
                                .matchedSkills
                                .length
                              : 0
                          )
                        )}{" "}
                        out of{" "}
                        {Number(
                          skillGapResult
                            .totalRequiredSkills ??
                          0
                        )}{" "}
                        required skills.
                      </p>
                    </div>

                  </div>

                  <div className="skill-results-grid">

                    <div className="skill-result-card">

                      <h3>
                        ✅ Skills You Already Have
                      </h3>

                      <div className="skills-list">

                        {Array.isArray(
                          skillGapResult.matchedSkills
                        ) &&
                          skillGapResult
                            .matchedSkills
                            .length > 0 ? (
                          skillGapResult
                            .matchedSkills
                            .map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={`matched-${index}`}
                                >
                                  {getSkillName(
                                    skill
                                  )}
                                </span>
                              )
                            )
                        ) : (
                          <p>
                            No direct matches
                            found yet.
                          </p>
                        )}

                      </div>

                    </div>

                    <div className="skill-result-card">

                      <h3>
                        📈 Skills You Need
                        to Learn
                      </h3>

                      <div className="missing-skills-list">

                        {Array.isArray(
                          skillGapResult.missingSkills
                        ) &&
                          skillGapResult
                            .missingSkills
                            .length > 0 ? (

                          skillGapResult
                            .missingSkills
                            .map(
                              (
                                item,
                                index
                              ) => {

                                const skillName =
                                  getSkillName(
                                    item
                                  ) ||
                                  "Unknown Skill";

                                const priority =
                                  getPriority(
                                    item
                                  );

                                const reason =
                                  getReason(
                                    item
                                  );

                                return (
                                  <div
                                    className="missing-skill-item"
                                    key={`missing-${skillName}-${index}`}
                                  >

                                    <div>
                                      <strong>
                                        {skillName}
                                      </strong>

                                      <p>
                                        {getText(
                                          reason
                                        )}
                                      </p>
                                    </div>

                                    <span
                                      className={`priority ${String(
                                        priority
                                      ).toLowerCase()}`}
                                    >
                                      {String(
                                        priority
                                      )}
                                    </span>

                                  </div>
                                );
                              }
                            )

                        ) : (

                          <p>
                            Great! No major
                            skill gaps found.
                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                  <div className="next-step-card">

                    <div>
                      <h2>
                        🗺️ Ready for Your
                        Learning Roadmap?
                      </h2>

                      <p>
                        Generate a personalized
                        roadmap based on your
                        missing skills.
                      </p>
                    </div>

                    <button
                      className="analyze-btn"
                      onClick={
                        generateRoadmap
                      }
                      disabled={
                        roadmapLoading
                      }
                    >
                      {roadmapLoading
                        ? "Generating..."
                        : "Generate My Roadmap →"}
                    </button>

                  </div>

                </section>
              )}

            </>
          )}

        {/* ================= ROADMAP ================= */}

        {activePage ===
          "roadmap" && (
            <section className="roadmap-page">

              {!roadmapResult ? (

                <div className="roadmap-empty">

                  <div className="roadmap-empty-icon">
                    🗺️
                  </div>

                  <h2>
                    Your Personalized
                    Roadmap
                  </h2>

                  <p>
                    Complete your Skill Gap
                    Analysis first, then
                    generate your personalized
                    roadmap.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setActivePage(
                        "skills"
                      )
                    }
                  >
                    Go to Skill Gap →
                  </button>

                </div>

              ) : (

                <>

                  <div className="roadmap-badge">
                    ✨ PERSONALIZED ROADMAP
                  </div>

                  <div className="roadmap-summary">

                    <h2>
                      Roadmap to Become a{" "}
                      {getText(
                        roadmapResult.targetRole
                      ) ||
                        skillGapRole}
                    </h2>

                    <p>
                      Based on your personalized
                      skill gap.
                    </p>

                    <div className="roadmap-stats">

                      <div className="roadmap-stat">
                        <strong>
                          {roadmapResult
                            .totalPhases ??
                            (
                              Array.isArray(
                                roadmapResult
                                  .phases
                              )
                                ? roadmapResult
                                  .phases
                                  .length
                                : 0
                            )}
                        </strong>

                        <span>
                          Phases
                        </span>
                      </div>

                      <div className="roadmap-stat">
                        <strong>
                          {roadmapResult
                            .totalSkillsToLearn ??
                            0}
                        </strong>

                        <span>
                          Skills to Learn
                        </span>
                      </div>

                      <div className="roadmap-stat">
                        <strong>
                          {getRoadmapProgress()}%
                        </strong>

                        <span>
                          Progress
                        </span>
                      </div>

                    </div>

                  </div>

                  <div className="roadmap-phases">

                    {Array.isArray(
                      roadmapResult.phases
                    ) &&
                      roadmapResult
                        .phases
                        .length > 0 ? (

                      roadmapResult.phases.map(
                        (
                          phase,
                          phaseIndex
                        ) => {

                          const phaseNumber =
                            phase?.phase ??
                            phaseIndex +
                            1;

                          return (
                            <div
                              className="roadmap-phase"
                              key={`phase-${phaseNumber}-${phaseIndex}`}
                            >

                              <div className="phase-header">

                                <div className="phase-number">
                                  {phaseNumber}
                                </div>

                                <div>

                                  <span className="phase-label">
                                    PHASE{" "}
                                    {phaseNumber}
                                  </span>

                                  <h3>
                                    {getText(
                                      phase?.title
                                    ) ||
                                      `Phase ${phaseNumber}`}
                                  </h3>

                                </div>

                              </div>

                              <p className="phase-description">
                                {getText(
                                  phase?.description
                                )}
                              </p>

                              <div className="phase-skills">

                                {Array.isArray(
                                  phase?.skills
                                ) &&
                                  phase
                                    .skills
                                    .length >
                                  0 ? (

                                  phase.skills.map(
                                    (
                                      skill,
                                      skillIndex
                                    ) => {

                                      const skillName =
                                        getSkillName(
                                          skill
                                        ) ||
                                        `Skill ${skillIndex +
                                        1
                                        }`;

                                      const priority =
                                        getPriority(
                                          skill
                                        );

                                      const description =
                                        skill &&
                                          typeof skill ===
                                          "object"
                                          ? skill.description ||
                                          skill.reason ||
                                          ""
                                          : "";

                                      const duration =
                                        skill &&
                                          typeof skill ===
                                          "object"
                                          ? skill.duration ||
                                          "Flexible"
                                          : "Flexible";

                                      const resources =
                                        skill &&
                                          typeof skill ===
                                          "object" &&
                                          Array.isArray(
                                            skill.resources
                                          )
                                          ? skill.resources
                                          : [];

                                      const progress =
                                        skillProgress[
                                        skillName
                                        ] || 0;

                                      return (
                                        <div
                                          className="roadmap-skill"
                                          key={`${skillName}-${skillIndex}`}
                                        >

                                          <div className="skill-header">

                                            <h4>
                                              {skillName}
                                            </h4>

                                            <span
                                              className={`priority ${String(
                                                priority
                                              ).toLowerCase()}`}
                                            >
                                              {String(
                                                priority
                                              )}
                                            </span>

                                          </div>

                                          <p>
                                            {getText(
                                              description
                                            )}
                                          </p>

                                          <span className="skill-duration">
                                            ⏱{" "}
                                            {getText(
                                              duration
                                            )}
                                          </span>

                                          {resources.length >
                                            0 && (
                                              <div className="resource-list">

                                                {resources.map(
                                                  (
                                                    resource,
                                                    resourceIndex
                                                  ) => (
                                                    <span
                                                      key={`resource-${resourceIndex}`}
                                                    >
                                                      {getText(
                                                        resource
                                                      )}
                                                    </span>
                                                  )
                                                )}

                                              </div>
                                            )}

                                          {/* PROGRESS */}

                                          <div className="progress-section">

                                            <div className="progress-header">

                                              <span>
                                                Learning
                                                Progress
                                              </span>

                                              <strong>
                                                {progress}%
                                              </strong>

                                            </div>

                                            <div className="progress-bar">

                                              <div
                                                className="progress-fill"
                                                style={{
                                                  width:
                                                    `${progress}%`,
                                                }}
                                              />

                                            </div>

                                            <div className="progress-actions">

                                              <button
                                                onClick={() =>
                                                  updateSkillProgress(
                                                    skillName,
                                                    progress +
                                                    10
                                                  )
                                                }
                                              >
                                                +10%
                                              </button>

                                              <button
                                                onClick={() =>
                                                  updateSkillProgress(
                                                    skillName,
                                                    progress +
                                                    25
                                                  )
                                                }
                                              >
                                                +25%
                                              </button>

                                              <button
                                                onClick={() =>
                                                  updateSkillProgress(
                                                    skillName,
                                                    100
                                                  )
                                                }
                                              >
                                                ✓ Complete
                                              </button>

                                            </div>

                                          </div>

                                        </div>
                                      );
                                    }
                                  )

                                ) : (

                                  <p>
                                    No skills
                                    available
                                    for this
                                    phase.
                                  </p>

                                )}

                              </div>

                            </div>
                          );
                        }
                      )

                    ) : (

                      <div className="roadmap-empty">
                        <p>
                          No roadmap phases
                          were generated.
                        </p>
                      </div>

                    )}

                  </div>

                </>
              )}

            </section>
          )}

        {/* ================= INTERVIEW ================= */}

        {activePage ===
          "interview" && (
            <section className="interview-page">

              {interviewQuestions.length ===
                0 ? (

                <>

                  <div className="page-title">

                    <div className="page-icon">
                      🎤
                    </div>

                    <div>
                      <h2>
                        AI Interview
                        Preparation
                      </h2>

                      <p>
                        Practice interview
                        questions and get
                        feedback on your
                        answers.
                      </p>
                    </div>

                  </div>

                  <div className="skill-gap-form-card">

                    <div className="form-group">

                      <label>
                        Target Role
                      </label>

                      <select
                        value={
                          interviewRole
                        }
                        onChange={(event) =>
                          setInterviewRole(
                            event.target.value
                          )
                        }
                      >
                        <option>
                          AI Product Manager
                        </option>

                        <option>
                          Data Analyst
                        </option>

                        <option>
                          Frontend Developer
                        </option>
                      </select>

                    </div>

                    <div className="form-group">

                      <label>
                        Experience Level
                      </label>

                      <select
                        value={
                          interviewExperience
                        }
                        onChange={(event) =>
                          setInterviewExperience(
                            event.target
                              .value
                          )
                        }
                      >
                        <option>
                          Fresher
                        </option>

                        <option>
                          Intermediate
                        </option>
                      </select>

                    </div>

                    <button
                      className="analyze-btn"
                      onClick={
                        generateInterviewQuestions
                      }
                      disabled={
                        interviewLoading
                      }
                    >
                      {interviewLoading
                        ? "Generating Questions..."
                        : "🎤 Generate Interview Questions"}
                    </button>

                  </div>

                </>

              ) : (

                <>

                  <div className="result-top">

                    <div>

                      <p>
                        AI Mock Interview ✨
                      </p>

                      <h2>
                        {interviewRole}
                        {" "}
                        Interview
                      </h2>

                      <p>
                        Question{" "}
                        {currentQuestionIndex +
                          1}{" "}
                        of{" "}
                        {interviewQuestions.length}
                      </p>

                    </div>

                    <button
                      className="secondary-btn"
                      onClick={
                        restartInterview
                      }
                    >
                      Start New Interview
                    </button>

                  </div>

                  {interviewQuestions[
                    currentQuestionIndex
                  ] && (

                      <>

                        <div className="skill-result-card">

                          <div className="question-badge">
                            Question{" "}
                            {currentQuestionIndex +
                              1}
                          </div>

                          <h2 className="interview-question">
                            {getQuestionText(
                              interviewQuestions[
                              currentQuestionIndex
                              ]
                            )}
                          </h2>

                          <div className="form-group">

                            <label>
                              Your Answer
                            </label>

                            <textarea
                              value={
                                userAnswer
                              }
                              onChange={(
                                event
                              ) =>
                                setUserAnswer(
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Write your answer here..."
                              rows="8"
                            />

                          </div>

                          <button
                            className="analyze-btn"
                            onClick={
                              evaluateAnswer
                            }
                            disabled={
                              evaluationLoading
                            }
                          >
                            {evaluationLoading
                              ? "AI is Evaluating..."
                              : "✨ Evaluate My Answer"}
                          </button>

                        </div>

                        {evaluationResult && (

                          <>

                            <div className="score-card">

                              <div className="score-circle">

                                <span>
                                  {Number(
                                    evaluationResult.score ||
                                    0
                                  )}
                                </span>

                                <small>
                                  /100
                                </small>

                              </div>

                              <div>

                                <h2>
                                  Answer
                                  Evaluation
                                </h2>

                                <p>
                                  {getText(
                                    evaluationResult.feedback
                                  )}
                                </p>

                              </div>

                            </div>

                            <div className="result-grid">

                              <div className="result-card">

                                <h3>
                                  💪 What You
                                  Did Well
                                </h3>

                                <ul>

                                  {Array.isArray(
                                    evaluationResult.strengths
                                  ) &&
                                    evaluationResult
                                      .strengths
                                      .length >
                                    0 ? (

                                    evaluationResult
                                      .strengths
                                      .map(
                                        (
                                          item,
                                          index
                                        ) => (
                                          <li
                                            key={`eval-strength-${index}`}
                                          >
                                            {getText(
                                              item
                                            )}
                                          </li>
                                        )
                                      )

                                  ) : (

                                    <li>
                                      No strengths
                                      feedback
                                      available.
                                    </li>

                                  )}

                                </ul>

                              </div>

                              <div className="result-card">

                                <h3>
                                  📈 How to
                                  Improve
                                </h3>

                                <ul>

                                  {Array.isArray(
                                    evaluationResult.improvements
                                  ) &&
                                    evaluationResult
                                      .improvements
                                      .length >
                                    0 ? (

                                    evaluationResult
                                      .improvements
                                      .map(
                                        (
                                          item,
                                          index
                                        ) => (
                                          <li
                                            key={`eval-improve-${index}`}
                                          >
                                            {getText(
                                              item
                                            )}
                                          </li>
                                        )
                                      )

                                  ) : (

                                    <li>
                                      No improvement
                                      suggestions
                                      available.
                                    </li>

                                  )}

                                </ul>

                              </div>

                            </div>

                          </>
                        )}

                        <div className="interview-navigation">

                          <button
                            className="secondary-btn"
                            onClick={
                              previousQuestion
                            }
                            disabled={
                              currentQuestionIndex ===
                              0
                            }
                          >
                            ← Previous
                          </button>

                          {currentQuestionIndex <
                            interviewQuestions.length -
                            1 ? (

                            <button
                              className="primary-btn"
                              onClick={
                                nextQuestion
                              }
                            >
                              Next Question →
                            </button>

                          ) : (

                            <button
                              className="primary-btn"
                              onClick={
                                restartInterview
                              }
                            >
                              Finish Interview 🎉
                            </button>

                          )}

                        </div>

                      </>
                    )}

                </>

              )}

            </section>
          )}

        {/* ================= PROFILE ================= */}

        {activePage ===
          "profile" && (
            <section className="profile-page">

              <div className="page-title">

                <div className="page-icon">
                  👤
                </div>

                <div>
                  <h2>
                    Your Career Profile
                  </h2>

                  <p>
                    Personalize your
                    Career Copilot
                    experience.
                  </p>
                </div>

              </div>

              <div className="profile-card">

                <div className="profile-avatar">
                  {profile.name
                    ? profile.name
                      .charAt(0)
                      .toUpperCase()
                    : "N"}
                </div>

                <div className="form-group">

                  <label>
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={
                      profile.name
                    }
                    onChange={(event) =>
                      updateProfile(
                        "name",
                        event.target
                          .value
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Target Role
                  </label>

                  <select
                    value={
                      profile.role
                    }
                    onChange={(event) =>
                      updateProfile(
                        "role",
                        event.target
                          .value
                      )
                    }
                  >
                    <option>
                      AI Product Manager
                    </option>

                    <option>
                      Data Analyst
                    </option>

                    <option>
                      Frontend Developer
                    </option>
                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Experience Level
                  </label>

                  <select
                    value={
                      profile.experience
                    }
                    onChange={(event) =>
                      updateProfile(
                        "experience",
                        event.target
                          .value
                      )
                    }
                  >
                    <option>
                      Fresher
                    </option>

                    <option>
                      Intermediate
                    </option>

                  </select>

                </div>

                <div className="profile-summary">

                  <h3>
                    Career Goal
                  </h3>

                  <p>
                    Your current target is{" "}
                    <strong>
                      {profile.role}
                    </strong>
                    .
                  </p>

                  <p>
                    Your saved progress
                    stays in this browser.
                  </p>

                </div>

              </div>

            </section>
          )}

      </main>
    </div>
  );
}

export default App;