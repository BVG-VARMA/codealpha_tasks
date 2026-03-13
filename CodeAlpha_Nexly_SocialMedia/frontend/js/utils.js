// ── utils.js (v2) ─────────────────────────────────────

// Handles both avatarUrl (camelCase) and avatar_url (snake_case)
export const avatarSrc = (url) => {
  if (!url)
    return "https://ui-avatars.com/api/?background=7c6dfa&color=fff&name=U";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

export const postImageSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const showToast = (message, type = "info") => {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
