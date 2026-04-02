// brands.js - Brand Management Module

const STATUS_CLASS_MAP = {
    'Brand Evaluation':           'status-brand-evaluation',
    'Brand Registration':         'status-brand-registration',
    'Documentation':              'status-documentation',
    'Cataloguing & SKU Creation': 'status-cataloguing',
    'Logistics & Shipment':       'status-logistics',
    'Warehouse Handover':         'status-warehouse-handover',
    'Product Live':               'status-product-live',
};

const brands = {
    allBrands: [],
    filteredBrands: [],
    currentPage: 1,
    itemsPerPage: 10,
    filterOptions: {},

    async init() {
        if (this._initialized) return;
        this._initialized = true;
        await this.loadFilterOptions();
        await this.loadAllBrands();
        this.setupModalHandlers();
        this.setupEventListeners();
    },

    async loadFilterOptions() {
        try {
            const response = await api.brands.getFilterOptions();
            this.filterOptions = response;
            this.populateFilterSelects();
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    },

    async loadAllBrands() {
        try {
            const response = await api.brands.getAll();
            this.allBrands = response.results || response || [];
            this.filteredBrands = [...this.allBrands];
            this.currentPage = 1;
            this.displayBrands();
        } catch (error) {
            console.error('Error loading brands:', error);
            alert('Failed to load brands');
        }
    },
    showNotification(message, type = 'success') {
    // Remove any existing notification
            const existing = document.getElementById('appNotification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.id = 'appNotification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 14px 24px;
                background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
                color: white;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: opacity 0.5s ease;
            `;
            document.body.appendChild(notification);

            // Auto-remove after 3 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        },
    populateFilterSelects() {
        // Sidebar - Category filter
        const categoryFilterList = document.getElementById('categoryFilterList');
        if (categoryFilterList && this.filterOptions.Category) {
            categoryFilterList.innerHTML = '';
            this.filterOptions.Category.forEach(cat => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${cat}" onchange="updateDropdownLabel('categoryFilter', 'categoryFilterLabel', 'Select categories')"> ${cat}`;
                categoryFilterList.appendChild(label);
            });
        }

        // Sidebar - Price Band
        const priceFilterList = document.getElementById('priceFilterList');
        if (priceFilterList && this.filterOptions.price_ranges) {
            priceFilterList.innerHTML = '';
            this.filterOptions.price_ranges.forEach(range => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${range.min}-${range.max}" onchange="updateDropdownLabel('priceFilter', 'priceFilterLabel', 'Select price range')"> ${range.label}`;
                priceFilterList.appendChild(label);
            });
        }

        // Sidebar - Style
        const styleFilterList = document.getElementById('styleFilterList');
        if (styleFilterList && this.filterOptions.Style) {
            styleFilterList.innerHTML = '';
            this.filterOptions.Style.forEach(style => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${style}" onchange="updateDropdownLabel('styleFilter', 'styleFilterLabel', 'Select style')"> ${style}`;
                styleFilterList.appendChild(label);
            });
        }

        // Sidebar - USP
        const uspFilterList = document.getElementById('uspFilterList');
        if (uspFilterList && this.filterOptions.USP) {
            uspFilterList.innerHTML = '';
            this.filterOptions.USP.forEach(usp => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${usp}" onchange="updateDropdownLabel('uspFilter', 'uspFilterLabel', 'Select USP')"> ${usp}`;
                uspFilterList.appendChild(label);
            });
        }

        // Modal form - Category
        const brandCategoryList = document.getElementById('brandCategoryList');
        if (brandCategoryList && this.filterOptions.Category) {
            brandCategoryList.innerHTML = '';
            this.filterOptions.Category.forEach(cat => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${cat}" onchange="updateDropdownLabel('brandCategoryDropdown', 'brandCategoryLabel', 'Select categories'); brands.updatePreview()"> ${cat}`;
                brandCategoryList.appendChild(label);
            });
        }

        // Modal form - USP
        const brandUSPList = document.getElementById('brandUSPList');
        if (brandUSPList && this.filterOptions.USP) {
            brandUSPList.innerHTML = '';
            this.filterOptions.USP.forEach(usp => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${usp}" onchange="updateDropdownLabel('brandUSPDropdown', 'brandUSPLabel', 'Select USP'); brands.updatePreview()"> ${usp}`;
                brandUSPList.appendChild(label);
            });
        }

        // Modal form - Price Range
        const brandPriceMin = document.getElementById('brandPriceMin');
        const brandPriceMax = document.getElementById('brandPriceMax');
        if (brandPriceMin && brandPriceMax && this.filterOptions.price_ranges) {
            brandPriceMin.innerHTML = '<option value="">Min</option>';
            brandPriceMax.innerHTML = '<option value="">Max</option>';
            this.filterOptions.price_ranges.forEach(range => {
                const optionMin = document.createElement('option');
                optionMin.value = range.min;
                optionMin.textContent = range.label;
                brandPriceMin.appendChild(optionMin);

                const optionMax = document.createElement('option');
                optionMax.value = range.max;
                optionMax.textContent = range.label;
                brandPriceMax.appendChild(optionMax);
            });
        }
    },

    displayBrands() {
        const tbody = document.getElementById('brandsTableBody');
        tbody.innerHTML = '';

        if (this.filteredBrands.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        No brands found. Try adjusting your filters.
                    </td>
                </tr>
            `;
            this.updatePaginationInfo();
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredBrands.slice(start, end);

        pageItems.forEach(brand => {
            const row = document.createElement('tr');
            const categories = brand.attributes
                .filter(a => a.type_name === 'Category')
                .map(a => a.value)
                .join(', ') || 'N/A';
            const usps = brand.attributes
                .filter(a => a.type_name === 'USP')
                .map(a => a.value)
                .join(', ') || 'N/A';

            row.innerHTML = `
                <td class="brand-name-cell" onclick="brands.showBrandDetails(${brand.id})" style="cursor: pointer; color: #0066cc; text-decoration: underline;">
                    ${this.escapeHtml(brand.brand_name)}
                </td>
                <td>${this.escapeHtml(brand.country)}</td>
                <td>${this.escapeHtml(categories)}</td>
                <td>Rs. ${brand.price_range_min.toLocaleString()} - Rs. ${brand.price_range_max.toLocaleString()}</td>
                <td>${this.escapeHtml(usps)}</td>
                <td>
                    <span class="status-badge ${STATUS_CLASS_MAP[brand.status] || ''}">
                        ${brand.status}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updatePaginationInfo();
    },

    updatePaginationInfo() {
        const totalPages = Math.ceil(this.filteredBrands.length / this.itemsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
        document.getElementById('showingInfo').textContent = `Showing ${this.filteredBrands.length} ${this.filteredBrands.length === 1 ? 'brand' : 'brands'}`;
        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === totalPages;
    },

    async updateStatus(brandId, newStatus) {
        try {
            await api.brands.updateStatus(brandId, newStatus);
            await this.loadAllBrands(); // already correct
        } catch (error) {
            console.error('Error updating status:', error);
            this.showNotification('Failed to update status', 'error');
        }
    },

    async showBrandDetails(brandId) {
        try {
            const brand = await api.brands.getOne(brandId);

            document.getElementById('detailsBrandName').textContent = brand.brand_name;
            document.getElementById('detailBrandName').textContent = brand.brand_name;
            document.getElementById('detailCountry').textContent = brand.country;
            document.getElementById('detailWebsite').textContent = brand.website || 'N/A';
            document.getElementById('detailInstagram').textContent = brand.instagram || 'N/A';

            const categories = brand.attributes
                .filter(a => a.type_name === 'Category')
                .map(a => a.value)
                .join(', ');
            document.getElementById('detailCategories').textContent = categories || 'N/A';
            document.getElementById('detailPrice').textContent = `Rs. ${brand.price_range_min.toLocaleString()} - Rs. ${brand.price_range_max.toLocaleString()}`;

            const uspValues = brand.attributes
                .filter(a => a.type_name === 'USP')
                .map(a => a.value)
                .join(', ');
            document.getElementById('detailUSP').textContent = uspValues || 'N/A';

            this.displayWorkflow(brand.workflow_steps || [], brandId);
            document.getElementById('brandDetailsModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading brand details:', error);
            alert('Failed to load brand details');
        }
    },

    displayWorkflow(steps, brandId) {
        const container = document.getElementById('workflowContainer');
        container.innerHTML = '';

        if (!steps || steps.length === 0) {
            container.innerHTML = '<p style="color: #999;">No workflow steps found.</p>';
            return;
        }

        steps.forEach(step => {
            const stepEl = document.createElement('div');
            stepEl.id = `workflow-step-${step.step_number}`;
            stepEl.className = `workflow-step ${step.is_current ? 'current' : ''} ${step.is_completed ? 'completed' : ''}`;

            stepEl.innerHTML = `
                <div class="step-indicator">
                    ${step.is_completed ? '✓' : step.step_number}
                </div>
                <div class="step-details">
                    <strong>${step.step_name}</strong>
                    ${step.is_completed && step.completed_at ?
                        `<small style="color: #999; display: block;">Completed: ${new Date(step.completed_at).toLocaleDateString()}</small>`
                        : ''}
                </div>
                <button
                    class="${step.is_current ? 'btn-current' : 'btn-set-active'}"
                    onclick="workflow.setCurrentStep(${brandId}, ${step.step_number})"
                    ${step.is_current ? 'disabled' : ''}
                >
                    ${step.is_current ? 'Current' : 'Set Active'}
                </button>
            `;
            container.appendChild(stepEl);
        });
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    setupModalHandlers() {
        const addBrandBtn = document.getElementById('addBrandBtn');
        const addBrandModal = document.getElementById('addBrandModal');
        const closeBrandModal = document.getElementById('closeBrandModal');
        const cancelBrandBtn = document.getElementById('cancelBrandBtn');
        const addBrandForm = document.getElementById('addBrandForm');
        const brandDetailsModal = document.getElementById('brandDetailsModal');
        const closeBrandDetailsModal = document.getElementById('closeBrandDetailsModal');

        addBrandBtn.addEventListener('click', () => {
            addBrandModal.style.display = 'block';
            this.resetAddBrandForm();
        });

        closeBrandModal.addEventListener('click', () => {
            addBrandModal.style.display = 'none';
        });

        cancelBrandBtn.addEventListener('click', () => {
            addBrandModal.style.display = 'none';
        });

        closeBrandDetailsModal.addEventListener('click', () => {
            brandDetailsModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === addBrandModal) addBrandModal.style.display = 'none';
            if (e.target === brandDetailsModal) brandDetailsModal.style.display = 'none';
        });

        addBrandForm.addEventListener('submit', (e) => this.handleAddBrand(e));
    },

    resetAddBrandForm() {
        document.getElementById('addBrandForm').reset();
        document.querySelectorAll('#brandCategoryList input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('brandCategoryLabel').textContent = 'Select categories';
        document.querySelectorAll('#brandUSPList input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('brandUSPLabel').textContent = 'Select USP';
        document.getElementById('formError').style.display = 'none';
        this.updatePreview();
    },

    async handleAddBrand(e) {
        e.preventDefault();

        const brandName = document.getElementById('brandName').value.trim();
        const country = document.getElementById('brandCountry').value.trim();
        const website = document.getElementById('brandWebsite').value.trim();
        const instagram = document.getElementById('brandInstagram').value.trim();
        const priceMin = parseInt(document.getElementById('brandPriceMin').value);
        const priceMax = parseInt(document.getElementById('brandPriceMax').value);

        // ✅ Read from checkboxes only — no select elements
        const selectedCategories = Array.from(
            document.querySelectorAll('#brandCategoryList input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const selectedUSPs = Array.from(
            document.querySelectorAll('#brandUSPList input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const formError = document.getElementById('formError');

        if (!brandName || !country || selectedCategories.length === 0 || selectedUSPs.length === 0 || !priceMin || !priceMax) {
            formError.textContent = 'Please fill all required fields';
            formError.style.display = 'block';
            return;
        }

        if (priceMin > priceMax) {
            formError.textContent = 'Minimum price cannot be greater than maximum price';
            formError.style.display = 'block';
            return;
        }

        try {
            const brandData = {
                brand_name: brandName,
                country: country,
                website: website || null,
                instagram: instagram || null,
                price_range_min: priceMin,
                price_range_max: priceMax,
                attribute_values: [...selectedCategories, ...selectedUSPs],
                status: 'Brand Evaluation'
            };

            const response = await api.brands.create(brandData);
            if (response.id) {
                document.getElementById('addBrandModal').style.display = 'none';
                this.resetAddBrandForm();
                await this.loadAllBrands(); // ✅ wait for this to finish first
                this.showNotification('Brand added successfully!'); // ✅ non-blocking
            }
        } catch (error) {
            console.error('Error adding brand:', error);
            formError.textContent = error.message || 'Failed to add brand';
            formError.style.display = 'block';
        }
    },

    setupEventListeners() {
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayBrands();
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredBrands.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.displayBrands();
            }
        });

        const formInputs = [
            'brandName', 'brandCountry', 'brandWebsite', 'brandInstagram',
            'brandPriceMin', 'brandPriceMax'
        ];
        formInputs.forEach(inputId => {
            const el = document.getElementById(inputId);
            if (el) {
                el.addEventListener('input', () => this.updatePreview());
                el.addEventListener('change', () => this.updatePreview());
            }
        });
    },

    updatePreview() {
        document.getElementById('previewBrandName').textContent =
            document.getElementById('brandName').value || 'N/A';
        document.getElementById('previewCountry').textContent =
            document.getElementById('brandCountry').value || 'N/A';
        document.getElementById('previewWebsite').textContent =
            document.getElementById('brandWebsite').value || 'N/A';
        document.getElementById('previewInstagram').textContent =
            document.getElementById('brandInstagram').value || 'N/A';

        const checkedCats = Array.from(
            document.querySelectorAll('#brandCategoryList input[type="checkbox"]:checked')
        ).map(cb => cb.value);
        document.getElementById('previewCategories').textContent =
            checkedCats.length > 0 ? checkedCats.join(', ') : 'N/A';

        const priceMin = document.getElementById('brandPriceMin').value || 'N/A';
        const priceMax = document.getElementById('brandPriceMax').value || 'N/A';
        document.getElementById('previewPrice').textContent = `Rs. ${priceMin} - ${priceMax}`;

        const checkedUSPs = Array.from(
            document.querySelectorAll('#brandUSPList input[type="checkbox"]:checked')
        ).map(cb => cb.value);
        document.getElementById('previewUSP').textContent =
            checkedUSPs.length > 0 ? checkedUSPs.join(', ') : 'N/A';
    }
};