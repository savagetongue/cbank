// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// JWTPayload compatible with hono/jwt
export interface JWTPayload {
  sub: string; // User ID
  role: string;
  exp: number;
  [key: string]: any; // For compatibility with hono/jwt
}
// Entities matching Supabase schema
export interface MemberProfile {
  id: string; // maps to auth.users.id
  name: string;
  email: string;
  contact: string | null;
  credits: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}
export interface ServiceOffer {
  id: string;
  provider_member_id: string;
  title: string;
  description: string;
  price_credits: number;
  status: 'available' | 'in_progress' | 'completed' | 'cancelled';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface ServiceRequest {
  id: string;
  offer_id: string;
  member_id: string; // requester
  title: string;
  description: string;
  price_credits: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  escrow_id: string | null; // Added to track the associated escrow
  created_at: string;
  updated_at: string;
}
export interface Escrow {
  id: string;
  request_id: string;
  offerer_id: string;
  requester_id: string;
  amount: number;
  status: 'held' | 'released' | 'refunded' | 'disputed' | 'resolved';
  offerer_confirm: boolean;
  requester_confirm: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
}
export interface Dispute {
  id: string;
  escrow_id: string;
  raised_by: string;
  reason: string;
  evidence: string | null;
  status: 'open' | 'resolved';
  admin_decision: 'release' | 'refund' | 'split' | null;
  resolved_at: string | null;
}
// Generic RPC response for success/failure
export interface RpcResponse {
  ok: boolean;
  message: string;
  data?: any;
}