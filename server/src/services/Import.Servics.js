const { parse } = require('csv-parse/sync');
const Transaction = require('../models/Transactions.models.js');
const { generateImportHash, normalizeMerchant, parseAmount } = require('../utils/csv.Util.js');

// Expected CSV columns: date, amount, type, category, merchant, description
const importCsv = async (userId, accountId, fileBuffer) => {
  const csvText = fileBuffer.toString('utf-8');

  let rows;
  try {
    rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    const error = new Error('Invalid CSV format');
    error.statusCode = 400;
    throw error;
  }

  const results = { totalRows: rows.length, imported: 0, skippedDuplicates: 0, rejected: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 accounts for header row + 0-index

    const date = new Date(row.date);
    const amount = parseAmount(row.amount);
    const type = (row.type || 'expense').toLowerCase();
    const merchant = normalizeMerchant(row.merchant);

    if (isNaN(date.getTime())) {
      results.rejected++;
      results.errors.push({ row: rowNum, reason: 'Invalid date' });
      continue;
    }
    if (amount === null || amount <= 0) {
      results.rejected++;
      results.errors.push({ row: rowNum, reason: 'Invalid amount' });
      continue;
    }
    if (!['income', 'expense'].includes(type)) {
      results.rejected++;
      results.errors.push({ row: rowNum, reason: 'Invalid type' });
      continue;
    }

    const importHash = generateImportHash({ userId, accountId, date, amount, merchant });

    const existing = await Transaction.findOne({ userId, importHash });
    if (existing) {
      results.skippedDuplicates++;
      continue;
    }

    await Transaction.create({
      userId,
      accountId,
      type,
      amount,
      category: row.category || 'uncategorized',
      merchant,
      description: row.description || '',
      date,
      source: 'csv',
      importHash,
    });

    results.imported++;
  }

  return results;
};

module.exports = { importCsv };