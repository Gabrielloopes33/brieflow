import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabaseClient: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('SUPABASE_URL or SUPABASE_ANON_KEY not configured');
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!supabaseClient) {
      return res.status(500).json({ message: 'Supabase client not configured' });
    }

    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
