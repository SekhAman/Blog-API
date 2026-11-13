
const API_URL = "https://blog-api-9wsb.onrender.com";

// =====================================
// 1. ELEMENTS
// =====================================

const signupForm = document.querySelector("#signup-form");
const signupMessage = document.querySelector("#signup-message");

const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

const themeToggle = document.querySelector("#themeToggle");

// =====================================
// 2. THEME MANAGEMENT
// =====================================

function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");

    if (themeToggle) {
        themeToggle.textContent =
            theme === "light" ? "🌙" : "☀️";
    }

    localStorage.setItem("blog-theme", theme);
}

applyTheme(localStorage.getItem("blog-theme") || "dark");

themeToggle?.addEventListener("click", () => {
    const theme = document.body.classList.contains("light")
        ? "dark"
        : "light";

    applyTheme(theme);
});

// =====================================
// 3. SIGNUP
// =====================================

signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    signupMessage.textContent = "Creating account...";

    const formData = new FormData(signupForm);
    const userData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || `Request failed: ${response.status}`
            );
        }

        signupMessage.textContent =
            "Account created successfully! You can now log in.";

        signupForm.reset();

    } catch (error) {
        signupMessage.textContent =
            `Could not sign up: ${error.message}`;
    }
});

// =====================================
// 4. LOGIN
// =====================================

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginMessage.textContent = "Logging in...";

    const formData = new FormData(loginForm);
    const userData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || `Request failed: ${response.status}`
            );
        }

        if (!result.token) {
            throw new Error("Login response did not contain a token.");
        }

        // Save login information
        localStorage.setItem("token", result.token);
        localStorage.setItem("username", userData.username);

        loginMessage.textContent = "Logged in successfully! Redirecting...";

        loginForm.reset();

        // Redirect to homepage
        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);

    } catch (error) {
        loginMessage.textContent =
            `Could not log in: ${error.message}`;
    }
});
