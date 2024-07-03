const mongoose = require("mongoose");

// Define the Task schema
const taskSchema = new mongoose.Schema({
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", 
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["incomplete", "ongoing", "completed"],
    default: "incomplete",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Task model
const TaskModel = mongoose.model("Task", taskSchema);

module.exports = TaskModel;
