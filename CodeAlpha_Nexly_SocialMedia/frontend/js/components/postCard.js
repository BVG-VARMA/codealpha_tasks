// ── Post Card component (v3) ──────────────────────────
import { timeAgo, avatarSrc, postImageSrc, showToast } from "../utils.js";
import { getUser, getToken } from "../auth.js";
import api from "../api.js";

const BACKEND = `http://${window.location.hostname}:3000`;

// ── Modal helpers ─────────────────────────────────────
export const removeModal = (id) => document.getElementById(id)?.remove();

const createModal = (id, title, bodyHTML) => {
  removeModal(id);
  const m = document.createElement("div");
  m.id = id;
  m.className = "modal-overlay";
  m.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
    </div>`;
  m.querySelector(".modal-close").addEventListener("click", () =>
    removeModal(id),
  );
  m.addEventListener("click", (e) => {
    if (e.target === m) removeModal(id);
  });
  return m;
};

const userListHTML = (users) => {
  if (!users?.length) return '<p class="modal-empty">Nobody yet</p>';
  return users
    .map(
      (u) => `
    <a href="/profile.html?u=${u.username}" class="modal-user-item">
      <img src="${avatarSrc(u.avatar_url)}" class="avatar avatar-sm"
           onerror="this.src='https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${u.username}'"/>
      <div>
        <div class="modal-username">@${u.username}</div>
        ${u.display_name ? `<div class="modal-displayname">${u.display_name}</div>` : ""}
      </div>
    </a>`,
    )
    .join("");
};

// ── renderPostCard ────────────────────────────────────
export const renderPostCard = (post) => {
  const me = getUser();
  const card = document.createElement("div");
  card.className = "post-card";
  card.dataset.id = post.id;

  const img = postImageSrc(post.image_url);
  const isOwner = me?.id === post.user_id || me?.id === post.author_id;
  const liked = post.user_liked || post.is_liked || false;
  const likes = post.like_count || post.likes_count || 0;
  const comments = post.comment_count || post.comments_count || 0;

  card.innerHTML = `
    <div class="post-header">
      <a href="/profile.html?u=${post.username}">
        <img src="${avatarSrc(post.avatar_url)}"
             class="avatar avatar-sm" alt="${post.username}"
             onerror="this.src='https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${post.username}'"
             style="transition:transform .2s"
             onmouseover="this.style.transform='scale(1.08)'"
             onmouseout="this.style.transform='scale(1)'"/>
      </a>
      <div class="post-author">
        <div class="post-author-name">
          <a href="/profile.html?u=${post.username}">@${post.username}</a>
          ${post.display_name ? `<span class="post-displayname"> · ${post.display_name}</span>` : ""}
        </div>
        <div class="post-time">${timeAgo(post.created_at)}</div>
      </div>
      ${
        isOwner
          ? `
        <div class="post-menu-wrap">
          <button class="post-menu-btn" title="Options">⋯</button>
          <div class="post-dropdown" style="display:none;">
            <button class="delete-btn danger">🗑 Delete post</button>
          </div>
        </div>`
          : ""
      }
    </div>

    <div class="post-body">${escapeHTML(post.content)}</div>

    ${img ? `<img src="${img}" class="post-image" alt="post image" loading="lazy"/>` : ""}

    <div class="post-actions">
      <button class="action-btn like-btn ${liked ? "liked" : ""}" data-id="${post.id}">
        <span class="like-icon">${liked ? "❤️" : "🤍"}</span>
        <span class="like-count" data-postid="${post.id}" title="See who liked" style="cursor:pointer">${likes}</span>
      </button>
      <button class="action-btn comment-toggle-btn" data-id="${post.id}">
        <span class="icon">💬</span>
        <span class="comment-count">${comments}</span>
      </button>
    </div>

    <div class="comment-section" id="comments-${post.id}" style="display:none;">
      <div class="comment-list" id="comment-list-${post.id}">
        <p class="loading-text">Loading…</p>
      </div>
      <div class="comment-form">
        <img src="${avatarSrc(me?.avatar_url)}" class="avatar avatar-xs"
             onerror="this.src='https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${me?.username || "U"}'"/>
        <input class="comment-input" placeholder="Write a comment…" data-postid="${post.id}"/>
        <button class="comment-submit btn btn-primary btn-sm" data-postid="${post.id}">Post</button>
      </div>
    </div>
  `;

  // ── Dropdown menu ─────────────────────────────────
  const menuBtn = card.querySelector(".post-menu-btn");
  const dropdown = card.querySelector(".post-dropdown");
  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === "none" ? "block" : "none";
  });
  document.addEventListener("click", () => {
    if (dropdown) dropdown.style.display = "none";
  });

  // ── Like toggle ───────────────────────────────────
  const likeBtn = card.querySelector(".like-btn");
  const likeIcon = card.querySelector(".like-icon");
  const likeCount = card.querySelector(".like-count");

  likeBtn?.addEventListener("click", async (e) => {
    if (e.target === likeCount) return; // let count click handle separately
    try {
      const { liked: newLiked, like_count } = await api.toggleLike(post.id);
      likeIcon.textContent = newLiked ? "❤️" : "🤍";
      likeCount.textContent = like_count;
      likeBtn.classList.toggle("liked", newLiked);
    } catch (err) {
      showToast(err.message || "Login to like", "error");
    }
  });

  // ── Like count click → show who liked ────────────
  likeCount?.addEventListener("click", async (e) => {
    e.stopPropagation();
    const modal = createModal(
      "likes-modal",
      "Liked by",
      '<p class="loading-text">Loading…</p>',
    );
    document.body.appendChild(modal);
    try {
      const res = await fetch(`${BACKEND}/api/likes/posts/${post.id}/likers`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed");
      const { users } = await res.json();
      modal.querySelector(".modal-body").innerHTML = userListHTML(users);
    } catch {
      modal.querySelector(".modal-body").innerHTML =
        '<p class="modal-empty">Could not load likes</p>';
    }
  });

  // ── Comments toggle ───────────────────────────────
  const commentSection = card.querySelector(`#comments-${post.id}`);
  let commentsLoaded = false;

  card
    .querySelector(".comment-toggle-btn")
    ?.addEventListener("click", async () => {
      const isHidden = commentSection.style.display === "none";
      commentSection.style.display = isHidden ? "block" : "none";
      if (isHidden && !commentsLoaded) {
        commentsLoaded = true;
        await loadComments(post.id, card);
      }
    });

  // ── Submit comment ────────────────────────────────
  const commentInput = card.querySelector(".comment-input");
  const commentSubmit = card.querySelector(".comment-submit");

  const submitComment = async () => {
    const body = commentInput.value.trim();
    if (!body) return;
    try {
      commentSubmit.disabled = true;
      await api.addComment(post.id, body);
      commentInput.value = "";
      const countEl = card.querySelector(".comment-count");
      countEl.textContent = parseInt(countEl.textContent || 0) + 1;
      await loadComments(post.id, card);
    } catch (err) {
      showToast(err.message || "Login to comment", "error");
    } finally {
      commentSubmit.disabled = false;
    }
  };

  commentSubmit?.addEventListener("click", submitComment);
  commentInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitComment();
  });

  // ── Delete post ───────────────────────────────────
  card.querySelector(".delete-btn")?.addEventListener("click", async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.deletePost(post.id);
      card.style.transition = "opacity .3s, transform .3s";
      card.style.opacity = "0";
      card.style.transform = "translateY(-8px)";
      setTimeout(() => card.remove(), 300);
      showToast("Post deleted", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  return card;
};

// ── Load comments into card ───────────────────────────
const loadComments = async (postId, card) => {
  const list = card.querySelector(`#comment-list-${postId}`);
  try {
    const data = await api.getComments(postId);
    const comments = data.comments || data || [];
    if (!comments.length) {
      list.innerHTML = '<p class="no-comments">No comments yet. Be first!</p>';
      return;
    }
    list.innerHTML = comments.map((c) => renderComment(c)).join("");

    // wire up delete buttons
    list.querySelectorAll(".comment-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const cid = btn.dataset.id;
        if (!confirm("Delete comment?")) return;
        try {
          await api.deleteComment(cid);
          btn.closest(".comment-item").remove();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  } catch {
    list.innerHTML = '<p class="no-comments">Could not load comments</p>';
  }
};

const renderComment = (c) => {
  const me = getUser();
  const isOwner = me?.id === c.user_id || me?.id === c.author_id;
  return `
    <div class="comment-item" data-id="${c.id}">
      <a href="/profile.html?u=${c.username}">
        <img src="${avatarSrc(c.avatar_url)}" class="avatar avatar-xs"
             onerror="this.src='https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=${c.username}'"/>
      </a>
      <div class="comment-content">
        <a href="/profile.html?u=${c.username}" class="comment-author">@${c.username}</a>
        <span class="comment-body">${escapeHTML(c.content || c.body || "")}</span>
        <div class="comment-meta">
          <span class="comment-time">${timeAgo(c.created_at)}</span>
          ${isOwner ? `<button class="comment-delete-btn" data-id="${c.id}">Delete</button>` : ""}
        </div>
      </div>
    </div>`;
};

const escapeHTML = (str = "") =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
