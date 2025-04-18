import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If Clerk is not loaded yet, show a loading indicator
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff3b9a]"></div>
      </div>
    );
  }

  // Handle the email step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare the sign-in attempt with the email
      const result = await signIn.create({
        identifier: email,
      });

      // Check if the sign-in attempt was successful
      if (result.status === 'needs_identifier') {
        setError('Please enter your email address');
      } else if (result.status === 'needs_first_factor') {
        // Move to the password step
        setStep('password');
      } else {
        console.log('Unexpected sign-in status:', result.status);
      }
    } catch (err: any) {
      console.error('Error during sign-in:', err);
      setError(err.message || 'An error occurred during sign-in');
    } finally {
      setLoading(false);
    }
  };

  // Handle the password step
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Attempt to complete the sign-in with the password
      const result = await signIn.attemptFirstFactor({
        strategy: 'password',
        password,
      });

      if (result.status === 'complete') {
        // Sign-in successful, set the active session
        await setActive({ session: result.createdSessionId });
        // Redirect to the home page
        navigate('/');
      } else {
        console.log('Unexpected sign-in completion status:', result.status);
        setError('An unexpected error occurred');
      }
    } catch (err: any) {
      console.error('Error completing sign-in:', err);
      setError(err.message || 'An error occurred during sign-in');
    } finally {
      setLoading(false);
    }
  };

  // Render the email step
  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ff3b9a] hover:bg-[#ff3b9a]/80 text-white w-full py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Continuing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    );
  }

  // Render the password step
  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="text-[#ff3b9a] text-sm font-medium"
          >
            Change Email
          </button>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#ff3b9a] hover:bg-[#ff3b9a]/80 text-white w-full py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
