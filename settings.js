// Custom Popup Functionality
function showCustomPopup(message, type = 'success') {
    let popup = document.getElementById('custom-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'custom-popup';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;
        document.body.appendChild(popup);
    }

    // Set background color based on type
    popup.style.backgroundColor = type === 'error' ? '#dc3545' : '#28a745';
    popup.textContent = message;
    popup.style.opacity = '1';

    setTimeout(() => {
        popup.style.opacity = '0';
    }, 3000);
}

// Form Validation
function validatePassword(password) {
    const minLength = 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!hasLetter) {
        errors.push('Password must contain at least one letter');
    }
    if (!hasNumber) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    return errors.length === 0 ? null : errors;
}

// State Management
const state = {
    isDarkMode: false,
    fontSize: 'medium',
    notifications: {
        email: true,
        returns: true,
        tax: true,
        payment: false
    }
};

// Save state to localStorage
function saveState() {
    localStorage.setItem('appState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
        applyState();
    }
}

// Apply state to UI
function applyState() {
    // Apply dark mode
    if (state.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('appearance-dark-mode').checked = true;
    }

    // Apply font size
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${state.fontSize}`);
    document.querySelectorAll('.btn-font-size').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === state.fontSize);
        btn.setAttribute('aria-pressed', btn.dataset.size === state.fontSize);
    });

    // Apply notification settings
    document.getElementById('notifications-email').checked = state.notifications.email;
    document.getElementById('notifications-returns').checked = state.notifications.returns;
    document.getElementById('notifications-tax').checked = state.notifications.tax;
    document.getElementById('notifications-payment').checked = state.notifications.payment;
}

// Profile Validation
function validateProfile(data) {
    const errors = {};
    
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.name)) {
        errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    // Email validation
    if (!data.email) {
        errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
        errors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }
    
    // Phone validation
    if (!data.phone) {
        errors.phone = 'Phone number is required';
    } else {
        const cleanedPhone = data.phone.replace(/[\s()-]/g, '');
        if (!/^\d{10}$/.test(cleanedPhone)) {
            errors.phone = 'Phone number must be exactly 10 digits';
        }
    }
    
    // Date validation
    if (!data.birthDate) {
        errors.birthDate = 'Birth date is required';
    } else {
        const date = new Date(data.birthDate);
        const today = new Date();
        const minAge = 13;
        const maxAge = 120;
        const age = today.getFullYear() - date.getFullYear();
        
        if (isNaN(date.getTime())) {
            errors.birthDate = 'Please enter a valid date';
        } else if (age < minAge) {
            errors.birthDate = `You must be at least ${minAge} years old`;
        } else if (age > maxAge) {
            errors.birthDate = 'Please enter a valid birth date';
        }
    }
    
    return Object.keys(errors).length === 0 ? null : errors;
}

// Format phone number
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phone;
}

// Format date
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Parse date
function parseDate(dateStr) {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

// Function to toggle edit mode for a section
function toggleEditMode(sectionSelector, editButtonSelector, fields) {
    const section = document.querySelector(sectionSelector);
    const editButton = section.querySelector(editButtonSelector);
    let isEditing = false;
    let originalValues = {};

    editButton.addEventListener('click', () => {
        isEditing = !isEditing;
        if (isEditing) {
            // Store original values
            fields.forEach(field => {
                const element = section.querySelector(field.selector);
                if (element) {
                    originalValues[field.id] = element.textContent.trim();
                }
            });

            editButton.textContent = 'Save';
            editButton.style.backgroundColor = '#28a745';
            fields.forEach(field => {
                const element = section.querySelector(field.selector);
                if (element) {
                    if (field.type === 'input') {
                        const input = document.createElement('input');
                        input.type = field.inputType || 'text';
                        input.value = element.textContent.trim();
                        input.id = field.id;
                        input.name = field.id;
                        input.className = 'form-control';
                        input.required = true;
                        
                        // Add specific attributes based on input type
                        if (field.inputType === 'email') {
                            input.pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
                            input.title = 'Please enter a valid email address (e.g., user@example.com)';
                        } else if (field.inputType === 'tel') {
                            input.pattern = '\\d{10}';
                            input.title = 'Please enter a 10-digit phone number';
                            input.placeholder = '1234567890';
                        } else if (field.inputType === 'date') {
                            const date = new Date(element.textContent.trim());
                            input.value = date.toISOString().split('T')[0];
                        }
                        
                        // Add error message container
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.style.color = 'red';
                        errorDiv.style.fontSize = '0.8em';
                        errorDiv.style.marginTop = '5px';
                        
                        element.replaceWith(input);
                        input.parentNode.insertBefore(errorDiv, input.nextSibling);
                    } else if (field.type === 'select') {
                        const select = document.createElement('select');
                        select.id = field.id;
                        select.name = field.id;
                        select.className = 'form-control';
                        select.required = true;
                        const options = field.options || [];
                        options.forEach(optionText => {
                            const option = document.createElement('option');
                            option.value = optionText.toLowerCase();
                            option.textContent = optionText;
                            if (optionText === element.textContent.trim()) {
                                option.selected = true;
                            }
                            select.appendChild(option);
                        });
                        element.replaceWith(select);
                    }
                }
            });
        } else {
            // Collect and validate data
            const formData = {};
            fields.forEach(field => {
                const input = section.querySelector(`#${field.id}`);
                if (input) {
                    formData[field.id] = input.value.trim();
                }
            });

            // Validate the data
            const errors = validateProfile(formData);
            if (errors) {
                // Show errors
                Object.entries(errors).forEach(([field, message]) => {
                    const input = section.querySelector(`#${field}`);
                    if (input) {
                        // Find or create error div
                        let errorDiv = input.nextElementSibling;
                        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
                            errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            errorDiv.style.color = 'red';
                            errorDiv.style.fontSize = '0.8em';
                            errorDiv.style.marginTop = '5px';
                            input.parentNode.insertBefore(errorDiv, input.nextSibling);
                        }
                        input.classList.add('is-invalid');
                        errorDiv.textContent = message;
                    }
                });
                return;
            }

            // Format the data
            if (formData.phone) {
                formData.phone = formatPhoneNumber(formData.phone);
            }
            if (formData.birthDate) {
                formData.birthDate = formatDate(formData.birthDate);
            }

            // Update the UI
            editButton.textContent = 'Edit';
            editButton.style.backgroundColor = '#007bff';
            fields.forEach(field => {
                const input = section.querySelector(`#${field.id}`);
                if (input) {
                    const p = document.createElement('p');
                    p.textContent = formData[field.id];
                    input.replaceWith(p);
                }
            });

            // Save to state
            state.profile = { ...state.profile, ...formData };
            saveState();

            showCustomPopup('Profile updated successfully!');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Load saved state
    loadState();

    // Profile Overview Edit
    toggleEditMode('.profile-overview', '.btn-edit', [
        { selector: '#profile-name-display', type: 'input', id: 'profile-name' },
        { selector: '#profile-username-display', type: 'input', id: 'profile-username' },
        { selector: '#profile-email-display', type: 'input', inputType: 'email', id: 'profile-email' }
    ]);

    // Personal Information Edit
    toggleEditMode('.personal-info', '.btn-edit', [
        { selector: '#personal-full-name', type: 'input', id: 'personal-full-name' },
        { selector: '#personal-email', type: 'input', inputType: 'email', id: 'personal-email' },
        { selector: '#personal-phone', type: 'input', inputType: 'tel', id: 'personal-phone' },
        { selector: '#personal-birth-date', type: 'input', inputType: 'date', id: 'personal-birth-date' }
    ]);

    // Password Form Validation
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        // Add password requirements display
        const requirementsDiv = document.createElement('div');
        requirementsDiv.className = 'password-requirements';
        requirementsDiv.style.marginTop = '10px';
        requirementsDiv.style.fontSize = '0.9em';
        requirementsDiv.style.color = '#666';
        requirementsDiv.innerHTML = `
            <strong>Password Requirements:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>At least 8 characters long</li>
                <li>At least one uppercase letter (A-Z)</li>
                <li>At least one lowercase letter (a-z)</li>
                <li>At least one number (0-9)</li>
                <li>At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
            </ul>
        `;
        
        const newPasswordInput = document.getElementById('security-new-password');
        if (newPasswordInput) {
            newPasswordInput.parentNode.insertBefore(requirementsDiv, newPasswordInput.nextSibling);
        }

        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('security-current-password').value;
            const newPassword = document.getElementById('security-new-password').value;
            const confirmPassword = document.getElementById('security-confirm-password').value;

            // Clear previous error messages
            const errorElements = passwordForm.querySelectorAll('.error-message');
            errorElements.forEach(el => el.remove());

            // Validate current password
            if (!currentPassword) {
                showPasswordError('security-current-password', 'Please enter your current password');
                return;
            }

            // Validate new password
            const passwordErrors = validatePassword(newPassword);
            if (passwordErrors) {
                showPasswordError('security-new-password', passwordErrors.join('<br>'));
                return;
            }

            // Check if passwords match
            if (newPassword !== confirmPassword) {
                showPasswordError('security-confirm-password', 'New passwords do not match');
                return;
            }

            // Send password change request to backend
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                showCustomPopup('Not logged in', 'error');
                return;
            }
            const loginId = currentUser;
            try {
                const response = await fetch('http://localhost:3001/api/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        loginId: loginId,
                        currentPassword,
                        newPassword
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    showCustomPopup('Password updated successfully!');
                    passwordForm.reset();
                } else {
                    showCustomPopup(data.message || 'Failed to update password', 'error');
                }
            } catch (err) {
                showCustomPopup('Error updating password', 'error');
            }
        });
    }

    function showPasswordError(fieldId, message) {
        const input = document.getElementById(fieldId);
        if (!input) return;

        // Remove any existing error message
        const existingError = input.nextElementSibling;
        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.8em';
        errorDiv.style.marginTop = '5px';
        errorDiv.innerHTML = message;
        
        input.classList.add('is-invalid');
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }

    // Investment Preferences Form
    const investmentForm = document.getElementById('investment-form');
    if (investmentForm) {
        investmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, this would send the data to the server
            showCustomPopup('Investment preferences saved!');
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('appearance-dark-mode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            state.isDarkMode = darkModeToggle.checked;
            if (state.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                showCustomPopup('Dark Mode Enabled');
            } else {
                document.documentElement.removeAttribute('data-theme');
                showCustomPopup('Dark Mode Disabled');
            }
            saveState();
        });
    }

    // Font Size Changer
    const fontSizeButtons = document.querySelectorAll('.btn-font-size');
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const size = button.dataset.size;
            state.fontSize = size;
            
            fontSizeButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            
            document.body.classList.remove('font-small', 'font-medium', 'font-large');
            document.body.classList.add(`font-${size}`);
            
            showCustomPopup(`Font size set to ${size}`);
            saveState();
        });
    });

    // Notification Toggles
    const notificationToggles = {
        'notifications-email': 'email',
        'notifications-returns': 'returns',
        'notifications-tax': 'tax',
        'notifications-payment': 'payment'
    };

    Object.entries(notificationToggles).forEach(([id, key]) => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', () => {
                state.notifications[key] = toggle.checked;
                showCustomPopup(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${toggle.checked ? 'enabled' : 'disabled'}`);
                saveState();
            });
        }
    });

    // Export Data
    const exportDataBtn = document.querySelector('.danger-zone .btn-export');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            // In a real app, this would generate and download the data
            showCustomPopup('Exporting data...');
        });
    }

    // Delete Account
    const deleteAccountBtn = document.querySelector('.danger-zone .btn-delete');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // In a real app, this would send a request to delete the account
                showCustomPopup('Account deleted.');
            } else {
                showCustomPopup('Account deletion cancelled.');
            }
        });
    }

    const userInfo = document.getElementById('current-user-info');
    const currentUser = localStorage.getItem('currentUser');
    if (userInfo) {
        if (currentUser) {
            userInfo.textContent = `Logged in as: ${currentUser}`;
        } else {
            userInfo.textContent = 'Not logged in';
        }
    }

    // Fetch and display user profile info
    if (currentUser) {
        fetch(`http://localhost:3001/api/user-profile?loginId=${encodeURIComponent(currentUser)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.username) {
                    // Profile Overview
                    document.getElementById('profile-name-display').textContent = `${data.firstName} ${data.lastName}`;
                    document.getElementById('profile-username-display').textContent = `@${data.username}`;
                    document.getElementById('profile-email-display').textContent = data.email;
                    // Personal Info
                    document.getElementById('personal-full-name').textContent = `${data.firstName} ${data.lastName}`;
                    document.getElementById('personal-email').textContent = data.email;
                    document.getElementById('personal-phone').textContent = data.phone;
                }
            })
            .catch(err => {
                // Optionally show error to user
                console.error('Failed to fetch user profile:', err);
            });
    }
});