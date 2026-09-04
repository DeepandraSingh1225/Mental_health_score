// ============================================================================
// CONFIGURATION
// ============================================================================

// CHANGE THIS to match wherever your FastAPI server is running.
const API_URL = "https://mental-health-score-backend-h9nz.onrender.com";

// The maximum possible score returned by the model, used to draw the gauge.
// Change this if your model's scale is different from 0-100.
const SCORE_MAX = 10;

// ============================================================================
// DOM REFERENCES
// ============================================================================

const form = document.getElementById("assessmentForm");
const submitBtn = document.getElementById("submitBtn");
const formError = document.getElementById("formError");

const assessmentSection = document.getElementById("assessment");
const resultSection = document.getElementById("result");
const apiErrorSection = document.getElementById("apiError");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");

const scoreNumberEl = document.getElementById("scoreNumber");
const gaugeSweepEl = document.getElementById("gaugeSweep");
const resultStatusEl = document.getElementById("resultStatus");
const resultMessageEl = document.getElementById("resultMessage");
const resultDragon = document.getElementById("result-dragon");
const resultParticles = document.getElementById("resultParticles");

const startAssessmentBtn = document.getElementById("startAssessmentBtn");
const retakeBtn = document.getElementById("retakeBtn");
const backToTopBtn = document.getElementById("backToTopBtn");
const errorRetryBtn = document.getElementById("errorRetryBtn");

// ============================================================================
// AMBIENT EMBER PARTICLES (decorative, page-wide)
// ============================================================================

function spawnEmbers(container, count = 26) {
  for (let i = 0; i < count; i++) {
    const ember = document.createElement("span");
    ember.className = "ember";
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
    ember.style.animationDuration = `${8 + Math.random() * 10}s`;
    ember.style.animationDelay = `${Math.random() * 12}s`;
    ember.style.width = ember.style.height = `${2 + Math.random() * 2}px`;
    container.appendChild(ember);
  }
}
spawnEmbers(document.getElementById("ambientEmbers"));

// ============================================================================
// SLIDER LABELS (live value display)
// ============================================================================

