import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env as CoreEnv } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { getSupabaseClients } from './supabase';
import { authMiddleware } from './auth';
import authApp from './auth';
import * as s from './schemas';
import type { JWTPayload } from '@shared/types';
import type { MiddlewareHandler } from 'hono';
// Define a more specific Env type for this worker to include secrets
interface Env extends CoreEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  CRON_SECRET: string;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Mount auth routes
  app.route('/auth', authApp);
  // Apply auth middleware to all subsequent routes in this file
  app.use('/member/*', authMiddleware());
  app.use('/offers-create', authMiddleware());
  app.use('/requests', authMiddleware());
  app.use('/request-accept', authMiddleware());
  app.use('/escrow/*', authMiddleware());
  app.use('/admin/*', authMiddleware());
  // --- Member Routes ---
  app.post('/member', zValidator('json', s.createMemberSchema), async (c) => {
    const payload = c.get('jwtPayload') as JWTPayload;
    const { name, contact } = c.req.valid('json');
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(payload.sub);
    if (userError || !user) {
        return bad(c, `Failed to retrieve user details: ${userError?.message}`);
    }
    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({ id: payload.sub, name, contact, email: user.user.email })
      .select()
      .single();
    if (error) return bad(c, `Failed to create member profile: ${error.message}`);
    return ok(c, data);
  });
  // --- Offer Routes ---
  app.get('/offers', async (c) => {
    const { supabasePublic } = getSupabaseClients(c);
    const { data, error } = await supabasePublic.from('offers').select('*').eq('is_active', true);
    if (error) return bad(c, error.message);
    return ok(c, data);
  });
  app.post('/offers-create', zValidator('json', s.createOfferSchema), async (c) => {
    const payload = c.get('jwtPayload') as JWTPayload;
    const offerData = c.req.valid('json');
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin
      .from('offers')
      .insert({ ...offerData, provider_member_id: payload.sub })
      .select()
      .single();
    if (error) return bad(c, `Failed to create offer: ${error.message}`);
    return ok(c, data);
  });
  // --- Request Routes ---
  app.get('/requests', async (c) => {
    const payload = c.get('jwtPayload') as JWTPayload;
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.from('requests').select('*').eq('member_id', payload.sub);
    if (error) return bad(c, error.message);
    return ok(c, data);
  });
  app.post('/request-accept', zValidator('json', s.acceptRequestSchema), async (c) => {
    const { request_id, idempotency_key } = c.req.valid('json');
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('accept_request_rpc', {
      p_request_id: request_id,
      p_idempotency_key: idempotency_key,
    });
    if (error) return bad(c, `RPC Error: ${error.message}`);
    if (!data || !data.ok) return notFound(c, data?.message || 'Accepting request failed or already processed.');
    return ok(c, { escrow_id: data.escrow_id });
  });
  // --- Escrow Routes ---
  app.post('/escrow/confirm', zValidator('json', s.confirmEscrowSchema), async (c) => {
    const payload = c.get('jwtPayload') as JWTPayload;
    const { escrow_id, idempotency_key } = c.req.valid('json');
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('confirm_escrow_rpc', {
      p_escrow_id: escrow_id,
      p_member_id: payload.sub,
      p_idempotency_key: idempotency_key,
    });
    if (error) return bad(c, `RPC Error: ${error.message}`);
    return ok(c, { success: data?.ok, released: data?.released, escrow_id: data?.escrow_id });
  });
  app.post('/escrow/dispute', zValidator('json', s.disputeEscrowSchema), async (c) => {
    const { escrow_id, reason } = c.req.valid('json');
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('open_dispute_rpc', {
      p_escrow_id: escrow_id,
      p_reason: reason,
    });
    if (error) return bad(c, `RPC Error: ${error.message}`);
    return ok(c, { dispute_id: data?.dispute_id });
  });
  // --- Admin Routes ---
  app.post('/admin/disputes/resolve', zValidator('json', s.resolveDisputeSchema), async (c) => {
    const { escrow_id, admin_decision, offer_share, idempotency_key } = c.req.valid('json');
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('resolve_dispute_rpc', {
      p_escrow_id: escrow_id,
      p_admin_decision: admin_decision,
      p_offer_share: offer_share,
      p_idempotency_key: idempotency_key,
    });
    if (error) return bad(c, `RPC Error: ${error.message}`);
    return ok(c, { success: data?.ok, decision: data?.decision });
  });
  // --- Cron Job Routes ---
  const cronAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
    const secret = c.req.header('X-Cron-Secret');
    const cronSecret = c.env.CRON_SECRET;
    if (!cronSecret || secret !== cronSecret) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    await next();
  };
  const cronApp = new Hono<{ Bindings: Env }>();
  cronApp.use('/*', cronAuth);
  cronApp.post('/auto-release', async (c) => {
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('auto_release_rpc');
    if (error) return bad(c, `RPC Error: ${error.message}`);
    return ok(c, { message: 'Auto-release process completed.', released_count: data?.released_count });
  });
  cronApp.post('/reconcile', async (c) => {
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('reconcile_rpc');
    if (error) return bad(c, `RPC Error: ${error.message}`);
    return ok(c, { message: 'Reconciliation process completed.', anomalies: data?.anomalies });
  });
  cronApp.post('/cleanup-idempotency', async (c) => {
    const { supabaseAdmin } = getSupabaseClients(c);
    const { data, error } = await supabaseAdmin.rpc('cleanup_idempotency_rpc');
    if (error) return bad(c, `RPC Error: ${error.message}`);
    return ok(c, { message: 'Idempotency key cleanup completed.', deleted_count: data?.deleted_count });
  });
  app.route('/cron', cronApp);
}