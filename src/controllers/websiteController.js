import Website from '../models/Website.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getWebsites = async (req, res) => {
  try {
    const { search, status, clientId, websiteType, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (websiteType) query.websiteType = websiteType;

    if (search) {
      query.$or = [
        { domainName: { $regex: search, $options: 'i' } },
        { websiteId: { $regex: search, $options: 'i' } },
        { hostingProvider: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const data = await Website.find(query)
      .populate('clientId', 'companyName name contactPerson email')
      .populate('projectId', 'projectName')
      .populate('amcId', 'amcNumber status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Website.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWebsite = async (req, res) => {
  try {
    const data = await Website.findOne({ _id: req.params.id, deletedAt: null })
      .populate('clientId')
      .populate('projectId')
      .populate('amcId');
    if (!data) return res.status(404).json({ success: false, message: 'Website record not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWebsite = async (req, res) => {
  try {
    const websiteId = await generateNextNumber('WEBSITE');
    const {
      clientId,
      domainName,
      projectId,
      websiteType = 'Corporate',
      technologyStack,
      framework,
      repositoryUrl,
      hostingProvider,
      serverIp,
      sslStatus = 'Active',
      databaseType,
      deploymentDate,
      renewalDate,
      hasAmc = false,
      status = 'Live',
      backupStatus = 'Weekly',
      notes
    } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client selection is required' });
    }
    if (!domainName || !domainName.trim()) {
      return res.status(400).json({ success: false, message: 'Website domain name/URL is required' });
    }

    // Clean domain format
    const cleanedDomain = domainName.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

    const data = await Website.create({
      websiteId,
      clientId,
      projectId: projectId || undefined,
      domainName: cleanedDomain,
      websiteType,
      technologyStack: Array.isArray(technologyStack) ? technologyStack : (technologyStack ? [technologyStack] : []),
      framework,
      repositoryUrl,
      hostingProvider,
      serverIp,
      sslStatus,
      databaseType,
      deploymentDate: deploymentDate || new Date(),
      renewalDate: renewalDate || undefined,
      hasAmc,
      status,
      backupStatus,
      notes,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_WEBSITE',
      module: 'Website',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWebsite = async (req, res) => {
  try {
    const old = await Website.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Website not found' });

    const data = await Website.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user?._id }, 
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_WEBSITE',
      module: 'Website',
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

export const deleteWebsite = async (req, res) => {
  try {
    const data = await Website.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Website not found' });

    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_WEBSITE',
      module: 'Website',
      recordId: data._id,
      req
    });

    res.json({ success: true, message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
