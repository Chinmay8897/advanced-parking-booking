import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { debugAuthIssues, testUserLogin, checkEmailConfirmationSettings } from '../utils/debugAuth';
import { runLoginDiagnostic, testRegisteredUserLogin, LoginDiagnosticResult } from '../utils/loginDiagnostic';

const DebugAuthPage = () => {
  const { user, loading } = useAuth();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [loginTestResults, setLoginTestResults] = useState<any>(null);
  const [emailConfirmationInfo, setEmailConfirmationInfo] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<LoginDiagnosticResult[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  useEffect(() => {
    runDebugChecks();
    checkEmailSettings();
  }, []);

  const runDebugChecks = async () => {
    setIsRunningTests(true);
    try {
      const results = await debugAuthIssues();
      setDebugResults(results);
    } catch (error) {
      console.error('Debug check failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const checkEmailSettings = async () => {
    try {
      const info = await checkEmailConfirmationSettings();
      setEmailConfirmationInfo(info);
    } catch (error) {
      console.error('Email confirmation check failed:', error);
    }
  };

  const testLogin = async () => {
    if (!testEmail || !testPassword) {
      alert('Please enter both email and password');
      return;
    }

    setIsRunningTests(true);
    try {
      const results = await testUserLogin(testEmail, testPassword);
      setLoginTestResults(results);
    } catch (error) {
      console.error('Login test failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runComprehensiveDiagnostic = async () => {
    if (!testEmail || !testPassword) {
      alert('Please enter both email and password for testing');
      return;
    }
    
    setIsRunningDiagnostic(true);
    try {
      const results = await runLoginDiagnostic(testEmail, testPassword);
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Diagnostic failed:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const runTestUserDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const { testUser, results } = await testRegisteredUserLogin();
      setTestEmail(testUser.email);
      setTestPassword(testUser.password);
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Test user diagnostic failed:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const getStepStatus = (passed: boolean) => {
    return passed ? '✅' : '❌';
  };

  const getStepClass = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      
      {/* Current User Status */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
          <p><strong>User Name:</strong> {user?.name || 'Not set'}</p>
        </div>
      </div>

      {/* System Debug Results */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">System Debug Results</h2>
        <button
          onClick={runDebugChecks}
          disabled={isRunningTests}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunningTests ? 'Running...' : 'Run Debug Checks'}
        </button>
        
        {debugResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded ${debugResults.environmentCheck ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-semibold">Environment {getStepStatus(debugResults.environmentCheck)}</p>
              </div>
              <div className={`p-3 rounded ${debugResults.connectionCheck ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-semibold">Connection {getStepStatus(debugResults.connectionCheck)}</p>
              </div>
              <div className={`p-3 rounded ${debugResults.authConfigCheck ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-semibold">Auth Config {getStepStatus(debugResults.authConfigCheck)}</p>
              </div>
              <div className={`p-3 rounded ${debugResults.profileTableCheck ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-semibold">Profile Table {getStepStatus(debugResults.profileTableCheck)}</p>
              </div>
            </div>
            
            {debugResults.issues.length > 0 && (
              <div className="bg-red-50 p-4 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Issues Found:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {debugResults.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-red-700">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {debugResults.recommendations.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-semibold text-yellow-800 mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {debugResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-yellow-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Confirmation Settings */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Email Confirmation Settings</h2>
        {emailConfirmationInfo && (
          <div className="space-y-2">
            <p><strong>Requires Email Confirmation:</strong> 
              <span className={emailConfirmationInfo.requiresConfirmation ? 'text-red-600' : 'text-green-600'}>
                {emailConfirmationInfo.requiresConfirmation ? 'Yes' : 'No'}
              </span>
            </p>
            {emailConfirmationInfo.error && (
              <p className="text-red-600"><strong>Error:</strong> {emailConfirmationInfo.error}</p>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Details</summary>
              <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                {JSON.stringify(emailConfirmationInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Login Test */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Test User Login</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter email to test"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter password to test"
              />
            </div>
          </div>
          <button
            onClick={testLogin}
            disabled={isRunningTests}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isRunningTests ? 'Testing...' : 'Test Login'}
          </button>
          
          {loginTestResults && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Login Test Results:</h3>
              <div className="space-y-2">
                <div className={getStepClass(loginTestResults.step1_validation)}>
                  {getStepStatus(loginTestResults.step1_validation)} Step 1: Input Validation
                </div>
                <div className={getStepClass(loginTestResults.step2_auth_attempt)}>
                  {getStepStatus(loginTestResults.step2_auth_attempt)} Step 2: Authentication Attempt
                </div>
                <div className={getStepClass(loginTestResults.step3_session_created)}>
                  {getStepStatus(loginTestResults.step3_session_created)} Step 3: Session Created
                </div>
                <div className={getStepClass(loginTestResults.step4_user_confirmed)}>
                  {getStepStatus(loginTestResults.step4_user_confirmed)} Step 4: Email Confirmed
                </div>
                <div className={getStepClass(loginTestResults.step5_profile_exists)}>
                  {getStepStatus(loginTestResults.step5_profile_exists)} Step 5: Profile Exists
                </div>
              </div>
              
              {loginTestResults.error && (
                <div className="bg-red-50 p-3 rounded mt-4">
                  <p className="text-red-800 font-semibold">Error:</p>
                  <p className="text-red-700">{loginTestResults.error.message || JSON.stringify(loginTestResults.error)}</p>
                </div>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Full Test Details</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(loginTestResults, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Common Issues and Solutions */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Common Login Issues & Solutions</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">Issue: Email not confirmed</h3>
            <p className="text-gray-600">Users must confirm their email before logging in.</p>
            <p className="text-sm text-blue-600">Solution: Check Supabase Auth settings and disable email confirmation for development, or ensure users confirm emails.</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">Issue: Profile not created</h3>
            <p className="text-gray-600">User authenticated but profile record missing in database.</p>
            <p className="text-sm text-green-600">Solution: Ensure profile creation during registration or implement auto-creation during login.</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold">Issue: RLS Policies</h3>
            <p className="text-gray-600">Row Level Security preventing profile access.</p>
            <p className="text-sm text-yellow-600">Solution: Check and update RLS policies for profiles table.</p>
          </div>
          
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold">Issue: Case sensitivity</h3>
            <p className="text-gray-600">Email case mismatch between auth and profile records.</p>
            <p className="text-sm text-red-600">Solution: Normalize emails to lowercase in both registration and login.</p>
          </div>
        </div>
      </div>

      {/* Comprehensive Login Diagnostic */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">🔍 Comprehensive Login Diagnostic</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Test with Specific User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter test email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password:</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter test password"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={runComprehensiveDiagnostic}
                disabled={isRunningDiagnostic}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunningDiagnostic ? 'Running...' : 'Run Diagnostic'}
              </button>
              <button
                onClick={runTestUserDiagnostic}
                disabled={isRunningDiagnostic}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isRunningDiagnostic ? 'Running...' : 'Test with Demo User'}
              </button>
            </div>
          </div>

          {diagnosticResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Diagnostic Results</h3>
              <div className="space-y-2">
                {diagnosticResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? '✅' : '❌'}
                      </span>
                      <strong>{result.step}</strong>
                    </div>
                    {result.error && (
                      <div className="text-red-600 text-sm mt-1">
                        Error: {result.error}
                      </div>
                    )}
                    {result.details && (
                      <div className="text-gray-600 text-sm mt-1">
                        <details>
                          <summary className="cursor-pointer">Details</summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugAuthPage;