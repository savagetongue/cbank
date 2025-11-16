import { z } from 'zod';
// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(3).max(50),
  contact: z.string().optional(),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
// Member Schema
export const createMemberSchema = z.object({
  name: z.string().min(3).max(50),
  contact: z.string().max(100).optional(),
});
// Offer Schema
export const createOfferSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  price_credits: z.number().int().positive(),
});
// Request Schema
export const createRequestSchema = z.object({
  offer_id: z.string().uuid(),
});
export const acceptRequestSchema = z.object({
  request_id: z.string().uuid(),
  idempotency_key: z.string().uuid(),
});
// Escrow Schemas
export const confirmEscrowSchema = z.object({
  escrow_id: z.string().uuid(),
  idempotency_key: z.string().uuid(),
});
export const disputeEscrowSchema = z.object({
  escrow_id: z.string().uuid(),
  reason: z.string().min(10).max(500),
});
// Admin Schema
export const resolveDisputeSchema = z.object({
  escrow_id: z.string().uuid(),
  admin_decision: z.enum(['release', 'refund', 'split']),
  offer_share: z.number().min(0).max(100).optional().default(50), // Percentage for provider in a split
  idempotency_key: z.string().uuid(),
});