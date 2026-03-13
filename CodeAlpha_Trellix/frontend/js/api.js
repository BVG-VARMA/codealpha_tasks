const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const request = async (method, endpoint, body = null) => {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

const api = {
  // Auth
  register: (body) => request("POST", "/auth/register", body),
  login: (body) => request("POST", "/auth/login", body),
  getMe: () => request("GET", "/auth/me"),

  // Projects
  getProjects: () => request("GET", "/projects"),
  getProject: (id) => request("GET", `/projects/${id}`),
  createProject: (body) => request("POST", "/projects", body),
  updateProject: (id, body) => request("PUT", `/projects/${id}`, body),
  deleteProject: (id) => request("DELETE", `/projects/${id}`),

  // Tasks
  getTasks: (pid) => request("GET", `/projects/${pid}/tasks`),
  createTask: (pid, body) => request("POST", `/projects/${pid}/tasks`, body),
  updateTask: (pid, tid, body) =>
    request("PUT", `/projects/${pid}/tasks/${tid}`, body),
  deleteTask: (pid, tid) => request("DELETE", `/projects/${pid}/tasks/${tid}`),

  // Comments
  getComments: (pid, tid) =>
    request("GET", `/projects/${pid}/tasks/${tid}/comments`),
  addComment: (pid, tid, body) =>
    request("POST", `/projects/${pid}/tasks/${tid}/comments`, body),
  deleteComment: (pid, tid, cid) =>
    request("DELETE", `/projects/${pid}/tasks/${tid}/comments/${cid}`),
};
