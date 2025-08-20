import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';


interface SenderCredentials {
  email: string;
  password: string;
}


interface UserCredentialsProps {
  onChange: (credentials: SenderCredentials) => void;
}


const UserCredentials: React.FC<UserCredentialsProps> = ({ onChange }) => {

  const [credentials, setCredentials] = useState<SenderCredentials>({
    email: '',
    password: '',
  });

  const [showInfoTooltip, setShowInfoTooltip] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prevCreds => ({
      ...prevCreds,

      [name]: value,
    }));
  };

  useEffect(() => {
    onChange(credentials);
  }, [credentials, onChange]);

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Sender Credentials</h3>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            Enter your company email address and a generated app password to send emails.
          </p>
        </div>
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
              <p>For accounts with 2-Factor Authentication (like your company Outlook), you must generate a special "App Password" to allow this application to send emails on your behalf.</p>
              <p className="mt-2">Please contact your IT department for instructions on how to generate one.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Company Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email" // This name MUST match the state key
            value={credentials.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="your.name@company.com"
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
            name="password" // This name MUST match the state key
            value={credentials.password}
            onChange={handleChange}
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
