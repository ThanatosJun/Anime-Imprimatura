// this file get the logined user's id & mail

document.addEventListener('DOMContentLoaded', async () => {
    // This function will be executed when the DOMContentLoaded event is triggered
    window.user_id = null;
    window.user_email = null;
    
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

            window.user_id = data.user.id;
            window.user_email = data.user.gmail;

            console.log('id:', window.user_id);
        } catch (error) {
            console.error('Error fetching content:', error); // Handle other errors
        }
    } else {
        console.log('No token found in localStorage');
    }

    document.dispatchEvent(new Event('getUserCompleted'));
});