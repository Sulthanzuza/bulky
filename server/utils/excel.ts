import xlsx from 'xlsx';
import { isValidEmail } from './email';

// Define a type for a row of data, which can have any string keys
export interface RecipientData {
  email: string;
  [key: string]: any; // Allows for other columns like 'name', 'company', etc.
}

export const extractRecipientDataFromExcel = (filePath: string): RecipientData[] => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return [];
    }
    const worksheet = workbook.Sheets[sheetName];
    
    // Use sheet_to_json with default settings to get an array of objects
    // where keys are the header names (e.g., 'Email', 'Name', 'Company')
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet);

    const recipients: RecipientData[] = [];
    const seenEmails = new Set<string>();

    for (const row of jsonData) {
      let foundEmail: string | null = null;
      const recipientRow: RecipientData = { email: '' };

      // Find the first valid email in the row and standardize the key to 'email'
      for (const key in row) {
        const value = row[key];
        if (typeof value === 'string' && isValidEmail(value)) {
          foundEmail = value.trim();
          // Standardize other keys to be lowercase for easier placeholder replacement
          for(const innerKey in row) {
             recipientRow[innerKey.toLowerCase()] = row[innerKey];
          }
          recipientRow.email = foundEmail; // Ensure the 'email' key is set
          break; 
        }
      }

      // Add the recipient if an email was found and it's not a duplicate
      if (foundEmail && !seenEmails.has(foundEmail)) {
        recipients.push(recipientRow);
        seenEmails.add(foundEmail);
      }
    }

    return recipients;
  } catch (error) {
    console.error(`Error reading or parsing Excel file at ${filePath}:`, error);
    throw new Error('Failed to parse Excel file. It may be corrupted or in an unsupported format.');
  }
};