// ============================================================
//  utils.js  –  Shared helpers: navbar, toast, cart badge
//  Include AFTER api.js and auth.js on every page
// ============================================================

// ── Render Navbar ─────────────────────────────────────────
function renderNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  const user = auth.getUser();

  nav.innerHTML = `
    <a class="nav-brand" href="/index.html">Shop<span style="color:var(--accent)">Ease</span></a>
    <div class="nav-links">
      <a href="/index.html">Store</a>
      ${
        user
          ? `<span class="nav-user">Hi, <strong>${user.name.split(" ")[0]}</strong></span>
           <a href="/orders.html">Orders</a>
           <button class="btn-logout" onclick="auth.logout()">Logout</button>`
          : `<a href="/login.html">Login</a>
           <a href="/register.html">Register</a>`
      }
      <a href="/cart.html">
        <button class="nav-cart">
          🛒 Cart <span class="nav-cart-count" id="cart-badge">0</span>
        </button>
      </a>
    </div>`;

  // Load live cart count for logged-in users
  if (user) loadCartBadge();
}

// ── Cart badge ────────────────────────────────────────────
async function loadCartBadge() {
  try {
    const { items } = await api.get("/cart");
    updateCartBadge(items.reduce((s, i) => s + i.quantity, 0));
  } catch (_) {}
}

function updateCartBadge(count) {
  const el = document.getElementById("cart-badge");
  if (el) el.textContent = count;
}

// ── Toast notification ────────────────────────────────────
function showToast(msg, type = "") {
  let wrap = document.getElementById("toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
