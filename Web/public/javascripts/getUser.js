document.addEventListener('DOMContentLoaded', async () => {
    // This function will be executed when the DOMContentLoaded event is triggered
    var idInput = document.getElementById('user-id');
    var emailInput = document.getElementById('user-email');
    let user_id = "user id";
    let user_email = "email";

    console.log('DOM fully loaded and parsed');

    if (localStorage.getItem('token')) {
        try {
            const response = await fetch('/api/content', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok'); // Handle HTTP errors
            }

            const data = await response.json(); // Wait for JSON parsing
            console.log('Content fetched:', data);

            user_id = data.user.id;
            user_email = data.user.gmail;

        } catch (error) {
            console.error('Error fetching content:', error); // Handle other errors
        }
    } else {
        console.log('No token found in localStorage');
    }

    idInput.value = user_id;
    emailInput.value = user_email;
});