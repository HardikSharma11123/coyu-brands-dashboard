const filters = {
    async applyFilters() {
        const checkedCategories = Array.from(
            document.querySelectorAll('#categoryFilterList input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const checkedPrices = Array.from(
            document.querySelectorAll('#priceFilterList input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const checkedStyles = Array.from(
            document.querySelectorAll('#styleFilterList input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const checkedUSPs = Array.from(
            document.querySelectorAll('#uspFilterList input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        const searchBrand = document.getElementById('searchBrand').value.trim();

        try {
            const params = new URLSearchParams();

            checkedCategories.forEach(cat => params.append('category', cat));
            checkedStyles.forEach(style => params.append('style', style));
            checkedUSPs.forEach(usp => params.append('usp', usp));
            if (searchBrand) params.append('search', searchBrand);

            // Price: use first selected range for now
            if (checkedPrices.length > 0) {
                const [min, max] = checkedPrices[0].split('-');
                params.append('price_min', min);
                params.append('price_max', max);
            }

            const hasFilters = [...params.keys()].length > 0;

            if (!hasFilters) {
                brands.filteredBrands = [...brands.allBrands];
            } else {
                const response = await api.request(`/brands/?${params.toString()}`);
                brands.filteredBrands = response.results || response || [];
            }

            brands.currentPage = 1;
            brands.displayBrands();
        } catch (error) {
            console.error('Error applying filters:', error);
            alert('Failed to filter brands');
        }
    },

    setupEventListeners() {
        const showMatchingBtn = document.getElementById('showMatchingBtn');
        const searchBrand = document.getElementById('searchBrand');

        if (showMatchingBtn) {
            showMatchingBtn.addEventListener('click', () => this.applyFilters());
        }
        if (searchBrand) {
            searchBrand.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.applyFilters();
            });
        }
    }
};