import AMC from '../models/AMC.js';
export const getAMCs = async (req, res) => {
  try {
    const data = await AMC.find({ deletedAt: null }).populate('clientId', 'companyName name email');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAMC = async (req, res) => {
  try {
    const data = await AMC.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAMC = async (req, res) => {
  try {
    const { 
      title, 
      serviceName, 
      clientId, 
      startDate, 
      endDate, 
      expiryDate, 
      amcValue, 
      amcAmount, 
      costPrice, 
      notes, 
      coverageDetails 
    } = req.body;

    const finalTitle = title || serviceName || 'Annual Maintenance Contract';
    const finalEndDate = endDate || expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const finalAmount = Number(amcValue || amcAmount || 0);

    const data = await AMC.create({
      ...req.body,
      title: finalTitle,
      clientId,
      startDate: startDate || new Date(),
      endDate: finalEndDate,
      amcValue: finalAmount,
      costPrice: costPrice || 0,
      coverageDetails: coverageDetails || notes || '',
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAMC = async (req, res) => {
  try {
    const data = await AMC.findByIdAndUpdate(
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

export const deleteAMC = async (req, res) => {
  try {
    const data = await AMC.findByIdAndUpdate(
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
