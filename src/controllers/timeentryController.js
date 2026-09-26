import TimeEntry from '../models/TimeEntry.js';
export const getTimeEntrys = async (req, res) => {
  try {
    const data = await TimeEntry.find({ deletedAt: null });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTimeEntry = async (req, res) => {
  try {
    const data = await TimeEntry.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTimeEntry = async (req, res) => {
  try {
    const data = await TimeEntry.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTimeEntry = async (req, res) => {
  try {
    const data = await TimeEntry.findByIdAndUpdate(
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

export const deleteTimeEntry = async (req, res) => {
  try {
    const data = await TimeEntry.findByIdAndUpdate(
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
