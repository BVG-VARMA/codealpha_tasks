// ── auth.js (v2) ──────────────────────────────────────
import api from "./api.js";

const TOKEN_KEY = "nexly_token";
const USER_KEY = "nexly_user";

// ── Storage helpers ───────────────────────────────────
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
export const isLoggedIn = () => !!getToken();

export const setAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName || user.display_name || "",
      avatar_url: user.avatarUrl || user.avatar_url || "",
      isVerified: user.isVerified || user.is_verified || false,
    }),
  );
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ── Route guards ──────────────────────────────────────
export const requireAuth = () => {
  if (!isLoggedIn()) window.location.href = "/login.html";
};
export const requireGuest = () => {
  if (isLoggedIn()) window.location.href = "/index.html";
};

// ── Form handlers — run on page load ─────────────────
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

if (loginForm) {
  requireGuest(); // already logged in → go to feed
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector("button[type=submit]");
    const email = loginForm.querySelector("input[name=email]").value.trim();
    const password = loginForm.querySelector("input[name=password]").value;
    btn.disabled = true;
    btn.textContent = "Signing in…";
    try {
      const { token, user } = await api.login({ email, password });
      setAuth(token, user);
      window.location.href = "/index.html";
    } catch (err) {
      showError(loginForm, err.message);
      btn.disabled = false;
      btn.textContent = "Sign In →";
    }
  });
}

if (registerForm) {
  requireGuest();
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector("button[type=submit]");
    const username = registerForm
      .querySelector("input[name=username]")
      .value.trim();
    const email = registerForm.querySelector("input[name=email]").value.trim();
    const password = registerForm.querySelector("input[name=password]").value;
    const displayName =
      registerForm.querySelector("input[name=displayName]")?.value.trim() ||
      username;
    btn.disabled = true;
    btn.textContent = "Creating account…";
    try {
      const { token, user } = await api.register({
        username,
        email,
        password,
        displayName,
      });
      setAuth(token, user);
      window.location.href = "/index.html";
    } catch (err) {
      showError(registerForm, err.message);
      btn.disabled = false;
      btn.textContent = "Create Account →";
    }
  });
}

// ── Error display helper ──────────────────────────────
const showError = (form, message) => {
  let el = form.querySelector(".auth-error");
  if (!el) {
    el = document.createElement("p");
    el.className = "auth-error";
    el.style.cssText =
      "color:#ff6b8a;font-size:.9rem;margin-top:.5rem;text-align:center;";
    form.appendChild(el);
  }
  el.textContent = message;
};

// ── Exports for other pages ───────────────────────────
export const handleLogin = async (email, password) => {
  const { token, user } = await api.login({ email, password });
  setAuth(token, user);
};

export const handleRegister = async (
  username,
  email,
  password,
  displayName,
) => {
  const { token, user } = await api.register({
    username,
    email,
    password,
    displayName,
  });
  setAuth(token, user);
};
