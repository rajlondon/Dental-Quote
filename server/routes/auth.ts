/**
 * Authentication Routes for MyDentalFly
 */
import { Express, Request, Response } from 'express';
import session from 'express-session';

// Mock user database for demo purposes
const users = [
  { id: 1, username: 'patient', password: 'password', role: 'patient' },
  { id: 2, username: 'clinic', password: 'password', role: 'clinic' },
  { id: 3, username: 'admin', password: 'password', role: 'admin' }
];

export function registerAuthRoutes(app: Express) {
  // User login endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    // Find user by username and password
    const user = users.find(u => 
      u.username === username && u.password === password
    );
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Create session
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
    }
    
    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: userInfo
    });
  });
  
  // User logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Logout failed' 
          });
        }
        
        res.json({ success: true, message: 'Logout successful' });
      });
    } else {
      res.json({ success: true, message: 'Already logged out' });
    }
  });
  
  // Get current user info
  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }
    
    // Find user by ID
    const user = users.find(u => u.id === req.session.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;
    
    res.json({ 
      success: true, 
      user: userInfo
    });
  });
}