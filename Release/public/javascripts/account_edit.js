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

// Toggle the readOnly state of an input field and focus it if editable
function enableEdit(id) {
    event.preventDefault(); // Prevent default form submission

    const input = document.getElementById(id);
    console.log("(account_edit) id: ",id );
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
document.getElementById('editForm').addEventListener('submit', async function editUser(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const originalData = {
        user_name: this.user_name.defaultValue,
        gmail: this.gmail.defaultValue,
        password: this.password.defaultValue
    };

    // 準備要發送的更新資料
    const updatedData = {
        id: window.user_id
    };

    if (this.user_name.value !== originalData.user_name) {
        updatedData.user_name = this.user_name.value;
    }
    if (this.gmail.value !== originalData.gmail) {
        updatedData.gmail = this.gmail.value;
    }
    if (this.password.value !== originalData.password) {
        updatedData.password = this.password.value;
    }
    
    console.log("updated field: ", updatedData);

    try {
        // Send POST request with form data
        const response = await fetch('/api/editUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
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