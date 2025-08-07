import nodemailer from 'nodemailer';

// Interface for the final, structured credentials
export interface EmailCredentials {
  provider: 'outlook' | 'smtp';
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Interface for the raw credentials coming from the frontend
export interface FrontendCredentials {
  email: string;
  password: string;
  provider?: 'outlook' | 'smtp';
  host?: string;
  port?: number;
  secure?: boolean;
}

// Maps and validates credentials from the frontend request
export const mapCredentials = (creds: FrontendCredentials): EmailCredentials => {
  const provider = creds.provider || 'outlook'; // Default to outlook

  // Set default host/port for Outlook if not provided
  const host = creds.host || (provider === 'outlook' ? 'smtp.office365.com' : '');
  const port = creds.port || (provider === 'outlook' ? 587 : 0);

  if (!host || !port) {
    throw new Error('SMTP configuration requires host and port.');
  }

  return {
    provider,
    host,
    port,

    secure: creds.secure !== undefined ? creds.secure : port === 465,
    auth: {
      user: creds.email,
      pass: creds.password,
    },
  };
};


export const createEmailTransporter = (config: EmailCredentials): nodemailer.Transporter => {
  console.log('Creating transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
  });

  // This single configuration works for both Office 365 and other SMTP servers
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    // Let Nodemailer handle STARTTLS automatically on non-secure ports like 587
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
    // Set connection timeouts for robustness
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 10000,   // 10 seconds
  });
};


// The rest of your utility functions remain the same
export interface EmailTemplate {
  subject: string;
  body: string;
}

export const sendEmail = async (
  transporter: nodemailer.Transporter,
  from: string,
  to: string,
  template: EmailTemplate
): Promise<void> => {
  try {
    // Verify connection first
    console.log('Verifying SMTP connection...');
    
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    await transporter.sendMail({
      from,
      to,
      subject: template.subject,
      html: template.body,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    // The error will be caught and handled in the controller
    throw error;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createTransporter = createEmailTransporter;