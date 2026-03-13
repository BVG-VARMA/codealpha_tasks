// Auth guard
const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user) window.location.href = "login.html";

const projectId = new URLSearchParams(window.location.search).get("id");
if (!projectId) window.location.href = "dashboard.html";

// Set user info
document.getElementById("userName").textContent = user.name;
document.getElementById("userAvatar").textContent = user.name[0];

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

let tasks = [];
let currentTask = null;
let socketInitialized = false;

// ── Load Board ──
const loadBoard = async () => {
  try {
    const [project, taskList] = await Promise.all([
      api.getProject(projectId),
      api.getTasks(projectId),
    ]);
    document.getElementById("projectTitle").textContent = project.title;
    document.getElementById("projectDesc").textContent =
      project.description || "";
    tasks = taskList;
    renderBoard();

    if (!socketInitialized) {
      socketInitialized = true;
      initSocket(projectId, {
        onConnect: () => {
          document.getElementById("liveIndicator").style.display = "flex";
        },
        onDisconnect: () => {
          document.getElementById("liveIndicator").style.display = "none";
        },
        onTaskCreated: (task) => {
          if (!tasks.find((t) => t._id === task._id)) {
            tasks.push(task);
            renderBoard();
          }
        },
        onTaskUpdated: (task) => {
          const existing = tasks.find((t) => t._id === task._id);
          if (existing) {
            tasks = tasks.map((t) => (t._id === task._id ? task : t));
            renderBoard();
          }
        },
        onTaskDeleted: (taskId) => {
          if (tasks.find((t) => t._id === taskId)) {
            tasks = tasks.filter((t) => t._id !== taskId);
            renderBoard();
          }
        },
        onCommentAdded: (comment) => {
          if (currentTask && comment.task === currentTask._id) {
            if (!document.getElementById(`comment-${comment._id}`)) {
              const container = document.getElementById("commentsList");
              const noComments = container.querySelector("p");
              if (noComments) container.innerHTML = "";
              container.insertAdjacentHTML("beforeend", buildComment(comment));
            }
          }
        },
        onCommentDeleted: ({ commentId }) => {
          const el = document.getElementById(`comment-${commentId}`);
          if (el) el.remove();
        },
      });
    }
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ── Render Board ──
const renderBoard = () => {
  const statuses = ["todo", "inprogress", "done"];
  statuses.forEach((status) => {
    const col = document.getElementById(`col-${status}`);
    const filtered = tasks.filter((t) => t.status === status);
    document.getElementById(`count-${status}`).textContent = filtered.length;

    if (filtered.length === 0) {
      col.innerHTML = "";
      return;
    }

    col.innerHTML = filtered
      .map(
        (task) => `
      <div class="task-card" data-id="${task._id}">
        <h4>${task.title}</h4>
        ${task.description ? `<p>${task.description}</p>` : ""}
        <div class="task-meta">
          <span class="priority-badge ${task.priority}">${task.priority}</span>
          ${
            task.dueDate
              ? `<span class="task-due ${isOverdue(task.dueDate) ? "overdue" : ""}">
                ${formatDate(task.dueDate)}
               </span>`
              : ""
          }
        </div>
      </div>`,
      )
      .join("");
  });

  // Attach click to all task cards
  document.querySelectorAll(".task-card").forEach((card) => {
    card.addEventListener("click", () => openTaskDetail(card.dataset.id));
  });
};

const isOverdue = (date) => new Date(date) < new Date();
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

// ── Add Task ──
let addTaskStatus = "todo";

const openAddTask = (status) => {
  addTaskStatus = status;
  document.getElementById("taskForm").reset();
  document.getElementById("addTaskModal").classList.add("active");
  setTimeout(() => document.getElementById("taskTitle").focus(), 100);
};

document
  .getElementById("addTodo")
  .addEventListener("click", () => openAddTask("todo"));
document
  .getElementById("addInprogress")
  .addEventListener("click", () => openAddTask("inprogress"));
document
  .getElementById("addDone")
  .addEventListener("click", () => openAddTask("done"));

document.getElementById("closeAddTask").addEventListener("click", () => {
  document.getElementById("addTaskModal").classList.remove("active");
});

document.getElementById("cancelAddTask").addEventListener("click", () => {
  document.getElementById("addTaskModal").classList.remove("active");
});

document.getElementById("addTaskModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("addTaskModal")) {
    document.getElementById("addTaskModal").classList.remove("active");
  }
});

