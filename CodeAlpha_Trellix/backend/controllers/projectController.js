const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .sort("-createdAt")
      .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, color } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const project = await Project.create({
      title,
      description,
      color,
      owner: req.user.id,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    // Prevent owner field from being overwritten
    delete req.body.owner;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Cascade delete tasks + comments
    const tasks = await Task.find({ project: project._id }).select("_id");
    const taskIds = tasks.map((t) => t._id);
    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
