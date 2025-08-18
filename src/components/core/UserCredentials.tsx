import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface UserCredentialsProps {
  onChange: (credentials: { email: string; password: string; provider?: 'gmail' | 'outlook' | 'smtp'; host?: string; port?: number; secure?: boolean }) => void;
}

const UserCredentials: React.FC<UserCredentialsProps> = ({ onChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    onChange({ email: newEmail, password });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    onChange({ email, password: newPassword });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-600 max-w-xl">
          Enter the sender's email address and app password.
        </p>
        <div className="relative">
          <button
            type="button"
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            onMouseEnter={() => setShowInfoTooltip(true)}
            onMouseLeave={() => setShowInfoTooltip(false)}
            aria-label="More information"
          >
            <Info size={20} />
          </button>
          {showInfoTooltip && (
            <div className="absolute right-0 mt-2 z-10 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-800 mb-2">What is an App Password?</p>
              <p>For services like Gmail or Outlook with 2-Factor Authentication, you must generate a special "App Password" to allow this application to send emails on your behalf.</p>
              <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline mt-2 block">
                Learn how to create one for Gmail &rarr;
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Sender Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="your.email@gmail.com"
            required
          />
        </div>
        <div>
          <label htmlFor="app-password" className="block text-sm font-medium text-gray-700 mb-1">
            Email App Password
          </label>
          <input
            type="password"
            id="app-password"
            value={password}
            onChange={handlePasswordChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="••••••••••••••••"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default UserCredentials;