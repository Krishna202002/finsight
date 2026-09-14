const express = require('express');
const router = express.Router();
const importController = require('../controllers/Import.Controller.js');
const upload = require('../middleware/Upload.Middleware.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.use(protect);
router.post('/csv', upload.single('file'), importController.importCsv);

module.exports = router;