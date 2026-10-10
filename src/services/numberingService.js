import Numbering from '../models/Numbering.js';

const defaultPrefixes = {
  LEAD: 'INN-LEAD-',
  CLIENT: 'INN-CLI-',
  QUOTATION: 'INN-QUO-',
  INVOICE: 'INN-INV-',
  PROJECT: 'INN-PROJ-',
  TASK: 'INN-TSK-',
  TICKET: 'INN-TCK-',
  CONTRACT: 'INN-CON-',
  EXPENSE: 'INN-EXP-',
  PURCHASE: 'INN-PO-',
  PAYMENT: 'INN-PAY-',
  CHANGEREQUEST: 'INN-CR-',
  BUG: 'INN-BUG-',
  EMPLOYEE: 'INN-EMP-',
  WEBSITE: 'INN-WEB-',
  DOMAIN: 'INN-DOM-',
  HOSTING: 'INN-HST-',
  AMC: 'INN-AMC-'
};

export const generateNextNumber = async (moduleName, companyId = null) => {
  const modKey = moduleName.toUpperCase();
  const prefix = defaultPrefixes[modKey] || `INN-${modKey.slice(0, 3)}-`;

  const record = await Numbering.findOneAndUpdate(
    { module: modKey },
    { 
      $inc: { currentNumber: 1 },
      $setOnInsert: { prefix, padding: 6, companyId }
    },
    { new: true, upsert: true }
  );

  const numStr = String(record.currentNumber).padStart(record.padding || 6, '0');
  return `${record.prefix}${numStr}${record.suffix || ''}`;
};
