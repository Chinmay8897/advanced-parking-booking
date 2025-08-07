import { useState, useEffect } from 'react';
import { checkSupabaseStatus, getSupabaseRecommendations } from '../utils/supabaseStatus';

const SupabaseStatus = () => {
  const [statusResult, setStatusResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await checkSupabaseStatus();
      setStatusResult(result);
      setRecommendations(getSupabaseRecommendations(result));
    } catch (err: any) {
      setStatusResult({
        status: 'error',
        active: false,
        message: err.message || 'An error occurred checking Supabase status',
        error: err
      });
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run the check when the component mounts
    checkStatus();
  }, []);

  const getStatusBadge = () => {
    if (!statusResult) return null;
    
    const badgeClasses = {
      active: 'bg-green-100 text-green-800',
      permission_denied: 'bg-yellow-100 text-yellow-800',
      connection_failed: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800',
      exception: 'bg-red-100 text-red-800'
    };
    
    const badgeText = {
      active: 'Active',
      permission_denied: 'Permission Issue',
      connection_failed: 'Connection Failed',
      error: 'Error',
      exception: 'Exception'
    };
    
    const classes = badgeClasses[statusResult.status as keyof typeof badgeClasses] || 'bg-gray-100 text-gray-800';
    const text = badgeText[statusResult.status as keyof typeof badgeText] || 'Unknown';
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${classes}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Supabase Project Status</h2>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-4">
        <button
          onClick={checkStatus}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
        
        {statusResult && (
          <div className="mt-4">
            <div className={`p-4 rounded ${statusResult.active ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {statusResult.active ? '✅ Project is responding' : '❌ Project is not responding'}
                  </p>
                  <p className="text-sm mt-1">{statusResult.message}</p>
                  {statusResult.details && (
                    <p className="text-sm mt-1 text-gray-700">{statusResult.details}</p>
                  )}
                  {statusResult.responseTime && (
                    <p className="text-xs mt-1 text-gray-500">Response time: {statusResult.responseTime}ms</p>
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
                  <h3 className="text-sm font-semibold mb-2">Project Details:</h3>
                  <div className="bg-white p-3 rounded border text-sm">
                    <p><strong>Project ID:</strong> {statusResult.projectId || 'Unknown'}</p>
                    <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
                    <p><strong>Status:</strong> {statusResult.status}</p>
                    
                    {statusResult.error && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Error Details:</h4>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(statusResult.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {recommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded">
                      <h4 className="font-semibold text-blue-800">{rec.title}</h4>
                      <p className="text-sm mt-1">{rec.description}</p>
                      {rec.steps && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Steps:</p>
                          <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                            {rec.steps.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseStatus;