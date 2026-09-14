const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/Transaction.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

const validate = require('../middleware/Validate.Middleware.js');
const { createTransactionSchema, transferSchema } = require('../validators/Transaction.Validator.js');

router.use(protect);

router.post('/transfer', validate(transferSchema), transactionController.transfer);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.get('/', transactionController.list);
router.get('/:id', transactionController.getById);
router.patch('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

module.exports = router;