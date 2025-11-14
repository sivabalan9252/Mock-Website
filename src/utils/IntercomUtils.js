/**
 * IntercomUtils.js - Utility functions for Intercom chat integration
 * 
 * This file provides utilities to interact with the Intercom chat widget,
 * including user identification, session management, and URL tracking.
 */

class IntercomUtils {
  static APP_ID = process.env.REACT_APP_INTERCOM_APP_ID;
  
  /**
   * Initialize Intercom with proper settings and event handlers
   * @param {Object} userData - Initial user data (optional)
   */
  static init(userData = null) {
    if (!window.Intercom) {
      console.error('Intercom: Intercom library not loaded');
      return;
    }
    
    console.debug('Intercom: Initializing with app ID', this.APP_ID);
    
    // Load stored user data from localStorage
    const storedUserData = this.loadStoredUserData();
    // Get current timestamp for user data
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Merge stored data with provided data, with provided data taking precedence
    const mergedUserData = {
      ...storedUserData,
      ...userData,
      app_id: this.APP_ID,
      created_at: currentTimestamp, // Use the timestamp
      custom_launcher_selector: '#intercom-custom-launcher',
      hide_default_launcher: false
    };
    
    // Initialize Intercom with merged data
    window.intercomSettings = mergedUserData;
    window.Intercom('boot', mergedUserData);
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Log initialization
    console.debug('Intercom: Initialized with settings', window.intercomSettings);
  }
  
  /**
   * Set up Intercom event handlers
   */
  static setupEventHandlers() {
    if (!window.Intercom) return;
    
    // Update Last Page URL when messenger is shown
    window.Intercom('onShow', () => {
      console.debug('Intercom: onShow event fired');
      this.updateLastPageUrl();
    });
    
    // Update Last Page URL when a message is sent
    window.Intercom('onMessageSent', (message) => {
      console.debug('Intercom: onMessageSent event fired', message);
      this.updateLastPageUrl();
    });
  }
  
  /**
   * Update the Last Page URL custom attribute
   * using the exact backend key name "Last Page URL"
   * @param {string} url - URL to set (optional, defaults to current URL)
   * @param {boolean} trackEvent - Whether to track this as an event (default: false)
   */
  static updateLastPageUrl(url, trackEvent = false) {
    console.debug('Intercom: updateLastPageUrl called', { url, trackEvent });
    
    if (window.Intercom && typeof window.Intercom === 'function') {
      let pageUrl = url || window.location.pathname;
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Format URL as stellar/home
      if (pageUrl.startsWith('/')) {
        pageUrl = pageUrl.substring(1);
      }
      if (pageUrl === '') {
        pageUrl = 'home';
      }
      pageUrl = `stellar/${pageUrl}`;
      
      console.debug('Intercom: Updating Last Page URL to', pageUrl);
      
      // Update Intercom with the correct attribute name
      window.Intercom('update', {
        user_id: window.intercomSettings.user_id || 'anonymous_user',
        custom_attributes: {
          "Last Page URL": pageUrl,
          "Last URL Update Time": timestamp
        }
      });
      
      // Store in localStorage with exact key names
      localStorage.setItem('intercom_settings', JSON.stringify({
        ...this.loadStoredUserData(),
        custom_attributes: {
          ...this.loadStoredUserData().custom_attributes,
          "Last Page URL": pageUrl,
          "Last URL Update Time": timestamp
        }
      }));
      
      // Update intercomSettings object
      if (window.intercomSettings) {
        window.intercomSettings.custom_attributes = {
          ...window.intercomSettings.custom_attributes,
          "Last Page URL": pageUrl,
          "Last URL Update Time": timestamp
        };
      }
      
      // Track page view event if requested
      if (trackEvent) {
        window.Intercom('trackEvent', 'page_view', {
          page_url: pageUrl,
          timestamp: timestamp
        });
      }
    }
  }
  
  /**
   * Load user data stored in localStorage
   * @returns {Object} Stored user data or empty defaults
   */
  static loadStoredUserData() {
    try {
      const storedData = localStorage.getItem('intercom_settings');
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (err) {
      console.error('Intercom: Error loading stored data', err);
    }
    
    return {
      app_id: this.APP_ID,
      custom_attributes: {}
    };
  }
  
  /**
   * Identify user with Intercom
   * @param {Object} userData - User data to identify
   */
  static identifyUser(userData) {
    if (!window.Intercom) return;
    
    const timestamp = Math.floor(Date.now() / 1000);
    const userInfo = {
      app_id: this.APP_ID,
      created_at: timestamp,
      ...userData
    };
    
    // Ensure we have a consistent user_id (using email)
    if (userData.email && !userData.user_id) {
      userInfo.user_id = userData.email.toLowerCase().trim();
    }
    
    console.debug('Intercom: Identifying user', userInfo);
    
    // Update Intercom with user data
    window.Intercom('update', userInfo);
    
    // Store in localStorage
    localStorage.setItem('intercom_settings', JSON.stringify({
      ...this.loadStoredUserData(),
      ...userInfo
    }));
    
    // Update intercomSettings object
    if (window.intercomSettings) {
      window.intercomSettings = {
        ...window.intercomSettings,
        ...userInfo
      };
    }
  }
  
  /**
   * Show the Intercom messenger
   */
  static showMessenger() {
    if (window.Intercom) {
      window.Intercom('show');
    }
  }
  
  /**
   * Hide the Intercom messenger
   */
  static hideMessenger() {
    if (window.Intercom) {
      window.Intercom('hide');
    }
  }
  
  /**
   * Show new message in the Intercom messenger
   * @param {string} message - Pre-filled message
   */
  static showNewMessage(message = '') {
    if (window.Intercom) {
      window.Intercom('showNewMessage', message);
    }
  }
  
  /**
   * Track an event in Intercom
   * @param {string} name - Event name
   * @param {Object} metadata - Event metadata
   */
  static trackEvent(name, metadata = {}) {
    if (window.Intercom) {
      window.Intercom('trackEvent', name, metadata);
    }
  }
  
  /**
   * Shutdown Intercom session
   */
  static shutdown() {
    if (window.Intercom) {
      window.Intercom('shutdown');
    }
  }
}

// Expose to window for legacy code
window.IntercomUtils = IntercomUtils;

export default IntercomUtils;
