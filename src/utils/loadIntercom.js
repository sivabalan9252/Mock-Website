/**
 * Loads the Intercom script and sets up initial settings to avoid race conditions.
 * @param {string} appId - Your Intercom App ID.
 */
export const loadIntercom = (appId) => {
  // Don't load if script already exists or if not in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // If Intercom is already loaded, just update
  if (window.Intercom && typeof window.Intercom === 'function' && !window.Intercom.q) {
    return;
  }

  // Set up the Intercom function queue
  var w = window;
  var ic = w.Intercom;
  if (typeof ic === 'function') {
    ic('reattach_activator');
    ic('update', w.intercomSettings);
  } else {
    var i = function () { i.c(arguments); };
    i.q = [];
    i.c = function (args) { i.q.push(args); };
    w.Intercom = i;
  }

  // Set the app_id on window.intercomSettings BEFORE loading the script
  window.intercomSettings = {
    api_base: 'https://api-iam.intercom.io',
    app_id: appId,
  };

  // Create and inject the script tag
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${appId}`;
  
  script.onload = () => {
    console.log(`Intercom script loaded successfully for app: ${appId}`);
  };

  script.onerror = () => {
    console.error('Failed to load the Intercom script.');
  };

  if (document.readyState === 'complete') {
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    window.addEventListener('load', () => {
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    }, false);
  }
};

/**
 * Boot Intercom with JWT for authenticated users
 * @param {Object} userData - User data (user_id, email, name)
 * @param {string} jwtToken - JWT token from server
 */
export const bootIntercomWithJWT = (userData, jwtToken) => {
  if (!window.Intercom) {
    console.error('Intercom not loaded yet');
    return;
  }

  const settings = {
    api_base: 'https://api-iam.intercom.io',
    app_id: process.env.REACT_APP_INTERCOM_APP_ID || 'v77sghen',
    intercom_user_jwt: jwtToken,
    name: userData.name || undefined,
    email: userData.email || undefined,
    user_id: userData.user_id || undefined,
    created_at: userData.created_at || Math.floor(Date.now() / 1000),
    session_duration: 86400000, // 1 day
  };

  window.intercomSettings = settings;
  window.Intercom('boot', settings);
  console.log('Intercom: Booted with JWT for user', userData.email || userData.user_id);
};

/**
 * Shutdown Intercom and reboot as anonymous visitor
 */
export const shutdownIntercom = () => {
  if (window.Intercom) {
    window.Intercom('shutdown');
    // Reboot as anonymous visitor
    const appId = process.env.REACT_APP_INTERCOM_APP_ID || 'v77sghen';
    window.intercomSettings = {
      api_base: 'https://api-iam.intercom.io',
      app_id: appId,
    };
    window.Intercom('boot', window.intercomSettings);
    console.log('Intercom: Shutdown and rebooted as anonymous');
  }
};
