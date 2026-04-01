// Main initialization script
function toggleDropdown(containerId) {
    const list = document.getElementById(containerId + 'List') || 
                 document.querySelector(`#${containerId} .checkbox-dropdown-list`);
    if (list) {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
}

function updateDropdownLabel(containerId, labelId, placeholder) {
    const list = document.getElementById(containerId + 'List') ||
                 document.querySelector(`#${containerId} .checkbox-dropdown-list`);
    const label = document.getElementById(labelId);
    if (!list || !label) return;
    const checked = Array.from(list.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    label.textContent = checked.length > 0 ? checked.join(', ') : placeholder;
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.checkbox-dropdown')) {
        document.querySelectorAll('.checkbox-dropdown-list').forEach(list => {
            list.style.display = 'none';
        });
    }
});
document.addEventListener('DOMContentLoaded', async function() {
    // Only run on dashboard page
    if (!document.getElementById('brandsTable')) {
        return;
    }

    try {
        // Initialize modules
        await brands.init();
        filters.setupEventListeners();

        console.log('✓ COYU Brand Finder Dashboard loaded successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Failed to load dashboard. Please refresh the page.');
    }
});