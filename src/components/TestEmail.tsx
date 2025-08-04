import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
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
  provider?: 'outlook' | 'smtp';
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
    // ... your validation logic is fine and remains here
    return true;
  };

  const handleSendTest = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    const loadingToast = toast.loading('Sending test email...');

    try {
      // FIX: Send the credentials from props directly.
      // Do not hardcode the host/port here. Let the backend handle it.
      // This makes your component reusable for custom SMTP servers.
      const payload = {
        credentials, // Send the credentials object as is
        template,
        testEmail
      };

      console.log('Sending test email with payload:', payload);

      const response = await axios.post('https://bulky-9eky.onrender.com/api/send-test', payload);

      toast.success(`Test email sent successfully via ${response.data.provider}!`);
      setError(null);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      const errData = error.response?.data;

      // Use the detailed error messages from the backend
      if (errData?.suggestion) {
        setError(`${errData.error}\n\nSuggestion: ${errData.suggestion}`);
        toast.error(errData.error);
      } else if (errData?.error) {
        setError(errData.error);
        toast.error(errData.error);
      } else if (error.message.includes('Network Error')) {
        const msg = 'Cannot connect to server. Please ensure the backend is running.';
        setError(msg);
        toast.error(msg);
      } else {
        const msg = 'An unknown error occurred. Check the console for details.';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsSending(false);
    }
  };

  // ... the rest of your JSX rendering can remain the same
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Send a test email to verify your template and credentials before sending in bulk.
      </p>
      <div>
        <label htmlFor="test-email" className="block text-sm font-medium text-gray-700">
          Test Email Address
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="email"
            name="test-email"
            id="test-email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="test@example.com"
            disabled={isSending}
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSending || !testEmail}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="mr-2" />
            {isSending ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-start text-red-600 text-sm bg-red-50 p-3 rounded">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <div className="whitespace-pre-wrap">{error}</div>
        </div>
      )}
    </div>
  );
};

export default TestEmail;