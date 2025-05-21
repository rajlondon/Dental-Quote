import { Router, Request, Response } from 'express';
import { db } from '../db';
import { quoteRequests } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

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
          const userQuotes = await db
            .select()
            .from(quoteRequests)
            .where(eq(quoteRequests.userId, userId))
            .orderBy(desc(quoteRequests.createdAt)); // Order by most recent first
          
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
            console.log(`Found dental chart data in quote #${quoteWithChart.id} for user ${userId}`);
            // Create a new chart using the quote dental chart data
            const newChartId = `chart_${userId}_${Date.now()}`;
            userChart = {
              chartId: newChartId,
              patientName: user.email || 'Patient',
              patientEmail: user.email,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              userId: userId,
              teethData: quoteWithChart.dentalChartData,
              source: 'quote',
              quoteRequestId: quoteWithChart.id
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
          teethData: {},
          source: 'patient_portal'
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
      const { teethData, quoteRequestId, source = 'patient_portal' } = req.body;
      
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
        createdAt: existingChart?.createdAt || new Date().toISOString(),
        source, // Where the chart update originated from
        quoteRequestId // Associated quote request ID (if any)
      };
      
      // Store the updated chart in memory
      dentalChartStorage.set(chartId, updatedChart);
      
      // Update quote data if a specific quote ID was provided
      if (quoteRequestId) {
        try {
          await db
            .update(quoteRequests)
            .set({
              dentalChartData: teethData,
              updatedAt: new Date()
            })
            .where(eq(quoteRequests.id, quoteRequestId));
          
          console.log(`Updated dental chart data in specified quote ${quoteRequestId} for user ${userId}`);
        } catch (dbError) {
          console.error(`Error updating dental chart data in quote ${quoteRequestId}:`, dbError);
        }
      } else {
        // Update the most recent quote if no specific quote ID provided
        try {
          // Find the user's most recent quote
          const userQuotes = await db
            .select()
            .from(quoteRequests)
            .where(eq(quoteRequests.userId, userId))
            .orderBy(desc(quoteRequests.createdAt))
            .limit(1);
          
          if (userQuotes.length > 0) {
            const latestQuoteId = userQuotes[0].id;
            
            // Update the dental chart data in the latest quote
            await db
              .update(quoteRequests)
              .set({
                dentalChartData: teethData,
                updatedAt: new Date()
              })
              .where(eq(quoteRequests.id, latestQuoteId));
            
            // Update the return data with the quote ID
            updatedChart.quoteRequestId = latestQuoteId;
            
            console.log(`Updated dental chart data in latest quote ${latestQuoteId} for user ${userId}`);
          }
        } catch (dbError) {
          console.error('Error updating dental chart data in latest quote:', dbError);
          // Continue even if there's a database error - the in-memory chart is still updated
        }
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

  // Refresh dental chart from quotes
  router.post('/refresh', async (req: Request, res: Response) => {
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
      
      // Find the most recent quote with dental chart data
      const userQuotes = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.userId, userId))
        .orderBy(desc(quoteRequests.createdAt));
      
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
      
      if (!quoteWithChart || !quoteWithChart.dentalChartData) {
        return res.status(404).json({
          success: false,
          error: 'No dental chart data found in any quotes'
        });
      }
      
      // Look for an existing dental chart to update
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
      
      const refreshedChart = {
        ...existingChart,
        chartId,
        patientName: user.email || 'Patient',
        patientEmail: user.email,
        userId,
        teethData: quoteWithChart.dentalChartData,
        lastUpdated: new Date().toISOString(),
        createdAt: existingChart?.createdAt || new Date().toISOString(),
        source: 'quote',
        quoteRequestId: quoteWithChart.id
      };
      
      // Store the updated chart in memory
      dentalChartStorage.set(chartId, refreshedChart);
      
      console.log(`Dental chart refreshed from quote ${quoteWithChart.id} for user ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Dental chart data refreshed successfully from quote',
        chartData: refreshedChart
      });
    } catch (error) {
      console.error('Error refreshing dental chart data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to refresh dental chart data'
      });
    }
  });
  
  return router;
};