document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titleVal = document.getElementById("taskTitle").value.trim();
  if (!titleVal) {
    showToast("Title is required", "error");
    return;
  }

  const body = {
    title: titleVal,
    description: document.getElementById("taskDesc").value.trim(),
    priority: document.getElementById("taskPriority").value,
    dueDate: document.getElementById("taskDue").value || null,
    status: addTaskStatus,
  };

  try {
    const task = await api.createTask(projectId, body);
    if (!tasks.find((t) => t._id === task._id)) {
      tasks.push(task);
    }
    renderBoard();
    document.getElementById("addTaskModal").classList.remove("active");
    document.getElementById("taskForm").reset();
    showToast("Task created!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// ── Task Detail ──
const openTaskDetail = (taskId) => {
  currentTask = tasks.find((t) => t._id === taskId);
  if (!currentTask) return;

  document.getElementById("detailTitle").textContent = currentTask.title;
  document.getElementById("detailDesc").textContent =
    currentTask.description || "No description";
  document.getElementById("detailPriority").textContent = currentTask.priority;
  document.getElementById("detailStatus").textContent = currentTask.status;
  document.getElementById("detailDue").textContent = currentTask.dueDate
    ? formatDate(currentTask.dueDate)
    : "No due date";

  document.getElementById("taskDetailModal").classList.add("active");
  loadComments(taskId);
};

document.getElementById("closeDetail").addEventListener("click", () => {
  document.getElementById("taskDetailModal").classList.remove("active");
  currentTask = null;
});

document.getElementById("taskDetailModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("taskDetailModal")) {
    document.getElementById("taskDetailModal").classList.remove("active");
    currentTask = null;
  }
});

// ── Delete Task ──
document.getElementById("deleteTaskBtn").addEventListener("click", async () => {
  if (!currentTask) return;
  if (!confirm("Delete this task?")) return;

  const taskId = currentTask._id;

  try {
    await api.deleteTask(projectId, taskId);
    tasks = tasks.filter((t) => t._id !== taskId);
    renderBoard();
    document.getElementById("taskDetailModal").classList.remove("active");
    currentTask = null;
    showToast("Task deleted", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// ── Move Task ──
document.getElementById("moveTaskBtn").addEventListener("click", async () => {
  if (!currentTask) return;
  const statuses = ["todo", "inprogress", "done"];
  const next =
    statuses[(statuses.indexOf(currentTask.status) + 1) % statuses.length];

  try {
    const updated = await api.updateTask(projectId, currentTask._id, {
      status: next,
    });
    tasks = tasks.map((t) => (t._id === currentTask._id ? updated : t));
    currentTask = updated;
    document.getElementById("detailStatus").textContent = updated.status;
    renderBoard();
    showToast(`Moved to ${next}!`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// ── Comments ──
const loadComments = async (taskId) => {
  const container = document.getElementById("commentsList");
  container.innerHTML =
    '<p style="font-size:13px;color:#94a3b8">Loading...</p>';
  try {
    const comments = await api.getComments(projectId, taskId);
    renderComments(comments);
  } catch (err) {
    container.innerHTML =
      '<p style="font-size:13px;color:#ef4444">Failed to load comments</p>';
  }
};

const renderComments = (comments) => {
  const container = document.getElementById("commentsList");
  if (comments.length === 0) {
    container.innerHTML =
      '<p style="font-size:13px;color:#94a3b8">No comments yet</p>';
    return;
  }
  container.innerHTML = comments.map((c) => buildComment(c)).join("");
};

const buildComment = (c) => `
  <div class="comment" id="comment-${c._id}">
    <div class="comment-avatar">${c.author.name[0].toUpperCase()}</div>
    <div class="comment-body">
      <span class="comment-author">${c.author.name}</span>
      <span class="comment-time">${timeAgo(c.createdAt)}</span>
      <p class="comment-text">${c.text}</p>
    </div>
  </div>`;

document.getElementById("addCommentBtn").addEventListener("click", async () => {
  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text || !currentTask) return;

  try {
    const comment = await api.addComment(projectId, currentTask._id, { text });
    input.value = "";
    if (!document.getElementById(`comment-${comment._id}`)) {
      const container = document.getElementById("commentsList");
      const noComments = container.querySelector("p");
      if (noComments) container.innerHTML = "";
      container.insertAdjacentHTML("beforeend", buildComment(comment));
    }
  } catch (err) {
    showToast(err.message, "error");
  }
});

document.getElementById("commentInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("addCommentBtn").click();
});

// ── Helpers ──
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const showToast = (msg, type = "") => {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
};

// ── Start ──
loadBoard();
