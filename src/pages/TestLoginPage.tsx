import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { testParkingAccess } from '../utils/testLogin';
import { testRegistrationLoginFlow, quickLoginTest } from '../utils/testRegistrationLogin';
import { runBasicDiagnostics, quickAuthTest } from '../utils/diagnostics';
import debugEnvironmentVariables from '../utils/envDebug';
import { testSupabaseConnectivity, testSupabaseClientDirectly } from '../utils/networkTest';
import { testClientCreationOnly, testAuthServiceOnly } from '../utils/simpleTest';
import testWithHardcodedValues from '../utils/hardcodedTest';
import { clearAllStorage, clearSupabaseStorage } from '../lib/clearStorage';

const TestLoginPage = () => {
  const { user, logout } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testName, setTestName] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [regTestResults, setRegTestResults] = useState<any>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runLoginTest = async () => {
    if (!testEmail || !testPassword) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    setTestResults(null);
    console.log('=== Starting Login Test ===');
    console.log('Email:', testEmail);
    console.log('Password length:', testPassword.length);

    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      console.error('Login test timed out after 30 seconds');
      setTestResults({
        error: 'Test timed out after 30 seconds. This usually indicates a network issue or Supabase configuration problem.'
      });
      setLoading(false);
    }, 30000);

    try {
      console.log('Step 1: Running quick login test...');
      const loginResult = await Promise.race([
        quickLoginTest(testEmail, testPassword),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login test timeout')), 15000)
        )
      ]) as any;
      
      console.log('Step 1 completed:', loginResult);
      
      if (loginResult.success) {
        console.log('Step 2: Login test passed, now testing parking access...');
        const parkingResult = await Promise.race([
          testParkingAccess(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Parking test timeout')), 10000)
          )
        ]) as any;
        
        console.log('Step 2 completed:', parkingResult);
        
        setTestResults({
          login: loginResult,
          parking: parkingResult
        });
      } else {
        console.log('Login test failed, skipping parking test');
        setTestResults({
          login: loginResult,
          parking: null
        });
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Test failed with error:', error);
      setTestResults({
        error: error instanceof Error ? error.message : 'Test failed with unknown error',
        details: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : 'No stack trace'
        }
      });
    } finally {
      setLoading(false);
      console.log('=== Login Test Completed ===');
    }
  };

  const runRegistrationTest = async () => {
    if (!testEmail || !testPassword || !testName) {
      alert('Please enter name, email, and password for registration test');
      return;
    }

    setLoading(true);
    setRegTestResults(null);
    console.log('=== Starting Registration Test ===');
    console.log('Name:', testName);
    console.log('Email:', testEmail);
    console.log('Password length:', testPassword.length);

    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      console.error('Registration test timed out after 60 seconds');
      setRegTestResults({
        error: 'Test timed out after 60 seconds. This usually indicates a network issue or Supabase configuration problem.'
      });
      setLoading(false);
    }, 60000);

    try {
      console.log('Starting registration-login flow test...');
      const results = await Promise.race([
        testRegistrationLoginFlow(testEmail, testPassword, testName),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Registration flow timeout')), 45000)
        )
      ]) as any;
      
      console.log('Registration test completed:', results);
      setRegTestResults(results);
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Registration test failed with error:', error);
      setRegTestResults({
        error: error instanceof Error ? error.message : 'Registration test failed with unknown error',
        details: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : 'No stack trace'
        }
      });
    } finally {
      setLoading(false);
      console.log('=== Registration Test Completed ===');
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnosticResults(null);
    console.log('=== Starting Diagnostics ===');

    try {
      const results = await runBasicDiagnostics();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnosticResults({
        error: error instanceof Error ? error.message : 'Diagnostics failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const runQuickAuth = async () => {
    if (!testEmail || !testPassword) {
      alert('Please enter email and password first');
      return;
    }

    setLoading(true);
    setTestResults(null);
    console.log('=== Starting Quick Auth Test ===');

    try {
      const result = await quickAuthTest(testEmail, testPassword);
      setTestResults({
        quickAuth: result
      });
    } catch (error) {
      console.error('Quick auth test failed:', error);
      setTestResults({
        error: error instanceof Error ? error.message : 'Quick auth test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setTestResults(null);
    setRegTestResults(null);
    setDiagnosticResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login Test Page</h1>
          
          {/* Current User Status */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current User Status</h2>
            {user ? (
              <div>
                <p className="text-green-600">✅ User is logged in</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.name || 'Not set'}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <button
                  onClick={handleLogout}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <p className="text-red-600">❌ No user logged in</p>
            )}
          </div>

          {/* Test Login Form */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Test User Authentication</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Test Name (for registration test)
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Test Email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Test Password
                </label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={runDiagnostics}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : '🔍 Run Diagnostics'}
                </button>
                <button
                  onClick={() => {
                    console.clear();
                    const result = debugEnvironmentVariables();
                    alert(`Environment Debug:\nURL: ${result.hasUrl ? 'Found' : 'Missing'}\nKey: ${result.hasKey ? 'Found' : 'Missing'}\nKey Length: ${result.keyLength}\nCheck console for details`);
                  }}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  🐛 Debug Env Vars
                </button>
                <button
                  onClick={async () => {
                    console.clear();
                    setLoading(true);
                    try {
                      const networkResult = await testSupabaseConnectivity();
                      const clientResult = await testSupabaseClientDirectly();
                      
                      setDiagnosticResults(`Network Test Results:\n\nConnectivity: ${networkResult.success ? 'SUCCESS' : 'FAILED'}\nClient Test: ${clientResult.success ? 'SUCCESS' : 'FAILED'}\n\nCheck console for detailed logs`);
                    } catch (error: any) {
                      setDiagnosticResults(`Network test failed: ${error.message}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : '🌐 Network Test'}
                </button>
                <button
                  onClick={async () => {
                    console.clear();
                    setLoading(true);
                    try {
                      console.log('Running simple client creation test...');
                      const clientTest = await testClientCreationOnly();
                      console.log('Running auth service test...');
                      const authTest = await testAuthServiceOnly();
                      
                      setDiagnosticResults(`Simple Tests:\n\nClient Creation: ${clientTest.success ? 'SUCCESS' : 'FAILED'}\nAuth Service: ${authTest.success ? 'SUCCESS' : 'FAILED'}\n\nClient Error: ${clientTest.error || 'None'}\nAuth Error: ${authTest.error || 'None'}\n\nCheck console for details`);
                    } catch (error: any) {
                      setDiagnosticResults(`Simple test failed: ${error.message}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : '⚙️ Simple Test'}
                </button>
                <button
                  onClick={async () => {
                    console.clear();
                    setLoading(true);
                    try {
                      console.log('Running hardcoded values test...');
                      const result = await testWithHardcodedValues();
                      
                      setDiagnosticResults(`Hardcoded Test:\n\nResult: ${result.success ? 'SUCCESS' : 'FAILED'}\nError: ${result.error || 'None'}\nMessage: ${result.message || 'None'}\n\nCheck console for details`);
                    } catch (error: any) {
                      setDiagnosticResults(`Hardcoded test failed: ${error.message}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : '🔧 Hardcoded Test'}
                </button>
                <button
                  onClick={() => {
                    const result = clearSupabaseStorage();
                    alert(`Supabase Storage Cleared!\n\nSuccess: ${result.success}\nCleared ${result.clearedKeys?.length || 0} keys\n\nTry logging in again!`);
                    // Refresh the page after clearing storage
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                >
                  🧽 Clear Storage
                </button>
                <button
                  onClick={() => {
                    const result = clearAllStorage();
                    alert(`All Storage Cleared!\n\nSuccess: ${result.success}\nLocalStorage: ${result.clearedItems?.localStorage || 0} items\nSessionStorage: ${result.clearedItems?.sessionStorage || 0} items\n\nPage will refresh...`);
                    // Refresh the page after clearing storage
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  🗑️ Clear All Storage
                </button>
                <button
                  onClick={runQuickAuth}
                  disabled={loading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : '⚡ Quick Auth Test'}
                </button>
                <button
                  onClick={runLoginTest}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Existing User Login'}
                </button>
                <button
                  onClick={runRegistrationTest}
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Registration → Login Flow'}
                </button>
              </div>
            </div>
          </div>

          {/* Diagnostic Results */}
          {diagnosticResults && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">🔍 Diagnostic Results</h2>
              <div className="space-y-4">
                
                {/* Environment Check */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Environment Variables</h3>
                  <div className={diagnosticResults.environment?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{diagnosticResults.environment?.success ? '✅' : '❌'} {diagnosticResults.environment?.message}</p>
                    {diagnosticResults.environment?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        {JSON.stringify(diagnosticResults.environment.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Supabase Connection */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Supabase Connection</h3>
                  <div className={diagnosticResults.supabaseConnection?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{diagnosticResults.supabaseConnection?.success ? '✅' : '❌'} {diagnosticResults.supabaseConnection?.message}</p>
                    {diagnosticResults.supabaseConnection?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        Duration: {diagnosticResults.supabaseConnection.details.duration}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Auth Service */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Auth Service</h3>
                  <div className={diagnosticResults.authService?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{diagnosticResults.authService?.success ? '✅' : '❌'} {diagnosticResults.authService?.message}</p>
                    {diagnosticResults.authService?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        Duration: {diagnosticResults.authService.details.duration}
                        {diagnosticResults.authService.details.hasSession !== undefined && 
                          `\nHas Session: ${diagnosticResults.authService.details.hasSession}`
                        }
                      </pre>
                    )}
                  </div>
                </div>

                {/* Database Access */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Database Access</h3>
                  <div className={diagnosticResults.databaseAccess?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{diagnosticResults.databaseAccess?.success ? '✅' : '❌'} {diagnosticResults.databaseAccess?.message}</p>
                    {diagnosticResults.databaseAccess?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        Duration: {diagnosticResults.databaseAccess.details.duration}
                        {diagnosticResults.databaseAccess.details.recordCount !== undefined && 
                          `\nRecord Count: ${diagnosticResults.databaseAccess.details.recordCount}`
                        }
                      </pre>
                    )}
                  </div>
                </div>

                {/* General Error */}
                {diagnosticResults.error && (
                  <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <p className="text-red-600">❌ Diagnostic Error: {diagnosticResults.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                {testResults.quickAuth ? '⚡ Quick Auth Test Results' : 'Existing User Login Test Results'}
              </h2>
              <div className="space-y-4">
                
                {/* Quick Auth Results */}
                {testResults.quickAuth && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Quick Auth Test</h3>
                    <div className={testResults.quickAuth.success ? 'text-green-600' : 'text-red-600'}>
                      <p>{testResults.quickAuth.success ? '✅' : '❌'} {testResults.quickAuth.message}</p>
                      {testResults.quickAuth.details && (
                        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                          {JSON.stringify(testResults.quickAuth.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Login Test Results */}
                {testResults.login && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Login Test</h3>
                    <div className={testResults.login.success ? 'text-green-600' : 'text-red-600'}>
                      <p>{testResults.login.success ? '✅' : '❌'} {testResults.login.message}</p>
                      {testResults.login.details && (
                        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                          {JSON.stringify(testResults.login.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Parking Access Test Results */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Parking Access Test</h3>
                  {testResults.parking ? (
                    <div>
                      {testResults.parking.success ? (
                        <div className="text-green-600">
                          <p>✅ Can access parking booking features!</p>
                          <p><strong>Message:</strong> {testResults.parking.message}</p>
                          {testResults.parking.sampleData && (
                            <p><strong>Sample Data:</strong> {JSON.stringify(testResults.parking.sampleData, null, 2)}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-600">
                          <p>❌ Cannot access parking features</p>
                          <p><strong>Error:</strong> {testResults.parking.error}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Parking access not tested (login failed)</p>
                  )}
                </div>

                {/* General Error */}
                {testResults.error && (
                  <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <p className="text-red-600">❌ Test Error: {testResults.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration-Login Flow Test Results */}
          {regTestResults && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Registration → Login Flow Test Results</h2>
              <div className="space-y-4">
                
                {/* Cleanup Results */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Step 1: Cleanup</h3>
                  <div className={regTestResults.cleanup?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{regTestResults.cleanup?.success ? '✅' : '❌'} {regTestResults.cleanup?.message}</p>
                  </div>
                </div>

                {/* Registration Results */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Step 2: Registration</h3>
                  <div className={regTestResults.registration?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{regTestResults.registration?.success ? '✅' : '❌'} {regTestResults.registration?.message}</p>
                    {regTestResults.registration?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        {JSON.stringify(regTestResults.registration.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Profile Check Results */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Step 3: Profile Creation</h3>
                  <div className={regTestResults.profileCheck?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{regTestResults.profileCheck?.success ? '✅' : '❌'} {regTestResults.profileCheck?.message}</p>
                  </div>
                </div>

                {/* Login Results */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Step 4: Login Test</h3>
                  <div className={regTestResults.login?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{regTestResults.login?.success ? '✅' : '❌'} {regTestResults.login?.message}</p>
                    {regTestResults.login?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        {JSON.stringify(regTestResults.login.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Final Check Results */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Step 5: Profile Access After Login</h3>
                  <div className={regTestResults.finalCheck?.success ? 'text-green-600' : 'text-red-600'}>
                    <p>{regTestResults.finalCheck?.success ? '✅' : '❌'} {regTestResults.finalCheck?.message}</p>
                  </div>
                </div>

                {/* General Error */}
                {regTestResults.error && (
                  <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <p className="text-red-600">❌ Test Error: {regTestResults.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium mb-2">Instructions</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>If buttons are stuck on "Testing...":</strong></li>
              <li>1. First click "🔍 Run Diagnostics" to check your setup</li>
              <li>2. Then try "⚡ Quick Auth Test" for a simple auth check</li>
              <li>3. Check the browser console (F12) for error messages</li>
              <li></li>
              <li><strong>For Existing Users:</strong></li>
              <li>1. Enter the email and password of an existing registered user</li>
              <li>2. Click "Test Existing User Login" to verify login works</li>
              <li></li>
              <li><strong>For New User Registration:</strong></li>
              <li>1. Enter a name, email, and password for a NEW user (use a unique email)</li>
              <li>2. Click "Test Registration → Login Flow" to test the complete flow</li>
              <li>3. This will: register the user → create profile → test login → verify access</li>
              <li></li>
              <li>4. Green checkmarks (✅) indicate success, red X marks (❌) indicate issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLoginPage;
