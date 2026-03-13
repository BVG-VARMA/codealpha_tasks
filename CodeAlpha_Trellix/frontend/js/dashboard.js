// Auth guard
const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user) window.location.href = "login.html";

document.getElementById("userName").textContent = user.name;
document.getElementById("userAvatar").textContent = user.name[0].toUpperCase();

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

let projects = [];

// ── Load projects ─────────────────────────────────────────────────────────────
const loadProjects = async () => {
  try {
    projects = await api.getProjects();
    renderProjects();
  } catch (err) {
    showToast(err.message, "error");
  }
};

const renderProjects = () => {
  const grid = document.getElementById("projectsGrid");
  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">📋</div>
        <h3>No projects yet</h3>
        <p>Create your first project to get started</p>
      </div>`;
    return;
  }

  grid.innerHTML = projects
    .map(
      (p, i) => `
    <div class="project-card" style="--project-color:${p.color};animation-delay:${i * 40}ms"
         onclick="openProject('${p._id}')">
      <h3>${escHtml(p.title)}</h3>
      <p>${escHtml(p.description || "No description")}</p>
      <div class="project-card-footer">
        <span class="project-status">${p.status}</span>
        <div class="project-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-secondary" onclick="openEditProject('${p._id}')">Edit</button>
          <button class="btn btn-sm btn-danger"    onclick="deleteProject('${p._id}')">Delete</button>
        </div>
      </div>
    </div>`,
    )
    .join("");
};

const openProject = (id) => {
  window.location.href = `project.html?id=${id}`;
};

// ── Create / Edit modal ───────────────────────────────────────────────────────
const modal = document.getElementById("projectModal");

document.getElementById("createProjectBtn").addEventListener("click", () => {
  document.getElementById("modalTitle").textContent = "New Project";
  document.getElementById("projectForm").reset();
  document.getElementById("editProjectId").value = "";
  modal.classList.add("active");
});

document
  .getElementById("closeModal")
  .addEventListener("click", () => modal.classList.remove("active"));

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editProjectId").value;
  const body = {
    title: document.getElementById("projectTitle").value.trim(),
    description: document.getElementById("projectDesc").value.trim(),
    color: document.getElementById("projectColor").value,
  };

  try {
    if (id) {
      const updated = await api.updateProject(id, body);
      projects = projects.map((p) => (p._id === id ? updated : p));
      showToast("Project updated!", "success");
    } else {
      const created = await api.createProject(body);
      projects.unshift(created);
      showToast("Project created!", "success");
    }
    renderProjects();
    modal.classList.remove("active");
  } catch (err) {
    showToast(err.message, "error");
  }
});

const openEditProject = (id) => {
  const p = projects.find((p) => p._id === id);
  if (!p) return;
  document.getElementById("modalTitle").textContent = "Edit Project";
  document.getElementById("editProjectId").value = id;
  document.getElementById("projectTitle").value = p.title;
  document.getElementById("projectDesc").value = p.description || "";
  document.getElementById("projectColor").value = p.color || "#d97706";
  modal.classList.add("active");
};

const deleteProject = async (id) => {
  if (!confirm("Delete this project and all its tasks?")) return;
  try {
    await api.deleteProject(id);
    projects = projects.filter((p) => p._id !== id);
    renderProjects();
    showToast("Project deleted", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const escHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const showToast = (msg, type = "") => {
  const toast = document.getElementById("toast");
  if (toast._hideTimeout) clearTimeout(toast._hideTimeout);
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  toast._hideTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
};

loadProjects();
