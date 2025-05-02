import { Notification, NotificationCategory } from '@shared/notifications';
import { User } from '@shared/schema';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isMailjetConfigured } from '../mailjet-service';
import mailjet from 'node-mailjet';

// Configuration with verified domain
const SENDER_EMAIL = process.env.MAILJET_SENDER_EMAIL || 'noreply@mydentalfly.com';
const SENDER_NAME = process.env.MAILJET_SENDER_NAME || 'MyDentalFly';

/**
 * Email Notification Service
 * Handles sending email notifications to users when important events occur
 */
export class EmailNotificationService {
  /**
   * Initialize the email notification service
   */
  constructor() {
    // Initialize mailjet client if configured
    if (isMailjetConfigured()) {
      this.mailjetClient = mailjet.apiConnect(
        process.env.MAILJET_API_KEY || '',
        process.env.MAILJET_SECRET_KEY || ''
      );
    }
  }

  private mailjetClient: any;

  /**
   * Process a notification and send an email if appropriate
   * @param notification The notification object
   */
  public async processNotification(notification: Notification): Promise<boolean> {
    // Only send emails for specific notification types that require immediate attention
    if (!this.shouldSendEmail(notification)) {
      return false;
    }

    // Don't send emails if Mailjet isn't configured
    if (!isMailjetConfigured() || !this.mailjetClient) {
      console.warn('Mailjet not configured - skipping email notification');
      return false;
    }

    try {
      // If it's a specific user target, get their email
      if (notification.target_type === 'patient' && notification.target_id) {
        // Convert string ID to number
        const userId = parseInt(notification.target_id, 10);
        if (isNaN(userId)) {
          console.error('Invalid user ID for email notification:', notification.target_id);
          return false;
        }

        // Look up the user to get their email
        const user = await this.getUserById(userId);
        
        if (!user || !user.email) {
          console.error('User not found or no email for ID:', userId);
          return false;
        }

        // Only send if email is verified
        if (!user.emailVerified) {
          console.warn('User email not verified, skipping notification email:', user.email);
          return false;
        }

        // Send the email
        return await this.sendEmailNotification(user, notification);
      }
      
      return false;
    } catch (error) {
      console.error('Error processing email notification:', error);
      return false;
    }
  }

  /**
   * Determine if a notification should trigger an email
   */
  private shouldSendEmail(notification: Notification): boolean {
    // Only send emails to patient targets 
    if (notification.target_type !== 'patient') {
      return false;
    }

    // Only send if notification is important enough (high priority or specific categories)
    return (
      notification.priority === 'high' || 
      notification.priority === 'urgent' ||
      [
        'treatment', 
        'appointment',
        'message', 
        'document'
      ].includes(notification.category)
    );
  }

  /**
   * Get user by ID
   */
  private async getUserById(userId: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      return user;
    } catch (error) {
      console.error('Error fetching user for email notification:', error);
      return undefined;
    }
  }

  /**
   * Send email notification to user
   */
  private async sendEmailNotification(user: User, notification: Notification): Promise<boolean> {
    try {
      const userName = user.firstName || user.email.split('@')[0];
      
      // Create email content based on notification type
      const { subject, htmlContent } = this.createEmailContent(userName, notification);

      // Prepare email message
      const message = {
        From: {
          Email: SENDER_EMAIL,
          Name: SENDER_NAME
        },
        To: [
          {
            Email: user.email,
            Name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
          }
        ],
        Subject: subject,
        HTMLPart: htmlContent,
      };

      // Send email
      await this.mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [message]
      });

      console.log(`Email notification sent to ${user.email} for ${notification.category}`);
      return true;
    } catch (error: unknown) {
      console.error('Error sending email notification:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const mailjetError = error as { response: { status: number; statusText: string; data: unknown } };
        console.error('Mailjet API error details:', {
          status: mailjetError.response.status,
          statusText: mailjetError.response.statusText,
          data: mailjetError.response.data
        });
      }
      return false;
    }
  }

  /**
   * Create email content based on notification type
   */
  private createEmailContent(userName: string, notification: Notification): { subject: string, htmlContent: string } {
    // Base template with styling
    const baseTemplate = (content: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00688B; color: white; padding: 15px; text-align: center;">
          <h1 style="margin: 0;">MyDentalFly Notification</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px;">
          <h2 style="color: #007B9E; margin-top: 0;">Hello ${userName},</h2>
          ${content}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p>Thank you for choosing MyDentalFly for your dental tourism needs.</p>
            <p>The MyDentalFly Team</p>
          </div>
        </div>
        <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message from MyDentalFly. Please do not reply to this email.</p>
          <p>To manage your notification preferences, please log in to your MyDentalFly account.</p>
        </div>
      </div>
    `;

    let subject = notification.title;
    let content = '';
    const actionUrl = notification.action_url || 'https://mydentalfly.com/patient';

    // Create content based on notification category
    switch(notification.category) {
      case 'treatment':
        subject = 'New Treatment Plan Available';
        content = `
          <p>${notification.message}</p>
          <p>A new treatment plan has been created for you. Please log in to your MyDentalFly account to review the details.</p>
          <p style="margin-top: 20px;">
            <a href="${actionUrl}" style="background-color: #007B9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Treatment Plan</a>
          </p>
        `;
        break;
        
      case 'appointment':
        subject = 'Appointment Update';
        content = `
          <p>${notification.message}</p>
          <p>There has been an update to your dental appointment. Please check your MyDentalFly account for more details.</p>
          <p style="margin-top: 20px;">
            <a href="${actionUrl}" style="background-color: #007B9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Appointment</a>
          </p>
        `;
        break;
        
      case 'message':
        subject = 'New Message Received';
        content = `
          <p>You have received a new message in your MyDentalFly account.</p>
          <p>${notification.message}</p>
          <p style="margin-top: 20px;">
            <a href="${actionUrl}" style="background-color: #007B9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Read Message</a>
          </p>
        `;
        break;
        
      case 'document':
        subject = 'New Document Available';
        content = `
          <p>${notification.message}</p>
          <p>A new document has been added to your MyDentalFly account. Please log in to view and download it.</p>
          <p style="margin-top: 20px;">
            <a href="${actionUrl}" style="background-color: #007B9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Document</a>
          </p>
        `;
        break;
        
      case 'payment':
        subject = 'Payment Update';
        content = `
          <p>${notification.message}</p>
          <p>There has been an update regarding a payment on your MyDentalFly account. Please log in to view the details.</p>
          <p style="margin-top: 20px;">
            <a href="${actionUrl}" style="background-color: #007B9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Payment Details</a>
          </p>
        `;
        break;
        
      default:
        content = `
          <p>${notification.message}</p>
          <p>Please log in to your MyDentalFly account to view more details.</p>
          <p style="margin-top: 20px;">
            <a href="${actionUrl}" style="background-color: #007B9E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Log in to MyDentalFly</a>
          </p>
        `;
    }

    return {
      subject,
      htmlContent: baseTemplate(content)
    };
  }
}

// Export a factory function to create the service
export const createEmailNotificationService = (): EmailNotificationService => {
  return new EmailNotificationService();
};