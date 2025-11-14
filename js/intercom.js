/**
 * Intercom Integration - Clean Implementation for Session Persistence
 */

(function() {
    'use strict';

    const APP_ID = process.env.REACT_APP_INTERCOM_APP_ID;
    
    // Initialize Intercom settings
    window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: APP_ID,
        hide_default_launcher: false // Ensure the launcher is visible
    };

    // Load stored user data for session persistence
    function loadStoredUserData() {
        try {
            const stored = localStorage.getItem('intercom_user_session');
            if (stored) {
                const userData = JSON.parse(stored);
                // Create the base intercom settings
                Object.assign(window.intercomSettings, {
                    user_id: userData.user_id,
                    email: userData.email,
                    name: userData.name,
                    created_at: userData.created_at
                });
                
                // Set up custom attributes separately
                if (!window.intercomSettings.custom_attributes) {
                    window.intercomSettings.custom_attributes = {};
                }
                
                // Add Last Page URL as a custom attribute with exact backend key name
                if (userData["Last Page URL"]) {
                    window.intercomSettings.custom_attributes["Last Page URL"] = userData["Last Page URL"];
                }
                
                console.log('Intercom: Restored user session with data:', window.intercomSettings);
            } else {
                console.log('Intercom: No stored user session found');
            }
        } catch (e) {
            console.warn('Intercom: Error loading session:', e);
            localStorage.removeItem('intercom_user_session');
        }
    }

    // Load stored data first
    loadStoredUserData();

    // Official Intercom installation script
    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/'+APP_ID;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    
})();

// User identification function - stores session for persistence
window.identifyIntercomUser = function(userData) {
    if (!userData) return;
    
    // Store for persistence across page refreshes
    try {
        localStorage.setItem('intercom_user_session', JSON.stringify({
            user_id: userData.user_id || userData.email,
            email: userData.email,
            name: userData.name,
            created_at: userData.created_at || Math.floor(Date.now() / 1000)
        }));
        console.log('Intercom: User session saved');
    } catch (e) {
        console.warn('Intercom: Failed to store session:', e);
    }
    
    // Update current session
    Object.assign(window.intercomSettings, userData);
    
    // Update Intercom if loaded
    if (window.Intercom && typeof window.Intercom === 'function') {
        window.Intercom('update', userData);
    }
};

// Reset user session - clears stored data
window.resetIntercomUser = function() {
    localStorage.removeItem('intercom_user_session');
    window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: process.env.REACT_APP_INTERCOM_APP_ID
    };
    
    if (window.Intercom && typeof window.Intercom === 'function') {
        window.Intercom('shutdown');
        setTimeout(function() {
            window.Intercom('boot', window.intercomSettings);
        }, 100);
    }
};

