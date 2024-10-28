document.addEventListener('getUserCompleted', () => {
    console.log('getUser has completed, executing account_edit');
    
    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var pwdInput = document.getElementById('password');
    var userNameSection = document.getElementById('username');

    if(window.user_id) {
        nameInput.value = window.user_name;
        emailInput.value = window.user_email;
        pwdInput.value = window.password;
        userNameSection.textContent = window.user_name;

    }
});
// Initialize edit state
let isEditable = false;

// Get the buttons and inputs
const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const form = document.getElementById('editForm');
const inputs = document.querySelectorAll('#name, #email, #password');

// Toggle the edit mode
function toggleEditMode(event) {
    event.preventDefault(); // Prevent accidental form submission
    isEditable = !isEditable;

    // Toggle readonly state and add/edit styles for editing
    inputs.forEach(input => {
        input.readOnly = !isEditable;
        input.classList.toggle('editable', isEditable);
    });

    // Toggle button visibility between Edit and Save
    editBtn.style.display = isEditable ? 'none' : 'inline';
    saveBtn.style.display = isEditable ? 'inline' : 'none';
}

// Attach event listeners
editBtn.addEventListener('click', toggleEditMode);
saveBtn.addEventListener('click', async function (event) {
    if (isEditable) {
        event.preventDefault(); // Prevent form from submitting automatically
        const updatedData = {};

        // Prepare form data
        inputs.forEach(input => {
            if (input.value !== input.defaultValue) {
                updatedData[input.name] = input.value;
            }
        });

        updatedData.id = window.user_id;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Failed to update user settings');

            const data = await response.json();
            console.log('Updated user settings:', data);

            // Switch back to view mode
            toggleEditMode(event);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update user settings');
        }
    }
});