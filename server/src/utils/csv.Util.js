const crypto = require('crypto');

// Generates a stable fingerprint for a row so duplicates can be detected
const generateImportHash = ({ userId, accountId, date, amount, merchant }) => {
  const raw = `${userId}-${accountId}-${new Date(date).toISOString().slice(0, 10)}-${amount}-${(merchant || '').toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

const normalizeMerchant = (name) => {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
};

const parseAmount = (value) => {
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : Math.round(num * 100); // convert rupees to paise
};

module.exports = { generateImportHash, normalizeMerchant, parseAmount };