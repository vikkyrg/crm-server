import Ticket from '../models/Ticket.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getTickets = async (req, res) => {
  try {
    const { status, priority, clientId, projectId, search } = req.query;
    const query = { deletedAt: null };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (clientId) query.clientId = clientId;
    if (projectId) query.projectId = projectId;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await Ticket.find(query)
      .populate('clientId', 'companyName email phone')
      .populate('projectId', 'projectName')
      .populate('assignedEmployee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicket = async (req, res) => {
  try {
    const data = await Ticket.findById(req.params.id)
      .populate('clientId')
      .populate('projectId')
      .populate('assignedEmployee', 'name email')
      .populate('messages.sender', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const ticketId = await generateNextNumber('TICKET');
    const data = await Ticket.create({
      ...req.body,
      ticketId,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_TICKET',
      module: 'Ticket',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const old = await Ticket.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Ticket not found' });

    let updatePayload = { ...req.body, updatedBy: req.user?._id };
    if (req.body.newMessage) {
      updatePayload.$push = {
        messages: {
          sender: req.user?._id,
          senderType: req.user?.role?.name === 'Client' ? 'Client' : 'Staff',
          message: req.body.newMessage,
          createdAt: new Date()
        }
      };
      delete updatePayload.newMessage;
    }

    const data = await Ticket.findByIdAndUpdate(
      req.params.id, 
      updatePayload, 
      { new: true, runValidators: true }
    ).populate('clientId').populate('assignedEmployee', 'name email');

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_TICKET',
      module: 'Ticket',
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

export const deleteTicket = async (req, res) => {
  try {
    const data = await Ticket.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