function bindSlider(inputId, outputId, unit) {
  const input = document.getElementById(inputId);
  const output = document.getElementById(outputId);

  function refresh() {
    const val = parseFloat(input.value);
    output.textContent = `${val.toFixed(1)} ${unit}`;
    const pct = ((val - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--fill", `${pct}%`);
  }

  input.addEventListener("input", refresh);
  refresh();
}

bindSlider("usageHours", "usageHoursValue", "hrs");
bindSlider("studyHours", "studyHoursValue", "hrs");
bindSlider("activityHours", "activityHoursValue", "hrs");
bindSlider("sleepHours", "sleepHoursValue", "hrs");

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

function scrollToSection(section) {
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

startAssessmentBtn.addEventListener("click", () => scrollToSection(assessmentSection));
backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
errorRetryBtn.addEventListener("click", () => {
  apiErrorSection.hidden = true;
  assessmentSection.hidden = false;
  scrollToSection(assessmentSection);
});

// ============================================================================
// FORM DATA COLLECTION + VALIDATION
// ============================================================================

function collectFormData() {
  const formData = new FormData(form);

  return {
    age: parseInt(formData.get("age"), 10),
    gender: formData.get("gender"),
    country: formData.get("country"),
    academic_level: formData.get("academic_level"),
    most_used_platform: formData.get("most_used_platform"),
    purpose_of_use: formData.get("purpose_of_use"),
    avg_daily_usage_hours: parseFloat(formData.get("avg_daily_usage_hours")),
    daily_unlocks: parseInt(formData.get("daily_unlocks"), 10),
    study_hours: parseFloat(formData.get("study_hours")),
    physical_activity_hours: parseFloat(formData.get("physical_activity_hours")),
    sleep_hours_per_night: parseFloat(formData.get("sleep_hours_per_night")),
    stress_level: formData.get("stress_level"),
  };
}

function validateForm(data) {
  const rangeChecks = [
    ["age", 0, 100],
    ["avg_daily_usage_hours", 0, 24],
    ["daily_unlocks", 0, Infinity],
    ["study_hours", 0, 24],
    ["physical_activity_hours", 0, 24],
    ["sleep_hours_per_night", 0, 24],
  ];

  for (const [field, min, max] of rangeChecks) {
    const value = data[field];
    if (Number.isNaN(value) || value < min || value > max) {
      return `Please enter a valid value for "${field.replace(/_/g, " ")}".`;
    }
  }

  return null; // no errors
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearFormError() {
  formError.hidden = true;
  formError.textContent = "";
}

// ============================================================================
// API CALL
// ============================================================================

async function predictMentalHealth(data) {
  const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody.detail ? JSON.stringify(errBody.detail) : "";
    } catch (_) {
      // response wasn't JSON, ignore
    }
    throw new Error(`API responded with status ${response.status}. ${detail}`);
  }

  const result = await response.json();

  // =====================================
  // CHANGE THIS IF YOUR API RESPONSE DIFFERS
  // =====================================
  // Your FastAPI /predict endpoint currently returns:
  //   { "predicted_mental_health_score": 78.0 }
  // If you rename the field in PredictionResponse, update the line below.
  const score = result.predicted_mental_health_score;

  if (typeof score !== "number" || Number.isNaN(score)) {
    throw new Error("The API response did not include a valid score.");
  }

  return score;
}

// ============================================================================
// LOADING STATE
// ============================================================================

const LOADING_MESSAGES = [
  "Analyzing your patterns\u2026",
  "Examining lifestyle factors\u2026",
  "Evaluating social media habits\u2026",
  "Calculating your mental health score\u2026",
];

let loadingInterval = null;

function showLoading() {
  loadingOverlay.hidden = false;
  submitBtn.disabled = true;
  submitBtn.classList.add("is-loading");

  let step = 0;
  loadingText.textContent = LOADING_MESSAGES[0];
  loadingInterval = setInterval(() => {
    step = (step + 1) % LOADING_MESSAGES.length;
    loadingText.textContent = LOADING_MESSAGES[step];
  }, 700);
}

function hideLoading() {
  loadingOverlay.hidden = true;
  submitBtn.disabled = false;
  submitBtn.classList.remove("is-loading");
  clearInterval(loadingInterval);
}

// Minimum time the cinematic loader stays visible, so it never just flickers.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// SCORE CLASSIFICATION
// ============================================================================

function getScoreStatus(score) {
  if (score >= 8) return { label: "Excellent", tone: "high" };
  if (score >= 6) return { label: "Good", tone: "high" };
  if (score >= 4) return { label: "Moderate", tone: "mid" };
  if (score >= 2) return { label: "Concerning", tone: "low" };
  return { label: "Critical", tone: "low" };
}

function getResultMessage(tone) {
  if (tone === "high") {
    return "Your current indicators appear relatively positive.";
  }
  if (tone === "mid") {
    return "Your results are mixed \u2014 a few areas may be worth keeping an eye on.";
  }
  return "Your results suggest that some areas of your lifestyle may deserve attention.";
}

// ============================================================================
// RESULT RENDERING
// ============================================================================

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 94; // matches r=94 in the SVG

function animateScore(score) {
  const clamped = Math.max(0, Math.min(score, SCORE_MAX));
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const currentValue = eased * clamped;

    scoreNumberEl.textContent = currentValue.toFixed(2);

    const offset = GAUGE_CIRCUMFERENCE * (1 - eased * (clamped / SCORE_MAX));
    gaugeSweepEl.style.strokeDashoffset = offset;

    if (progress < 1) requestAnimationFrame(tick);
  }

  gaugeSweepEl.style.strokeDasharray = GAUGE_CIRCUMFERENCE;
  gaugeSweepEl.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;
  requestAnimationFrame(tick);
}

function spawnResultSparks(count = 18) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 140;
    spark.style.setProperty("--sx", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--sy", `${Math.sin(angle) * distance}px`);
    spark.style.left = "50%";
    spark.style.top = "38%";
    spark.style.animationDelay = `${Math.random() * 0.4}s`;
    resultParticles.appendChild(spark);
    setTimeout(() => spark.remove(), 2200);
  }
}

