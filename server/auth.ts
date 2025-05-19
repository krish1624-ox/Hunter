import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import bcrypt from 'bcrypt';
import { db } from './db';
import { pool } from './db';
import { users, loginSchema, insertUserSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Session configuration
const PgStore = pgSession(session);
const sessionConfig = {
  store: new PgStore({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true,
  }),
  name: 'telegram_mod_sid',
  secret: process.env.SESSION_SECRET || 'telegram_mod_default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
};

// Setup auth routes
export function setupAuth(app: express.Express) {
  // Initialize session
  app.use(session(sessionConfig));

  // User registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.format() });
      }
      
      const { username, password, email, isAdmin } = result.data;
      
      // Check if username exists
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword,
        email: email || null,
        isAdmin: isAdmin || false,
      }).returning();
      
      // Set user session
      req.session.userId = newUser.id;
      
      // Return user (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // User login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.format() });
      }
      
      const { username, password } = result.data;
      
      // Find user
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      const passwordValid = await bcrypt.compare(password, user.password);
      
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // User logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error logging out:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      
      res.clearCookie('telegram_mod_sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Failed to get current user" });
    }
  });

  // Create default admin user if none exists
  createDefaultAdminIfNeeded();
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware to require admin privileges
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  db.select().from(users).where(eq(users.id, req.session.userId)).limit(1)
    .then(([user]) => {
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      next();
    })
    .catch(error => {
      console.error("Error checking admin privileges:", error);
      res.status(500).json({ message: "Failed to check privileges" });
    });
}

// Create default admin user for first-time setup
async function createDefaultAdminIfNeeded() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      // Create default admin
      const defaultPassword = 'admin123'; // This should be changed immediately
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        isAdmin: true,
      });
      
      console.log('Default admin user created. Please change the password immediately.');
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}