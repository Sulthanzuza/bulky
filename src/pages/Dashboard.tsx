import React, { useState } from 'react';
import UserCredentials from '../components/core/UserCredentials';
import TemplateManager from '../components/templates/TemplateManager';
import FileUpload from '../components/core/FileUpload';
import TestEmail from '../components/actions/TestEmail';
import BulkSend from '../components/actions/BulkSend';
import EmailPreview from '../components/preview/EmailPreview';
import Card from '../components/ui/Card';
import { Template } from '../types';

const Dashboard: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSending, setIsSending] = useState(false); // Shared sending state

  return (
    <div className="space-y-8">
      <Card step={1} title="Configure Sender">
        <UserCredentials onChange={setCredentials} />
      </Card>

      <Card step={2} title="Upload Recipients">
        <FileUpload onUpload={setFileUploaded} />
      </Card>

      <Card step={3} title="Compose & Select Email">
        <TemplateManager 
          onSelect={setSelectedTemplate} 
          selectedTemplateId={selectedTemplate?.id || null} 
        />
      </Card>

      {/* The single, centralized preview appears here when a template is selected */}
      {selectedTemplate && (
        <EmailPreview template={selectedTemplate} />
      )}

      {/* Final Actions Section */}
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
          <h2 className="text-xl font-bold text-gray-800">Test & Send Campaign</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Send a Test Email</h3>
            <TestEmail 
              credentials={credentials}
              template={selectedTemplate}
              isSending={isSending}
              setIsSending={setIsSending}
            />
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Launch Bulk Campaign</h3>
            <BulkSend 
              credentials={credentials}
              template={selectedTemplate}
              fileUploaded={fileUploaded}
              isSending={isSending}
              setIsSending={setIsSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;