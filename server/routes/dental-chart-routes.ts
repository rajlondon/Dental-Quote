import { Router, Request, Response } from 'express';

// Simple in-memory storage for dental charts
const dentalChartStorage = new Map<string, any>();

export const setupDentalChartRoutes = () => {
  const router = Router();
  
  // Get dental chart for current user
  router.get('/', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const user = req.user as Express.User;
      const userId = user.id;
      
      // Look for a dental chart associated with this user
      let userChart = null;
      
      for (const [chartId, chart] of dentalChartStorage.entries()) {
        if (chart.userId === userId || chart.patientEmail === user.email) {
          userChart = chart;
          break;
        }
      }
      
      // If no chart exists, create a placeholder to avoid "failed to load"
      if (!userChart) {
        const newChartId = `chart_${userId}_${Date.now()}`;
        userChart = {
          chartId: newChartId,
          patientName: user.name || user.email,
          patientEmail: user.email,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          userId: userId,
          teethData: {}
        };
        
        // Store the empty chart
        dentalChartStorage.set(newChartId, userChart);
      }
      
      return res.status(200).json({
        success: true,
        chartData: userChart
      });
    } catch (error) {
      console.error('Error retrieving dental chart:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve dental chart'
      });
    }
  });
  
  // Save/update dental chart
  router.post('/', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const user = req.user as Express.User;
      const userId = user.id;
      const { teethData } = req.body;
      
      if (!teethData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required data: teethData'
        });
      }
      
      // Look for an existing dental chart
      let chartId: string | null = null;
      let existingChart: any = null;
      
      for (const [id, chart] of dentalChartStorage.entries()) {
        if (chart.userId === userId || chart.patientEmail === user.email) {
          chartId = id;
          existingChart = chart;
          break;
        }
      }
      
      // If no chart exists, create a new one
      if (!chartId) {
        chartId = `chart_${userId}_${Date.now()}`;
      }
      
      const updatedChart = {
        ...existingChart,
        chartId,
        patientName: user.name || user.email,
        patientEmail: user.email,
        userId,
        teethData,
        lastUpdated: new Date().toISOString(),
        createdAt: existingChart?.createdAt || new Date().toISOString()
      };
      
      // Store the updated chart
      dentalChartStorage.set(chartId, updatedChart);
      
      console.log(`Dental chart data saved for user ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Dental chart data saved successfully',
        chartData: updatedChart
      });
    } catch (error) {
      console.error('Error saving dental chart data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save dental chart data'
      });
    }
  });
  
  return router;
};