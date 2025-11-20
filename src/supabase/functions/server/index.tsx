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

// Get sourcing logs for an item
app.get("/make-server-593da926/sourcing-logs/:itemId", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const itemId = c.req.param('itemId');
    const allLogs = await kv.getByPrefix('sourcing_log:');
    const itemLogs = allLogs.filter(log => log.item_id === itemId);
    
    return c.json({ logs: itemLogs });
  } catch (error) {
    console.log('Get sourcing logs error:', error);
    return c.json({ error: 'Failed to fetch logs' }, 500);
  }
});

// ============ TASKS ROUTES ============

// Get all tasks
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

// Create task
app.post("/make-server-593da926/tasks", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    if (profile?.role !== 'staff') {
      return c.json({ error: 'Only staff can create tasks' }, 403);
    }
    
    const { title, priority } = await c.req.json();
    const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      id: taskId,
      title,
      priority: priority || 'medium',
      completed: false,
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

// Update task
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

// Delete task
app.delete("/make-server-593da926/tasks/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    if (profile?.role !== 'staff') {
      return c.json({ error: 'Only staff can delete tasks' }, 403);
    }
    
    const taskId = c.req.param('id');
    await kv.del(`task:${taskId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete task error:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

// ============ EMAIL/INBOX ROUTES ============

// Get emails (staff inbox or volunteer-specific)
app.get("/make-server-593da926/emails", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    const allEmails = await kv.getByPrefix('email:');
    
    let emails;
    if (profile?.role === 'staff') {
      // Staff see emails with no recipient (shared inbox)
      emails = allEmails.filter(email => !email.recipient_id);
    } else {
      // Volunteers see emails addressed to them
      emails = allEmails.filter(email => email.recipient_id === user.id);
    }
    
    return c.json({ emails });
  } catch (error) {
    console.log('Get emails error:', error);
    return c.json({ error: 'Failed to fetch emails' }, 500);
  }
});

// Forward email to volunteer (staff only)
app.post("/make-server-593da926/emails/:id/forward", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    if (profile?.role !== 'staff') {
      return c.json({ error: 'Only staff can forward emails' }, 403);
    }
    
    const emailId = c.req.param('id');
    const { volunteerId } = await c.req.json();
    
    const originalEmail = await kv.get(`email:${emailId}`);
    
    if (!originalEmail) {
      return c.json({ error: 'Email not found' }, 404);
    }
    
    // Create forwarded email
    const forwardedEmailId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const forwardedEmail = {
      ...originalEmail,
      id: forwardedEmailId,
      recipient_id: volunteerId,
      forwarded_at: new Date().toISOString(),
      forwarded_by: user.id,
    };
    
    await kv.set(`email:${forwardedEmailId}`, forwardedEmail);
    
    return c.json({ email: forwardedEmail });
  } catch (error) {
    console.log('Forward email error:', error);
    return c.json({ error: 'Failed to forward email' }, 500);
  }
});

// ============ CALENDAR ROUTES ============

// Get calendar events
app.get("/make-server-593da926/calendar", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    const allEvents = await kv.getByPrefix('calendar:');
    
    let events;
    if (profile?.role === 'staff') {
      // Staff see all events (shared calendar + their own)
      events = allEvents.filter(event => !event.owner_id || event.owner_id === user.id);
    } else {
      // Volunteers see only their events
      events = allEvents.filter(event => event.owner_id === user.id);
    }
    
    return c.json({ events });
  } catch (error) {
    console.log('Get calendar events error:', error);
    return c.json({ error: 'Failed to fetch calendar events' }, 500);
  }
});

// Create calendar event from email
app.post("/make-server-593da926/calendar/from-email", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { emailId, title, date, time } = await c.req.json();
    const profile = await kv.get(`profile:${user.id}`);
    
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const event = {
      id: eventId,
      title,
      date,
      time,
      owner_id: profile?.role === 'volunteer' ? user.id : null, // null for shared staff calendar
      source_email_id: emailId,
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

// Get all volunteers (for staff)
app.get("/make-server-593da926/volunteers", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`profile:${user.id}`);
    
    if (profile?.role !== 'staff') {
      return c.json({ error: 'Only staff can view volunteers list' }, 403);
    }
    
    const allProfiles = await kv.getByPrefix('profile:');
    const volunteers = allProfiles.filter(p => p.role === 'volunteer');
    
    return c.json({ volunteers });
  } catch (error) {
    console.log('Get volunteers error:', error);
    return c.json({ error: 'Failed to fetch volunteers' }, 500);
  }
});

// Initialize sample data
app.post("/make-server-593da926/init-data", async (c) => {
  try {
    // Check if data already exists
    const existingItems = await kv.getByPrefix('inventory:');
    
    if (existingItems.length > 0) {
      return c.json({ message: 'Data already initialized' });
    }
    
    // Initialize inventory
    const inventoryItems = [
      { id: '1', name: 'Peanut Butter', stock: 12, unit: 'jars', low_stock_threshold: 15 },
      { id: '2', name: 'Canned Beans', stock: 45, unit: 'cans', low_stock_threshold: 20 },
      { id: '3', name: 'Rice', stock: 8, unit: 'bags', low_stock_threshold: 15 },
      { id: '4', name: 'Pasta', stock: 30, unit: 'boxes', low_stock_threshold: 25 },
      { id: '5', name: 'Tomato Sauce', stock: 25, unit: 'cans', low_stock_threshold: 20 },
      { id: '6', name: 'Cereal', stock: 18, unit: 'boxes', low_stock_threshold: 15 },
      { id: '7', name: 'Canned Tuna', stock: 6, unit: 'cans', low_stock_threshold: 15 },
      { id: '8', name: 'Oatmeal', stock: 22, unit: 'boxes', low_stock_threshold: 15 },
      { id: '9', name: 'Soup', stock: 35, unit: 'cans', low_stock_threshold: 20 },
      { id: '10', name: 'Crackers', stock: 14, unit: 'boxes', low_stock_threshold: 10 },
      { id: '11', name: 'Milk (Shelf-Stable)', stock: 10, unit: 'cartons', low_stock_threshold: 12 },
      { id: '12', name: 'Vegetable Oil', stock: 8, unit: 'bottles', low_stock_threshold: 10 },
    ];
    
    for (const item of inventoryItems) {
      await kv.set(`inventory:${item.id}`, item);
    }
    
    // Initialize sample emails
    const sampleEmails = [
      {
        id: 'email-1',
        from: 'donations@localmarket.com',
        subject: 'Weekly Donation Available',
        body: 'We have fresh produce available for pickup this Thursday at 2 PM.',
        date: '2024-11-18',
        recipient_id: null,
      },
      {
        id: 'email-2',
        from: 'volunteer@example.com',
        subject: 'Volunteering This Weekend',
        body: 'I would like to volunteer this Saturday. What time should I arrive?',
        date: '2024-11-19',
        recipient_id: null,
      },
      {
        id: 'email-3',
        from: 'supplier@foodbank.org',
        subject: 'Delivery Schedule Update',
        body: 'The delivery scheduled for Friday has been moved to Monday at 10 AM.',
        date: '2024-11-19',
        recipient_id: null,
      },
      {
        id: 'email-4',
        from: 'community@neighbors.org',
        subject: 'Community Food Drive - November 25th',
        body: 'Join us for a community food drive on November 25th from 9 AM to 5 PM at the community center. We expect to collect over 500 items.',
        date: '2024-11-15',
        recipient_id: null,
      },
      {
        id: 'email-5',
        from: 'maria@greengrocer.com',
        subject: 'Surplus Vegetables Available December 3rd',
        body: 'We will have surplus fresh vegetables available for donation on December 3rd at 3 PM. Please confirm if you can pick them up.',
        date: '2024-11-17',
        recipient_id: null,
      },
      {
        id: 'email-6',
        from: 'coordinator@cityfoodnetwork.org',
        subject: 'Regional Food Bank Meeting - December 10th',
        body: 'You are invited to attend the regional food bank coordination meeting on December 10th at 1 PM. Lunch will be provided.',
        date: '2024-11-16',
        recipient_id: null,
      },
      {
        id: 'email-7',
        from: 'donations@bakery.local',
        subject: 'Daily Bread Donations Starting November 28th',
        body: 'Starting November 28th, we can provide daily bread donations. Pickup available every morning at 7 AM.',
        date: '2024-11-14',
        recipient_id: null,
      },
      {
        id: 'email-8',
        from: 'events@thanksgiving.org',
        subject: 'Thanksgiving Distribution Event - November 27th',
        body: 'Our annual Thanksgiving food distribution event is scheduled for November 27th from 10 AM to 4 PM. We need 15 volunteers.',
        date: '2024-11-13',
        recipient_id: null,
      },
      {
        id: 'email-9',
        from: 'director@charity.org',
        subject: 'Volunteer Training Session - December 5th',
        body: 'Mandatory volunteer training session for new volunteers will be held on December 5th at 6 PM in the main hall.',
        date: '2024-11-18',
        recipient_id: null,
      },
      {
        id: 'email-10',
        from: 'warehouse@distributor.com',
        subject: 'Monthly Bulk Delivery - December 1st',
        body: 'Your monthly bulk food delivery is scheduled for December 1st between 8 AM and 12 PM. Please ensure someone is available to receive it.',
        date: '2024-11-19',
        recipient_id: null,
      },
      {
        id: 'email-11',
        from: 'inspector@healthdept.gov',
        subject: 'Facility Inspection - December 8th',
        body: 'A routine health and safety inspection is scheduled for December 8th at 11 AM. Please have all documentation ready.',
        date: '2024-11-17',
        recipient_id: null,
      },
      {
        id: 'email-12',
        from: 'organizer@holidaydrive.org',
        subject: 'Holiday Food Drive Kickoff - November 30th',
        body: 'Join us for the kickoff of our holiday food drive campaign on November 30th at 2 PM. Marketing materials will be distributed.',
        date: '2024-11-16',
        recipient_id: null,
      },
      {
        id: 'email-13',
        from: 'schools@district.edu',
        subject: 'School Partnership Program - December 12th',
        body: 'Meeting to discuss expanding our school partnership program scheduled for December 12th at 3 PM at the district office.',
        date: '2024-11-18',
        recipient_id: null,
      },
      {
        id: 'email-14',
        from: 'funding@grants.org',
        subject: 'Grant Application Workshop - November 29th',
        body: 'Free workshop on applying for food bank grants will be held November 29th from 1 PM to 4 PM. Registration required.',
        date: '2024-11-15',
        recipient_id: null,
      },
      {
        id: 'email-15',
        from: 'corporate@techcompany.com',
        subject: 'Corporate Volunteering Day - December 6th',
        body: 'Our company would like to send 20 volunteers to help on December 6th from 9 AM to 1 PM. Can you accommodate this group?',
        date: '2024-11-17',
        recipient_id: null,
      },
      {
        id: 'email-16',
        from: 'refrigeration@repairs.com',
        subject: 'Freezer Maintenance Scheduled - December 4th',
        body: 'Annual freezer maintenance is scheduled for December 4th at 8 AM. Please clear the service area.',
        date: '2024-11-18',
        recipient_id: null,
      },
      {
        id: 'email-17',
        from: 'media@localnews.tv',
        subject: 'News Feature Interview Request - November 26th',
        body: 'We would like to feature your food bank in our community spotlight segment. Interview proposed for November 26th at 4 PM.',
        date: '2024-11-14',
        recipient_id: null,
      },
      {
        id: 'email-18',
        from: 'pantry@churchgroup.org',
        subject: 'Food Pantry Collaboration Meeting - December 7th',
        body: 'Monthly collaboration meeting with other local food pantries on December 7th at 10 AM. Agenda to be sent soon.',
        date: '2024-11-19',
        recipient_id: null,
      },
      {
        id: 'email-19',
        from: 'transport@logistics.com',
        subject: 'Delivery Route Optimization - December 9th',
        body: 'Meeting to discuss optimizing delivery routes for better efficiency scheduled for December 9th at 2 PM.',
        date: '2024-11-16',
        recipient_id: null,
      },
      {
        id: 'email-20',
        from: 'nutrition@dietitian.org',
        subject: 'Nutrition Education Workshop - December 11th',
        body: 'Free nutrition education workshop for staff and volunteers on December 11th from 5 PM to 7 PM. Dinner included.',
        date: '2024-11-15',
        recipient_id: null,
      },
    ];
    
    for (const email of sampleEmails) {
      await kv.set(`email:${email.id}`, email);
    }
    
    return c.json({ message: 'Sample data initialized successfully' });
  } catch (error) {
    console.log('Init data error:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

Deno.serve(app.fetch);