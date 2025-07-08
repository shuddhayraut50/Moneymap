// Modal logic for investment cards

document.addEventListener('DOMContentLoaded', function () {
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Open modal
    learnMoreButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            }
        });
    });

    // Close modal on close button
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close modal on background click
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Optional: Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    auth.checkAuth && auth.checkAuth();
    // Update auth UI
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (auth.isAuthenticated) {
        if (userInfo) userInfo.classList.remove('hidden');
        if (usernameDisplay) usernameDisplay.textContent = auth.getCurrentUsername();
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (userInfo) userInfo.classList.add('hidden');
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
});

// Page Transition System for Loading Animation
class PageTransition {
    constructor() {
        this.overlay = document.getElementById('page-transition');
        this.isTransitioning = false;
    }
    show() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.overlay.classList.add('active');
    }
    hide() {
        this.overlay.classList.remove('active');
        this.isTransitioning = false;
    }
    async navigateTo(url) {
        this.show();
        await new Promise(resolve => setTimeout(resolve, 4000));
        window.location.href = url;
    }
}
const pageTransition = new PageTransition();
function navigateWithTransition(url, event = null) {
    if (event) event.preventDefault();
    pageTransition.navigateTo(url);
}

// Hide overlay on initial load (only show on navigation)
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('page-transition').classList.remove('active');
});

function handleLogout() {
    if (auth.logout()) {
        navigateWithTransition('../user/login.html');
    }
}
window.handleLogout = handleLogout; // Make it available globally
