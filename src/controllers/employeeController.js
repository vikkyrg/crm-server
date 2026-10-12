import Employee from '../models/Employee.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const query = { deletedAt: null };
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await Employee.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const data = await Employee.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employeeId = await generateNextNumber('EMPLOYEE');
    const data = await Employee.create({
      ...req.body,
      employeeId,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_EMPLOYEE',
      module: 'Employee',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const old = await Employee.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Employee not found' });

    const data = await Employee.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user?._id }, 
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_EMPLOYEE',
      module: 'Employee',
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

export const deleteEmployee = async (req, res) => {
  try {
    const data = await Employee.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
