/**
 * Loads the Intercom script and sets up initial settings to avoid race conditions.
 * @param {string} appId - Your Intercom App ID.
 */
export const loadIntercom = (appId) => {
  // Don't load if script already exists or if not in a browser environment
  if (typeof window === 'undefined' || window.Intercom) {
    return;
  }

  // Set up the Intercom function queue
  window.Intercom = function() {
    (window.Intercom.q = window.Intercom.q || []).push(arguments);
  };

  // Set the app_id on window.intercomSettings BEFORE loading the script
  // This is the crucial step to prevent the race condition.
  window.intercomSettings = {
    app_id: appId,
  };

  // Create and inject the script tag
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${appId}`;
  
  script.onload = () => {
    console.log(`Intercom script loaded successfully for app: ${appId}`);
    // The Intercom script will automatically boot with window.intercomSettings.

    // Add a listener for when the user opens the messenger
    window.Intercom('onShow', () => {
      const currentPage = window.location.href;
      console.log(`Intercom messenger opened. Updating 'Last Page URL' to: ${currentPage}`);
      window.Intercom('update', { 
        'Last Page URL': currentPage 
      });
    });
  };

  script.onerror = () => {
    console.error('Failed to load the Intercom script.');
  };

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
};
