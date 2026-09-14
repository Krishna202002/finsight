const { z } = require('zod');

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['bank', 'cash', 'wallet', 'credit_card']),
  openingBalance: z.number().nonnegative().optional(),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['bank', 'cash', 'wallet', 'credit_card']).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createAccountSchema, updateAccountSchema };