// ── post.js — Single post + comments ────────────────
import { requireAuth } from "./auth.js";
import { injectNavbar } from "./components/navbar.js";
import { renderPostCard } from "./components/postCard.js";
import { renderComment } from "./components/commentItem.js";
import { showToast } from "./utils.js";
import api from "./api.js";

requireAuth();
injectNavbar();

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const loadPost = async () => {
  try {
    const [{ post }, { comments }] = await Promise.all([
      api.getPost(postId),
      api.getComments(postId),
    ]);

    document.getElementById("post-container").appendChild(renderPostCard(post));

    const listEl = document.getElementById("comments-list");
    listEl.innerHTML = "";
    if (!comments.length) {
      listEl.innerHTML =
        '<div class="empty-state"><p>No comments yet. Be first!</p></div>';
    } else {
      comments.forEach((c) => listEl.appendChild(renderComment(c)));
    }
  } catch (err) {
    showToast("Failed to load post.", "error");
  }
};

// Add comment
document
  .getElementById("comment-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("comment-input");
    const body = input.value.trim();
    if (!body) return;
    try {
      const { comment } = await api.addComment(postId, body);
      const listEl = document.getElementById("comments-list");
      const empty = listEl.querySelector(".empty-state");
      if (empty) empty.remove();
      listEl.appendChild(renderComment(comment));
      input.value = "";
    } catch (err) {
      showToast(err.message, "error");
    }
  });

loadPost();
