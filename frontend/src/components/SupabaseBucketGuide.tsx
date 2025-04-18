import React, { useState } from 'react';
import { BucketDebugger } from './BucketDebugger';
import { createProductImagesPolicies, createBucketsPolicies } from 'utils/storagePolicies';

export function SupabaseBucketGuide() {
  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Creating the product-images Bucket in Supabase</h2>

      <p className="mb-4">
        To enable image uploads in the application, you need to create a storage bucket in your Supabase project.
        Follow these steps:
      </p>

      <ol className="list-decimal pl-6 mb-6 space-y-2">
        <li>Log in to your Supabase dashboard at <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://app.supabase.com</a></li>
        <li>Select your project</li>
        <li>In the left sidebar, click on <strong>Storage</strong></li>
        <li>Click the <strong>New Bucket</strong> button</li>
        <li>Enter <code className="bg-gray-100 px-2 py-1 rounded">product-images</code> as the bucket name</li>
        <li>Enable the <strong>Public</strong> option if you want the images to be publicly accessible</li>
        <li>Click <strong>Create bucket</strong></li>
      </ol>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Why can't the application create the bucket automatically?</h3>
        <p className="text-blue-700">
          Creating storage buckets in Supabase requires admin privileges, which are not available to client-side applications
          for security reasons. This is why the bucket needs to be created manually through the Supabase dashboard.
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Setting Up RLS Policies</h3>
        <p className="text-yellow-700 mb-2">
          After creating the bucket, you need to set up Row Level Security (RLS) policies to allow access to the bucket.
          Go to the SQL Editor in your Supabase dashboard and run the following SQL commands:
        </p>

        <div className="mb-3">
          <h4 className="font-semibold mb-1 text-yellow-800">1. Policies for storage.objects table:</h4>
          <pre className="bg-white p-3 rounded overflow-auto text-sm border border-yellow-300">
            {createProductImagesPolicies}
          </pre>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold mb-1 text-yellow-800">2. Policies for storage.buckets table:</h4>
          <pre className="bg-white p-3 rounded overflow-auto text-sm border border-yellow-300">
            {createBucketsPolicies}
          </pre>
        </div>
      </div>

      <div className="mt-6 mb-6">
        <p className="font-medium">After creating the bucket, refresh this page to continue using the application.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Refresh Page
        </button>
      </div>

      <div className="border-t pt-6">
        <button
          onClick={() => setShowDebugger(!showDebugger)}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {showDebugger ? 'Hide Advanced Debugging' : 'Show Advanced Debugging'}
        </button>

        {showDebugger && (
          <div className="mt-4">
            <BucketDebugger />
          </div>
        )}
      </div>
    </div>
  );
}
