import Contact from '../models/Contact.js';
export const getContacts = async (req, res) => {
  try {
    const data = await Contact.find({ deletedAt: null });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContact = async (req, res) => {
  try {
    const data = await Contact.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const data = await Contact.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const data = await Contact.findByIdAndUpdate(
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

export const deleteContact = async (req, res) => {
  try {
    const data = await Contact.findByIdAndUpdate(
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
