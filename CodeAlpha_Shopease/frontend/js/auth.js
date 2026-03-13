// ============================================================
//  auth.js  –  Login, Register, Session helpers
// ============================================================

const auth = {

  // ── Session helpers ───────────────────────────────────────
  getToken()    { return localStorage.getItem('token'); },
  getUser()     { return JSON.parse(localStorage.getItem('user') || 'null'); },
  isLoggedIn()  { return !!this.getToken(); },

  save(user, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user',  JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  },

  // ── Guard: redirect to login if not authenticated ─────────
  require(redirectBack = false) {
    if (!this.isLoggedIn()) {
      const page = redirectBack
        ? window.location.pathname.replace('/', '')
        : '';
      window.location.href = '/login.html' + (page ? `?redirect=${page}` : '');
    }
  },

  // ── Redirect to previous page or home after login ─────────
  redirectAfterLogin() {
    const params   = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    window.location.href = redirect ? `/${redirect}` : '/index.html';
  },
};

// ── Register form handler ─────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('submit-btn');
  const errEl    = document.getElementById('error-msg');

  errEl.style.display = 'none';

  if (!name || !email || !password) {
    return showError(errEl, 'All fields are required.');
  }
  if (password.length < 6) {
    return showError(errEl, 'Password must be at least 6 characters.');
  }

  btn.disabled    = true;
  btn.textContent = 'Creating account…';

  try {
    const { user, token } = await api.post('/auth/register', { name, email, password });
    auth.save(user, token);
    showToast(`Welcome, ${user.name.split(' ')[0]}! 🎉`, 'success');
    setTimeout(() => window.location.href = '/index.html', 700);
  } catch (err) {
    showError(errEl, err.message);
    btn.disabled    = false;
    btn.textContent = 'Create Account';
  }
}

// ── Login form handler ────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('submit-btn');
  const errEl    = document.getElementById('error-msg');

  errEl.style.display = 'none';

  if (!email || !password) {
    return showError(errEl, 'Email and password are required.');
  }

  btn.disabled    = true;
  btn.textContent = 'Signing in…';

  try {
    const { user, token } = await api.post('/auth/login', { email, password });
    auth.save(user, token);
    showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
    setTimeout(() => auth.redirectAfterLogin(), 600);
  } catch (err) {
    showError(errEl, err.message);
    btn.disabled    = false;
    btn.textContent = 'Sign In';
  }
}

// ── Utilities ─────────────────────────────────────────────
function showError(el, msg) {
  el.textContent    = msg;
  el.style.display  = 'block';
}