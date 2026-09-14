const express = require('express');
const router = express.Router();
const accountController = require('../controllers/Account.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

const validate = require('../middleware/Validate.Middleware.js');
const { createAccountSchema, updateAccountSchema } = require('../validators/Account.Validator.js');

router.use(protect); 

router.post('/', validate(createAccountSchema), accountController.createAccount);
router.get('/', accountController.getAccounts);
router.patch('/:id', validate(updateAccountSchema), accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;