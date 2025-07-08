// auth.js
// Handles login/logout navbar logic for all pages

document.addEventListener('DOMContentLoaded', function() {
    const navLogin = document.querySelector('.nav-links li a[href="./login.html"]');
    const userInfo = document.getElementById('current-user-info');
    if (!navLogin) return;
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        navLogin.textContent = 'Logout';
        navLogin.href = '#';
        navLogin.addEventListener('click', function(e) {
            e.preventDefault();
            // ===== Logout Confirmation Popup =====
            if (document.getElementById('logout-popup')) return; // Prevent multiple popups
            const popup = document.createElement('div');
            popup.id = 'logout-popup';
            popup.innerHTML = `
                <div class="logout-modal-bg" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9998;"></div>
                <div class="logout-modal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:32px 28px 24px 28px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.18);z-index:9999;min-width:300px;text-align:center;">
                    <h2 style='margin-bottom:18px;font-size:1.3em;color:#1a237e;'>Logout Confirmation</h2>
                    <p style='margin-bottom:24px;color:#333;'>Are you sure you want to logout?</p>
                    <button id="logout-yes" style="background:#1a237e;color:#fff;padding:8px 24px;border:none;border-radius:6px;margin-right:12px;cursor:pointer;font-size:1em;">Yes</button>
                    <button id="logout-no" style="background:#fff;color:#1a237e;padding:8px 24px;border:1.5px solid #1a237e;border-radius:6px;cursor:pointer;font-size:1em;">No</button>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById('logout-yes').onclick = function() {
                localStorage.removeItem('currentUser');
                document.body.removeChild(popup);
                window.location.href = './login.html';
            };
            document.getElementById('logout-no').onclick = function() {
                document.body.removeChild(popup);
            };
            // Also close popup if background is clicked
            popup.querySelector('.logout-modal-bg').onclick = function() {
                document.body.removeChild(popup);
            };
        });
        if (userInfo) {
            userInfo.textContent = `Welcome back, ${currentUser}! 😊`;
        }
    } else {
        navLogin.textContent = 'Login';
        navLogin.href = './login.html';
        if (userInfo) {
            userInfo.textContent = '';
        }
    }
});
