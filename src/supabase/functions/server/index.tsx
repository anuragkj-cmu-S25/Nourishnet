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
    console.log('Authorization error: No authorization header provided');
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Authorization error: No token found in header');
    return { user: null, error: 'No token in header' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.log('Authorization error while verifying token:', error);
    return { user: null, error: 'Invalid token' };
  }
  
  if (!user) {
    console.log('Authorization error: No user found for token');
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

// ============ TASKS ROUTES ============

app.get("/make-server-593da926/tasks", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const tasks = await kv.getByPrefix('task:');
    return c.json({ tasks });
  } catch (error) {
    console.log('Get tasks error:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

app.post("/make-server-593da926/tasks", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { title, description, assignedTo, priority, dueDate } = await c.req.json();
    
    const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task = {
      id: taskId,
      title,
      description,
      assignedTo,
      priority: priority || 'medium',
      dueDate,
      status: 'pending',
      created_at: new Date().toISOString(),
      created_by: user.id,
    };
    
    await kv.set(`task:${taskId}`, task);
    
    return c.json({ task });
  } catch (error) {
    console.log('Create task error:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

app.put("/make-server-593da926/tasks/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('id');
    const updates = await c.req.json();
    
    const task = await kv.get(`task:${taskId}`);
    
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    const updatedTask = {
      ...task,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`task:${taskId}`, updatedTask);
    
    return c.json({ task: updatedTask });
  } catch (error) {
    console.log('Update task error:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

app.delete("/make-server-593da926/tasks/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('id');
    await kv.del(`task:${taskId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete task error:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

// ============ EMAIL ROUTES ============

app.get("/make-server-593da926/emails", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const emails = await kv.getByPrefix('email:');
    return c.json({ emails });
  } catch (error) {
    console.log('Get emails error:', error);
    return c.json({ error: 'Failed to fetch emails' }, 500);
  }
});

app.get("/make-server-593da926/emails/forwarded", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const allEmails = await kv.getByPrefix('email:');
    const forwardedEmails = allEmails.filter((email: any) => email.forwardedTo === user.id);
    return c.json({ emails: forwardedEmails });
  } catch (error) {
    console.log('Get forwarded emails error:', error);
    return c.json({ error: 'Failed to fetch forwarded emails' }, 500);
  }
});

app.post("/make-server-593da926/emails/:id/forward", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const emailId = c.req.param('id');
    const { volunteerId } = await c.req.json();
    
    const email = await kv.get(`email:${emailId}`);
    
    if (!email) {
      return c.json({ error: 'Email not found' }, 404);
    }
    
    const updatedEmail = {
      ...email,
      forwardedTo: volunteerId,
      forwarded_at: new Date().toISOString(),
    };
    
    await kv.set(`email:${emailId}`, updatedEmail);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Forward email error:', error);
    return c.json({ error: 'Failed to forward email' }, 500);
  }
});

// ============ CALENDAR ROUTES ============

app.get("/make-server-593da926/calendar", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const events = await kv.getByPrefix('calendar:');
    return c.json({ events });
  } catch (error) {
    console.log('Get calendar events error:', error);
    return c.json({ error: 'Failed to fetch calendar events' }, 500);
  }
});

app.post("/make-server-593da926/calendar/from-email", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { emailId, title, date, time } = await c.req.json();
    
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const event = {
      id: eventId,
      source_email_id: emailId,
      title,
      date,
      time,
      created_at: new Date().toISOString(),
      created_by: user.id,
    };
    
    await kv.set(`calendar:${eventId}`, event);
    
    return c.json({ event });
  } catch (error) {
    console.log('Create calendar event error:', error);
    return c.json({ error: 'Failed to create calendar event' }, 500);
  }
});

app.delete("/make-server-593da926/calendar/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const eventId = c.req.param('id');
    await kv.del(`calendar:${eventId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete calendar event error:', error);
    return c.json({ error: 'Failed to delete calendar event' }, 500);
  }
});

// ============ VOLUNTEERS ROUTE ============

app.get("/make-server-593da926/volunteers", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profiles = await kv.getByPrefix('profile:');
    const volunteers = profiles.filter((p: any) => p.role === 'volunteer');
    return c.json({ volunteers });
  } catch (error) {
    console.log('Get volunteers error:', error);
    return c.json({ error: 'Failed to fetch volunteers' }, 500);
  }
});

// ============ INIT DATA ROUTE ============

app.post("/make-server-593da926/init-data", async (c) => {
  try {
    // Check if data already exists
    const existingInventory = await kv.getByPrefix('inventory:');
    if (existingInventory.length > 0) {
      return c.json({ message: 'Data already initialized' });
    }

    // Initialize inventory
    const inventoryItems = [
      { id: '1', name: 'Canned Beans', category: 'Canned Goods', stock: 150, unit: 'cans', low_stock_threshold: 50, is_low_stock: false },
      { id: '2', name: 'Rice', category: 'Grains', stock: 80, unit: 'lbs', low_stock_threshold: 100, is_low_stock: true },
      { id: '3', name: 'Pasta', category: 'Grains', stock: 120, unit: 'boxes', low_stock_threshold: 75, is_low_stock: false },
      { id: '4', name: 'Canned Soup', category: 'Canned Goods', stock: 90, unit: 'cans', low_stock_threshold: 60, is_low_stock: false },
      { id: '5', name: 'Peanut Butter', category: 'Protein', stock: 40, unit: 'jars', low_stock_threshold: 45, is_low_stock: true },
      { id: '6', name: 'Cereal', category: 'Breakfast', stock: 65, unit: 'boxes', low_stock_threshold: 50, is_low_stock: false },
      { id: '7', name: 'Canned Vegetables', category: 'Canned Goods', stock: 110, unit: 'cans', low_stock_threshold: 70, is_low_stock: false },
      { id: '8', name: 'Cooking Oil', category: 'Cooking', stock: 30, unit: 'bottles', low_stock_threshold: 40, is_low_stock: true },
    ];

    for (const item of inventoryItems) {
      await kv.set(`inventory:${item.id}`, item);
    }

    // Initialize some sample emails
    const sampleEmails = [
      {
        id: '1',
        from: 'community@foodnetwork.org',
        subject: 'Holiday Food Distribution - December 15th',
        body: 'Join us for our holiday food distribution on December 15th at 10 AM. We need volunteers to help sort and distribute food packages.',
        date: '2025-11-18',
      },
      {
        id: '2',
        from: 'donations@localchurch.org',
        subject: 'Large Donation Available for Pickup - January 10th',
        body: 'We have a large donation of canned goods available. Can someone pick it up on January 10th at 2 PM?',
        date: '2025-11-19',
      },
      {
        id: '3',
        from: 'volunteer@community.org',
        subject: 'Volunteer Training - November 28th',
        body: 'We are hosting a volunteer training session on November 28th at 3 PM. All new volunteers are welcome!',
        date: '2025-11-15',
      },
    ];

    for (const email of sampleEmails) {
      await kv.set(`email:${email.id}`, email);
    }

    // Initialize sample calendar events spread across Oct 2025 - Feb 2026
    const sampleEvents = [
      {
        id: 'event-1',
        title: 'Fall Food Drive Kickoff',
        date: '2025-10-05',
        time: '09:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-2',
        title: 'Community Pantry Open Day',
        date: '2025-10-12',
        time: '10:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-3',
        title: 'Volunteer Appreciation Lunch',
        date: '2025-10-20',
        time: '12:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-4',
        title: 'Halloween Harvest Collection',
        date: '2025-10-31',
        time: '14:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-5',
        title: 'Monthly Inventory Review',
        date: '2025-11-08',
        time: '11:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-6',
        title: 'Thanksgiving Prep Day',
        date: '2025-11-20',
        time: '08:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-7',
        title: 'Thanksgiving Food Distribution',
        date: '2025-11-27',
        time: '09:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-8',
        title: 'Holiday Planning Meeting',
        date: '2025-12-03',
        time: '15:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-9',
        title: 'Winter Coat Drive',
        date: '2025-12-10',
        time: '10:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-10',
        title: 'Holiday Meal Prep Day',
        date: '2025-12-18',
        time: '08:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-11',
        title: 'Christmas Food Distribution',
        date: '2025-12-24',
        time: '09:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-12',
        title: 'New Year Volunteer Orientation',
        date: '2026-01-07',
        time: '14:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-13',
        title: 'Winter Food Drive',
        date: '2026-01-15',
        time: '10:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-14',
        title: 'Quarterly Inventory Audit',
        date: '2026-01-25',
        time: '11:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-15',
        title: 'Community Outreach Fair',
        date: '2026-02-08',
        time: '13:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-16',
        title: 'Volunteer Training Workshop',
        date: '2026-02-14',
        time: '14:00',
        created_at: new Date().toISOString(),
      },
      {
        id: 'event-17',
        title: 'Spring Planning Session',
        date: '2026-02-22',
        time: '15:00',
        created_at: new Date().toISOString(),
      },
    ];

    for (const event of sampleEvents) {
      await kv.set(`calendar:${event.id}`, event);
    }

    return c.json({ message: 'Data initialized successfully' });
  } catch (error) {
    console.log('Init data error:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);