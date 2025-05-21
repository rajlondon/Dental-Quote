import { Router, Request, Response } from 'express';
import { db } from '../db';
import { quoteRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
      
      // Use Array.from instead of for...of with entries() to avoid compatibility issues
      const entries = Array.from(dentalChartStorage.entries());
      for (let i = 0; i < entries.length; i++) {
        const [chartId, chart] = entries[i];
        if (chart.userId === userId || chart.patientEmail === user.email) {
          userChart = chart;
          break;
        }
      }
      
      // If no chart exists in memory, try to get it from quote data
      if (!userChart) {
        try {
          // Look up quotes from this user to find dental chart data
          const userQuotes = await db.select().from(quoteRequests).where(eq(quoteRequests.userId, userId));
          
          // Find the most recent quote with dental chart data
          let quoteWithChart = null;
          for (const quote of userQuotes) {
            if (quote.dentalChartData && 
                typeof quote.dentalChartData === 'object' && 
                Object.keys(quote.dentalChartData).length > 0) {
              quoteWithChart = quote;
              break;
            }
          }
          
          if (quoteWithChart && quoteWithChart.dentalChartData) {
            console.log(`Found dental chart data in quote for user ${userId}`);
            // Create a new chart using the quote dental chart data
            const newChartId = `chart_${userId}_${Date.now()}`;
            userChart = {
              chartId: newChartId,
              patientName: user.email || 'Patient',
              patientEmail: user.email,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              userId: userId,
              teethData: quoteWithChart.dentalChartData
            };
            
            // Store the chart for future use
            dentalChartStorage.set(newChartId, userChart);
          }
        } catch (dbError) {
          console.error('Error fetching quote data for dental chart:', dbError);
          // Continue with empty chart if there's a database error
        }
      }
      
      // If still no chart exists, create an empty placeholder
      if (!userChart) {
        const newChartId = `chart_${userId}_${Date.now()}`;
        userChart = {
          chartId: newChartId,
          patientName: user.email || 'Patient',
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
      
      // Use Array.from to avoid compatibility issues
      const entries = Array.from(dentalChartStorage.entries());
      for (let i = 0; i < entries.length; i++) {
        const [id, chart] = entries[i];
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
        patientName: user.email || 'Patient',
        patientEmail: user.email,
        userId,
        teethData,
        lastUpdated: new Date().toISOString(),
        createdAt: existingChart?.createdAt || new Date().toISOString()
      };
      
      // Store the updated chart in memory
      dentalChartStorage.set(chartId, updatedChart);
      
      // Also update the dental chart data in the user's latest quote
      try {
        // Find the user's most recent quote
        const userQuotes = await db.select().from(quoteRequests).where(eq(quoteRequests.userId, userId));
        
        if (userQuotes.length > 0) {
          // Sort by creation date to get the most recent quote
          const sortedQuotes = userQuotes.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          
          const latestQuoteId = sortedQuotes[0].id;
          
          // Update the dental chart data in the latest quote
          await db
            .update(quoteRequests)
            .set({
              dentalChartData: teethData,
              updatedAt: new Date()
            })
            .where(eq(quoteRequests.id, latestQuoteId));
          
          console.log(`Updated dental chart data in quote ${latestQuoteId} for user ${userId}`);
        }
      } catch (dbError) {
        console.error('Error updating dental chart data in quote:', dbError);
        // Continue even if there's a database error - the in-memory chart is still updated
      }
      
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