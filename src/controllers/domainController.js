import Domain from '../models/Domain.js';
import DomainRenewal from '../models/DomainRenewal.js';
import { logAudit } from '../services/auditService.js';

export const getDomains = async (req, res) => {
  try {
    const { 
      search, status, renewalStatus, clientId, registrar, 
      daysRemaining, expiryFrom, expiryTo,
      page = 1, limit = 50 
    } = req.query;
    
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (renewalStatus) query.renewalStatus = renewalStatus;
    if (clientId) query.clientId = clientId;
    if (registrar) query.registrar = registrar;
    
    if (search) {
      query.domainName = { $regex: search, $options: 'i' };
    }

    if (expiryFrom || expiryTo || daysRemaining) {
      query.expiryDate = {};
      if (expiryFrom) query.expiryDate.$gte = new Date(expiryFrom);
      if (expiryTo) query.expiryDate.$lte = new Date(expiryTo);
      
      if (daysRemaining) {
        const today = new Date();
        const futureDate = new Date(today.getTime() + Number(daysRemaining) * 24 * 60 * 60 * 1000);
        query.expiryDate.$lte = futureDate;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const data = await Domain.find(query)
      .populate('clientId', 'companyName')
      .populate('responsibleEmployee', 'name email')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Domain.countDocuments(query);

    res.json({ 
      success: true, 
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('[getDomains Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDomain = async (req, res) => {
  try {
    const data = await Domain.findById(req.params.id)
      .populate('clientId', 'companyName')
      .populate('responsibleEmployee', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDomain = async (req, res) => {
  try {
    const { domainName, clientId, expiryDate, registrar, registrationDate, autoRenew, renewalCost, notes, status, renewalStatus } = req.body;

    if (!domainName || !domainName.trim()) {
      return res.status(400).json({ success: false, message: 'Domain name is required' });
    }
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client association is required' });
    }
    if (!expiryDate) {
      return res.status(400).json({ success: false, message: 'Domain expiry date is required' });
    }

    const cleanDomain = domainName.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

    // Duplicate check
    const existing = await Domain.findOne({ domainName: cleanDomain, deletedAt: null });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: `Domain "${cleanDomain}" is already registered in the system.` 
      });
    }

    const data = await Domain.create({
      ...req.body,
      domainName: cleanDomain,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_DOMAIN',
      module: 'Domain',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDomain = async (req, res) => {
  try {
    const data = await Domain.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user?._id }, 
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDomain = async (req, res) => {
  try {
    const data = await Domain.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const renewDomain = async (req, res) => {
  try {
    const { renewalPeriod, newExpiry, renewalCost, vendor, paymentStatus, notes, transactionRef } = req.body;
    
    if (!newExpiry || !renewalPeriod || renewalCost === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required renewal fields' });
    }

    const domain = await Domain.findById(req.params.id);
    if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });

    const previousExpiry = domain.expiryDate;
    
    // Create Renewal History Record
    const renewal = await DomainRenewal.create({
      domainId: domain._id,
      companyId: domain.companyId,
      renewalDate: new Date(),
      previousExpiry,
      newExpiry: new Date(newExpiry),
      renewalPeriod,
      cost: renewalCost,
      vendor: vendor || domain.registrar,
      paymentStatus,
      transactionRef,
      notes,
      createdBy: req.user?._id
    });

    // Update Domain record
    domain.expiryDate = new Date(newExpiry);
    domain.renewalStatus = 'Renewed';
    domain.status = 'Active';
    domain.renewalCost = renewalCost;
    if (vendor) domain.registrar = vendor;
    domain.updatedBy = req.user?._id;
    
    await domain.save();

    await logAudit({
      userId: req.user?._id,
      action: 'RENEW_DOMAIN',
      module: 'Domain',
      recordId: domain._id,
      newValues: { newExpiry, renewalCost },
      req
    });

    res.json({ success: true, message: 'Domain renewed successfully', data: { domain, renewal } });
  } catch (error) {
    console.error('[renewDomain Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDomainRenewalHistory = async (req, res) => {
  try {
    const history = await DomainRenewal.find({ domainId: req.params.id, deletedAt: null })
      .populate('createdBy', 'name email')
      .sort({ renewalDate: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
