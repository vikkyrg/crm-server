import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import AuditLog from '../models/AuditLog.js';

export const convertLeadToClient = async (leadId, userId) => {
  // Using Mongoose Transactions would go here
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found');
  
  const newClient = await Client.create({
    company: lead.company,
    contact: lead.contact,
    email: lead.email,
    phone: 'Update Required',
    status: 'Active'
  });
  
  lead.status = 'Won';
  await lead.save();
  
  await AuditLog.create({
    user: userId,
    action: 'LEAD_CONVERTED',
    module: 'Leads',
    recordId: lead._id,
    newValue: { clientId: newClient._id }
  });
  
  return newClient;
};