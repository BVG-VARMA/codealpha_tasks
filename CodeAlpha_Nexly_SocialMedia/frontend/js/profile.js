// ── profile.js (v2) ───────────────────────────────────
import { requireAuth, getUser } from "./auth.js";
import { injectNavbar } from "./components/navbar.js";
import { renderPostCard } from "./components/postCard.js";
import { avatarSrc, showToast } from "./utils.js";
import api from "./api.js";

requireAuth();
injectNavbar();

const params = new URLSearchParams(window.location.search);
const me = getUser();
const username = params.get("u") || me?.username;
if (!username) window.location.href = "/login.html";

const BACKEND = `http://${window.location.hostname}:3000`;

// ── Helper ────────────────────────────────────────────
const removeModal = (id) => document.getElementById(id)?.remove();

const loadProfile = async () => {
  try {
    const [{ user }, postsRes, followersRes, followingRes] = await Promise.all([
      api.getUserByUsername(username),
      api.getUserPosts(username),
      api.getFollowers(username),
      api.getFollowing(username),
    ]);

    const posts = postsRes.posts || [];
    const followers = followersRes.followers || [];
    const following = followingRes.following || [];

    const isMe = String(me?.id) === String(user.id);
    const isFollowing = user.isFollowing || false;

    document.getElementById("profile-username").textContent =
      user.display_name || user.username;
    document.getElementById("profile-handle").textContent = `@${user.username}`;
    document.getElementById("profile-bio").textContent = user.bio || "";
    document.getElementById("profile-avatar").src = avatarSrc(user.avatar_url);
    document.getElementById("profile-posts-count").textContent =
      user.posts_count ?? posts.length;

    // Clickable followers
    const followersEl = document.getElementById("profile-followers");
    followersEl.textContent = user.followers_count ?? followers.length;
    followersEl
      .closest(".profile-stat")
      ?.addEventListener("click", () =>
        showUserListModal("Followers", followers),
      );

    // Clickable following
    const followingEl = document.getElementById("profile-following");
    followingEl.textContent = user.following_count ?? following.length;
    followingEl
      .closest(".profile-stat")
      ?.addEventListener("click", () =>
        showUserListModal("Following", following),
      );

    // Actions
    const actionsEl = document.getElementById("profile-actions");
    if (isMe) {
      actionsEl.innerHTML = `
        <button class="btn btn-outline btn-sm" id="edit-profile-btn">✏️ Edit Profile</button>`;
      document
        .getElementById("edit-profile-btn")
        .addEventListener("click", () => {
          document.getElementById("edit-modal").classList.add("open");
          document.getElementById("edit-bio").value = user.bio || "";
        });
    } else {
      actionsEl.innerHTML = `
        <button class="btn ${isFollowing ? "btn-outline" : "btn-primary"} btn-sm" id="follow-btn">
          ${isFollowing ? "✓ Following" : "+ Follow"}
        </button>`;
      document
        .getElementById("follow-btn")
        .addEventListener("click", async () => {
          try {
            await api.toggleFollow(user.username);
            const btn = document.getElementById("follow-btn");
            const wasFollowing = btn.textContent.includes("✓");
            btn.textContent = wasFollowing ? "+ Follow" : "✓ Following";
            btn.className = `btn ${wasFollowing ? "btn-primary" : "btn-outline"} btn-sm`;
            followersEl.textContent =
              (parseInt(followersEl.textContent) || 0) +
              (wasFollowing ? -1 : 1);
            showToast(wasFollowing ? "Unfollowed" : "Following! ✨", "success");
          } catch (err) {
            showToast(err.message, "error");
          }
        });
    }

    // Posts
    const postsEl = document.getElementById("profile-posts");
    postsEl.innerHTML = "";
    if (!posts.length) {
      postsEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No posts yet.</p>
        </div>`;
    } else {
      posts.forEach((p, i) => {
        const card = renderPostCard(p);
        card.style.animationDelay = `${i * 0.06}s`;
        postsEl.appendChild(card);
      });
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to load profile.", "error");
  }
};

// ── Edit form ─────────────────────────────────────────
document.getElementById("edit-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Saving...";
  const form = new FormData();
  form.append("bio", document.getElementById("edit-bio").value);
  const avatar = document.getElementById("edit-avatar").files[0];
  if (avatar) form.append("avatar", avatar);
  try {
    const { user } = await api.updateUser(form);
    localStorage.setItem("nexly_user", JSON.stringify({ ...me, ...user }));
    showToast("Profile updated! ✨", "success");
    document.getElementById("edit-modal").classList.remove("open");
    loadProfile();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
});

document
  .getElementById("modal-close")
  ?.addEventListener("click", () =>
    document.getElementById("edit-modal").classList.remove("open"),
  );
document.getElementById("edit-modal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
});

loadProfile();

// ── Followers / Following modal ───────────────────────
const showUserListModal = (title, users) => {
  removeModal("user-list-modal");

  const modal = document.createElement("div");
  modal.id = "user-list-modal";
  modal.className = "ig-modal-overlay";
  modal.innerHTML = `
    <div class="ig-modal">
      <div class="ig-modal-header">
        <span>${title}</span>
        <button class="ig-modal-close" id="ulm-close">✕</button>
      </div>
      <div class="ig-modal-body">
        ${
          !users.length
            ? `<p class="ig-empty">No ${title.toLowerCase()} yet</p>`
            : users
                .map(
                  (u) => `
            <a href="/profile.html?u=${u.username}" class="ig-user-row">
              <img src="${
                u.avatar_url
                  ? u.avatar_url.startsWith("http")
                    ? u.avatar_url
                    : BACKEND + u.avatar_url
                  : `https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${u.username}`
              }"
                class="ig-user-avatar" alt="${u.username}"/>
              <div class="ig-user-info">
                <div class="ig-user-name">${u.display_name || u.username}</div>
                <div class="ig-user-handle">@${u.username}</div>
              </div>
            </a>`,
                )
                .join("")
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document
    .getElementById("ulm-close")
    .addEventListener("click", () => removeModal("user-list-modal"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) removeModal("user-list-modal");
  });
};
