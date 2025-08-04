import React, { useState } from 'react';
import { Send, AlertCircle, Loader2 } from 'lucide-react'; // Added Loader2
import axios from 'axios';
import toast from 'react-hot-toast';

// Assuming these types are defined elsewhere
interface Template {
  subject: string;
  body: string;
}

interface Credentials {
  email: string;
  password: string;
  provider?: 'outlook' | 'smtp' | 'gmail';
  host?: string;
  port?: number;
  secure?: boolean;
}

interface TestEmailProps {
  credentials: Credentials;
  template: Template | null;
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
}

const TestEmail: React.FC<TestEmailProps> = ({
  credentials,
  template,
  isSending,
  setIsSending
}) => {
  const [testEmail, setTestEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!testEmail || !/\S+@\S+\.\S+/.test(testEmail)) {
      setError('Please enter a valid test email address.');
      return false;
    }
    if (!template) {
      setError('Please select a template first.');
      return false;
    }
    if (!credentials.email || !credentials.password) {
      setError('Please enter your email credentials first.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSendTest = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    const loadingToast = toast.loading('Sending test email...');

    try {
      const payload = {
        credentials,
        template,
        testEmail
      };
      
      const response = await axios.post('https://bulky-9eky.onrender.com/api/send-test', payload);

      toast.success(`Test email sent successfully via ${response.data.provider}!`);
      setError(null);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      const errData = error.response?.data;

      if (errData?.suggestion) {
        setError(`${errData.error}\n\nSuggestion: ${errData.suggestion}`);
        toast.error(errData.error, { duration: 5000 });
      } else if (errData?.error) {
        setError(errData.error);
        toast.error(errData.error);
      } else if (error.message.includes('Network Error')) {
        const msg = 'Cannot connect to server. Ensure the backend is running.';
        setError(msg);
        toast.error(msg);
      } else {
        const msg = 'An unknown error occurred. Check console for details.';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Send a test email to verify your template and credentials before sending in bulk.
      </p>
      
      {/* START: ADDED EMAIL PREVIEW */}
      {template && (
        <div className="border-t pt-4">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">
            Email Preview
          </h3>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-baseline border-b pb-2">
              <p className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">Subject:</p>
              <p className="ml-2 text-sm font-semibold text-gray-800">{template.subject}</p>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              <div 
                className="prose prose-sm max-w-none max-h-60 overflow-y-auto" 
                dangerouslySetInnerHTML={{ __html: template.body }} 
              />
            </div>
          </div>
        </div>
      )}
      {/* END: ADDED EMAIL PREVIEW */}

      <div className="pt-4">
        <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-1">
          Test Recipient Email
        </label>
        <div className="flex rounded-md shadow-sm">
          <input
            type="email"
            name="test-email"
            id="test-email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="recipient@example.com"
            disabled={isSending}
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSending || !testEmail || !template}
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span className='ml-2'>{isSending ? 'Sending...' : 'Send Test'}</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="flex items-start text-red-600 text-sm bg-red-50 p-3 rounded-md">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <div className="whitespace-pre-wrap">{error}</div>
        </div>
      )}
    </div>
  );
};

export default TestEmail;