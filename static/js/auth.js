// auth.js - Authentication Module

const auth = {
    currentUser: null,

    async init() {
        // Check if already authenticated via session
        try {
            const authStatus = await api.auth.checkAuth();
            if (authStatus.authenticated) {
                this.currentUser = { authenticated: true };
                this.redirectToDashboard();
            }
        } catch (error) {
            // Not authenticated, stay on login
        }
    },

    async login(username, password) {
    try {
        // Ensure CSRF first
        await api.auth.checkAuth();

        const response = await fetch(`${API_AUTH_URL}/login/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': api.getCSRFToken(),
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error || 'Login failed'
            };
        }

        // 🔥 IMPORTANT: wait for session to be usable
        await new Promise(resolve => setTimeout(resolve, 200));

        return data;

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
},
    async logout() {
        try {
            await api.auth.logout();
            this.currentUser = null;
            this.redirectToLogin();
        } catch (error) {
            console.error('Logout error:', error);
            this.redirectToLogin();
        }
    },

    redirectToDashboard() {
        window.location.href = '/dashboard/';
    },

    redirectToLogin() {
        window.location.href = '/';
    },

    isLoggedIn() {
        return this.currentUser !== null;
    }
};

// Login Page Handler
if (document.getElementById('loginForm')) {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const errorMessage = document.getElementById('errorMessage');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        // Check if already logged in
        auth.init();

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                showError('Username and password are required');
                return;
            }

            try {
                loginBtn.disabled = true;
                document.getElementById('loginBtnText').style.display = 'none';
                document.getElementById('loginSpinner').style.display = 'inline';
                errorMessage.style.display = 'none';

                const result = await auth.login(username, password);

// 🔥 VERIFY SESSION BEFORE REDIRECT
const authStatus = await api.auth.checkAuth();

if (authStatus.authenticated) {
    auth.redirectToDashboard();
} else {
    throw { message: 'Session not established. Try again.' };
}
            } catch (error) {
                loginBtn.disabled = false;
                document.getElementById('loginBtnText').style.display = 'inline';
                document.getElementById('loginSpinner').style.display = 'none';

                let errorText = 'Login failed. Please try again.';
                if (error.status === 401 || error.status === 403) {
                    errorText = 'Invalid username or password';
                } else if (error.message) {
                    errorText = error.message;
                }

                showError(errorText);
                console.error('Login error:', error);
            }
        });

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    });
}

// Dashboard Page Authentication Handler
if (document.getElementById('logoutBtn')) {
    document.addEventListener('DOMContentLoaded', async function() {
        // Check authentication
        try {
            const authStatus = await api.auth.checkAuth();
            if (!authStatus.authenticated) {
                auth.redirectToLogin();
                return;
            }

            // Update user greeting
            const userGreeting = document.getElementById('userGreeting');
            if (userGreeting) {
                userGreeting.textContent = 'Welcome to COYU Brand Finder!';
            }
        } catch (error) {
            auth.redirectToLogin();
        }

        // Logout handler
        document.getElementById('logoutBtn').addEventListener('click', async function() {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await auth.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                    auth.redirectToLogin();
                }
            }
        });
    });
}