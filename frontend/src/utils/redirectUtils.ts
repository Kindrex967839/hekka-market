/**
 * Utility functions for handling redirects
 */

/**
 * Checks if the current URL contains 'factor-one' and redirects to sign-in if needed
 * @returns {boolean} True if a redirect was performed, false otherwise
 */
export function checkAndRedirectFactorOne(): boolean {
  if (window.location.pathname.includes('factor-one')) {
    console.log('Detected factor-one path, redirecting to sign-in...');
    window.location.href = '/sign-in';
    return true;
  }
  return false;
}

/**
 * Adds a global event listener to handle factor-one redirects
 */
export function setupFactorOneRedirectListener(): void {
  // Check immediately
  checkAndRedirectFactorOne();
  
  // Also add an event listener for popstate events (browser navigation)
  window.addEventListener('popstate', () => {
    checkAndRedirectFactorOne();
  });
  
  // Add an event listener for before unload to catch navigation
  window.addEventListener('beforeunload', () => {
    // Store the current URL in session storage
    sessionStorage.setItem('lastUrl', window.location.href);
  });
  
  // Check if we're coming back from a redirect
  window.addEventListener('load', () => {
    const lastUrl = sessionStorage.getItem('lastUrl');
    if (lastUrl && lastUrl.includes('factor-one')) {
      console.log('Detected return from factor-one path, redirecting to sign-in...');
      window.location.href = '/sign-in';
    }
  });
}
