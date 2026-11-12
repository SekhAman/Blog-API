const API_URL = "https://blog-api-9wsb.onrender.com";

const signupForm = document.querySelector("#signup-form");
const signupMessage = document.querySelector("#signup-message");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");


// Shared theme management

const themeToggle = document.querySelector("#themeToggle");

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


signupForm.addEventListener("submit", async (event) => {
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
            throw new Error(result.message || `Request failed: ${response.status}`);
        }

        signupMessage.textContent = "Account created. You can log in now.";
        signupForm.reset();
    } catch (error) {
        signupMessage.textContent = `Could not sign up: ${error.message}`;
    }
});

loginForm.addEventListener("submit", async (event) => {
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
            throw new Error(result.message || `Request failed: ${response.status}`);
        }

        localStorage.setItem("token", result.token);
        localStorage.setItem("username", userData.username);
        loginMessage.textContent = "Logged in successfully.";
        loginForm.reset();
    } catch (error) {
        loginMessage.textContent = `Could not log in: ${error.message}`;
    }
});