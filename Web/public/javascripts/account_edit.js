document.addEventListener('getUserCompleted', () => {
    console.log('getUser has completed, executing account_edit');
    
    var idInput = document.getElementById('id');
    var emailInput = document.getElementById('email');

    idInput.value = window.user_id;
    emailInput.value = window.user_email;
});

// Toggle the readOnly state of an input field and focus it if editable
function enableEdit(id) {
    const input = document.getElementById(id);
    if (input) {
        // Toggle readOnly property
        input.readOnly = !input.readOnly;
        if (!input.readOnly) {
            // Focus the input if it is now editable
            input.focus();
        }
    } else {
        // Log a warning if the element with the given ID is not found
        console.warn(`Element with id "${id}" not found.`);
    }
}

// Handle form submission
document.getElementById('editForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);

    try {
        // Send POST request with form data
        const response = await fetch('/edituser', {
            method: 'POST',
            body: formData
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse JSON response
        const data = await response.json();
        
        // Update page content with new data
        document.getElementById('email').innerText = formData.get('newGmail') || data.newGmail;
        document.getElementById('password').innerText = formData.get('newPassword') || data.newPassword;
    } catch (error) {
        // Log and alert errors
        console.error('Error:', error);
        alert('Error updating user settings');
    }
});