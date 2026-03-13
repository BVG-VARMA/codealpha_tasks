// Redirect if already logged in
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

const showError = (msg) => {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.style.display = "block";
};

// ── Register ────────────────────────────────────────────────────────────────
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Creating account…";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    if (password !== confirm) {
      showError("Passwords do not match");
      btn.disabled = false;
      btn.textContent = "Create account";
      return;
    }

    try {
      const data = await api.register({ name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message);
      btn.disabled = false;
      btn.textContent = "Create account";
    }
  });
}

// ── Login ───────────────────────────────────────────────────────────────────
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Signing in…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await api.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message);
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}
