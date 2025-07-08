// Authentication handling - Simplified to use only currentUser
const auth = {
    isAuthenticated: false,
    user: null,

    // Check if user is logged in
    checkAuth: function() {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                this.user = { username: currentUser };
                this.isAuthenticated = true;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },

    // Handle login
    login: function(userData) {
        try {
            // Only store the username as currentUser
            const username = userData.username || userData.email || 'unknown';
            localStorage.setItem('currentUser', username);
            
            this.user = { username: username };
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    },

    // Handle logout
    logout: function() {
        try {
            // Only clear currentUser
            localStorage.removeItem('currentUser');
            this.user = null;
            this.isAuthenticated = false;
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    },

    // Get current username (simplified)
    getCurrentUsername: function() {
        if (this.isAuthenticated && this.user) {
            return this.user.username;
        }
        // Fallback to localStorage
        return localStorage.getItem('currentUser') || 'unknown';
    }
};

// Initialize auth state
document.addEventListener('DOMContentLoaded', function() {
    auth.checkAuth();
});

// Export auth object
window.auth = auth;