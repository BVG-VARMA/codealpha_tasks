// ── Nexly API Client ──────────────────────────────────
// Auto-detect backend URL based on how frontend is served
const BACKEND =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `http://${window.location.hostname}:3000`;

const BASE_URL = `${BACKEND}/api`;

const getToken = () => localStorage.getItem("nexly_token");

const headers = (isFormData = false) => {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (!isFormData) h["Content-Type"] = "application/json";
  return h;
};

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

const api = {
  // Auth
  register: (body) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handleRes),
  login: (body) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handleRes),

  // Users
  getUserByUsername: (username) =>
    fetch(`${BASE_URL}/users/${username}`, { headers: headers() }).then(
      handleRes,
    ),
  searchUsers: (q) =>
    fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`, {
      headers: headers(),
    }).then(handleRes),
  updateUser: (form) =>
    fetch(`${BASE_URL}/users/me/profile`, {
      method: "PUT",
      headers: headers(true),
      body: form,
    }).then(handleRes),
  getFollowers: (username) =>
    fetch(`${BASE_URL}/users/${username}/followers`, {
      headers: headers(),
    }).then(handleRes),
  getFollowing: (username) =>
    fetch(`${BASE_URL}/users/${username}/following`, {
      headers: headers(),
    }).then(handleRes),

  // Follows
  toggleFollow: (username) =>
    fetch(`${BASE_URL}/follows/${username}/follow`, {
      method: "POST",
      headers: headers(),
    }).then(handleRes),

  // Posts
  getFeed: () =>
    fetch(`${BASE_URL}/posts/feed`, { headers: headers() }).then(handleRes),
  getPost: (id) =>
    fetch(`${BASE_URL}/posts/${id}`, { headers: headers() }).then(handleRes),
  getUserPosts: (username) =>
    fetch(`${BASE_URL}/posts/user/${username}`, { headers: headers() }).then(
      handleRes,
    ),
  createPost: (form) =>
    fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: headers(true),
      body: form,
    }).then(handleRes),
  updatePost: (id, form) =>
    fetch(`${BASE_URL}/posts/${id}`, {
      method: "PUT",
      headers: headers(true),
      body: form,
    }).then(handleRes),
  deletePost: (id) =>
    fetch(`${BASE_URL}/posts/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handleRes),

  // Likes
  toggleLike: (postId) =>
    fetch(`${BASE_URL}/likes/posts/${postId}/like`, {
      method: "POST",
      headers: headers(),
    }).then(handleRes),
  toggleCommentLike: (commentId) =>
    fetch(`${BASE_URL}/likes/comments/${commentId}/like`, {
      method: "POST",
      headers: headers(),
    }).then(handleRes),

  // Comments
  getComments: (postId) =>
    fetch(`${BASE_URL}/comments/posts/${postId}/comments`, {
      headers: headers(),
    }).then(handleRes),
  addComment: (postId, body) =>
    fetch(`${BASE_URL}/comments/posts/${postId}/comments`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ body }),
    }).then(handleRes),
  getReplies: (commentId) =>
    fetch(`${BASE_URL}/comments/comments/${commentId}/replies`, {
      headers: headers(),
    }).then(handleRes),
  deleteComment: (id) =>
    fetch(`${BASE_URL}/comments/comments/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handleRes),
};

export default api;
