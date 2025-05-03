document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const schemeForm = document.getElementById('schemeForm');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');
    const schemesContainer = document.getElementById('schemesContainer');

    // API Base URL
    const API_URL = `${window.location.origin}/api/schemes`;

    // Load all schemes on page load
    fetchSchemes();

    // Form submission handler
    schemeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const schemeData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            imageLink: document.getElementById('imageLink').value,
            pdfLink: document.getElementById('pdfLink').value,
            income: document.getElementById('income').value ? Number(document.getElementById('income').value) : undefined,
            state: document.getElementById('state').value,
            age: document.getElementById('age').value ? Number(document.getElementById('age').value) : undefined,
            eligibility: {},
            benefits: []
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(schemeData)
            });

            if (!response.ok) throw new Error('Failed to save scheme');
            
            const newScheme = await response.json();
            displayScheme(newScheme);
            schemeForm.reset();
            showNotification('Scheme saved successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error saving scheme', 'error');
        }
    });

    // Clear form handler
    clearBtn.addEventListener('click', function() {
        schemeForm.reset();
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const schemeCards = document.querySelectorAll('.scheme-card');
        
        schemeCards.forEach(card => {
            const schemeName = card.querySelector('h3').textContent.toLowerCase();
            if (schemeName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Fetch all schemes from API
    async function fetchSchemes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch schemes');
            
            const schemes = await response.json();
            schemesContainer.innerHTML = '';
            schemes.forEach(scheme => displayScheme(scheme));
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error loading schemes', 'error');
        }
    }

    // Display a single scheme
    function displayScheme(scheme) {
        const schemeCard = document.createElement('div');
        schemeCard.className = 'scheme-card';
        schemeCard.innerHTML = `
            <h3>${scheme.title}</h3>
            <p>${scheme.description}</p>
            ${scheme.imageLink ? `<img src="${scheme.imageLink}" alt="Scheme image" class="scheme-image">` : ''}
            ${scheme.pdfLink ? `<a href="${scheme.pdfLink}" target="_blank">View PDF</a>` : ''}
            ${scheme.income ? `<p><strong>Income:</strong> ${scheme.income}</p>` : ''}
            ${scheme.state ? `<p><strong>State:</strong> ${scheme.state}</p>` : ''}
            ${scheme.age ? `<p><strong>Age:</strong> ${scheme.age}</p>` : ''}
            <div class="scheme-actions">
                <button class="btn-primary" onclick="editScheme('${scheme._id}')">Edit</button>
                <button class="btn-secondary" onclick="deleteScheme('${scheme._id}')">Delete</button>
            </div>
        `;
        schemesContainer.appendChild(schemeCard);
    }

    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

// Global functions for scheme actions
async function editScheme(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch scheme');
        
        const scheme = await response.json();
        document.getElementById('title').value = scheme.title;
        document.getElementById('description').value = scheme.description;
        document.getElementById('imageLink').value = scheme.imageLink || '';
        document.getElementById('pdfLink').value = scheme.pdfLink || '';
        document.getElementById('income').value = scheme.income || '';
        document.getElementById('state').value = scheme.state || '';
        document.getElementById('age').value = scheme.age || '';
        
        // Update form submit to perform PUT instead of POST
        const form = document.getElementById('schemeForm');
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: document.getElementById('title').value,
                        description: document.getElementById('description').value,
                        imageLink: document.getElementById('imageLink').value,
                        pdfLink: document.getElementById('pdfLink').value,
                        income: document.getElementById('income').value ? Number(document.getElementById('income').value) : undefined,
                        state: document.getElementById('state').value,
                        age: document.getElementById('age').value ? Number(document.getElementById('age').value) : undefined
                    })
                });

                if (!response.ok) throw new Error('Failed to update scheme');
                
                const updatedScheme = await response.json();
                showNotification('Scheme updated successfully!', 'success');
                fetchSchemes(); // Refresh the list
                form.reset();
                form.onsubmit = originalSubmitHandler; // Restore original handler
            } catch (error) {
                console.error('Error:', error);
                showNotification('Error updating scheme', 'error');
            }
        };
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading scheme for editing', 'error');
    }
}

// Store original form submit handler
const originalSubmitHandler = document.getElementById('schemeForm').onsubmit;

async function deleteScheme(id) {
    if (confirm('Are you sure you want to delete this scheme?')) {
        try {
            const response = await fetch(`http://localhost:3001/api/schemes/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete scheme');
            
            document.querySelector(`.scheme-card[data-id="${id}"]`).remove();
            showNotification('Scheme deleted successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error deleting scheme', 'error');
        }
    }
}
