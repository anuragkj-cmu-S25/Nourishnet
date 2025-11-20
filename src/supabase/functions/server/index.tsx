import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify auth token
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }
  
  return { user, error: null };
}

// Health check endpoint
app.get("/make-server-593da926/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ROUTES ============

// Sign up endpoint
app.post("/make-server-593da926/auth/signup", async (c) => {
  try {
    const { email, password, fullName, role } = await c.req.json();
    
    if (!email || !password || !fullName || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    if (role !== 'staff' && role !== 'volunteer') {
      return c.json({ error: 'Role must be staff or volunteer' }, 400);
    }
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`profile:${data.user.id}`, {
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      created_at: new Date().toISOString(),
    });
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get("/make-server-593da926/auth/profile", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const profile = await kv.get(`profile:${user.id}`);
  
  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }
  
  return c.json({ profile });
});

// Update user profile
app.put("/make-server-593da926/auth/profile", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { full_name } = await c.req.json();
    
    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    const updatedProfile = {
      ...profile,
      full_name,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`profile:${user.id}`, updatedProfile);
    
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ============ INVENTORY ROUTES ============

// Get all inventory items
app.get("/make-server-593da926/inventory", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const items = await kv.getByPrefix('inventory:');
    return c.json({ items });
  } catch (error) {
    console.log('Get inventory error:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// Update inventory item stock
app.put("/make-server-593da926/inventory/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const itemId = c.req.param('id');
    const { stock } = await c.req.json();
    
    const item = await kv.get(`inventory:${itemId}`);
    
    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    const updatedItem = {
      ...item,
      stock,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`inventory:${itemId}`, updatedItem);
    
    return c.json({ item: updatedItem });
  } catch (error) {
    console.log('Update inventory error:', error);
    return c.json({ error: 'Failed to update inventory' }, 500);
  }
});

// ============ SOURCING LIST ROUTES ============

// Get active sourcing list
app.get("/make-server-593da926/sourcing-list", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const items = await kv.getByPrefix('sourcing:');
    return c.json({ items });
  } catch (error) {
    console.log('Get sourcing list error:', error);
    return c.json({ error: 'Failed to fetch sourcing list' }, 500);
  }
});

// Add item to sourcing list (staff only)
app.post("/make-server-593da926/sourcing-list", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    if (profile?.role !== 'staff') {
      return c.json({ error: 'Only staff can add items to sourcing list' }, 403);
    }
    
    const { itemId, name, targetQuantity, unit } = await c.req.json();
    
    const sourcingItem = {
      id: itemId,
      name,
      targetQuantity,
      unit,
      totalSourced: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      created_by: user.id,
    };
    
    await kv.set(`sourcing:${itemId}`, sourcingItem);
    
    return c.json({ item: sourcingItem });
  } catch (error) {
    console.log('Add to sourcing list error:', error);
    return c.json({ error: 'Failed to add item to sourcing list' }, 500);
  }
});

// Remove item from sourcing list (staff only)
app.delete("/make-server-593da926/sourcing-list/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    if (profile?.role !== 'staff') {
      return c.json({ error: 'Only staff can remove items' }, 403);
    }
    
    const itemId = c.req.param('id');
    await kv.del(`sourcing:${itemId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Remove from sourcing list error:', error);
    return c.json({ error: 'Failed to remove item' }, 500);
  }
});

// Submit sourced quantities (volunteers)
app.post("/make-server-593da926/sourcing-list/submit", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    const { items } = await c.req.json(); // Array of { itemId, quantity }
    
    const logs = [];
    
    for (const { itemId, quantity } of items) {
      if (quantity > 0) {
        // Log the sourcing entry
        const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const logEntry = {
          id: logId,
          volunteer_id: user.id,
          volunteer_name: profile?.full_name || 'Unknown',
          item_id: itemId,
          quantity,
          timestamp: new Date().toISOString(),
        };
        
        await kv.set(`sourcing_log:${logId}`, logEntry);
        logs.push(logEntry);
        
        // Update sourcing list totals
        const sourcingItem = await kv.get(`sourcing:${itemId}`);
        if (sourcingItem) {
          const updatedItem = {
            ...sourcingItem,
            totalSourced: (sourcingItem.totalSourced || 0) + quantity,
            status: (sourcingItem.totalSourced + quantity) >= sourcingItem.targetQuantity ? 'complete' : 'active',
            updated_at: new Date().toISOString(),
          };
          await kv.set(`sourcing:${itemId}`, updatedItem);
        }
        
        // Update inventory
        const inventoryItem = await kv.get(`inventory:${itemId}`);
        if (inventoryItem) {
          const updatedInventory = {
            ...inventoryItem,
            stock: inventoryItem.stock + quantity,
            updated_at: new Date().toISOString(),
          };
          await kv.set(`inventory:${itemId}`, updatedInventory);
        }
      }
    }
    
    return c.json({ success: true, logs });
  } catch (error) {
    console.log('Submit sourcing error:', error);
    return c.json({ error: 'Failed to submit sourcing data' }, 500);
  }
});

// Get all sourcing logs
app.get("/make-server-593da926/sourcing-logs", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const logs = await kv.getByPrefix('sourcing_log:');
    return c.json({ logs });
  } catch (error) {
    console.log('Get sourcing logs error:', error);
    return c.json({ error: 'Failed to fetch sourcing logs' }, 500);
  }
});

// Tasks API