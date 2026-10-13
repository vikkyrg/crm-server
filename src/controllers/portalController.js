import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Quotation from '../models/Quotation.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Document from '../models/Document.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';

// CLIENT PORTAL API - Strict Tenant Isolation
export const getClientPortalData = async (req, res) => {
  try {
    let client = null;
    
    // 1. Direct explicit binding on user account
    if (req.user.clientId) {
      client = await Client.findOne({ _id: req.user.clientId, deletedAt: null });
    }
    
    // 2. Fallback to authenticated email match
    if (!client && req.user.email) {
      client = await Client.findOne({ email: req.user.email.toLowerCase().trim(), deletedAt: null });
    }

    if (!client) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access Denied: Your account is not linked to any authorized Client Organization.' 
      });
    }

    const [projects, quotations, invoices, payments, tickets, documents] = await Promise.all([
      Project.find({ clientId: client._id, deletedAt: null }).select('-teamMembers'),
      Quotation.find({ clientId: client._id, deletedAt: null }),
      Invoice.find({ clientId: client._id, deletedAt: null }),
      Payment.find({ clientId: client._id, deletedAt: null }),
      Ticket.find({ clientId: client._id, deletedAt: null }),
      Document.find({ relatedRecordId: client._id, deletedAt: null })
    ]);

    res.json({
      success: true,
      data: {
        client,
        projects,
        quotations,
        invoices,
        payments,
        tickets,
        documents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EMPLOYEE PORTAL API
export const getEmployeePortalData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [tasks, projects, attendanceRecords, leaveRequests] = await Promise.all([
      Task.find({ assignedEmployee: userId, deletedAt: null }).populate('projectId', 'projectName'),
      Project.find({ teamMembers: userId, deletedAt: null }),
      Attendance.find({ employeeId: userId }).sort({ date: -1 }).limit(30),
      Leave.find({ employeeId: userId }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        employee: req.user,
        tasks,
        projects,
        attendanceRecords,
        leaveRequests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EMPLOYEE CHECK-IN / CHECK-OUT API
export const recordEmployeeAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { action } = req.body; // 'checkin' or 'checkout'
    const today = new Date();
    today.setHours(0,0,0,0);

    let record = await Attendance.findOne({ employeeId: userId, date: { $gte: today } });

    if (action === 'checkin') {
      if (!record) {
        record = await Attendance.create({
          employeeId: userId,
          date: new Date(),
          checkIn: new Date(),
          status: 'Present'
        });
      }
    } else if (action === 'checkout') {
      if (record) {
        record.checkOut = new Date();
        const diffHours = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
        record.workHours = Number(diffHours.toFixed(2));
        await record.save();
      }
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
