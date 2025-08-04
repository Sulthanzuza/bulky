import { Request, Response } from 'express';
import { createTransporter, sendEmail, isValidEmail, mapCredentials, EmailTemplate, FrontendCredentials } from '../utils/email';
// Import the new function and type from the updated excel utility
import { extractRecipientDataFromExcel, RecipientData } from '../utils/excel';

export let currentExcelFile: string | null = null;
// This now stores an array of objects, not just strings
export let extractedData: RecipientData[] = [];

// --- uploadExcel ---
// This function is updated to use the new data extraction logic
export const uploadExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    currentExcelFile = req.file.path;
    
    try {
      // Safely attempt to extract data
      extractedData = extractRecipientDataFromExcel(currentExcelFile);
    } catch (parsingError: any) {
      // This catch block will trigger if the Excel file is unreadable
      console.error('Error parsing Excel file:', parsingError.message);
      return res.status(400).json({
        error: 'Could not read the uploaded file.',
        suggestion: 'Please ensure the file is a valid, uncorrupted Excel document and is not password-protected.'
      });
    }

    if (extractedData.length === 0) {
      return res.status(400).json({
        error: 'No valid email addresses found in the uploaded file.',
        suggestion: 'Ensure your Excel file has a header row and a column containing emails.'
      });
    }

    return res.status(200).json({
      message: 'File processed successfully!',
      emailCount: extractedData.length,
      emailsSample: extractedData.slice(0, 5).map(r => r.email)
    });

  } catch (error: any) {
    // This is a final safeguard for any other unexpected errors
    console.error('An unexpected error occurred in uploadExcel:', error);
    return res.status(500).json({ error: 'An unexpected internal server error occurred.' });
  }
};

// --- sendTestEmail ---
// This function is updated to correctly format the 'from' string
export const sendTestEmail = async (req: Request, res: Response) => {
    try {
        const { credentials: frontendCreds, template, testEmail } = req.body;

        if (!frontendCreds || !template || !testEmail || !isValidEmail(testEmail)) {
            return res.status(400).json({ error: 'Missing or invalid required parameters.' });
        }

        const credentials = mapCredentials(frontendCreds);
        const transporter = createTransporter(credentials);

        // Uses the sender's email address directly for the 'from' field
        const fromString = credentials.auth.user;

        await sendEmail(transporter, fromString, testEmail, template);

        res.json({ 
            success: true, 
            message: `Test email sent successfully to ${testEmail}!` 
        });
    } catch (error: any) {
        // Your detailed error handling logic here...
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            error: 'Failed to send test email', 
            message: error.message 
        });
    }
};

// --- sendBulkEmails ---
// This function is heavily updated to handle placeholders and use rich data
export const sendBulkEmails = async (req: Request, res: Response) => {
    try {
        const { credentials: frontendCreds, template } = req.body;

        if (!frontendCreds || !template) {
            return res.status(400).json({ error: 'Missing credentials or template.' });
        }

        if (!extractedData || extractedData.length === 0) {
            return res.status(400).json({ error: 'No emails found. Please upload an Excel file first.' });
        }
        
        const credentials = mapCredentials(frontendCreds);
        const transporter = createTransporter(credentials);

        // Uses the sender's email address directly for the 'from' field
        const fromString = credentials.auth.user;

        let sent = 0;
        let failed = 0;
        const failedEmails: string[] = [];

        for (const recipient of extractedData) {
            try {
                let finalBody = template.body;
                let finalSubject = template.subject;

                // Dynamically replace placeholders for each column in the Excel file (e.g., {{name}}, {{company}})
                for (const key in recipient) {
                    const placeholder = new RegExp(`{{${key}}}`, 'gi');
                    finalSubject = finalSubject.replace(placeholder, recipient[key] || '');
                    finalBody = finalBody.replace(placeholder, recipient[key] || '');
                }
                
                const personalizedTemplate = { subject: finalSubject, body: finalBody };
                
                await sendEmail(transporter, fromString, recipient.email, personalizedTemplate);
                sent++;

                // Optional delay to avoid rate-limiting issues
                if (sent < extractedData.length) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

            } catch (error) {
                console.error(`Failed to send to ${recipient.email}:`, error);
                failed++;
                failedEmails.push(recipient.email);
            }
        }
        
        res.json({ 
            success: true, 
            total: extractedData.length, 
            sent, 
            failed,
            failedEmails 
        });

    } catch (error: any) {
        console.error('Error sending bulk emails:', error);
        res.status(500).json({ 
            error: 'A critical error occurred while sending bulk emails.', 
            message: error.message 
        });
    }
};

// ... (getExtractedEmails and clearExtractedEmails can remain the same, but you might want to adjust them for the new data structure)

export const getExtractedEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      emailCount: extractedData.length,
      emails: extractedData,
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
    extractedData = [];
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
