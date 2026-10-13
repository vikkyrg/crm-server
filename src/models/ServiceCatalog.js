import mongoose from 'mongoose';

const serviceCatalogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  serviceId: { type: String, unique: true, sparse: true }, // e.g. "INN-SRV-000001"
  serviceCode: { type: String, trim: true }, // e.g. "WEB-DEV-STD"
  serviceName: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: [
      'Website Development',
      'Website Design',
      'E-commerce Development',
      'Mobile App Development',
      'SEO and Digital Marketing',
      'Hosting and Domain Services',
      'Website Maintenance',
      'AMC',
      'Custom Software Development',
      'IT Consulting',
      'Other'
    ],
    default: 'Custom Software Development'
  },
  description: { type: String, trim: true },
  defaultPrice: { type: Number, default: 0, min: 0 },
  billingType: { 
    type: String, 
    enum: ['Fixed', 'Hourly', 'Monthly Recurring', 'Annual Recurring', 'Milestone Based'], 
    default: 'Fixed' 
  },
  billingFrequency: {
    type: String,
    enum: ['One-time', 'Monthly', 'Quarterly', 'Half-Yearly', 'Annually'],
    default: 'One-time'
  },
  defaultTerms: { type: String },
  defaultSLA: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

serviceCatalogSchema.index({ status: 1, deletedAt: 1 });
serviceCatalogSchema.index({ category: 1 });

export default mongoose.models.ServiceCatalog || mongoose.model('ServiceCatalog', serviceCatalogSchema);
