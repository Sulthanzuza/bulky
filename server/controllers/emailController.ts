import { Request, Response } from 'express';
import { createTransporter, sendEmail, isValidEmail, mapCredentials, EmailTemplate , FrontendCredentials} from '../utils/email';
import { extractEmailsFromExcel } from '../utils/excel';

let extractedEmails: string[] = [];
let currentExcelFile: string = '';

export const uploadExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    currentExcelFile = req.file.path;
    extractedEmails = extractEmailsFromExcel(currentExcelFile);
    
    res.json({
      success: true,
      emailCount: extractedEmails.length,
      emails: extractedEmails.slice(0, 10)
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ 
      error: 'Failed to process the Excel file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const sendTestEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credentials: frontendCreds, template, testEmail } = req.body as {
        credentials: FrontendCredentials,
        template: EmailTemplate,
        testEmail: string
    };

    if (!frontendCreds || !template || !testEmail) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    if (!isValidEmail(testEmail)) {
      res.status(400).json({ error: 'Invalid test email address' });
      return;
    }

    // Use the new, more robust mapping function
    const credentials = mapCredentials(frontendCreds);

    console.log(`Sending test email via ${credentials.host} from ${credentials.auth.user}`);

    const transporter = createTransporter(credentials);
    await sendEmail(transporter, credentials.auth.user, testEmail, template);

    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail} via ${credentials.provider}`,
      provider: credentials.provider
    });
  } catch (error) {
    // Your existing error handling is great and can remain here
    console.error('Error sending test email:', error);
    if (error instanceof Error) {
        if (error.message.includes('Invalid login') || error.message.includes('authentication') || error.message.includes('BadCredentials')) {
            res.status(401).json({
                error: 'Invalid Credentials. Please check your email and password.',
                message: error.message,
                suggestion: 'If your organization uses Multi-Factor Authentication (MFA), you MUST generate and use an "App Password" instead of your regular password.'
            });
        } else if (error.message.includes('SmtpClientAuthentication is disabled')) {
            res.status(403).json({
                error: 'SMTP Authentication is disabled for your account.',
                message: error.message,
                suggestion: 'Your IT administrator needs to enable "Authenticated SMTP" for your user account in the Microsoft 365 admin center.'
            });
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            res.status(504).json({
                error: 'Connection to email server timed out.',
                message: error.message,
                suggestion: 'Check your internet connection and verify the SMTP Host and Port are correct. Firewalls can sometimes block port 587.'
            });
        } else {
            res.status(500).json({
                error: 'Failed to send test email.',
                message: error.message
            });
        }
    } else {
        res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
};

export const sendBulkEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credentials: frontendCreds, template } = req.body;
    
    if (!frontendCreds || !template) {
      res.status(400).json({ error: 'Missing credentials or template' });
      return;
    }

    if (extractedEmails.length === 0) {
      res.status(400).json({ error: 'No emails found. Please upload an Excel file first.' });
      return;
    }

    if (!template.subject || !template.body) {
      res.status(400).json({ error: 'Template must have both subject and body' });
      return;
    }

    const credentials = mapCredentials(frontendCreds);
    const transporter = createTransporter(credentials);
    const total = extractedEmails.length;
    let sent = 0;
    let failed = 0;
    const failedEmails: string[] = [];
    
    console.log(`Starting bulk email send to ${total} recipients via ${credentials.provider}...`);
    
    for (let i = 0; i < extractedEmails.length; i++) {
      const email = extractedEmails[i];
      
      if (!isValidEmail(email)) {
        console.warn(`Skipping invalid email: ${email}`);
        failed++;
        failedEmails.push(email);
        continue;
      }
      
      try {
        await sendEmail(transporter, credentials.auth.user, email, template);
        sent++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${total} emails processed`);
        }
        
        // Conservative delay for Office 365 to avoid rate limiting
        const delay = credentials.provider === 'smtp' ? 500 : 300;
        
        if (i < extractedEmails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        failed++;
        failedEmails.push(email);
        
        // Add a longer delay after failures to prevent cascading issues
        if (i < extractedEmails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.log(`Bulk email send completed via ${credentials.provider}. Sent: ${sent}, Failed: ${failed}`);
    
    res.json({
      success: true,
      total,
      sent,
      failed,
      failedEmails: failedEmails.slice(0, 20),
      provider: credentials.provider,
      message: `Bulk email send completed via ${credentials.provider}. ${sent} sent successfully, ${failed} failed.`
    });
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({ 
      error: 'Failed to send bulk emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getExtractedEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      emailCount: extractedEmails.length,
      emails: extractedEmails,
      currentFile: currentExcelFile
    });
  } catch (error) {
    console.error('Error getting extracted emails:', error);
    res.status(500).json({ 
      error: 'Failed to get extracted emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const clearExtractedEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    extractedEmails = [];
    currentExcelFile = '';
    
    res.json({
      success: true,
      message: 'Extracted emails cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing extracted emails:', error);
    res.status(500).json({ 
      error: 'Failed to clear extracted emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
