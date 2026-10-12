import Expense from '../models/Expense.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getExpenses = async (req, res) => {
  try {
    const { category, projectId, approvalStatus, search } = req.query;
    const query = { deletedAt: null };
    if (category) query.category = category;
    if (projectId) query.projectId = projectId;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search) {
      query.$or = [
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { expenseId: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await Expense.find(query)
      .populate('projectId', 'projectName')
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpense = async (req, res) => {
  try {
    const data = await Expense.findById(req.params.id)
      .populate('projectId')
      .populate('employeeId', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expenseId = await generateNextNumber('EXPENSE');
    const data = await Expense.create({
      ...req.body,
      expenseId,
      employeeId: req.body.employeeId || req.user?._id,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_EXPENSE',
      module: 'Expense',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const old = await Expense.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Expense not found' });

    const data = await Expense.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user?._id }, 
      { new: true, runValidators: true }
    ).populate('projectId').populate('employeeId', 'name email');

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_EXPENSE',
      module: 'Expense',
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

export const deleteExpense = async (req, res) => {
  try {
    const data = await Expense.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
