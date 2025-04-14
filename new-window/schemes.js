document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://webadmin-panel-2.onrender.com/api/schemes';
    const schemesContainer = document.getElementById('schemesContainer');

    // Fetch all schemes from API
    async function fetchSchemes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch schemes');
            
            const schemes = await response.json();
            displaySchemes(schemes);
        } catch (error) {
            console.error('Error:', error);
            schemesContainer.innerHTML = '<p class="error">Error loading schemes. Please try again later.</p>';
        }
    }

    // Display all schemes
    function displaySchemes(schemes) {
        if (schemes.length === 0) {
            schemesContainer.innerHTML = '<p>No schemes available at the moment.</p>';
            return;
        }

        schemesContainer.innerHTML = '';
        schemes.forEach(scheme => {
            const schemeCard = document.createElement('div');
            schemeCard.className = 'scheme-card';
            schemeCard.innerHTML = `
                <h3>${scheme.name}</h3>
                <p>${scheme.description}</p>
                <div class="scheme-details">
                    ${scheme.benefits && scheme.benefits.length > 0 ? 
                        `<p><strong>Benefits:</strong> ${scheme.benefits.join(', ')}</p>` : ''}
                    ${scheme.eligibility ? 
                        `<p><strong>Eligibility:</strong> ${JSON.stringify(scheme.eligibility)}</p>` : ''}
                    <p class="update-date">Last updated: ${new Date(scheme.lastUpdated).toLocaleDateString()}</p>
                </div>
            `;
            schemesContainer.appendChild(schemeCard);
        });
    }

    // Initial load
    fetchSchemes();
});
