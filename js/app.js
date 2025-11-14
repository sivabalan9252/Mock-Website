/**
 * Main Application JavaScript
 * Handles form submissions and user interactions
 */

(function() {
    'use strict';

    // Contact form handling
    function handleContactForm() {
        const contactForm = document.querySelector('.contact-form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const name = formData.get('name');
                const email = formData.get('email');
                const message = formData.get('message');
                
                // Validate form
                if (!name || !email || !message) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // Generate a consistent user ID from the email
                const userId = email.toLowerCase().trim();
                const timestamp = Math.floor(Date.now() / 1000);
                
                // Identify user in Intercom if available - with proper attribute structure
                if (window.identifyIntercomUser) {
                    window.identifyIntercomUser({
                        name: name,
                        email: email,
                        user_id: userId,
                        created_at: timestamp
                    });
                    
                    console.log('Intercom: User identified with data:', {
                        name, email, userId, timestamp
                    });
                }
                
                // Show success message
                showNotification('Thank you! We\'ll get back to you soon.', 'success');
                
                // Reset form
                this.reset();
                
                // Open Intercom chat with pre-filled message and force Last Page URL update
                if (window.IntercomUtils) {
                    setTimeout(() => {
                        // First update the Last Page URL
                        window.IntercomUtils.updateLastPageUrl();
                        
                        // Then open the chat with pre-filled message
                        window.IntercomUtils.showNewMessage(`Hi! I just submitted the contact form. Here's my message: ${message}`);
                        
                        console.log('Intercom: Chat initiated with message from contact form');
                    }, 1000);
                }
            });
        }
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-family: 'Poppins', sans-serif;
                    animation: slideIn 0.3s ease-out;
                    max-width: 400px;
                }
                .notification-success {
                    background: #10b981;
                    color: white;
                }
                .notification-error {
                    background: #ef4444;
                    color: white;
                }
                .notification-info {
                    background: #3b82f6;
                    color: white;
                }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // Smooth scrolling for anchor links
    function handleSmoothScrolling() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a[href^="#"]');
            if (target) {
                e.preventDefault();
                const targetId = target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // Initialize when DOM is ready
    function init() {
        handleContactForm();
        handleSmoothScrolling();
        
        // Log initialization
        console.log('Stellar website initialized successfully');
        
        // Do not automatically update Last Page URL on init
        // We'll update it only when a chat is initiated and first message sent
        console.log('Intercom: App initialized - Last Page URL will update on first message');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utilities globally
    window.StellarApp = {
        showNotification: showNotification
    };

})();
