const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/Budget.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.use(protect);

router.post('/', budgetController.create);
router.get('/', budgetController.list);
router.get('/progress', budgetController.progress); // before /:id
router.patch('/:id', budgetController.update);
router.delete('/:id', budgetController.remove);

module.exports = router;