const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/Transaction.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.use(protect);

router.post('/transfer', transactionController.transfer); // put before /:id routes to avoid conflicts
router.post('/', transactionController.create);
router.get('/', transactionController.list);
router.get('/:id', transactionController.getById);
router.patch('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

module.exports = router;