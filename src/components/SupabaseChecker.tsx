import { useState, useEffect } from 'react';
import { checkSupabaseProject } from '../utils/checkSupabase';

const SupabaseChecker = () => {
  const [checkResult, setCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const result = await checkSupabaseProject();
      setCheckResult(result);
    } catch (err: any) {
      setCheckResult({
        success: false,
        message: err.message || 'An error occurred checking Supabase',
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run the check when the component mounts
    runCheck();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Supabase Project Check</h2>
      
      <div className="space-y-4">
        <button
          onClick={runCheck}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Supabase Project'}
        </button>
        
        {checkResult && (
          <div className="mt-4">
            <div className={`p-4 rounded ${checkResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {checkResult.success ? '✅ Connected' : '❌ Connection Failed'}
                  </p>
                  <p className="text-sm mt-1">{checkResult.message}</p>
                  {checkResult.details && (
                    <p className="text-sm mt-1 text-gray-700">{checkResult.details}</p>
                  )}
                </div>
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {expanded ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {expanded && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Connection Details:</h3>
                  <div className="bg-white p-3 rounded border text-sm">
                    <p><strong>Project ID:</strong> {checkResult.projectId || 'Unknown'}</p>
                    <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
                    <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 
                      `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 10)}...` : 'Not set'}</p>
                    
                    {checkResult.error && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Error Details:</h4>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(checkResult.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm">
                    <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Verify your Supabase project is active and not paused</li>
                      <li>Check that your environment variables are correct</li>
                      <li>Ensure your database has the proper permissions set up</li>
                      <li>Verify that Row Level Security (RLS) policies are configured correctly</li>
                      <li>Check if your IP is allowed if you have network restrictions</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseChecker;