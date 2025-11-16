// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Authentication
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string | undefined;
  };
}
export interface JWTPayload {
  sub: string; // User ID
  role: string;
  exp: number;
}
// Entities
export interface MemberProfile {
  id: string; // Corresponds to auth.users.id
  created_at: string;
  username: string;
  bio: string | null;
  credits: number;
}
export interface ServiceOffer {
  id: string;
  created_at: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  credits_required: number;
  is_active: boolean;
}
export interface ServiceRequest {
  id: string;
  created_at: string;
  offer_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}
export interface Escrow {
  id: string;
  created_at: string;
  request_id: string;
  provider_id: string;
  requester_id: string;
  credits: number;
  status: 'held' | 'released' | 'refunded' | 'disputed' | 'resolved';
  expires_at: string;
}
export interface Dispute {
  id: string;
  created_at: string;
  escrow_id: string;
  reason: string;
  status: 'open' | 'resolved';
  resolved_at: string | null;
  admin_decision: 'release' | 'refund' | 'split' | null;
}
// Generic RPC response for success/failure
export interface RpcResponse {
  ok: boolean;
  message: string;
  data?: any;
}