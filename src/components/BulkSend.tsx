import React, { useState } from 'react';
import { SendHorizonal, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Template } from '../types';

interface BulkSendProps {
  credentials: { 
    email: string; 
    password: string;
    provider?: 'gmail' | 'outlook' | 'smtp';
    host?: string;
    port?: number;
    secure?: boolean;
  };
  template: Template | null;
  fileUploaded: boolean;
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
}

const BulkSend: React.FC<BulkSendProps> = ({
  credentials,
  template,
  fileUploaded,
  isSending,
  setIsSending
}) => {
  const [error, setError] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    inProgress: false,
    provider: ''
  });

  const validateForm = () => {
    if (!fileUploaded) {
      setError('Please upload an Excel file first');
      return false;
    }
    
    if (!template) {
      setError('Please select a template first');
      return false;
    }
    
    if (!template.subject || !template.body) {
      setError('The selected template is empty');
      return false;
    }
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter your email credentials');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSendBulk = async () => {
    if (!validateForm()) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to send emails to all recipients in the uploaded Excel file?'
    );
    
    if (!confirmed) return;
    
    setIsSending(true);
    setSendingProgress({
      total: 0,
      sent: 0,
      failed: 0,
      inProgress: true,
      provider: ''
    });
    
    const loadingToast = toast.loading('Sending bulk emails...');
    
    try {
      // Format credentials to match backend expectations
      const formattedCredentials = {
        provider: credentials.provider || (credentials.email.includes('@gmail.com') ? 'gmail' : 'outlook'),
        email: credentials.email,
        password: credentials.password,
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure
      };

      console.log('Sending bulk emails with provider:', formattedCredentials.provider);

      const response = await axios.post('http://localhost:3001/api/send-bulk', {
        credentials: formattedCredentials,
        template
      });
      
      setSendingProgress({
        total: response.data.total,
        sent: response.data.sent,
        failed: response.data.failed,
        inProgress: false,
        provider: response.data.provider || formattedCredentials.provider
      });
      
      if (response.data.sent === response.data.total) {
        toast.success(`Successfully sent ${response.data.sent} emails via ${response.data.provider}!`);
      } else {
        toast.success(`Sent ${response.data.sent} emails, ${response.data.failed} failed via ${response.data.provider}`);
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Error sending bulk emails:', error);
      
      // Enhanced error handling based on backend response
      if (error.response?.data?.suggestion) {
        setError(`${error.response.data.error}\n${error.response.data.suggestion}`);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message.includes('Network Error')) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('Failed to send bulk emails. Please check your credentials and try again.');
      }
      
      toast.error('Failed to send bulk emails');
      setSendingProgress({
        ...sendingProgress,
        inProgress: false
      });
    } finally {
      toast.dismiss(loadingToast);
      setIsSending(false);
    }
  };

  // Auto-detect provider based on email domain
  const getProviderFromEmail = (email: string): string => {
    if (email.includes('@gmail.com')) return 'Gmail';
    if (email.includes('@outlook.com') || email.includes('@hotmail.com')) return 'Outlook';
    return 'Company Email (SMTP)';
  };

  // Calculate progress percentage
  const progressPercentage = sendingProgress.total > 0 
    ? ((sendingProgress.sent + sendingProgress.failed) / sendingProgress.total) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Send emails to all recipients in the uploaded Excel file using the selected template.
      </p>
      
      {/* Show detected provider */}
      {credentials.email && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          Using Provider: {getProviderFromEmail(credentials.email)}
        </div>
      )}
      
      <div>
        <button
          type="button"
          onClick={handleSendBulk}
          disabled={isSending || !fileUploaded || !template}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <SendHorizonal size={16} className="mr-2" />
              Send to All Recipients
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="flex items-start text-red-600 text-sm bg-red-50 p-3 rounded">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}
      
      {(sendingProgress.inProgress || sendingProgress.total > 0) && (
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Sending Progress</h3>
            {sendingProgress.provider && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                via {sendingProgress.provider}
              </span>
            )}
          </div>
          
          {sendingProgress.inProgress ? (
            <div className="space-y-3">
              <div className="flex items-center text-sm text-blue-600">
                <Loader2 size={16} className="mr-2 animate-spin" />
                Sending emails...
              </div>
              
              {sendingProgress.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              )}
              
              {sendingProgress.total > 0 && (
                <div className="text-xs text-gray-600 text-center">
                  {sendingProgress.sent + sendingProgress.failed} of {sendingProgress.total} processed
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total recipients:</span>
                <span className="font-medium">{sendingProgress.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Successfully sent:</span>
                <span className="flex items-center text-green-600 font-medium">
                  <CheckCircle size={16} className="mr-1" />
                  {sendingProgress.sent}
                </span>
              </div>
              
              {sendingProgress.failed > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed:</span>
                  <span className="flex items-center text-red-600 font-medium">
                    <XCircle size={16} className="mr-1" />
                    {sendingProgress.failed}
                  </span>
                </div>
              )}
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${(sendingProgress.sent / sendingProgress.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-600 text-center">
                Success rate: {sendingProgress.total > 0 ? Math.round((sendingProgress.sent / sendingProgress.total) * 100) : 0}%
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Template Preview */}
      {template && (
        <div className="text-sm border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Using Template:</h3>
          <div className="bg-gray-50 rounded p-3">
            <p className="font-medium text-sm">Subject: {template.subject}</p>
            <div className="mt-2 text-xs text-gray-600 max-h-20 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: template.body.substring(0, 200) + '...' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkSend;
