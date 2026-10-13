import ServiceCatalog from '../models/ServiceCatalog.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getServiceCatalogs = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 100 } = req.query;
    const query = { deletedAt: null };

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { serviceCode: { $regex: search, $options: 'i' } },
        { serviceId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const data = await ServiceCatalog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ServiceCatalog.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getServiceCatalog = async (req, res) => {
  try {
    const data = await ServiceCatalog.findOne({ _id: req.params.id, deletedAt: null });
    if (!data) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceCatalog = async (req, res) => {
  try {
    const serviceId = await generateNextNumber('SERVICE');
    const data = await ServiceCatalog.create({
      ...req.body,
      serviceId,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_SERVICE',
      module: 'ServiceCatalog',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceCatalog = async (req, res) => {
  try {
    const old = await ServiceCatalog.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Service not found' });

    const data = await ServiceCatalog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_SERVICE',
      module: 'ServiceCatalog',
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

export const deleteServiceCatalog = async (req, res) => {
  try {
    const data = await ServiceCatalog.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Service not found' });

    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_SERVICE',
      module: 'ServiceCatalog',
      recordId: data._id,
      req
    });

    res.json({ success: true, message: 'Service archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
