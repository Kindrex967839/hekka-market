/**
 * This script adds a global event listener to handle factor-one redirects
 * It will be executed when the application loads
 */

// Function to check if the current URL contains 'factor-one' and redirect if needed
function checkAndRedirectFactorOne() {
  if (window.location.pathname.includes('factor-one')) {
    console.log('Detected factor-one path, redirecting to sign-in...');
    window.location.href = '/sign-in';
  }
}

// Check immediately when the script loads
checkAndRedirectFactorOne();

// Also add an event listener for popstate events (browser navigation)
window.addEventListener('popstate', checkAndRedirectFactorOne);

// Export an empty object to satisfy TypeScript module requirements
export {};
