const express = require('express');
const router = express.Router();
const accountController = require('../controllers/Account.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.use(protect); // every route below requires auth

router.post('/', accountController.createAccount);
router.get('/', accountController.getAccounts);
router.patch('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;