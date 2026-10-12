import Task from '../models/Task.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getTasks = async (req, res) => {
  try {
    const { status, priority, projectId, assignedEmployee, search } = req.query;
    const query = { deletedAt: null };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectId) query.projectId = projectId;
    if (assignedEmployee) query.assignedEmployee = assignedEmployee;
    if (search) {
      query.$or = [
        { taskName: { $regex: search, $options: 'i' } },
        { taskId: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await Task.find(query)
      .populate('projectId', 'projectName')
      .populate('assignedEmployee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const data = await Task.findById(req.params.id)
      .populate('projectId')
      .populate('assignedEmployee', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const taskId = await generateNextNumber('TASK');
    const data = await Task.create({
      ...req.body,
      taskId,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_TASK',
      module: 'Task',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const old = await Task.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Task not found' });

    const data = await Task.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user?._id }, 
      { new: true, runValidators: true }
    ).populate('projectId').populate('assignedEmployee', 'name email');

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_TASK',
      module: 'Task',
      recordId: data._id,
      oldValues: old.toObject(),
      newValues: data.toObject(),
      req
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const data = await Task.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
