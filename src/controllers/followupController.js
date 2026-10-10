import FollowUp from '../models/FollowUp.js';
export const getFollowUps = async (req, res) => {
  try {
    const data = await FollowUp.find({ deletedAt: null })
      .populate('leadId', 'name company email phone')
      .populate('clientId', 'companyName name email')
      .populate('assignedEmployee', 'name email')
      .sort({ followUpDate: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFollowUp = async (req, res) => {
  try {
    const data = await FollowUp.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFollowUp = async (req, res) => {
  try {
    const data = await FollowUp.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFollowUp = async (req, res) => {
  try {
    const data = await FollowUp.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedBy: req.user._id }, 
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFollowUp = async (req, res) => {
  try {
    const data = await FollowUp.findByIdAndUpdate(
      req.params.id, 
      { deletedAt: new Date(), updatedBy: req.user._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