function describeUsage(hours) {
  if (hours <= 2) return "Light usage";
  if (hours <= 5) return "Moderate usage";
  return "Heavy usage";
}

function describeSleep(hours) {
  if (hours < 6) return "Below recommended";
  if (hours <= 9) return "Within healthy range";
  return "Above typical range";
}

function describeBalance(study, activity) {
  const total = study + activity;
  if (total < 3) return "Light overall load";
  if (total <= 8) return "Balanced";
  return "Heavily scheduled";
}

function describeActivity(hours) {
  if (hours < 1) return "Low activity";
  if (hours <= 3) return "Active";
  return "Very active";
}

function populateBreakdown(data) {
  document.getElementById("breakdownUsage").textContent = describeUsage(data.avg_daily_usage_hours);
  document.getElementById("breakdownSleep").textContent = describeSleep(data.sleep_hours_per_night);
  document.getElementById("breakdownBalance").textContent = describeBalance(data.study_hours, data.physical_activity_hours);
  document.getElementById("breakdownActivity").textContent = describeActivity(data.physical_activity_hours);
  document.getElementById("breakdownStress").textContent = data.stress_level;
}

function displayResult(score, formData) {
  const { label, tone } = getScoreStatus(score);

  assessmentSection.hidden = true;
  apiErrorSection.hidden = true;
  resultSection.hidden = false;

  resultStatusEl.textContent = label;
  resultMessageEl.textContent = getResultMessage(tone);
  resultSection.dataset.tone = tone;

  // Recolor the gauge/dragon glow based on tone.
  const toneColor = tone === "high" ? "#ff5f78" : tone === "mid" ? "#ff8a4d" : "#ff2f4f";
  gaugeSweepEl.style.stroke = toneColor;
  resultDragon.style.opacity = tone === "low" ? "0.26" : "0.14";

  populateBreakdown(formData);
  animateScore(score);
  spawnResultSparks();

  scrollToSection(resultSection);
}

// ============================================================================
// RESET
// ============================================================================

function resetAssessment() {
  form.reset();
  // re-sync slider fills + labels after reset
  ["usageHours", "studyHours", "activityHours", "sleepHours"].forEach((id) => {
    document.getElementById(id).dispatchEvent(new Event("input"));
  });

  resultSection.hidden = true;
  apiErrorSection.hidden = true;
  assessmentSection.hidden = false;
  clearFormError();

  scrollToSection(assessmentSection);
}

retakeBtn.addEventListener("click", resetAssessment);

// ============================================================================
// FORM SUBMISSION
// ============================================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormError();

  const data = collectFormData();
  const validationError = validateForm(data);

  if (validationError) {
    showFormError(validationError);
    return;
  }

  showLoading();

  try {
    const [score] = await Promise.all([
      predictMentalHealth(data),
      wait(2200), // keeps the cinematic loader visible for a minimum duration
    ]);

    hideLoading();
    displayResult(score, data);
  } catch (error) {
    console.error("Prediction failed:", error);
    hideLoading();

    if (error.message.includes("400")) {
      showFormError(error.message);
      return;
    }


    assessmentSection.hidden = true;
    apiErrorSection.hidden = false;
    scrollToSection(apiErrorSection);
  }
});





// ============================================================================
// THEME TOGGLE
// ============================================================================


const themeToggle = document.getElementById("themeToggle");


themeToggle.addEventListener("click", () => {
  const isLight =
    document.documentElement.getAttribute("data-theme") === "light";

  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "☀️";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌙";
  }
});

