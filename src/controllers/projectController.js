import Project from '../models/Project.js';
import Client from '../models/Client.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Bug from '../models/Bug.js';
import ChangeRequest from '../models/ChangeRequest.js';
import TimeEntry from '../models/TimeEntry.js';
import Expense from '../models/Expense.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Website from '../models/Website.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getProjects = async (req, res) => {
  try {
    const { search, status, clientId, projectManager, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (projectManager) query.projectManager = projectManager;

    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { projectId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Project.find(query)
      .populate('clientId', 'companyName contactPerson email')
      .populate('projectManager', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const data = await Project.findById(req.params.id)
      .populate('clientId')
      .populate('projectManager', 'name email')
      .populate('teamMembers', 'name email role');

    if (!data) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROJECT 360 DEGREE VIEW AGGREGATION API
export const getProject360 = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId)
      .populate('clientId')
      .populate('projectManager', 'name email')
      .populate('teamMembers', 'name email');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const [
      milestones,
      tasks,
      bugs,
      changeRequests,
      timeEntries,
      expenses,
      invoices,
      payments,
      websites,
      documents,
      audits
    ] = await Promise.all([
      Milestone.find({ projectId, deletedAt: null }),
      Task.find({ projectId, deletedAt: null }).populate('assignedEmployee', 'name email'),
      Bug.find({ projectId, deletedAt: null }).populate('assignedDeveloper', 'name email'),
      ChangeRequest.find({ projectId, deletedAt: null }),
      TimeEntry.find({ projectId, deletedAt: null }).populate('employeeId', 'name email'),
      Expense.find({ projectId, deletedAt: null }),
      Invoice.find({ projectId, deletedAt: null }),
      Payment.find({ invoiceId: { $in: (await Invoice.find({ projectId }, '_id')).map(i => i._id) } }),
      Website.find({ projectId, deletedAt: null }),
      Document.find({ relatedRecordId: projectId, deletedAt: null }),
      AuditLog.find({ recordId: projectId }).sort({ createdAt: -1 }).limit(20)
    ]);

    // Financial calculations for Profitability:
    // Revenue = Total Payments received for this project
    const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    // Costs: Direct expenses + Time Tracking Cost
    const directExpensesCost = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const laborHours = timeEntries.reduce((sum, t) => sum + (t.durationHours || 0), 0);
    const estimatedHourlyCost = 500; // Default employee cost per hour
    const laborCost = laborHours * estimatedHourlyCost;
    const totalCost = directExpensesCost + laborCost;
    const projectProfit = revenue - totalCost;
    const marginPercent = revenue > 0 ? ((projectProfit / revenue) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        project,
        profitability: {
          revenue,
          directExpensesCost,
          laborHours,
          laborCost,
          totalCost,
          projectProfit,
          marginPercent: Number(marginPercent)
        },
        milestones,
        tasks,
        bugs,
        changeRequests,
        timeEntries,
        expenses,
        invoices,
        payments,
        websites,
        documents,
        activityTimeline: audits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const projectId = await generateNextNumber('PROJECT');
    const data = await Project.create({
      ...req.body,
      projectId,
      createdBy: req.user?._id
    });

    // Automatically create standard project milestones
    const defaultMilestones = [
      'Requirement Analysis',
      'UI/UX Design',
      'Development Phase',
      'QA & Testing',
      'Client UAT',
      'Deployment',
      'Handover & Training'
    ];

    await Promise.all(defaultMilestones.map(title => 
      Milestone.create({
        projectId: data._id,
        title,
        status: 'Pending',
        createdBy: req.user?._id
      })
    ));

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_PROJECT',
      module: 'Project',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const old = await Project.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Project not found' });

    const data = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_PROJECT',
      module: 'Project',
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

export const deleteProject = async (req, res) => {
  try {
    const data = await Project.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
