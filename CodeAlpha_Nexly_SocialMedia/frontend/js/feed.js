// ── feed.js (v2) ──────────────────────────────────────
import { requireAuth, getUser } from "./auth.js";
import { injectNavbar } from "./components/navbar.js";
import { renderPostCard } from "./components/postCard.js";
import { avatarSrc, showToast } from "./utils.js";
import api from "./api.js";

requireAuth();
injectNavbar();

const feedEl = document.getElementById("feed");
const textarea = document.getElementById("compose-text");
const postBtn = document.getElementById("post-btn");
const imageInput = document.getElementById("compose-image");
const previewWrap = document.getElementById("compose-preview-wrap");
const me = getUser();

document.getElementById("compose-avatar").src = avatarSrc(me?.avatar_url);

// Image preview
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) {
    previewWrap.innerHTML = "";
    return;
  }
  const url = URL.createObjectURL(file);
  previewWrap.innerHTML = `
    <div class="compose-preview">
      <img src="${url}" alt="preview"/>
      <button class="compose-preview-remove" id="remove-preview">✕</button>
    </div>`;
  document.getElementById("remove-preview").addEventListener("click", () => {
    imageInput.value = "";
    previewWrap.innerHTML = "";
  });
});

// Auto-grow textarea
textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
});

// ── Load feed ─────────────────────────────────────────
const loadFeed = async () => {
  feedEl.innerHTML = '<div class="spinner"></div>';
  try {
    const { posts } = await api.getFeed();
    feedEl.innerHTML = "";
    if (!posts.length) {
      feedEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>Your feed is empty.</p>
          <p style="margin-top:6px;font-size:13px;">Follow people to see their posts here!</p>
        </div>`;
      return;
    }
    posts.forEach((p, i) => {
      const card = renderPostCard(p);
      card.style.animationDelay = `${i * 0.06}s`;
      feedEl.appendChild(card);
    });
  } catch {
    feedEl.innerHTML = `<div class="empty-state"><p>Failed to load feed.</p></div>`;
  }
};

// ── Create post ───────────────────────────────────────
postBtn.addEventListener("click", async () => {
  const content = textarea.value.trim();
  if (!content) {
    textarea.focus();
    textarea.style.borderColor = "rgba(250,109,142,0.5)";
    setTimeout(() => (textarea.style.borderColor = ""), 1000);
    return;
  }
  postBtn.disabled = true;
  postBtn.innerHTML = '<span style="opacity:.7">Posting…</span>';

  const form = new FormData();
  form.append("content", content);
  if (imageInput.files[0]) form.append("image", imageInput.files[0]);

  try {
    await api.createPost(form);
    textarea.value = "";
    textarea.style.height = "auto";
    imageInput.value = "";
    previewWrap.innerHTML = "";
    showToast("✨ Posted!", "success");
    loadFeed();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = "Post";
  }
});

loadFeed();
