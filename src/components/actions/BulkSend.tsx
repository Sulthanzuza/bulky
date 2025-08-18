import React, { useState } from 'react';
import { SendHorizonal, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Template } from '../../types';

interface BulkSendProps {
  credentials: { email: string; password: string; };
  template: Template | null;
  fileUploaded: boolean;
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
}

const BulkSend: React.FC<BulkSendProps> = ({ credentials, template, fileUploaded, isSending, setIsSending }) => {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ total: 0, sent: 0, failed: 0, inProgress: false });

  const handleSendBulk = async () => {
    if (!fileUploaded) { toast.error('Please upload a recipient file first.'); return; }
    if (!template) { toast.error('Please select an email template first.'); return; }
    if (!credentials.email || !credentials.password) { toast.error('Please provide sender credentials first.'); return; }
    if (!window.confirm('Are you sure you want to send emails to all recipients? This action cannot be undone.')) return;

    setIsSending(true);
    setError(null);
    setProgress({ total: 0, sent: 0, failed: 0, inProgress: true });
    const loadingToast = toast.loading('Initiating bulk send...');

    try {
      const { data } = await axios.post('https://bulky-9eky.onrender.com/api/send-bulk', { credentials, template });
      setProgress({ ...data, inProgress: false });
      if (data.failed > 0) {
        toast.success(`Campaign finished. Sent ${data.sent}, Failed ${data.failed}.`);
      } else {
        toast.success(`Campaign complete! All ${data.sent} emails sent successfully.`);
      }
    } catch (err: any) {
      const errData = err.response?.data;
      const errorMessage = errData?.error || 'An unknown error occurred.';
      setError(errorMessage + (errData?.suggestion ? `\n\nSuggestion: ${errData.suggestion}` : ''));
      toast.error(errorMessage);
      setProgress({ total: 0, sent: 0, failed: 0, inProgress: false });
    } finally {
      toast.dismiss(loadingToast);
      setIsSending(false);
    }
  };

  const progressPercentage = progress.total > 0 ? ((progress.sent + progress.failed) / progress.total) * 100 : 0;
  const successPercentage = progress.total > 0 ? (progress.sent / progress.total) * 100 : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Start the main campaign. This will send the selected email template to every recipient found in your uploaded Excel file.</p>
      
      <button type="button" onClick={handleSendBulk} disabled={isSending || !fileUploaded || !template || !credentials.email} className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        {isSending ? <><Loader2 size={20} className="mr-2 animate-spin" /> Sending Campaign...</> : <><SendHorizonal size={20} className="mr-2" /> Send to All Recipients</>}
      </button>

      {error && (
        <div className="flex items-start text-red-700 bg-red-50 p-4 rounded-md">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <div className="whitespace-pre-wrap text-sm">{error}</div>
        </div>
      )}

      {(progress.inProgress || progress.total > 0) && (
        <div className="border rounded-lg p-4 bg-gray-50/70 space-y-3">
          <h3 className="font-semibold text-gray-900">Sending Progress</h3>
          {progress.inProgress ? (
            <div className="flex items-center text-sm text-indigo-600">
              <Loader2 size={16} className="mr-2 animate-spin" /> Processing...
            </div>
          ) : (
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Recipients:</span> <span className="font-medium">{progress.total}</span></div>
                <div className="flex justify-between items-center"><span>Successful:</span> <span className="font-medium text-green-600 flex items-center"><CheckCircle size={14} className="mr-1"/>{progress.sent}</span></div>
                <div className="flex justify-between items-center"><span>Failed:</span> <span className="font-medium text-red-600 flex items-center"><XCircle size={14} className="mr-1"/>{progress.failed}</span></div>
            </div>
          )}
           <div className="w-full bg-gray-200 rounded-full h-2.5">
             <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress.inProgress ? progressPercentage : successPercentage}%` }}></div>
           </div>
           <div className="text-xs text-gray-500 text-center">
             {progress.inProgress ? `${progress.sent + progress.failed} of ${progress.total} processed` : `Campaign complete (${Math.round(successPercentage)}% success rate)`}
           </div>
        </div>
      )}
    </div>
  );
};

export default BulkSend;