const workflow = {
    async setCurrentStep(brandId, stepNumber) {
        try {
            const response = await api.brands.setCurrentStep(brandId, stepNumber);
            if (response.success) {
                // Update UI instantly without reloading modal
                document.querySelectorAll('.workflow-step').forEach(el => {
                    el.classList.remove('current');
                });
                document.querySelectorAll('.workflow-step button').forEach(btn => {
                    btn.className = 'btn-set-active';
                    btn.textContent = 'Set Active';
                    btn.disabled = false;
                });

                const activeStep = document.getElementById(`workflow-step-${stepNumber}`);
                if (activeStep) {
                    activeStep.classList.add('current');
                    const btn = activeStep.querySelector('button');
                    btn.className = 'btn-current';
                    btn.textContent = 'Current';
                    btn.disabled = true;
                }
            }
        } catch (error) {
            console.error('Error setting workflow step:', error);
            alert('Failed to update workflow step');
        }
    }
};