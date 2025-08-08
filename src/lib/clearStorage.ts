/**
 * Utility to clear browser storage and fix login issues
 */

export function clearAllStorage() {
  console.log('🧹 Clearing all browser storage...');
  
  try {
    // Clear localStorage
    const localStorageKeys = Object.keys(localStorage);
    console.log('LocalStorage keys to clear:', localStorageKeys);
    localStorage.clear();
    console.log('✅ LocalStorage cleared');
    
    // Clear sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    console.log('SessionStorage keys to clear:', sessionStorageKeys);
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared');
    
    // Clear IndexedDB (Supabase sometimes uses this)
    if ('indexedDB' in window) {
      const dbs = ['supabase-auth', 'supabase-cache', 'localforage'];
      dbs.forEach((db) => {
        try {
          const req = indexedDB.deleteDatabase(db);
          req.onsuccess = () => console.log(`✅ IndexedDB database deleted: ${db}`);
          req.onerror = () => console.warn(`⚠️ Failed to delete IndexedDB database: ${db}`);
          req.onblocked = () => console.warn(`⚠️ Deletion blocked for IndexedDB database: ${db}`);
        } catch (e) {
          console.warn('IndexedDB deletion error for', db, e);
        }
      });
    }
    
    console.log('🎉 Storage clearing completed!');
    return {
      success: true,
      message: 'All browser storage cleared successfully',
      clearedItems: {
        localStorage: localStorageKeys.length,
        sessionStorage: sessionStorageKeys.length
      }
    };
    
  } catch (error: any) {
    console.error('❌ Error clearing storage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function clearSupabaseStorage() {
  console.log('🧹 Clearing Supabase-specific storage...');
  
  try {
    const keysToRemove: string[] = [];
    
    // Find and remove Supabase-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('token') ||
        key.includes('session')
      )) {
        keysToRemove.push(key);
      }
    }
    
    console.log('Supabase keys to remove:', keysToRemove);
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Also clear sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('token') ||
        key.includes('session')
      )) {
        sessionStorage.removeItem(key);
        keysToRemove.push(key);
      }
    }
    
    console.log('✅ Supabase storage cleared');
    return {
      success: true,
      message: 'Supabase storage cleared successfully',
      clearedKeys: keysToRemove
    };
    
  } catch (error: any) {
    console.error('❌ Error clearing Supabase storage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default { clearAllStorage, clearSupabaseStorage };
