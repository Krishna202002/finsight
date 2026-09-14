const { z } = require('zod');

const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(['income', 'expense']), // transfer has its own endpoint/schema below
  amount: z.number().positive(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  merchant: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(), // sent as ISO string from client, Mongoose casts it to Date
});

const transferSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().optional(),
});

module.exports = { createTransactionSchema, transferSchema };