const importService = require('../services/Import.Servics.js');

const importCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }
    if (!req.body.accountId) {
      const error = new Error('accountId is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await importService.importCsv(req.user.id, req.body.accountId, req.file.buffer);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { importCsv };