// Utility functions for programmatic control
window.IntercomUtils = {
    show: function() {
        if (window.Intercom && typeof window.Intercom === 'function') {
            window.Intercom('show');
        }
    },
    hide: function() {
        if (window.Intercom && typeof window.Intercom === 'function') {
            window.Intercom('hide');
        }
    },
    showNewMessage: function(message) {
        if (window.Intercom && typeof window.Intercom === 'function') {
            window.Intercom('showNewMessage', message);
        }
    },
    trackEvent: function(name, data) {
        if (window.Intercom && typeof window.Intercom === 'function') {
            window.Intercom('trackEvent', name, data || {});
        }
    },
    reload: function() {
        if (window.Intercom && typeof window.Intercom === 'function') {
            window.Intercom('shutdown');
            setTimeout(function() {
                window.Intercom('boot', window.intercomSettings);
            }, 300);
        }
    },
    /**
     * Updates the current contact's "Last Page URL" custom attribute
     * Note: This uses client-side tracking instead of direct API calls for security
     * For server-side updates, use the REST API with proper authentication
     * 
     * @param {string} [url] - Optional URL to set. Defaults to current page URL.
     * @param {boolean} [trackEvent] - Whether to also track this as an event. Default: true.
     */
    updateLastPageUrl: function(url, trackEvent = false) {
        console.debug('Intercom: updateLastPageUrl called', { url, trackEvent });
        
        if (window.Intercom && typeof window.Intercom === 'function') {
            // Format URL with proper naming (stellar/home instead of raw URL)
            let pageUrl = url || window.location.href;
            
            // Create more user-friendly URL format
            try {
                const urlObj = new URL(pageUrl);
                const path = urlObj.pathname.replace(/\/$/, '') || '/'; // Remove trailing slash
                const pageName = path === '/' ? 'home' : path.split('/').pop();
                const formattedUrl = 'stellar/' + pageName;
                
                pageUrl = formattedUrl; // Use the formatted URL
                console.log('Intercom: Using formatted URL:', pageUrl);
            } catch (e) {
                console.warn('Intercom: Could not format URL, using original:', pageUrl);
            }
            
            console.log('Intercom: Updating Last Page URL to:', pageUrl);
            
            // Store current timestamp to track when the URL was last updated
            const timestamp = Math.floor(Date.now() / 1000);
            console.log('Intercom: Preparing update with last_page_url:', pageUrl);
            
            // Following Intercom documentation for updating user attributes properly
            // Use the exact backend key name "Last Page URL" as required
            window.Intercom('update', {
                user_id: window.intercomSettings.user_id || 'anonymous_user',
                custom_attributes: {
                    "Last Page URL": pageUrl, // Exact key name as used in backend
                    "Last URL Update Time": timestamp // Matching naming convention
                }
            });
            
            console.log('Intercom: Update sent to Intercom with Last Page URL:', pageUrl);
            
            // Also update intercomSettings to ensure persistence
            if (!window.intercomSettings.custom_attributes) {
                window.intercomSettings.custom_attributes = {};
            }
            // Use the exact key name "Last Page URL"
            window.intercomSettings.custom_attributes["Last Page URL"] = pageUrl;
            console.log('Intercom: Updated intercomSettings with Last Page URL');
            console.debug('Intercom: Current intercomSettings:', window.intercomSettings);
            
            // Store locally for session tracking - using the same format as Intercom API
            try {
                const session = JSON.parse(localStorage.getItem('intercom_user_session') || '{}');
                // Use the exact key name "Last Page URL" here too
                session["Last Page URL"] = pageUrl;
                session["Last URL Update Time"] = timestamp;
                localStorage.setItem('intercom_user_session', JSON.stringify(session));
                console.log('Intercom: Last Page URL saved to localStorage:', pageUrl);
                console.debug('Intercom: Full session data:', session);
            } catch (e) {
                console.warn('Intercom: Failed to update session storage:', e);
            }
            
            return true;
        }
        return false;
    },
    
    /**
     * Server-side API implementation to update a contact (requires API key)
     * IMPORTANT: Do not use this function directly in the browser as it would expose your API key
     * This is provided as a reference for server-side implementation
     */
    _serverUpdateContact: function(contactId, apiKey, lastPageUrl) {
        // WARNING: This function should NOT be used client-side
        // It's included as a reference for server-side implementation
        console.warn('This is a server-side function and should not be called from the browser');
        
        /* Server-side pseudocode:
        fetch('https://api.intercom.io/contacts/' + contactId, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'custom_attributes': {
                    'last_page_url': lastPageUrl
                }
            })
        })
        */
    }
};

// Automatically track page views and update last page URL
(function trackPageView() {
    // Wait for Intercom to be ready
    function checkIntercom() {
        console.debug('Intercom: Checking if Intercom is ready...');
        if (window.Intercom && typeof window.Intercom === 'function' && window.IntercomUtils) {
            console.log('Intercom: Ready - Initializing chat listeners');
            
            // Do not automatically update Last Page URL on init
            // We'll update it only when a chat is initiated and first message sent
            console.log('Intercom: Initialized - Last Page URL will update on first message');
            
            // Add event listeners for Intercom events
            document.addEventListener('intercom:load', function() {
                console.log('Intercom: Widget fully loaded event triggered');
                
                // Update last page URL when the messenger is opened AND when messages are sent
                Intercom('onShow', function() {
                    console.log('Intercom: Messenger opened - Ready for interaction');
                    
                    // Identify the user if they exist in localStorage
                    try {
                        const stored = localStorage.getItem('intercom_user_session');
                        if (stored) {
                            const userData = JSON.parse(stored);
                            if (userData.user_id && userData.email) {
                                console.log('Intercom: Found existing user, updating Last Page URL');
                                window.IntercomUtils.updateLastPageUrl();
                            }
                        }
                    } catch (e) {
                        console.warn('Intercom: Error checking stored session:', e);
                    }
                });
                
                // Always update last page URL when a message is sent
                Intercom('onMessageSent', function() {
                    window.IntercomUtils.updateLastPageUrl();
                    console.log('Intercom: Message sent - Last Page URL updated');
                });
            });
            
            // Track URL changes (for SPA support)
            let lastUrl = window.location.href;
            console.log('Intercom: Initial URL for tracking:', lastUrl);
            
            // Check for URL changes periodically (for SPAs)
            setInterval(function() {
                if (window.location.href !== lastUrl) {
                    console.log('Intercom: URL changed from', lastUrl, 'to', window.location.href);
                    lastUrl = window.location.href;
                    window.IntercomUtils.updateLastPageUrl(lastUrl);
                }
            }, 1000);
        } else {
            // Try again in 1 second
            setTimeout(checkIntercom, 1000);
        }
    }
    
    // Start checking once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkIntercom);
    } else {
        checkIntercom();
    }
})();
