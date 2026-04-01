// api.js - API Communication Layer for Django REST Framework

// Configuration
const API_BASE_URL = '/api';
const API_AUTH_URL = '/api/auth';
// Global state for authentication
let authToken = null;
let currentUser = null;

// API wrapper with proper error handling
const api = {
    // Set CSRF token from cookies
    getCSRFToken() {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    },

    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            credentials: 'include', // Include cookies for Django session auth
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            }
        };

        const finalOptions = { ...defaultOptions, ...options };
        if (options.headers) {
            finalOptions.headers = { ...defaultOptions.headers, ...options.headers };
        }

        try {
            const response = await fetch(url, finalOptions);
            
            // Handle JSON responses
            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.error || data.detail || 'Request failed',
                    data: data
                };
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Brands endpoints
    brands: {
        getAll(filters = {}) {
            const params = new URLSearchParams(filters).toString();
            return api.request(`/brands/${params ? '?' + params : ''}`);
        },

        getOne(id) {
            return api.request(`/brands/${id}/`);
        },

        create(brandData) {
            return api.request('/brands/', {
                method: 'POST',
                body: JSON.stringify(brandData)
            });
        },

        update(id, brandData) {
            return api.request(`/brands/${id}/`, {
                method: 'PUT',
                body: JSON.stringify(brandData)
            });
        },

        updateStatus(id, status) {
            return api.request(`/brands/${id}/update_status/`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        },

        delete(id) {
            return api.request(`/brands/${id}/`, { method: 'DELETE' });
        },

        getFilterOptions() {
            return api.request('/brands/filter_options/');
        },

        setCurrentStep(id, stepNumber) {
            return api.request(`/brands/${id}/set_current_step/`, {
                method: 'PUT',
                body: JSON.stringify({ step_number: stepNumber })
            });
        }
    },

    // Workflow endpoints
    workflow: {
        getSteps(brandId) {
            return api.request(`/workflow-steps/?brand_id=${brandId}`);
        },

        updateNotes(stepId, notes) {
            return api.request(`/workflow-steps/${stepId}/update_notes/`, {
                method: 'PUT',
                body: JSON.stringify({ notes })
            });
        },

        markCompleted(stepId) {
            return api.request(`/workflow-steps/${stepId}/mark_completed/`, {
                method: 'PUT',
                body: JSON.stringify({})
            });
        }
    },

    // Document endpoints
    documents: {
        getByBrand(brandId) {
            return api.request(`/documents/?brand_id=${brandId}`);
        },

        getByStep(stepId) {
            return api.request(`/documents/?step_id=${stepId}`);
        },

        upload(formData) {
            return api.request('/documents/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': api.getCSRFToken(),
                },
                body: formData
            });
        },

        delete(id) {
            return api.request(`/documents/${id}/`, { method: 'DELETE' });
        }
    },

    // Product endpoints
    products: {
        getByBrand(brandId) {
            return api.request(`/products/?brand_id=${brandId}`);
        },

        create(productData) {
            return api.request('/products/', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        },

        update(id, productData) {
            return api.request(`/products/${id}/`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        },

        delete(id) {
            return api.request(`/products/${id}/`, { method: 'DELETE' });
        }
    },

    // Authentication (Django session-based)
    auth: {
        async login(username, password) {
            try {
                const response = await fetch(`${API_AUTH_URL}/login/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': api.getCSRFToken(),
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw {
                        status: response.status,
                        message: data.non_field_errors?.[0] || 'Login failed'
                    };
                }

                currentUser = { username };
                return { success: true, user: currentUser };
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        async logout() {
            try {
                const response = await fetch(`${API_AUTH_URL}/logout/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-CSRFToken': api.getCSRFToken(),
                    }
                });

                if (response.ok) {
                    currentUser = null;
                    return { success: true };
                }
            } catch (error) {
                console.error('Logout error:', error);
                throw error;
            }
        },

        async checkAuth() {
    try {
        const response = await fetch(`${API_AUTH_URL}/check/`, {
            credentials: 'include'
        });

        const data = await response.json();
        return data; // { authenticated: true/false }
    } catch {
        return { authenticated: false };
    }
}
    }
};