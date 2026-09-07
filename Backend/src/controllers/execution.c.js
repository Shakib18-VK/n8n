import axios from "axios";
import Execution from "../models/execution.js";
import Workflow from "../models/workflow.js";

/**
 * ▶️ Start execution
 */
export const createExecution = async (req, res) => {
  try {
    const { workflowId, input } = req.body;
    const userId = req.user._id;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      userId,
      isActive: true
    });

    if (!workflow) {
      return res.status(404).json({ message: "Active workflow not found" });
    }

    // create execution
    const execution = await Execution.create({
      workflowId,
      userId,
      input,
      status: "running",
      logs: [{ message: "Execution started", time: new Date() }]
    });

    // 🔥 CALL PYTHON ENGINE
    const pyRes = await axios.post("http://127.0.0.1:8000/execute", {
      nodes: workflow.nodes,
      edges: workflow.edges,
      query: input.query || input
    });

    // Safe extraction: Ensure pyRes.data.result is never an raw object with {type, text, extras}
    let rawResult = pyRes.data.result;
    let cleanResult = "";

    if (typeof rawResult === "object" && rawResult !== null) {
      cleanResult = rawResult.text || JSON.stringify(rawResult, null, 2);
    } else {
      cleanResult = String(rawResult || "");
    }

    execution.output = {
      result: cleanResult,
      route: pyRes.data.route
    };
    execution.status = "success";
    execution.logs.push({
      message: "Execution finished",
      time: new Date()
    });

    await execution.save();

    res.status(201).json(execution);
  } catch (err) {
    console.error("Execution Controller Error:", err.message);
    if (err.response) {
      console.error("Python Engine Error Data:", err.response.data);
      console.error("Python Engine Status:", err.response.status);
    }
    res.status(500).json({ message: "Execution failed", error: err.message });
  }
};

/**
 * 📄 Get all executions
 */
export const getAllExecutions = async (req, res) => {
  const executions = await Execution.find({ userId: req.user._id })
    .select("-logs")
    .sort({ createdAt: -1 });

  res.json(executions);
};

/**
 * 🔍 Get execution by id
 */
export const getExecutionById = async (req, res) => {
  const execution = await Execution.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!execution) {
    return res.status(404).json({ message: "Execution not found" });
  }

  res.json(execution);
};

/**
 * ❌ Delete execution
 */
export const deleteExecution = async (req, res) => {
  await Execution.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  res.json({ message: "Execution deleted" });
};