import React, { useState } from 'react';
import { checkBucketExists, createProductImagesBucket } from 'utils/refreshBucket';
import { supabase } from 'utils/supabaseClient';
import { createProductImagesPolicies, createBucketsPolicies } from 'utils/storagePolicies';

export function BucketDebugger() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);
  const [testUploadLoading, setTestUploadLoading] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState<any>(null);

  const handleCheckBucket = async () => {
    setLoading(true);
    try {
      const checkResult = await checkBucketExists();
      setResult(checkResult);
    } catch (error) {
      setResult({ error });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    setCreateLoading(true);
    try {
      const createResult = await createProductImagesBucket();
      setCreateResult(createResult);

      // If successful, check the bucket again
      if (createResult.success) {
        handleCheckBucket();
      }
    } catch (error) {
      setCreateResult({ error });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleTestUpload = async () => {
    setTestUploadLoading(true);
    try {
      // Create a small test file
      const testFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      // Try to upload to the bucket
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload('test-upload.txt', testFile, { upsert: true });

      setTestUploadResult({ success: !error, data, error });

      if (!error) {
        console.log('Test upload successful!');
      } else {
        console.error('Test upload failed:', error);
      }
    } catch (error) {
      setTestUploadResult({ success: false, error });
      console.error('Exception during test upload:', error);
    } finally {
      setTestUploadLoading(false);
    }
  };

  const handleForceAccept = () => {
    // Force the app to accept that the bucket exists
    localStorage.setItem('bucket-exists', 'true');
    window.location.reload();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Bucket Debugger</h2>

      <div className="space-y-6">
        <div>
          <button
            onClick={handleCheckBucket}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-4 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Bucket Status'}
          </button>

          <button
            onClick={handleRefreshPage}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Refresh Page
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Check Result:</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {!result.exists && !result.error && (
              <div className="mt-4">
                <p className="mb-2">The bucket doesn't exist. Would you like to create it?</p>
                <button
                  onClick={handleCreateBucket}
                  disabled={createLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Bucket'}
                </button>
              </div>
            )}
          </div>
        )}

        {createResult && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Create Result:</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(createResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleTestUpload}
            disabled={testUploadLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md mr-4 disabled:opacity-50"
          >
            {testUploadLoading ? 'Testing...' : 'Test Upload to Bucket'}
          </button>

          <button
            onClick={handleForceAccept}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Force Accept Bucket Exists
          </button>
        </div>

        {testUploadResult && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Upload Test Result:</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(testUploadResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
          <h3 className="font-bold text-blue-800 mb-2">Troubleshooting Tips:</h3>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>Make sure the bucket name is exactly "product-images" (all lowercase with a hyphen)</li>
            <li>Check that your Supabase credentials in .env.local are correct</li>
            <li>Verify that your Supabase project is active and running</li>
            <li>Check that your Supabase storage is enabled</li>
            <li>Make sure you have the necessary permissions to create buckets</li>
            <li>You may need to set up proper RLS policies for the storage.buckets table</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">RLS Policies for Storage</h3>
          <p className="mb-4">If you're having permission issues, you may need to set up the following RLS policies in your Supabase SQL editor:</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Policies for storage.objects table:</h4>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
              {createProductImagesPolicies}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Policies for storage.buckets table:</h4>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
              {createBucketsPolicies}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
