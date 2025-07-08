function investNow() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showLoginModal();
        return;
    }
    // Get SelectionData from localStorage
    let selectionData = localStorage.getItem('SelectionData');
    if (!selectionData) {
        showPopup('No selection data found.', 3000);
        return;
    }
    try {
        selectionData = JSON.parse(selectionData);
    } catch (e) {
        showPopup('Invalid selection data format.', 3000);
        return;
    }
    // Update username in selectionData
    selectionData.username = currentUser;

    // Send to MongoDB backend (example fetch call)
    fetch('http://localhost:3001/api/saveSelection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectionData)
    })
    .then(response => response.json())
    .then(data => {
        // On success, clear SelectionData from localStorage
        localStorage.removeItem('SelectionData');
        showPopup('Investment plan saved successfully!', 3000);
    })
    .catch(error => {
        showPopup('Failed to save investment plan. Please try again.', 3000);
    });
}

// Modal logic for login required
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hide');
        modal.classList.add('show');
    }
}
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('hide');
    }
}

// Attach modal button listeners on DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
    if (goToLoginBtn) {
        goToLoginBtn.onclick = function() {
            window.location.href = '../user/login.html';
        };
    }
    if (closeLoginModalBtn) {
        closeLoginModalBtn.onclick = function() {
            hideLoginModal();
        };
    }
});
