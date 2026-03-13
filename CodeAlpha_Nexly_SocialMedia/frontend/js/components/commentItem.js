// ── Comment Item component (v2) ───────────────────────
import { timeAgo, avatarSrc } from "../utils.js";
import { getUser } from "../auth.js";
import api from "../api.js";
import { showToast } from "../utils.js";

export const renderComment = (comment) => {
  const me = getUser();
  const div = document.createElement("div");
  div.className = "comment-item fade-up";
  div.dataset.id = comment.id;

  div.innerHTML = `
    <a href="/profile.html?id=${comment.author_id}">
      <img src="${avatarSrc(comment.avatar_url)}"
           class="avatar avatar-sm" alt="${comment.username}"/>
    </a>
    <div class="comment-body">
      <div class="comment-meta">
        <a href="/profile.html?id=${comment.author_id}" class="comment-author">${comment.username}</a>
        <span class="comment-time">${timeAgo(comment.created_at)}</span>
        ${
          me?.id === comment.author_id
            ? `<button class="comment-delete" data-id="${comment.id}" title="Delete">✕</button>`
            : ""
        }
      </div>
      <p class="comment-text">${comment.body}</p>
    </div>
  `;

  div.querySelector(".comment-delete")?.addEventListener("click", async () => {
    try {
      await api.deleteComment(comment.id);
      div.style.transition = "opacity .2s";
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 200);
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  return div;
};
