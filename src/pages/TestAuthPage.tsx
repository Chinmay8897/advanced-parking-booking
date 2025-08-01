import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const TestAuthPage = () => {
  const { user, loading } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  const testLogin = async () => {
    try {
      setTestResult(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      setTestResult({ data, error });
      
      if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      setTestResult({ error: err });
    }
  };

  const checkUsers = async () => {
    try {
      // This will only work if you have admin access
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } else {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error checking users:', err);
      setUsers([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Auth State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
            {session && (
              <details className="mt-2">
                <summary className="cursor-pointer">Session Details</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Test Login */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="password"
              />
            </div>
            <button
              onClick={testLogin}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Test Login
            </button>
            
            {testResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <p><strong>SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</p>
            <p><strong>SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Full URL</summary>
              <p className="text-xs bg-gray-100 p-2 mt-2 rounded break-all">
                {import.meta.env.VITE_SUPABASE_URL}
              </p>
            </details>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
            <button
              onClick={checkUsers}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Check Users (Admin Only)
            </button>
            
            {users.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Users:</h3>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Status:</strong> {user.email_confirmed_at ? 'Confirmed' : 'Pending'}</p>
                      <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage; 