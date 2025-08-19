import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

// Define a clear type for all the credentials we'll manage.
interface Credentials {
  email: string;
  password: string;
  provider: 'gmail' | 'outlook' | 'smtp';
  host: string;
  port: number;
  secure: boolean;
}

// The props interface remains the same, accepting the onChange callback.
interface UserCredentialsProps {
  onChange: (credentials: Credentials) => void;
}

const UserCredentials: React.FC<UserCredentialsProps> = ({ onChange }) => {
  // --- SOLUTION PART 1: Use a single state object for all form fields. ---
  // This is the core of the fix. All related data is now in one place.
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
    provider: 'gmail', // A sensible default
    host: '',
    port: 587,         // Default SMTP port
    secure: false,       // Default security setting
  });

  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // --- SOLUTION PART 2: A single, generic handler for ALL inputs. ---
  // This function is smart. It uses the input's `name` attribute to know
  // which property in the `credentials` state object to update.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // A special check for checkboxes, which use `checked` instead of `value`.
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setCredentials(prevCreds => ({
      ...prevCreds,
      // The `[name]` syntax is computed property names. It lets us update
      // a key in the object dynamically (e.g., 'email', 'password', 'host').
      [name]: name === 'port' ? parseInt(value, 10) || 0 : inputValue,
    }));
  };

  // --- SOLUTION PART 3: Notify the parent component of any changes. ---
  // This `useEffect` hook watches the `credentials` state. Whenever it changes,
  // it automatically calls the `onChange` prop to send the complete, updated
  // object up to the Dashboard. This keeps everything in sync.
  useEffect(() => {
    onChange(credentials);
  }, [credentials, onChange]);

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
            name="email" // The `name` attribute MUST match the state key
            value={credentials.email} // Bind value to the state object
            onChange={handleChange} // Use the single, generic handler
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
            name="password" // The `name` attribute MUST match the state key
            value={credentials.password} // Bind value to the state object
            onChange={handleChange} // Use the single, generic handler
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
