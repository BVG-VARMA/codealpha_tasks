// ── Navbar (v3 - fixed) ───────────────────────────────
import { getUser, clearAuth, isLoggedIn } from "../auth.js";
import { avatarSrc } from "../utils.js";
import { debounce } from "../utils.js";
import api from "../api.js";

export const injectNavbar = () => {
  const user = getUser();
  const nav = document.createElement("nav");
  nav.className = "navbar";

  const profileHref = user?.username
    ? `/profile.html?u=${user.username}`
    : "/login.html";

  nav.innerHTML = `
    <a href="/index.html" class="navbar-brand">Nexly</a>

    <div class="navbar-search">
      <input type="text" id="nav-search-input" placeholder="Search users…" autocomplete="off"/>
      <div class="search-dropdown" id="search-dropdown" style="display:none;"></div>
    </div>

    <div class="navbar-links">
      ${
        isLoggedIn()
          ? `
        <a href="/index.html" class="nav-link">🏠</a>
        <a href="${profileHref}" class="nav-avatar-link">
          <img src="${avatarSrc(user?.avatar_url)}"
               class="nav-avatar" alt="${user?.username || "me"}"
               onerror="this.src='https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${user?.username || "U"}'"/>
        </a>
        <button class="btn btn-ghost btn-sm" id="nav-logout">Sign out</button>
      `
          : `
        <a href="/login.html"    class="btn btn-outline btn-sm">Sign In</a>
        <a href="/register.html" class="btn btn-primary btn-sm">Join</a>
      `
      }
    </div>
  `;

  document.body.prepend(nav);

  // Logout
  document.getElementById("nav-logout")?.addEventListener("click", () => {
    clearAuth();
    window.location.href = "/login.html";
  });

  // Search
  const input = document.getElementById("nav-search-input");
  const dropdown = document.getElementById("search-dropdown");

  const doSearch = debounce(async (q) => {
    if (q.length < 2) {
      dropdown.style.display = "none";
      return;
    }
    try {
      const { users } = await api.searchUsers(q);
      if (!users?.length) {
        dropdown.innerHTML =
          '<div class="search-no-result">No users found</div>';
      } else {
        dropdown.innerHTML = users
          .map(
            (u) => `
          <a href="/profile.html?u=${u.username}" class="search-result-item">
            <img src="${avatarSrc(u.avatar_url)}" class="avatar avatar-xs"
                 onerror="this.src='https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${u.username}'"/>
            <div>
              <div class="search-username">@${u.username}</div>
              ${u.display_name ? `<div class="search-displayname">${u.display_name}</div>` : ""}
            </div>
          </a>`,
          )
          .join("");
      }
      dropdown.style.display = "block";
    } catch {
      dropdown.style.display = "none";
    }
  }, 300);

  input?.addEventListener("input", (e) => doSearch(e.target.value.trim()));
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dropdown.style.display = "none";
  });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) dropdown.style.display = "none";
  });
};
