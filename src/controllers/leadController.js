import Lead from '../models/Lead.js';
import LeadNote from '../models/LeadNote.js';
import Client from '../models/Client.js';
import Contact from '../models/Contact.js';
import FollowUp from '../models/FollowUp.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';
import { triggerWorkflow } from '../services/workflowService.js';

export const getLeads = async (req, res) => {
  try {
    const { search, status, leadSource, priority, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (leadSource) query.leadSource = leadSource;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { leadId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Lead.find(query)
      .populate('salesperson', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const data = await Lead.findById(req.params.id).populate('salesperson', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Lead not found' });
    
    // Fetch followups history
    const followups = await FollowUp.find({ leadId: data._id, deletedAt: null }).sort({ followUpDate: -1 });
    
    res.json({ success: true, data: { ...data.toObject(), followups } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const leadId = await generateNextNumber('LEAD');
    const data = await Lead.create({
      ...req.body,
      leadId,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_LEAD',
      module: 'Lead',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    await triggerWorkflow('LEAD_CREATED', { userId: req.user?._id, leadId: data._id });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const oldLead = await Lead.findById(req.params.id);
    if (!oldLead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const data = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_LEAD',
      module: 'Lead',
      recordId: data._id,
      oldValues: oldLead.toObject(),
      newValues: data.toObject(),
      req
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const convertLeadToClient = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (lead.isConverted) {
      return res.status(400).json({ success: false, message: 'Lead is already converted to a client' });
    }

    const clientId = await generateNextNumber('CLIENT');
    
    // 1. Create Client
    const client = await Client.create({
      clientId,
      companyName: lead.companyName || lead.contactName || 'Unknown Company',
      contactPerson: lead.contactName || 'Unknown Contact',
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      website: lead.website,
      industry: lead.industry,
      salesperson: lead.salesperson,
      leadId: lead._id,
      status: 'Active',
      createdBy: req.user?._id
    });

    // 2. Create primary Contact
    await Contact.create({
      clientId: client._id,
      contactName: lead.contactName || 'Unknown Contact',
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      isPrimary: true,
      createdBy: req.user?._id
    });

    // 3. Mark Lead as Won & Converted
    lead.status = 'Won';
    lead.isConverted = true;
    lead.convertedClientId = client._id;
    lead.convertedDate = new Date();
    await lead.save();

    await logAudit({
      userId: req.user?._id,
      action: 'CONVERT_LEAD_TO_CLIENT',
      module: 'Lead',
      recordId: lead._id,
      newValues: { clientId: client._id },
      req
    });

    res.json({
      success: true,
      message: 'Lead successfully converted to Client!',
      data: { client, lead }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const data = await Lead.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Lead not found' });
    
    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_LEAD',
      module: 'Lead',
      recordId: data._id,
      req
    });

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NOTES ENDPOINTS

export const getLeadNotes = async (req, res) => {
  try {
    const notes = await LeadNote.find({ leadId: req.params.id, deletedAt: null })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('[getLeadNotes Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addLeadNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || note.trim() === '') {
      return res.status(400).json({ success: false, message: 'Note content is required.' });
    }
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    const newNote = await LeadNote.create({
      leadId: req.params.id,
      note,
      createdBy: req.user?._id
    });

    lead.notesCount = (lead.notesCount || 0) + 1;
    await lead.save();

    await logAudit({
      userId: req.user?._id,
      action: 'ADD_LEAD_NOTE',
      module: 'Lead',
      recordId: lead._id,
      req
    });

    const populatedNote = await LeadNote.findById(newNote._id).populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeadNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || note.trim() === '') {
      return res.status(400).json({ success: false, message: 'Note content is required.' });
    }

    const updatedNote = await LeadNote.findOneAndUpdate(
      { _id: req.params.noteId, leadId: req.params.id },
      { note, updatedBy: req.user?._id },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!updatedNote) return res.status(404).json({ success: false, message: 'Note not found.' });

    res.json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeadNote = async (req, res) => {
  try {
    const deletedNote = await LeadNote.findOneAndUpdate(
      { _id: req.params.noteId, leadId: req.params.id },
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );

    if (!deletedNote) return res.status(404).json({ success: false, message: 'Note not found.' });

    const lead = await Lead.findById(req.params.id);
    if (lead) {
      lead.notesCount = Math.max(0, (lead.notesCount || 1) - 1);
      await lead.save();
    }

    res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
