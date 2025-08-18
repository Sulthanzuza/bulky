import React, { useState } from 'react';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Template } from '../../types';

interface Credentials {
  email: string;
  password: string;
}

interface TestEmailProps {
  credentials: Credentials;
  template: Template | null;
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
}

const TestEmail: React.FC<TestEmailProps> = ({ credentials, template, isSending, setIsSending }) => {
  const [testEmail, setTestEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendTest = async () => {
    if (!/\S+@\S+\.\S+/.test(testEmail)) {
        toast.error('Please enter a valid test email address.');
        return;
    }
    if (!template) {
        toast.error('Please select a template first.');
        return;
    }
    if (!credentials.email || !credentials.password) {
        toast.error('Please provide sender credentials first.');
        return;
    }

    setIsSending(true);
    setError(null);
    const loadingToast = toast.loading('Sending test email...');

    try {
      const { data } = await axios.post('https://bulky-9eky.onrender.com/api/send-test', { credentials, template, testEmail });
      toast.success(`Test email sent successfully via ${data.provider}!`);
    } catch (err: any) {
      const errData = err.response?.data;
      const errorMessage = errData?.error || 'An unknown error occurred.';
      setError(errorMessage + (errData?.suggestion ? `\n\nSuggestion: ${errData.suggestion}` : ''));
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Send a test email to yourself to verify credentials and check the template's appearance in an inbox.</p>
      
      <div>
        <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Email
        </label>
        <div className="flex rounded-md shadow-sm">
          <input
            type="email"
            id="test-email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="recipient@example.com"
            disabled={isSending}
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSending || !testEmail || !template || !credentials.email}
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={16} />}
            <span>{isSending ? 'Sending...' : 'Send Test'}</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="flex items-start text-red-700 bg-red-50 p-4 rounded-md">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <div className="whitespace-pre-wrap text-sm">{error}</div>
        </div>
      )}
    </div>
  );
};

export default TestEmail;