import { Request, Response, NextFunction } from 'express';

// Role-based access control middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

export const isClinicStaff = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (user.role !== 'clinic_staff' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Clinic staff access required' });
  }
  
  next();
};

export const isPatient = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (user.role !== 'patient' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Patient access required' });
  }
  
  next();
};