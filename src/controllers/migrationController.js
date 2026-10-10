import Client from '../models/Client.js';
import Website from '../models/Website.js';
import Domain from '../models/Domain.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const importLegacyWebsites = async (req, res) => {
  try {
    const { records = [] } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No records provided for migration import' });
    }

    let importedCount = 0;
    let duplicateCount = 0;
    const errors = [];

    for (const item of records) {
      try {
        const { companyName, domainName, websiteType = 'Corporate', technology = 'React/Node', email, phone } = item;

        if (!companyName || !domainName) {
          errors.push(`Skipped record: missing companyName or domainName`);
          continue;
        }

        // Check if Client exists or create one
        let client = await Client.findOne({ companyName: companyName.trim(), deletedAt: null });
        if (!client) {
          const clientId = await generateNextNumber('CLIENT');
          client = await Client.create({
            clientId,
            companyName: companyName.trim(),
            email,
            phone,
            createdBy: req.user?._id
          });
        }

        // Check duplicate website
        const existingWeb = await Website.findOne({ domainName: domainName.trim(), deletedAt: null });
        if (existingWeb) {
          duplicateCount++;
          continue;
        }

        const websiteId = await generateNextNumber('WEBSITE');
        await Website.create({
          websiteId,
          clientId: client._id,
          domainName: domainName.trim(),
          websiteType,
          technologyStack: Array.isArray(technology) ? technology : [technology],
          status: 'Live',
          createdBy: req.user?._id
        });

        // Also seed domain record if missing
        const existingDomain = await Domain.findOne({ domainName: domainName.trim(), deletedAt: null });
        if (!existingDomain) {
          await Domain.create({
            domainName: domainName.trim(),
            clientId: client._id,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'Active',
            createdBy: req.user?._id
          });
        }

        importedCount++;
      } catch (err) {
        errors.push(`Error importing ${item.domainName}: ${err.message}`);
      }
    }

    await logAudit({
      userId: req.user?._id,
      action: 'BULK_DATA_MIGRATION',
      module: 'Migration',
      newValues: { importedCount, duplicateCount, errors },
      req
    });

    res.json({
      success: true,
      message: `Data migration completed! ${importedCount} imported, ${duplicateCount} duplicates skipped.`,
      data: { importedCount, duplicateCount, errors }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
