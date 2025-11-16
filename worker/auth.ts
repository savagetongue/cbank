import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { getSupabaseClients } from './supabase';
import { registerSchema, loginSchema } from './schemas';
import { bad, ok } from './core-utils';
import type { JWTPayload } from '@shared/types';interface Env {id?: string | number;
  [key: string]: unknown;
}const authApp = new Hono<{Bindings: Env;}>();
authApp.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const { supabaseAdmin } = getSupabaseClients(c);
  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password
  });
  if (error) {
    return bad(c, error.message);
  }
  if (!data.user) {
    return bad(c, 'Registration failed: No user data returned.');
  }
  return ok(c, { message: 'Registration successful. Please check your email to verify.' });
});

authApp.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const { supabasePublic } = getSupabaseClients(c);
  const jwtSecret = c.env.JWT_SECRET as string;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not set in environment variables.');
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    return c.json({ success: false, error: error.message }, 401);
  }
  if (!data.user) {
    return bad(c, 'Login failed: No user data returned.');
  }
  const payload: JWTPayload = {
    sub: data.user.id,
    role: data.user.role || 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
  };
  const token = await sign(payload, jwtSecret);
  return ok(c, {
    accessToken: token,
    user: { id: data.user.id, email: data.user.email }
  });
});

export const authMiddleware = () => {
  return async (c: any, next: any) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET
    });
    return jwtMiddleware(c, next);
  };
};
export default authApp;